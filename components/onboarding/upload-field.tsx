'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Check, ClipboardPaste, ExternalLink, FileText, FileVideo, Loader2, RefreshCw, Trash2, UploadCloud, X } from 'lucide-react'
import type { OnboardingAsset } from '@/lib/onboarding/types'
import { ShareLinkButton, sharedAssetPath } from './share-link-button'
import {
  allowedUploadTypes,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
  resolveUploadMimeType,
} from '@/lib/onboarding/validation'

type LocalUpload = {
  file: File
  id: string
  progress: number
  status: 'queued' | 'uploading' | 'error'
  error?: string
  batchId: string
  mimeType: string
  uploadId?: string
}

type QueueItem = { batchId: string; file: File; id: string; mimeType: string; retryUploadId?: string }

type PresignedUpload = {
  mimeType: string
  mode: 'single'
  uploadId: string
  uploadUrl: string
} | {
  mimeType: string
  mode: 'multipart'
  partSize: number
  uploadId: string
  uploadedParts: Array<{ partNumber: number; size: number }>
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2).replace('.', ',')} GB`
}

function canPreviewImage(mimeType: string) {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(mimeType)
}

function clipboardFile(blob: Blob, index: number, originalFile?: File) {
  const mimeType = blob.type.toLowerCase()
  const extensions = allowedUploadTypes[mimeType]
  const originalExtension = originalFile?.name.split('.').pop()?.toLowerCase()
  if (originalFile?.name && originalExtension && extensions?.includes(originalExtension)) {
    return originalFile
  }

  const extension = extensions?.[0] || 'bin'
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const suffix = index > 0 ? `-${index + 1}` : ''
  return new File([blob], `vlozeny-obrazok-${timestamp}${suffix}.${extension}`, {
    lastModified: originalFile?.lastModified || Date.now(),
    type: mimeType,
  })
}

function storageErrorMessage(xhr: XMLHttpRequest) {
  const status = xhr.status ? `HTTP ${xhr.status}` : 'bez HTTP odpovede'
  const document = xhr.responseText
    ? new DOMParser().parseFromString(xhr.responseText, 'application/xml')
    : null
  const code = document?.querySelector('Code')?.textContent?.trim()
  const detail = document?.querySelector('Message')?.textContent?.trim()
  const diagnostic = [status, code].filter(Boolean).join(', ')

  return detail
    ? `Úložisko súbor odmietlo (${diagnostic}). ${detail}`
    : `Úložisko súbor odmietlo (${diagnostic}).`
}

async function errorMessage(response: Response) {
  const data = await response.json().catch(() => null) as {
    configuration?: { missing?: string[] }
    details?: string
    error?: string
    reason?: string
  } | null
  console.error('[nahrávanie súboru]', {
    chýbaKonfigurácia: data?.configuration?.missing || [],
    detail: data?.details,
    dôvod: data?.reason || 'unknown',
    httpStav: response.status,
    správa: data?.error || response.statusText,
  })
  const message = data?.error || 'Súbor sa nepodarilo nahrať.'
  return data?.details ? `${message}\n${data.details}` : message
}

export function UploadField({
  apiBasePath,
  assets,
  canDeleteAsset = () => true,
  getAssetUrl,
  newAssetMetadata,
  notificationsEnabled = true,
  onClientVisibilityChange,
  onAssetsChange,
  showAdminMetadata = false,
  token,
  totalAssetCount,
}: {
  apiBasePath?: string
  assets: OnboardingAsset[]
  canDeleteAsset?: (asset: OnboardingAsset) => boolean
  getAssetUrl?: (asset: OnboardingAsset) => string
  newAssetMetadata?: Pick<OnboardingAsset, 'category' | 'clientVisible' | 'uploadedBy'>
  notificationsEnabled?: boolean
  onClientVisibilityChange?: (asset: OnboardingAsset, visible: boolean) => void
  onAssetsChange: (assets: OnboardingAsset[]) => void
  showAdminMetadata?: boolean
  token?: string
  totalAssetCount?: number
}) {
  const [items, setItems] = useState<LocalUpload[]>([])
  const [dragging, setDragging] = useState(false)
  const [notice, setNotice] = useState('')
  const [readingClipboard, setReadingClipboard] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queueRef = useRef<QueueItem[]>([])
  const activeRef = useRef(0)
  const batchesRef = useRef(new Map<string, { pending: number; uploadedIds: string[] }>())
  const assetsRef = useRef(assets)
  const endpoint = apiBasePath || `/api/onboarding/${token}/uploads`

  useEffect(() => {
    assetsRef.current = assets
  }, [assets])

  function updateItem(id: string, update: Partial<LocalUpload>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...update } : item))
  }

  function putFile(url: string, body: Blob, onProgress: (progress: number) => void, mimeType?: string) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url)
      if (mimeType) xhr.setRequestHeader('Content-Type', mimeType)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
          return
        }
        reject(new Error(storageErrorMessage(xhr)))
      }
      xhr.onerror = () => reject(new Error(
        navigator.onLine
          ? 'Prehliadač nedostal odpoveď úložiska. Upload mohol zablokovať CORS alebo neplatný podpis odkazu.'
          : 'Internetové pripojenie nie je dostupné.',
      ))
      xhr.onabort = () => reject(new Error('Nahrávanie bolo zrušené.'))
      xhr.send(body)
    })
  }

  async function notifyUploadedAssets(assetIds: string[]) {
    if (!notificationsEnabled || !assetIds.length) return
    try {
      const response = await fetch(`${endpoint}/notify`, {
        body: JSON.stringify({ assetIds }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (response.ok) return
    } catch {
      // The uploaded files remain valid even if the secondary e-mail call fails.
    }
    if (assetsRef.current.length) {
      setNotice('Súbory sú bezpečne nahraté, ale e-mailové upozornenie sa nepodarilo odoslať.')
    }
  }

  function finishBatch(batchId: string, uploadId?: string) {
    const batch = batchesRef.current.get(batchId)
    if (!batch) return
    if (uploadId) batch.uploadedIds.push(uploadId)
    batch.pending -= 1
    if (batch.pending > 0) return
    batchesRef.current.delete(batchId)
    void notifyUploadedAssets(batch.uploadedIds)
  }

  async function uploadMultipart(
    upload: Extract<PresignedUpload, { mode: 'multipart' }>,
    file: File,
    localId: string,
  ) {
    const totalParts = Math.ceil(file.size / upload.partSize)
    const transferred = new Map<number, number>(
      upload.uploadedParts.map((part) => [part.partNumber, part.size]),
    )
    const reportProgress = () => {
      const bytes = [...transferred.values()].reduce((sum, value) => sum + value, 0)
      updateItem(localId, { progress: Math.min(100, Math.round((bytes / file.size) * 100)) })
    }
    reportProgress()

    const completedParts = new Set(upload.uploadedParts.map((part) => part.partNumber))
    const missingParts = Array.from({ length: totalParts }, (_, index) => index + 1)
      .filter((partNumber) => !completedParts.has(partNumber))

    for (let offset = 0; offset < missingParts.length; offset += 6) {
      const partNumbers = missingParts.slice(offset, offset + 6)
      const response = await fetch(`${endpoint}/${upload.uploadId}/parts`, {
        body: JSON.stringify({ partNumbers }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(await errorMessage(response))
      const data = await response.json() as { parts: Array<{ partNumber: number; uploadUrl: string }> }

      let nextIndex = 0
      const workers = Array.from({ length: Math.min(3, data.parts.length) }, async () => {
        while (nextIndex < data.parts.length) {
          const part = data.parts[nextIndex++]
          if (!part) return
          const start = (part.partNumber - 1) * upload.partSize
          const end = Math.min(start + upload.partSize, file.size)
          const blob = file.slice(start, end, upload.mimeType)
          let lastError: unknown
          for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
              await putFile(part.uploadUrl, blob, (percent) => {
                transferred.set(part.partNumber, Math.round((percent / 100) * blob.size))
                reportProgress()
              })
              transferred.set(part.partNumber, blob.size)
              reportProgress()
              lastError = undefined
              break
            } catch (error) {
              lastError = error
              transferred.delete(part.partNumber)
              reportProgress()
            }
          }
          if (lastError) throw lastError
        }
      })
      await Promise.all(workers)
    }
  }

  async function uploadOne(queueItem: QueueItem) {
    const { file, id, mimeType, retryUploadId } = queueItem
    updateItem(id, { error: undefined, progress: 0, status: 'uploading' })

    try {
      const presignResponse = await fetch(`${endpoint}/presign`, {
        body: JSON.stringify({
          assetCategory: newAssetMetadata?.category || 'source',
          clientVisible: newAssetMetadata?.clientVisible === true,
          mimeType,
          name: file.name,
          retryUploadId,
          size: file.size,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!presignResponse.ok) throw new Error(await errorMessage(presignResponse))
      const presign = await presignResponse.json() as PresignedUpload
      updateItem(id, { uploadId: presign.uploadId })

      if (presign.mode === 'multipart') {
        await uploadMultipart(presign, file, id)
      } else {
        await putFile(presign.uploadUrl, file, (progress) => updateItem(id, { progress }), presign.mimeType)
      }
      const completeResponse = await fetch(
        `${endpoint}/${presign.uploadId}/complete`,
        { method: 'POST' },
      )
      if (!completeResponse.ok) throw new Error(await errorMessage(completeResponse))
      const completed = await completeResponse.json() as { shareToken?: string | null }

      const nextAssets: OnboardingAsset[] = [
        ...assetsRef.current,
        {
          createdAt: new Date().toISOString(),
          id: presign.uploadId,
          mimeType: presign.mimeType,
          name: file.name,
          shareToken: completed.shareToken || undefined,
          size: file.size,
          status: 'uploaded',
          ...newAssetMetadata,
        },
      ]
      assetsRef.current = nextAssets
      onAssetsChange(nextAssets)
      setItems((current) => current.filter((item) => item.id !== id))
      return presign.uploadId
    } catch (error) {
      updateItem(id, {
        error: error instanceof Error ? error.message : 'Súbor sa nepodarilo nahrať.',
        status: 'error',
      })
      return undefined
    }
  }

  function pumpQueue() {
    while (activeRef.current < 2 && queueRef.current.length) {
      const next = queueRef.current.shift()
      if (!next) return
      activeRef.current += 1
      void uploadOne(next).then((uploadId) => finishBatch(next.batchId, uploadId)).finally(() => {
        activeRef.current -= 1
        pumpQueue()
      })
    }
  }

  function addFiles(fileList: FileList | File[]) {
    setNotice('')
    const remaining = MAX_UPLOAD_FILES - (totalAssetCount ?? assets.length) - items.length
    if (remaining <= 0) {
      setNotice(`Môžete nahrať najviac ${MAX_UPLOAD_FILES} súborov.`)
      return
    }

    const files = Array.from(fileList)
    const selected = files.slice(0, remaining)
    const accepted: LocalUpload[] = []
    const batchId = crypto.randomUUID()
    const selectedKeys = new Set<string>()
    const existingAssetKeys = new Set(
      assetsRef.current.map((asset) => `${asset.name.normalize('NFC').toLocaleLowerCase('sk')}\u0000${asset.size}`),
    )
    const activeFileKeys = new Set(
      items.map((item) => `${item.file.name.normalize('NFC').toLocaleLowerCase('sk')}\u0000${item.file.size}\u0000${item.file.lastModified}`),
    )
    const rejected: string[] = []
    let duplicateCount = 0

    for (const file of selected) {
      const mimeType = resolveUploadMimeType(file.name, file.type)
      const assetKey = `${file.name.normalize('NFC').toLocaleLowerCase('sk')}\u0000${file.size}`
      const fileKey = `${assetKey}\u0000${file.lastModified}`
      if (existingAssetKeys.has(assetKey) || activeFileKeys.has(fileKey) || selectedKeys.has(fileKey)) {
        duplicateCount += 1
        continue
      }
      if (file.size <= 0) {
        rejected.push(`„${file.name}“ je prázdny`)
        continue
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        rejected.push(`„${file.name}“ je väčší ako 5 GB`)
        continue
      }
      selectedKeys.add(fileKey)
      const id = crypto.randomUUID()
      accepted.push({ batchId, file, id, mimeType, progress: 0, status: 'queued' })
      queueRef.current.push({ batchId, file, id, mimeType })
    }

    const notices = []
    if (duplicateCount) notices.push(`${duplicateCount === 1 ? 'Duplicitný súbor nebol nahraný znova.' : `${duplicateCount} duplicitné súbory neboli nahrané znova.`}`)
    if (rejected.length) notices.push(`${rejected.join(', ')}.`)
    if (files.length > remaining) notices.push(`Naraz môžete mať najviac ${MAX_UPLOAD_FILES} súborov.`)
    setNotice(notices.join(' '))
    if (accepted.length) batchesRef.current.set(batchId, { pending: accepted.length, uploadedIds: [] })
    setItems((current) => [...current, ...accepted])
    pumpQueue()
  }

  function addPastedFiles(fileList: File[]) {
    const images = fileList.filter((file) => file.type.toLowerCase().startsWith('image/'))
    if (!images.length) {
      setNotice('Schránka neobsahuje obrázok. Najprv obrázok skopírujte a skúste to znova.')
      return
    }
    addFiles(images.map((file, index) => clipboardFile(file, index, file)))
  }

  async function pasteFromClipboard() {
    if (!navigator.clipboard?.read) {
      setNotice('Prehliadač neumožnil priamy prístup ku schránke. Označte túto plochu a stlačte ⌘V alebo Ctrl+V.')
      return
    }

    setReadingClipboard(true)
    setNotice('')
    try {
      const clipboardItems = await navigator.clipboard.read()
      const images: File[] = []
      for (const item of clipboardItems) {
        const mimeType = item.types.find((type) => type.toLowerCase().startsWith('image/'))
        if (!mimeType) continue
        const blob = await item.getType(mimeType)
        images.push(clipboardFile(blob, images.length))
      }
      addPastedFiles(images)
    } catch {
      setNotice('Prístup ku schránke bol zablokovaný. Označte túto plochu a stlačte ⌘V alebo Ctrl+V.')
    } finally {
      setReadingClipboard(false)
    }
  }

  function retry(item: LocalUpload) {
    const batchId = crypto.randomUUID()
    batchesRef.current.set(batchId, { pending: 1, uploadedIds: [] })
    queueRef.current.push({ batchId, file: item.file, id: item.id, mimeType: item.mimeType, retryUploadId: item.uploadId })
    updateItem(item.id, { batchId, error: undefined, status: 'queued' })
    pumpQueue()
  }

  async function removeAsset(asset: OnboardingAsset) {
    const previousAssets = assetsRef.current
    const nextAssets = previousAssets.filter((item) => item.id !== asset.id)
    assetsRef.current = nextAssets
    onAssetsChange(nextAssets)
    const response = await fetch(`${endpoint}/${asset.id}`, { method: 'DELETE' })
    if (!response.ok) {
      assetsRef.current = previousAssets
      onAssetsChange(previousAssets)
      setNotice(await errorMessage(response))
    }
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        multiple
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <div
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
        onPaste={(event) => {
          const files = Array.from(event.clipboardData.items)
            .filter((item) => item.kind === 'file' && item.type.toLowerCase().startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter((file): file is File => file !== null)
          if (files.length) event.preventDefault()
          addPastedFiles(files)
        }}
        className={`flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? 'border-brand bg-brand-soft' : 'border-border bg-white/45 hover:border-brand/50 hover:bg-white'
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
        >
          <span className="grid size-11 place-items-center rounded-full bg-brand-soft text-brand">
            <UploadCloud className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-semibold text-foreground">Vyberte alebo sem presuňte súbory</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              Fotografie, videá, zvuk, dokumenty aj archívy · max. 5 GB na súbor
            </span>
            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Veľké súbory sa nahrávajú po častiach a po výpadku ich môžete obnoviť.</span>
          </span>
        </button>
        <button
          type="button"
          disabled={readingClipboard}
          onClick={() => void pasteFromClipboard()}
          className="mt-5 inline-flex min-h-9 items-center gap-2 rounded-lg bg-brand-soft px-3.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
        >
          {readingClipboard ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ClipboardPaste className="size-4" aria-hidden="true" />}
          {readingClipboard ? 'Čítam schránku…' : 'Vložiť obrázok zo schránky'}
        </button>
        <span className="mt-2 text-xs text-muted-foreground">Funguje aj cez ⌘V alebo Ctrl+V, keď je plocha označená.</span>
      </div>

      {notice && <p className="flex items-start gap-2 text-sm text-destructive"><X className="mt-0.5 size-4 shrink-0" />{notice}</p>}

      {(assets.length > 0 || items.length > 0) && (
        <ul className="divide-y divide-border/70" aria-label="Nahrávané súbory">
          {assets.map((asset) => {
            const assetUrl = getAssetUrl?.(asset)
            const openUrl = sharedAssetPath(asset)
              || (assetUrl && canPreviewImage(asset.mimeType) ? `${assetUrl}?preview=1` : assetUrl)
            return <li key={asset.id} className="flex items-center gap-3 py-3.5">
              {getAssetUrl && canPreviewImage(asset.mimeType) ? (
                <Image unoptimized width={44} height={44} src={`${getAssetUrl(asset)}?preview=1`} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
              ) : asset.mimeType.startsWith('video/')
                ? <FileVideo className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                : <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
              <span className="min-w-0 flex-1">
                {openUrl ? (
                  <a href={openUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 truncate text-sm font-medium hover:text-brand hover:underline">
                    <span className="truncate">{asset.name}</span><ExternalLink className="size-3.5 shrink-0" />
                  </a>
                ) : <span className="block truncate text-sm font-medium">{asset.name}</span>}
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
                  Nahrané · {formatBytes(Number(asset.size))}{showAdminMetadata && ` · ${asset.uploadedBy === 'admin' ? 'správca' : 'klient'} · ${new Intl.DateTimeFormat('sk-SK', { dateStyle: 'medium' }).format(new Date(asset.createdAt))}`}
                </span>
              </span>
              {onClientVisibilityChange && (
                <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground">
                  <input type="checkbox" checked={asset.clientVisible === true} onChange={(event) => onClientVisibilityChange(asset, event.target.checked)} className="size-4 accent-[var(--brand)]" />
                  Vidí klient
                </label>
              )}
              <ShareLinkButton asset={asset} />
              {canDeleteAsset(asset) && (
                <button
                  type="button"
                  onClick={() => void removeAsset(asset)}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  aria-label={`Odstrániť ${asset.name}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              )}
            </li>
          })}
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3.5">
              {item.status === 'uploading'
                ? <Loader2 className="size-5 shrink-0 animate-spin text-brand" aria-hidden="true" />
                : <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.file.name}</span>
                {item.status === 'error' ? (
                  <span className="mt-0.5 block whitespace-pre-wrap text-xs text-destructive">{item.error}</span>
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
