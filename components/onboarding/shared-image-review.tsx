'use client'

import Image from 'next/image'
import {
  Check,
  LocateFixed,
  Maximize2,
  MessageCircle,
  Minimize2,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
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
  useSyncExternalStore,
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
type MobilePanelPlacement = 'none' | 'bottom' | 'top'

const zoomSteps = [1, 1.5, 2, 3, 4, 6, 8, 12, 16]
const mobileReviewQuery = '(max-width: 1023px)'

function recommendedInitialZoom(imageSize: Size | null, viewportSize: Size) {
  if (!imageSize) return 1
  const availableWidth = Math.max(1, viewportSize.width - 48)
  const availableHeight = Math.max(1, viewportSize.height - 48)
  const fitScale = Math.min(1, availableWidth / imageSize.width, availableHeight / imageSize.height)
  const fittedWidth = imageSize.width * fitScale
  const readableWidth = Math.min(imageSize.width, Math.max(320, availableWidth * 0.32))
  if (fittedWidth >= readableWidth) return 1

  const maxZoom = zoomSteps.at(-1) ?? 1
  return Math.min(maxZoom, Math.round((readableWidth / fittedWidth) * 100) / 100)
}

function subscribeToMobileReview(callback: () => void) {
  const media = window.matchMedia(mobileReviewQuery)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function isMobileReview() {
  return window.matchMedia(mobileReviewQuery).matches
}

function isServerMobileReview() {
  return false
}

function readVisualViewport() {
  if (typeof window === 'undefined') return { bottom: 0, height: 800, top: 0 }
  const viewport = window.visualViewport
  if (!viewport) return { bottom: 0, height: window.innerHeight, top: 0 }
  return {
    bottom: Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
    height: viewport.height,
    top: viewport.offsetTop,
  }
}

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
  const [zoom, setZoom] = useState<number | null>(null)
  const [imageSize, setImageSize] = useState<Size | null>(null)
  const [viewportSize, setViewportSize] = useState<Size>({ height: 640, width: 900 })
  const [saving, setSaving] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAuthorName, setEditAuthorName] = useState('')
  const [editBody, setEditBody] = useState('')
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [connector, setConnector] = useState<Connector | null>(null)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [visualViewport, setVisualViewport] = useState(readVisualViewport)
  const mobileReview = useSyncExternalStore(subscribeToMobileReview, isMobileReview, isServerMobileReview)
  const mobileFormOpen = mobileReview && mobilePanelOpen && Boolean(draft || editingId)

  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const commentsScrollRef = useRef<HTMLDivElement>(null)
  const draftCardRef = useRef<HTMLDivElement>(null)
  const mobilePanelRef = useRef<HTMLElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)
  const nativeFullscreenRef = useRef(false)
  const markerRefs = useRef(new Map<string, HTMLButtonElement>())
  const cardRefs = useRef(new Map<string, HTMLDivElement>())

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const measure = () => setViewportSize({ height: viewport.clientHeight, width: viewport.clientWidth })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const viewport = window.visualViewport
    const measure = () => setVisualViewport(readVisualViewport())
    viewport?.addEventListener('resize', measure)
    viewport?.addEventListener('scroll', measure)
    window.addEventListener('resize', measure)
    return () => {
      viewport?.removeEventListener('resize', measure)
      viewport?.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    const updateFullscreen = () => {
      if (document.fullscreenElement === rootRef.current) {
        nativeFullscreenRef.current = true
        setIsFullscreen(true)
      } else if (nativeFullscreenRef.current) {
        nativeFullscreenRef.current = false
        setIsFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', updateFullscreen)
    return () => document.removeEventListener('fullscreenchange', updateFullscreen)
  }, [])

  useEffect(() => {
    if (!isFullscreen) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) setIsFullscreen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isFullscreen])

  const activeZoom = useMemo(
    () => zoom ?? recommendedInitialZoom(imageSize, viewportSize),
    [imageSize, viewportSize, zoom],
  )

  const fittedImageSize = useMemo(() => {
    if (!imageSize) return { height: 1, width: 1 }
    const availableWidth = Math.max(1, viewportSize.width - 48)
    const availableHeight = Math.max(1, viewportSize.height - 48)
    const fitScale = Math.min(1, availableWidth / imageSize.width, availableHeight / imageSize.height)
    return {
      width: Math.round(imageSize.width * fitScale * activeZoom),
      height: Math.round(imageSize.height * fitScale * activeZoom),
    }
  }, [activeZoom, imageSize, viewportSize])

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

  const centerReview = useCallback((markerId: string | null, panelPlacement: MobilePanelPlacement) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const marker = markerId ? markerRefs.current.get(markerId) : null
    if (!marker) {
      viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2)
      viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2)
      return
    }

    const viewportRect = viewport.getBoundingClientRect()
    const markerRect = marker.getBoundingClientRect()
    viewport.scrollLeft += markerRect.left + markerRect.width / 2
      - (viewportRect.left + viewportRect.width / 2)

    const panelRect = panelPlacement !== 'none'
      ? mobilePanelRef.current?.getBoundingClientRect()
      : undefined
    let visibleTop = Math.max(viewportRect.top, visualViewport.top)
    let visibleBottom = Math.min(
      viewportRect.bottom,
      visualViewport.top + visualViewport.height,
    )
    if (panelPlacement === 'bottom' && panelRect) {
      visibleBottom = Math.min(visibleBottom, panelRect.top - 12)
    } else if (panelPlacement === 'top' && panelRect) {
      visibleTop = Math.max(visibleTop, panelRect.bottom + 12)
      // Some Android in-app browsers do not report the keyboard through
      // VisualViewport. Keep the marker close below the editor in that case.
      visibleBottom = Math.min(visibleBottom, visibleTop + 120)
    }
    if (visibleBottom - visibleTop > 44) {
      viewport.scrollTop += markerRect.top + markerRect.height / 2
        - (visibleTop + visibleBottom) / 2
    }
  }, [visualViewport])

  useEffect(() => {
    if (!imageSize) return
    const frame = window.requestAnimationFrame(() => {
      centerReview(null, 'none')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [centerReview, fittedImageSize, imageSize])

  useEffect(() => {
    if (!mobileReview || !mobilePanelOpen) return
    const frame = window.requestAnimationFrame(() => {
      centerReview(draft ? 'draft' : selectedId, mobileFormOpen ? 'top' : 'bottom')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [centerReview, draft, fittedImageSize, mobileFormOpen, mobilePanelOpen, mobileReview, selectedId])

  useEffect(() => {
    const panel = mobilePanelRef.current
    if (!mobileReview || !mobilePanelOpen || !panel) return

    let frame = 0
    const recenter = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        centerReview(draft ? 'draft' : selectedId, mobileFormOpen ? 'top' : 'bottom')
      })
    }
    const observer = new ResizeObserver(recenter)
    observer.observe(panel)
    recenter()

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [centerReview, draft, mobileFormOpen, mobilePanelOpen, mobileReview, selectedId])

  useEffect(() => {
    if (!mobileFormOpen) return

    let frame = 0
    const revealFormActions = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const scroll = commentsScrollRef.current
        const editor = draft
          ? draftCardRef.current
          : editingId ? cardRefs.current.get(editingId) : null
        if (!scroll || !editor) return

        const scrollRect = scroll.getBoundingClientRect()
        const editorRect = editor.getBoundingClientRect()
        if (editorRect.bottom > scrollRect.bottom) {
          scroll.scrollTop += editorRect.bottom - scrollRect.bottom + 4
        }
      })
    }

    revealFormActions()
    const keyboardFrame = window.setTimeout(revealFormActions, 350)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(keyboardFrame)
    }
  }, [draft, editingId, mobileFormOpen, visualViewport.height])

  function setMarkerRef(id: string, node: HTMLButtonElement | null) {
    if (node) markerRefs.current.set(id, node)
    else markerRefs.current.delete(id)
  }

  function setCardRef(id: string, node: HTMLDivElement | null) {
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
    setEditingId(null)
    setConfirmingDeleteId(null)
    setBody('')
    setError('')
    if (mobileReview) setMobilePanelOpen(true)
    window.requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }))
  }

  function selectComment(id: string, scrollCard = false) {
    setDraft(null)
    setSelectedId(id)
    setEditingId(null)
    setConfirmingDeleteId(null)
    setError('')
    if (mobileReview) {
      setMobilePanelOpen(true)
    } else if (scrollCard) {
      window.requestAnimationFrame(() => cardRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
    }
  }

  function changeZoom(direction: -1 | 1) {
    const currentIndex = zoomSteps.findIndex((step) => step >= activeZoom)
    const nextIndex = direction > 0
      ? Math.min(zoomSteps.length - 1, currentIndex + (zoomSteps[currentIndex] === activeZoom ? 1 : 0))
      : Math.max(0, currentIndex - 1)
    setZoom(zoomSteps[nextIndex] ?? 1)
  }

  async function toggleFullscreen() {
    const root = rootRef.current
    if (!root) return

    if (isFullscreen) {
      if (document.fullscreenElement === root) {
        try {
          await document.exitFullscreen()
        } catch {
          // The in-page fullscreen fallback still closes below.
        }
      }
      setIsFullscreen(false)
      return
    }

    setIsFullscreen(true)
    if (!document.fullscreenElement && document.fullscreenEnabled) {
      try {
        await root.requestFullscreen()
      } catch {
        // Some embedded and mobile browsers block the native API. The fixed
        // in-page fullscreen layout remains available in those browsers.
      }
    }
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

  function startEditing(comment: ImageReviewComment) {
    setDraft(null)
    setSelectedId(comment.id)
    setEditingId(comment.id)
    setConfirmingDeleteId(null)
    setEditAuthorName(comment.authorName)
    setEditBody(comment.body)
    setError('')
    if (mobileReview) setMobilePanelOpen(true)
    window.requestAnimationFrame(() => editTextareaRef.current?.focus({ preventScroll: true }))
  }

  function cancelEditing() {
    setEditingId(null)
    setEditAuthorName('')
    setEditBody('')
    setError('')
  }

  async function submitEdit(event: FormEvent) {
    event.preventDefault()
    if (!editingId || !editBody.trim() || savingEdit) return
    setSavingEdit(true)
    setError('')

    try {
      const response = await fetch(commentsUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: editingId, authorName: editAuthorName, body: editBody }),
      })
      if (!response.ok) throw new Error(await responseError(response, 'Komentár sa nepodarilo upraviť.'))

      const data = await response.json() as { comment: ImageReviewComment }
      setComments((current) => current.map((comment) => comment.id === data.comment.id ? data.comment : comment))
      setEditingId(null)
      rememberAuthorName(editAuthorName.trim())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Komentár sa nepodarilo upraviť.')
    } finally {
      setSavingEdit(false)
    }
  }

  function confirmDelete(commentId: string) {
    setDraft(null)
    setEditingId(null)
    setSelectedId(commentId)
    setConfirmingDeleteId(commentId)
    setError('')
  }

  async function deleteComment(commentId: string) {
    if (deletingId) return
    setDeletingId(commentId)
    setError('')

    try {
      const response = await fetch(commentsUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })
      if (!response.ok) throw new Error(await responseError(response, 'Komentár sa nepodarilo vymazať.'))

      const deletedIndex = comments.findIndex((comment) => comment.id === commentId)
      const remaining = comments.filter((comment) => comment.id !== commentId)
      setComments(remaining)
      setSelectedId(remaining[deletedIndex]?.id ?? remaining[deletedIndex - 1]?.id ?? null)
      setConfirmingDeleteId(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Komentár sa nepodarilo vymazať.')
    } finally {
      setDeletingId(null)
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
  const mobilePanelHeight = Math.max(210, Math.min(430, Math.round(visualViewport.height * 0.5)))
  const innerWidth = Math.max(viewportSize.width, fittedImageSize.width + 48)
  const innerHeight = Math.max(viewportSize.height, fittedImageSize.height + 48)
    + (mobileReview && mobilePanelOpen ? mobilePanelHeight + 24 : 0)

  return (
    <section aria-label="Pripomienkovanie obrázka" className="mt-8 sm:mt-10">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Pripomienky k obrázku</h2>
          <p className="mt-1 text-sm text-muted-foreground">Priblížte si návrh a kliknite presne na miesto, ktoré chcete okomentovať.</p>
        </div>
        <div className="flex w-fit items-center gap-1 rounded-xl border border-border bg-background p-1">
          <div className="hidden items-center gap-1 lg:flex" aria-label="Priblíženie obrázka">
            <button type="button" onClick={() => changeZoom(-1)} disabled={activeZoom <= zoomSteps[0]} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Oddialiť obrázok"><Minus className="size-4" /></button>
            <span className="min-w-14 text-center text-xs font-semibold tabular-nums">{Math.round(activeZoom * 100)} %</span>
            <button type="button" onClick={() => changeZoom(1)} disabled={activeZoom >= (zoomSteps.at(-1) ?? 1)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Priblížiť obrázok"><Plus className="size-4" /></button>
            <span className="mx-1 h-5 w-px bg-border" />
            <button type="button" onClick={() => setZoom(1)} disabled={activeZoom === 1} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Prispôsobiť obrázok oknu"><LocateFixed className="size-4" /> Prispôsobiť</button>
            <span className="mx-1 h-5 w-px bg-border" />
          </div>
          <button type="button" onClick={() => void toggleFullscreen()} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Otvoriť na celú obrazovku">
            <Maximize2 className="size-4" /> Celá obrazovka
          </button>
        </div>
      </div>

      <div ref={rootRef} className={`relative grid overflow-hidden bg-card lg:grid-cols-[minmax(0,1fr)_21rem] ${isFullscreen ? 'fixed inset-0 z-[100] h-dvh w-screen rounded-none border-0' : 'rounded-2xl border border-border'}`}>
        {mobileReview && mobilePanelOpen && (
          <button type="button" className="fixed inset-0 z-40 bg-black/15 lg:hidden" onClick={() => setMobilePanelOpen(false)} aria-label="Zavrieť okno komentára" />
        )}
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

        <div className="relative min-w-0 bg-secondary/70">
          {isFullscreen && (
            <button type="button" onClick={() => void toggleFullscreen()} className="absolute left-3 top-3 z-30 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background/95 px-3 text-xs font-semibold text-foreground shadow-lg backdrop-blur hover:bg-secondary" aria-label="Ukončiť celú obrazovku" title="Ukončiť celú obrazovku">
              <Minimize2 className="size-4" /> <span className="hidden sm:inline">Ukončiť celú obrazovku</span>
            </button>
          )}
          {isFullscreen && (
            <div className="absolute right-3 top-3 z-30 hidden items-center gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-lg backdrop-blur lg:flex" aria-label="Priblíženie obrázka">
              <button type="button" onClick={() => changeZoom(-1)} disabled={activeZoom <= zoomSteps[0]} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Oddialiť obrázok"><Minus className="size-4" /></button>
              <span className="min-w-14 text-center text-xs font-semibold tabular-nums">{Math.round(activeZoom * 100)} %</span>
              <button type="button" onClick={() => changeZoom(1)} disabled={activeZoom >= (zoomSteps.at(-1) ?? 1)} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Priblížiť obrázok"><Plus className="size-4" /></button>
              <span className="mx-1 h-5 w-px bg-border" />
              <button type="button" onClick={() => setZoom(1)} disabled={activeZoom === 1} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Prispôsobiť obrázok oknu"><LocateFixed className="size-4" /> Prispôsobiť</button>
            </div>
          )}
          <div className="absolute right-3 top-3 z-30 flex flex-col items-center overflow-hidden rounded-xl border border-border bg-background/95 shadow-lg backdrop-blur lg:hidden" aria-label="Priblíženie obrázka">
            <button type="button" onClick={() => changeZoom(1)} disabled={activeZoom >= (zoomSteps.at(-1) ?? 1)} className="grid size-11 place-items-center text-foreground hover:bg-secondary disabled:opacity-35" aria-label="Priblížiť obrázok"><Plus className="size-5" /></button>
            <span className="w-7 border-t border-border" />
            <span className="py-1 text-[10px] font-bold tabular-nums text-muted-foreground">{Math.round(activeZoom * 100)}%</span>
            <span className="w-7 border-t border-border" />
            <button type="button" onClick={() => changeZoom(-1)} disabled={activeZoom <= zoomSteps[0]} className="grid size-11 place-items-center text-foreground hover:bg-secondary disabled:opacity-35" aria-label="Oddialiť obrázok"><Minus className="size-5" /></button>
            <span className="w-7 border-t border-border" />
            <button type="button" onClick={() => setZoom(1)} disabled={activeZoom === 1} className="grid size-10 place-items-center text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-35" aria-label="Prispôsobiť obrázok oknu"><LocateFixed className="size-4" /></button>
          </div>
          <button type="button" onClick={() => setMobilePanelOpen(true)} className="absolute bottom-3 left-3 z-30 inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/95 px-3.5 text-xs font-semibold shadow-lg backdrop-blur lg:hidden" aria-label={`Otvoriť komentáre (${comments.length})`}>
            <MessageCircle className="size-4 text-brand" /> {comments.length}
          </button>
          <div ref={viewportRef} className={`${isFullscreen ? 'h-dvh min-h-0' : 'h-[64dvh] min-h-[30rem]'} overflow-auto overscroll-contain`} aria-label="Náhľad obrázka s bodmi komentárov">
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
                    onClick={(event) => { event.stopPropagation(); if (mobileReview) setMobilePanelOpen(true); window.requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true })) }}
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

        <aside
          ref={mobilePanelRef}
          style={mobileReview ? mobileFormOpen
            ? { maxHeight: mobilePanelHeight, top: visualViewport.top + 12 }
            : { bottom: visualViewport.bottom + 12, maxHeight: mobilePanelHeight }
            : undefined}
          className={`${mobilePanelOpen ? 'fixed inset-x-3 z-50 flex overflow-hidden rounded-2xl border border-border shadow-2xl' : 'hidden'} min-h-0 flex-col bg-background lg:relative lg:inset-auto lg:z-30 lg:flex lg:rounded-none lg:border-0 lg:border-l lg:shadow-none ${isFullscreen ? 'lg:h-dvh lg:min-h-0' : 'lg:h-[64dvh] lg:min-h-[30rem]'}`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-brand" />
              <h3 className="text-sm font-semibold">Komentáre</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{comments.length}</span>
            </div>
            <button type="button" onClick={() => void refreshComments()} disabled={refreshing} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50" aria-label="Obnoviť komentáre" title="Obnoviť komentáre">
              <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button type="button" onClick={() => setMobilePanelOpen(false)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden" aria-label="Zavrieť komentáre"><X className="size-4" /></button>
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
                    <textarea ref={textareaRef} value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} rows={3} className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-5 outline-none placeholder:text-muted-foreground focus:border-brand" placeholder="Čo chcete na tomto mieste zmeniť?" />
                  </label>
                  {error && <p role="alert" className="text-xs leading-5 text-destructive">{error}</p>}
                  <button type="submit" disabled={!body.trim() || saving} className="sticky bottom-0 z-10 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45">
                    {saving ? <><RefreshCw className="size-3.5 animate-spin" /> Ukladám…</> : <><Send className="size-3.5" /> Pridať komentár</>}
                  </button>
                </form>
              </div>
            )}

            {comments.map((comment, index) => (
              <div
                key={comment.id}
                ref={(node) => setCardRef(comment.id, node)}
                className={`overflow-hidden rounded-xl border transition-colors ${selectedId === comment.id && !draft ? 'border-brand bg-brand-soft/45' : 'border-border bg-card hover:border-brand/40'}`}
              >
                {confirmingDeleteId === comment.id ? (
                  <div className="p-3">
                    <p className="text-sm font-semibold">Vymazať komentár {index + 1}?</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Táto akcia sa nedá vrátiť späť.</p>
                    {error && <p role="alert" className="mt-2 text-xs leading-5 text-destructive">{error}</p>}
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => { setConfirmingDeleteId(null); setError('') }} disabled={deletingId === comment.id} className="min-h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-secondary disabled:opacity-45">Zrušiť</button>
                      <button type="button" onClick={() => void deleteComment(comment.id)} disabled={deletingId === comment.id} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45">
                        {deletingId === comment.id ? <><RefreshCw className="size-3.5 animate-spin" /> Mažem…</> : <><Trash2 className="size-3.5" /> Vymazať</>}
                      </button>
                    </div>
                  </div>
                ) : editingId === comment.id ? (
                  <form onSubmit={(event) => void submitEdit(event)} className="space-y-2.5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-brand">Upraviť komentár {index + 1}</p>
                      <button type="button" onClick={cancelEditing} className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground" aria-label="Zrušiť úpravu"><X className="size-3.5" /></button>
                    </div>
                    <label className="block">
                      <span className="sr-only">Vaše meno</span>
                      <input value={editAuthorName} onChange={(event) => setEditAuthorName(event.target.value)} maxLength={80} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand" placeholder="Vaše meno (nepovinné)" />
                    </label>
                    <label className="block">
                      <span className="sr-only">Komentár</span>
                      <textarea ref={editTextareaRef} value={editBody} onChange={(event) => setEditBody(event.target.value)} maxLength={2000} rows={3} className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-5 outline-none placeholder:text-muted-foreground focus:border-brand" placeholder="Text komentára" />
                    </label>
                    {error && <p role="alert" className="text-xs leading-5 text-destructive">{error}</p>}
                    <div className="sticky bottom-0 z-10 flex gap-2 bg-brand-soft/95 py-1">
                      <button type="button" onClick={cancelEditing} disabled={savingEdit} className="min-h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-secondary disabled:opacity-45">Zrušiť</button>
                      <button type="submit" disabled={!editBody.trim() || savingEdit} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45">
                        {savingEdit ? <><RefreshCw className="size-3.5 animate-spin" /> Ukladám…</> : <><Save className="size-3.5" /> Uložiť</>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <button type="button" onClick={() => selectComment(comment.id)} className="w-full p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
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
                    {selectedId === comment.id && !draft && (
                      <div className="flex justify-end gap-1 border-t border-brand/15 px-2 py-1.5">
                        <button type="button" onClick={() => startEditing(comment)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-brand hover:bg-background" aria-label={`Upraviť komentár ${index + 1}`}><Pencil className="size-3.5" /> Upraviť</button>
                        <button type="button" onClick={() => confirmDelete(comment.id)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10" aria-label={`Vymazať komentár ${index + 1}`}><Trash2 className="size-3.5" /> Vymazať</button>
                      </div>
                    )}
                  </>
                )}
              </div>
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

          <div className={`${mobileFormOpen ? 'hidden' : 'flex'} items-center gap-2 border-t border-border px-4 py-3 text-[11px] text-muted-foreground lg:flex`}>
            <Check className="size-3.5 text-emerald-600" /> Body sa ukladajú presne aj pri priblížení.
          </div>
        </aside>
      </div>
    </section>
  )
}
