'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { ArrowLeftIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, GithubIcon } from 'lucide-react'
import Link from 'next/link'

const R2_BASE = 'https://pub-a5c444900f9748e281dbfda946b92dc8.r2.dev'

const CORR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b',
  '#84cc16', '#6366f1', '#e11d48', '#0ea5e9', '#10b981',
  '#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8',
  '#818cf8', '#e879f9', '#2dd4bf', '#fb7185', '#c084fc',
  '#34d399', '#60a5fa', '#a78bfa',
]

type ImageMeta = {
  author?: string | null
  date?: string | null
  lat?: number | null
  lon?: number | null
  source_url?: string | null
}

type Pair = {
  id: number
  pair: string
  category: string
  subject: string
  path: string
  tags: string[]
  a_dims: [number, number]
  b_dims: [number, number]
  corresp: [number, number, number, number][]
  meta_a: ImageMeta
  meta_b: ImageMeta
}

type Metadata = {
  pairs: Pair[]
  total: number
}

function imageUrl(path: string, filename: string) {
  const encoded = path.split('/').map(encodeURIComponent).join('/')
  return `${R2_BASE}/${encoded}/${filename}`
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const SVG_GAP = 24

function CorrespondenceView({
  urlA,
  urlB,
  a_dims,
  b_dims,
  corresp,
}: {
  urlA: string
  urlB: string
  a_dims: [number, number]
  b_dims: [number, number]
  corresp: [number, number, number, number][]
}) {
  // Normalise both images to the same height, place side by side in one SVG
  const H = Math.max(a_dims[1], b_dims[1])
  const scaleA = H / a_dims[1]
  const wA = a_dims[0] * scaleA
  const scaleB = H / b_dims[1]
  const wB = b_dims[0] * scaleB
  const totalW = wA + SVG_GAP + wB

  return (
    <svg
      viewBox={`0 0 ${totalW} ${H}`}
      className="w-full h-auto rounded-lg"
      style={{ maxHeight: '65vh' }}
    >
      {/* Images */}
      <image href={urlA} x={0} y={0} width={wA} height={H} preserveAspectRatio="none" />
      <image href={urlB} x={wA + SVG_GAP} y={0} width={wB} height={H} preserveAspectRatio="none" />

      {/* Divider */}
      <rect x={wA} y={0} width={SVG_GAP} height={H} fill="hsl(var(--background))" />

      {/* Correspondences: lines first so dots render on top */}
      {corresp.map(([xA, yA, xB, yB], i) => {
        const color = CORR_COLORS[i % CORR_COLORS.length]
        const ax = xA * scaleA
        const ay = yA * scaleA
        const bx = wA + SVG_GAP + xB * scaleB
        const by = yB * scaleB
        return (
          <line
            key={`l${i}`}
            x1={ax} y1={ay} x2={bx} y2={by}
            stroke={color} strokeWidth={1.5} opacity={0.55}
          />
        )
      })}
      {corresp.map(([xA, yA, xB, yB], i) => {
        const color = CORR_COLORS[i % CORR_COLORS.length]
        const ax = xA * scaleA
        const ay = yA * scaleA
        const bx = wA + SVG_GAP + xB * scaleB
        const by = yB * scaleB
        return (
          <g key={`p${i}`}>
            <circle cx={ax} cy={ay} r={7} fill={color} stroke="white" strokeWidth={1.5} />
            <circle cx={bx} cy={by} r={7} fill={color} stroke="white" strokeWidth={1.5} />
          </g>
        )
      })}
    </svg>
  )
}

function formatCoords(lat: number, lon: number) {
  const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`
  const lonStr = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`
  return `${latStr} ${lonStr}`
}

function AttributionLine({ meta, label }: { meta: ImageMeta; label: string }) {
  const parts: React.ReactNode[] = []

  if (meta.author) parts.push(<span key="author">{meta.author}</span>)

  if (meta.date) parts.push(<span key="date">{meta.date.slice(0, 4)}</span>)

  if (meta.lat != null && meta.lon != null) {
    const mapsUrl = `https://www.openstreetmap.org/?mlat=${meta.lat}&mlon=${meta.lon}&zoom=12`
    parts.push(
      <a key="gps" href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
        {formatCoords(meta.lat, meta.lon)}
      </a>
    )
  }

  if (meta.source_url) {
    parts.push(
      <a key="src" href={meta.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
        source
      </a>
    )
  }

  if (parts.length === 0) return null

  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground/70">{label}:</span>{' '}
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1 opacity-40">·</span>}
          {part}
        </span>
      ))}
    </p>
  )
}

function PairModal({
  pair,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  pair: Pair
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-background border border-border rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {formatCategory(pair.category)}
            </span>
            <h2 className="text-sm font-semibold text-foreground mt-0.5 truncate max-w-[400px]">
              {pair.subject.replace(/_/g, ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {pair.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                {tag}
              </span>
            ))}
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
              {pair.corresp.length} correspondences
            </span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Correspondence view */}
        <div className="p-6">
          <CorrespondenceView
            urlA={imageUrl(pair.path, 'A_lr.jpg')}
            urlB={imageUrl(pair.path, 'B_lr.jpg')}
            a_dims={pair.a_dims}
            b_dims={pair.b_dims}
            corresp={pair.corresp}
          />

          {/* Attribution */}
          <div className="mt-4 pt-4 border-t border-border space-y-1">
            <AttributionLine meta={pair.meta_a} label="Image A" />
            <AttributionLine meta={pair.meta_b} label="Image B" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-4">
          <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev} className="gap-1">
            <ChevronLeftIcon className="h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext} className="gap-1">
            Next <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function PairCard({ pair, onClick }: { pair: Pair; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-lg overflow-hidden border border-border bg-muted/20 hover:border-foreground/30 transition-all duration-150 hover:shadow-md text-left"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl(pair.path, 'A_lr.jpg')}
        alt={pair.subject}
        className="w-full h-36 object-cover"
        loading="lazy"
      />
      <div className="p-2.5">
        <p className="text-xs font-medium text-foreground truncate leading-tight">
          {pair.subject.replace(/_/g, ' ')}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{pair.corresp.length} pts</p>
      </div>
    </button>
  )
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 mt-5">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function SidebarButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
        active
          ? 'bg-foreground text-background font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

export default function HardMatchPage() {
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [error, setError] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${R2_BASE}/metadata.json`)
      .then(r => r.json())
      .then(setMetadata)
      .catch(() => setError(true))
  }, [])

  const categories = useMemo(() => {
    if (!metadata) return []
    const counts: Record<string, number> = {}
    for (const p of metadata.pairs) {
      counts[p.category] = (counts[p.category] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
  }, [metadata])

  const allTags = useMemo(() => {
    if (!metadata) return []
    const counts: Record<string, number> = {}
    for (const p of metadata.pairs) {
      for (const tag of p.tags) {
        counts[tag] = (counts[tag] ?? 0) + 1
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [metadata])

  const filtered = useMemo(() => {
    if (!metadata) return []
    return metadata.pairs.filter(p => {
      if (activeCategory && p.category !== activeCategory) return false
      if (activeTag && !p.tags.includes(activeTag)) return false
      return true
    })
  }, [metadata, activeCategory, activeTag])

  const visible = useMemo(() => filtered.filter(p => p.corresp.length > 0), [filtered])

  const selectedPair = selectedIdx !== null ? visible[selectedIdx] : null

  const handleClose = useCallback(() => setSelectedIdx(null), [])
  const handlePrev = useCallback(() => setSelectedIdx(i => (i !== null && i > 0 ? i - 1 : i)), [])
  const handleNext = useCallback(
    () => setSelectedIdx(i => (i !== null && i < visible.length - 1 ? i + 1 : i)),
    [visible.length]
  )

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/loma" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeftIcon className="h-4 w-4" />
                LoMa
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-semibold">HardMatch Dataset</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/davnords/HardMatch" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <GithubIcon className="h-4 w-4" />
                davnords/HardMatch
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="pt-16 flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r border-border overflow-y-auto pt-4 pb-8 px-3">
          <SidebarSection title="Tag">
            <SidebarButton active={activeTag === null} onClick={() => setActiveTag(null)}>
              All
            </SidebarButton>
            {allTags.map(([tag, count]) => (
              <SidebarButton
                key={tag}
                active={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag} <span className="text-xs opacity-60">{count}</span>
              </SidebarButton>
            ))}
          </SidebarSection>

          <SidebarSection title="Category">
            <SidebarButton active={activeCategory === null} onClick={() => setActiveCategory(null)}>
              All <span className="text-xs opacity-60 ml-1">{metadata?.total ?? '…'}</span>
            </SidebarButton>
            {categories.map(([cat, count]) => (
              <SidebarButton
                key={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              >
                {formatCategory(cat)} <span className="text-xs opacity-60">{count}</span>
              </SidebarButton>
            ))}
          </SidebarSection>
        </aside>

        {/* Main grid */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Failed to load dataset. Make sure the R2 bucket is accessible.
            </div>
          )}

          {!metadata && !error && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Loading…
            </div>
          )}

          {metadata && (
            <div className="p-6">
              {/* Stats bar */}
              <div className="flex items-center gap-6 mb-6">
                <div>
                  <p className="text-2xl font-bold">{filtered.length}</p>
                  <p className="text-xs text-muted-foreground">
                    pairs{activeCategory ? ` in ${formatCategory(activeCategory)}` : ''}
                    {activeTag ? ` tagged "${activeTag}"` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-xs text-muted-foreground">categories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filtered.reduce((s, p) => s + p.corresp.length, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">annotated correspondences</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {visible.map((pair, idx) => (
                  <PairCard key={pair.id} pair={pair} onClick={() => setSelectedIdx(idx)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedPair && (
        <PairModal
          pair={selectedPair}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={selectedIdx !== null && selectedIdx > 0}
          hasNext={selectedIdx !== null && selectedIdx < visible.length - 1}
        />
      )}
    </main>
  )
}
