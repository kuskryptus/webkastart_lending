'use client'

import Image from 'next/image'
import {
  Check,
  LocateFixed,
  MessageCircle,
  Minus,
  Plus,
  RefreshCw,
  Send,
  X,
} from 'lucide-react'
import {
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export type ImageReviewComment = {
  id: string
  authorName: string
  body: string
  positionX: number
  positionY: number
  createdAt: string
}

type Point = { positionX: number; positionY: number }
type Size = { height: number; width: number }
type Connector = { endX: number; endY: number; height: number; startX: number; startY: number; width: number }

const zoomSteps = [1, 1.5, 2, 3, 4, 6, 8]

function displayDate(value: string) {
  return new Intl.DateTimeFormat('sk-SK', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Bratislava',
  }).format(new Date(value))
}

function responseError(response: Response, fallback: string) {
  return response.json()
    .then((data: unknown) => {
      if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
        return data.error
      }
      return fallback
    })
    .catch(() => fallback)
}

function storedAuthorName() {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem('webkastart-comment-author') || ''
  } catch {
    return ''
  }
}

function rememberAuthorName(value: string) {
  try {
    window.localStorage.setItem('webkastart-comment-author', value)
  } catch {
    // Remembering the optional name must never block saving a comment.
  }
}

export function SharedImageReview({
  alt,
  commentsUrl,
  imageUrl,
  initialComments,
}: {
  alt: string
  commentsUrl: string
  imageUrl: string
  initialComments: ImageReviewComment[]
}) {
  const [comments, setComments] = useState(initialComments)
  const [draft, setDraft] = useState<Point | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(initialComments[0]?.id ?? null)
  const [authorName, setAuthorName] = useState(storedAuthorName)
  const [body, setBody] = useState('')
  const [zoom, setZoom] = useState(1)
  const [imageSize, setImageSize] = useState<Size | null>(null)
  const [viewportSize, setViewportSize] = useState<Size>({ height: 640, width: 900 })
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [connector, setConnector] = useState<Connector | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const commentsScrollRef = useRef<HTMLDivElement>(null)
  const draftCardRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const markerRefs = useRef(new Map<string, HTMLButtonElement>())
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const measure = () => setViewportSize({ height: viewport.clientHeight, width: viewport.clientWidth })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const fittedImageSize = useMemo(() => {
    if (!imageSize) return { height: 1, width: 1 }
    const availableWidth = Math.max(1, viewportSize.width - 48)
    const availableHeight = Math.max(1, viewportSize.height - 48)
    const fitScale = Math.min(1, availableWidth / imageSize.width, availableHeight / imageSize.height)
    return {
      width: Math.round(imageSize.width * fitScale * zoom),
      height: Math.round(imageSize.height * fitScale * zoom),
    }
  }, [imageSize, viewportSize, zoom])

  const updateConnector = useCallback(() => {
    const root = rootRef.current
    const activeKey = draft ? 'draft' : selectedId
    const marker = activeKey ? markerRefs.current.get(activeKey) : null
    const card = draft ? draftCardRef.current : selectedId ? cardRefs.current.get(selectedId) : null

    if (!root || !marker || !card || window.innerWidth < 1024) {
      setConnector(null)
      return
    }

    const rootRect = root.getBoundingClientRect()
    const markerRect = marker.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const startX = markerRect.left + markerRect.width / 2 - rootRect.left
    const startY = markerRect.top + markerRect.height / 2 - rootRect.top
    const endX = cardRect.left - rootRect.left - 10
    const endY = cardRect.top + Math.min(54, cardRect.height / 2) - rootRect.top

    const markerVisible = startY >= 0 && startY <= rootRect.height
    const cardVisible = endY >= 0 && endY <= rootRect.height
    if (!markerVisible || !cardVisible) {
      setConnector(null)
      return
    }

    setConnector({
      startX,
      startY,
      endX,
      endY,
      width: rootRect.width,
      height: rootRect.height,
    })
  }, [draft, selectedId])

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateConnector)
    const viewport = viewportRef.current
    const commentsScroll = commentsScrollRef.current
    const onPositionChange = () => window.requestAnimationFrame(updateConnector)
    viewport?.addEventListener('scroll', onPositionChange, { passive: true })
    commentsScroll?.addEventListener('scroll', onPositionChange, { passive: true })
    window.addEventListener('resize', onPositionChange)
    return () => {
      window.cancelAnimationFrame(frame)
      viewport?.removeEventListener('scroll', onPositionChange)
      commentsScroll?.removeEventListener('scroll', onPositionChange)
      window.removeEventListener('resize', onPositionChange)
    }
  }, [comments, fittedImageSize, updateConnector])

  function setMarkerRef(id: string, node: HTMLButtonElement | null) {
    if (node) markerRefs.current.set(id, node)
    else markerRefs.current.delete(id)
  }

  function setCardRef(id: string, node: HTMLButtonElement | null) {
    if (node) cardRefs.current.set(id, node)
    else cardRefs.current.delete(id)
  }

  function addPoint(event: ReactMouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const nextDraft = {
      positionX: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      positionY: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    }
    setDraft(nextDraft)
    setSelectedId(null)
    setBody('')
    setError('')
    window.requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function selectComment(id: string, scrollCard = false) {
    setDraft(null)
    setSelectedId(id)
    setError('')
    if (scrollCard) {
      window.requestAnimationFrame(() => cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
    }
  }

  function changeZoom(direction: -1 | 1) {
    const currentIndex = zoomSteps.findIndex((step) => step >= zoom)
    const nextIndex = direction > 0
      ? Math.min(zoomSteps.length - 1, currentIndex + (zoomSteps[currentIndex] === zoom ? 1 : 0))
      : Math.max(0, currentIndex - 1)
    setZoom(zoomSteps[nextIndex] ?? 1)
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault()
    if (!draft || !body.trim() || saving) return
    setSaving(true)
    setError('')

    try {
      const response = await fetch(commentsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, authorName, body }),
      })
      if (!response.ok) throw new Error(await responseError(response, 'Komentár sa nepodarilo uložiť.'))

      const data = await response.json() as { comment: ImageReviewComment }
      setComments((current) => [...current, data.comment])
      setDraft(null)
      setBody('')
      setSelectedId(data.comment.id)
      rememberAuthorName(authorName.trim())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Komentár sa nepodarilo uložiť.')
    } finally {
      setSaving(false)
    }
  }

  async function refreshComments() {
    if (refreshing) return
    setRefreshing(true)
    setError('')
    try {
      const response = await fetch(commentsUrl, { cache: 'no-store' })
      if (!response.ok) throw new Error(await responseError(response, 'Komentáre sa nepodarilo obnoviť.'))
      const data = await response.json() as { comments: ImageReviewComment[] }
      setComments(data.comments)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Komentáre sa nepodarilo obnoviť.')
    } finally {
      setRefreshing(false)
    }
  }

  const activeMarkerId = draft ? 'draft' : selectedId
  const innerWidth = Math.max(viewportSize.width, fittedImageSize.width + 48)
  const innerHeight = Math.max(viewportSize.height, fittedImageSize.height + 48)

  return (
    <section aria-label="Pripomienkovanie obrázka" className="mt-8 sm:mt-10">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Pripomienky k obrázku</h2>
          <p className="mt-1 text-sm text-muted-foreground">Priblížte si návrh a kliknite presne na miesto, ktoré chcete okomentovať.</p>
        </div>
        <div className="flex w-fit items-center gap-1 rounded-xl border border-border bg-background p-1" aria-label="Priblíženie obrázka">
          <button type="button" onClick={() => changeZoom(-1)} disabled={zoom === zoomSteps[0]} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Oddialiť obrázok"><Minus className="size-4" /></button>
          <span className="min-w-14 text-center text-xs font-semibold tabular-nums">{Math.round(zoom * 100)} %</span>
          <button type="button" onClick={() => changeZoom(1)} disabled={zoom === zoomSteps.at(-1)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Priblížiť obrázok"><Plus className="size-4" /></button>
          <span className="mx-1 h-5 w-px bg-border" />
          <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Prispôsobiť obrázok oknu"><LocateFixed className="size-4" /> Prispôsobiť</button>
        </div>
      </div>

      <div ref={rootRef} className="relative grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[minmax(0,1fr)_21rem]">
        {connector && (
          <svg className="pointer-events-none absolute inset-0 z-20 hidden lg:block" width={connector.width} height={connector.height} viewBox={`0 0 ${connector.width} ${connector.height}`} aria-hidden="true">
            <path
              d={`M ${connector.startX} ${connector.startY} C ${connector.startX + 48} ${connector.startY}, ${connector.endX - 48} ${connector.endY}, ${connector.endX} ${connector.endY}`}
              fill="none"
              stroke="var(--brand)"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        )}

        <div className="min-w-0 bg-secondary/70">
          <div ref={viewportRef} className="h-[64dvh] min-h-[30rem] overflow-auto overscroll-contain" aria-label="Náhľad obrázka s bodmi komentárov">
            <div className="relative" style={{ width: innerWidth, height: innerHeight }}>
              <div
                className="absolute cursor-crosshair select-none bg-white shadow-sm"
                onClick={addPoint}
                style={{
                  width: fittedImageSize.width,
                  height: fittedImageSize.height,
                  left: (innerWidth - fittedImageSize.width) / 2,
                  top: (innerHeight - fittedImageSize.height) / 2,
                }}
              >
                <Image
                  unoptimized
                  fill
                  loading="eager"
                  sizes="100vw"
                  src={imageUrl}
                  alt={alt}
                  draggable={false}
                  className={`pointer-events-none object-contain transition-opacity ${imageSize ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                />

                {comments.map((comment, index) => (
                  <button
                    key={comment.id}
                    ref={(node) => setMarkerRef(comment.id, node)}
                    type="button"
                    onClick={(event) => { event.stopPropagation(); selectComment(comment.id, true) }}
                    className={`absolute z-30 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[11px] font-bold shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${activeMarkerId === comment.id ? 'border-white bg-brand text-white' : 'border-white bg-primary text-primary-foreground'}`}
                    style={{ left: `${comment.positionX * 100}%`, top: `${comment.positionY * 100}%` }}
                    aria-label={`Zobraziť komentár ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}

                {draft && (
                  <button
                    ref={(node) => setMarkerRef('draft', node)}
                    type="button"
                    onClick={(event) => { event.stopPropagation(); textareaRef.current?.focus() }}
                    className="absolute z-30 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-brand text-white shadow-lg ring-4 ring-brand/20"
                    style={{ left: `${draft.positionX * 100}%`, top: `${draft.positionY * 100}%` }}
                    aria-label="Nový komentár"
                  >
                    <Plus className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="relative z-30 flex min-h-0 flex-col border-t border-border bg-background lg:h-[64dvh] lg:min-h-[30rem] lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-brand" />
              <h3 className="text-sm font-semibold">Komentáre</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{comments.length}</span>
            </div>
            <button type="button" onClick={() => void refreshComments()} disabled={refreshing} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50" aria-label="Obnoviť komentáre" title="Obnoviť komentáre">
              <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div ref={commentsScrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {draft && (
              <div ref={draftCardRef} className="rounded-xl border border-brand bg-brand-soft/60 p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-brand">Nový komentár</p>
                  <button type="button" onClick={() => { setDraft(null); setBody(''); setError('') }} className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground" aria-label="Zrušiť komentár"><X className="size-3.5" /></button>
                </div>
                <form onSubmit={(event) => void submitComment(event)} className="mt-2.5 space-y-2.5">
                  <label className="block">
                    <span className="sr-only">Vaše meno</span>
                    <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} maxLength={80} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand" placeholder="Vaše meno (nepovinné)" />
                  </label>
                  <label className="block">
                    <span className="sr-only">Komentár</span>
                    <textarea ref={textareaRef} value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} rows={4} className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-5 outline-none placeholder:text-muted-foreground focus:border-brand" placeholder="Čo chcete na tomto mieste zmeniť?" />
                  </label>
                  {error && <p role="alert" className="text-xs leading-5 text-destructive">{error}</p>}
                  <button type="submit" disabled={!body.trim() || saving} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45">
                    {saving ? <><RefreshCw className="size-3.5 animate-spin" /> Ukladám…</> : <><Send className="size-3.5" /> Pridať komentár</>}
                  </button>
                </form>
              </div>
            )}

            {comments.map((comment, index) => (
              <button
                key={comment.id}
                ref={(node) => setCardRef(comment.id, node)}
                type="button"
                onClick={() => selectComment(comment.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${selectedId === comment.id && !draft ? 'border-brand bg-brand-soft/45' : 'border-border bg-card hover:border-brand/40'}`}
              >
                <span className="flex items-start gap-2.5">
                  <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${selectedId === comment.id && !draft ? 'bg-brand text-white' : 'bg-primary text-primary-foreground'}`}>{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-semibold">{comment.authorName || 'Anonymný komentár'}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{displayDate(comment.createdAt)}</span>
                    </span>
                    <span className="mt-1.5 block whitespace-pre-wrap break-words text-sm leading-5 text-foreground">{comment.body}</span>
                  </span>
                </span>
              </button>
            ))}

            {!draft && comments.length === 0 && (
              <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
                <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand"><MessageCircle className="size-4" /></span>
                <p className="mt-3 text-sm font-semibold">Zatiaľ bez komentárov</p>
                <p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">Kliknite na ľubovoľné miesto v obrázku a napíšte svoju pripomienku.</p>
              </div>
            )}

            {!draft && error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive">{error}</p>}
          </div>

          <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-[11px] text-muted-foreground">
            <Check className="size-3.5 text-emerald-600" /> Body sa ukladajú presne aj pri priblížení.
          </div>
        </aside>
      </div>
    </section>
  )
}
