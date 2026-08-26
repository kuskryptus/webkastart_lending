'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, FileText, Loader2, RefreshCw, Trash2, UploadCloud, X } from 'lucide-react'
import type { OnboardingAsset } from '@/lib/onboarding/types'
import { allowedUploadTypes, MAX_UPLOAD_BYTES, MAX_UPLOAD_FILES } from '@/lib/onboarding/validation'

type LocalUpload = {
  file: File
  id: string
  progress: number
  status: 'queued' | 'uploading' | 'error'
  error?: string
  uploadId?: string
}

type QueueItem = { file: File; id: string; retryUploadId?: string }

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

async function errorMessage(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null
  return data?.error || 'Súbor sa nepodarilo nahrať.'
}

export function UploadField({
  assets,
  onAssetsChange,
  token,
}: {
  assets: OnboardingAsset[]
  onAssetsChange: (assets: OnboardingAsset[]) => void
  token: string
}) {
  const [items, setItems] = useState<LocalUpload[]>([])
  const [dragging, setDragging] = useState(false)
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const queueRef = useRef<QueueItem[]>([])
  const activeRef = useRef(0)
  const assetsRef = useRef(assets)

  useEffect(() => {
    assetsRef.current = assets
  }, [assets])

  function updateItem(id: string, update: Partial<LocalUpload>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...update } : item))
  }

  function putFile(url: string, file: File, onProgress: (progress: number) => void) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
      }
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error('Úložisko súbor odmietlo.'))
      xhr.onerror = () => reject(new Error('Pripojenie sa prerušilo.'))
      xhr.send(file)
    })
  }

  async function uploadOne(queueItem: QueueItem) {
    const { file, id, retryUploadId } = queueItem
    updateItem(id, { error: undefined, progress: 0, status: 'uploading' })

    try {
      const presignResponse = await fetch(`/api/onboarding/${token}/uploads/presign`, {
        body: JSON.stringify({
          mimeType: file.type,
          name: file.name,
          retryUploadId,
          size: file.size,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!presignResponse.ok) throw new Error(await errorMessage(presignResponse))
      const presign = await presignResponse.json() as { uploadId: string; uploadUrl: string }
      updateItem(id, { uploadId: presign.uploadId })

      await putFile(presign.uploadUrl, file, (progress) => updateItem(id, { progress }))
      const completeResponse = await fetch(
        `/api/onboarding/${token}/uploads/${presign.uploadId}/complete`,
        { method: 'POST' },
      )
      if (!completeResponse.ok) throw new Error(await errorMessage(completeResponse))

      const nextAssets: OnboardingAsset[] = [
        ...assetsRef.current,
        {
          createdAt: new Date().toISOString(),
          id: presign.uploadId,
          mimeType: file.type,
          name: file.name,
          size: file.size,
          status: 'uploaded',
        },
      ]
      assetsRef.current = nextAssets
      onAssetsChange(nextAssets)
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (error) {
      updateItem(id, {
        error: error instanceof Error ? error.message : 'Súbor sa nepodarilo nahrať.',
        status: 'error',
      })
    }
  }

  function pumpQueue() {
    while (activeRef.current < 3 && queueRef.current.length) {
      const next = queueRef.current.shift()
      if (!next) return
      activeRef.current += 1
      void uploadOne(next).finally(() => {
        activeRef.current -= 1
        pumpQueue()
      })
    }
  }

  function addFiles(fileList: FileList | File[]) {
    setNotice('')
    const remaining = MAX_UPLOAD_FILES - assets.length - items.length
    if (remaining <= 0) {
      setNotice(`Môžete nahrať najviac ${MAX_UPLOAD_FILES} súborov.`)
      return
    }

    const selected = Array.from(fileList).slice(0, remaining)
    const accepted: LocalUpload[] = []

    for (const file of selected) {
      if (!allowedUploadTypes[file.type]) {
        setNotice(`Súbor „${file.name}“ má nepodporovaný typ.`)
        continue
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setNotice(`Súbor „${file.name}“ je väčší ako 50 MB.`)
        continue
      }
      const id = crypto.randomUUID()
      accepted.push({ file, id, progress: 0, status: 'queued' })
      queueRef.current.push({ file, id })
    }

    if (Array.from(fileList).length > remaining) {
      setNotice(`Naraz môžete mať najviac ${MAX_UPLOAD_FILES} súborov.`)
    }
    setItems((current) => [...current, ...accepted])
    pumpQueue()
  }

  function retry(item: LocalUpload) {
    queueRef.current.push({ file: item.file, id: item.id, retryUploadId: item.uploadId })
    updateItem(item.id, { error: undefined, status: 'queued' })
    pumpQueue()
  }

  async function removeAsset(asset: OnboardingAsset) {
    const previousAssets = assetsRef.current
    const nextAssets = previousAssets.filter((item) => item.id !== asset.id)
    assetsRef.current = nextAssets
    onAssetsChange(nextAssets)
    const response = await fetch(`/api/onboarding/${token}/uploads/${asset.id}`, { method: 'DELETE' })
    if (!response.ok) {
      assetsRef.current = previousAssets
      onAssetsChange(previousAssets)
      setNotice(await errorMessage(response))
    }
  }

  const accept = Object.entries(allowedUploadTypes)
    .flatMap(([mime, extensions]) => [mime, ...extensions.map((extension) => `.${extension}`)])
    .join(',')

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={accept}
        multiple
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
        onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
        onDragLeave={(event) => {
          event.preventDefault()
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFiles(event.dataTransfer.files)
        }}
        className={`group flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 ${
          dragging ? 'border-brand bg-brand-soft' : 'border-border bg-white/45 hover:border-brand/50 hover:bg-white'
        }`}
      >
        <span className="grid size-11 place-items-center rounded-full bg-brand-soft text-brand">
          <UploadCloud className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-base font-semibold text-foreground">Vyberte alebo sem presuňte súbory</span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            JPG, PNG, WEBP, SVG, PDF, DOC, DOCX alebo TXT · max. 50 MB
          </span>
        </span>
      </button>

      {notice && <p className="flex items-start gap-2 text-sm text-destructive"><X className="mt-0.5 size-4 shrink-0" />{notice}</p>}

      {(assets.length > 0 || items.length > 0) && (
        <ul className="divide-y divide-border/70" aria-label="Nahrávané súbory">
          {assets.map((asset) => (
            <li key={asset.id} className="flex items-center gap-3 py-3.5">
              <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{asset.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
                  Nahrané · {formatBytes(Number(asset.size))}
                </span>
              </span>
              <button
                type="button"
                onClick={() => void removeAsset(asset)}
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label={`Odstrániť ${asset.name}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3.5">
              {item.status === 'uploading'
                ? <Loader2 className="size-5 shrink-0 animate-spin text-brand" aria-hidden="true" />
                : <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.file.name}</span>
                {item.status === 'error' ? (
                  <span className="mt-0.5 block text-xs text-destructive">{item.error}</span>
                ) : (
                  <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-secondary">
                    <span className="block h-full rounded-full bg-brand transition-[width]" style={{ width: `${item.progress}%` }} />
                  </span>
                )}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {item.status === 'error' ? (
                  <button
                    type="button"
                    onClick={() => retry(item)}
                    className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                  >
                    <RefreshCw className="size-3.5" /> Skúsiť znova
                  </button>
                ) : `${item.progress}%`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
