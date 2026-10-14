'use client'

import { useEffect, useId, useMemo, useState } from 'react'

import impactData from '@/data/impact.json'
import { useInView } from '@/components/poincar3/reveal'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

type MonthMap = Record<string, number>

type Snapshot = {
  generatedAt: string
  sources: { citations: string; stars: string }
  totals: { citations: number; hIndex: number; stars: number; papers: number }
  milestones: { month: string; label: string }[]
  papers: {
    key: string
    label: string
    venue: string
    arxiv: string
    title: string | null
    published?: string | null
    citations: number
    undated: number
    monthly: MonthMap
  }[]
  repos: {
    key: string
    label: string
    repo: string
    url: string
    created: string | null
    stars: number
    monthly: MonthMap
  }[]
}

const impact = impactData as unknown as Snapshot

/**
 * Colour slot per entity, not per rank — a paper and its repository share a
 * hue, and filtering a series out never repaints the survivors. The stack is
 * drawn in this order so every touching pair is a validated adjacent pair.
 */
const SLOT: Record<string, number> = {
  loma: 1,
  romav2: 2,
  mum: 3,
  poincar3: 4,
  octic: 5,
  romaomega: 6,
  orientation: 7,
  flopping: 8,
}

const MODES = [
  { id: 'citations', label: 'Citations', noun: 'citations', source: 'Semantic Scholar' },
  { id: 'stars', label: 'GitHub stars', noun: 'stars', source: 'GitHub' },
] as const

type ModeId = (typeof MODES)[number]['id']

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function monthLabel(month: string, long = false) {
  const [year, m] = month.split('-')
  const name = MONTH_NAMES[Number(m) - 1]
  return long ? `${name} ${year}` : `${name} '${year.slice(2)}`
}

/** Every month from the first datapoint to the last, with no gaps. */
const MONTHS: string[] = (() => {
  const all = [...impact.papers, ...impact.repos].flatMap((row) => Object.keys(row.monthly))
  if (!all.length) return []
  const first = all.reduce((a, b) => (a < b ? a : b))
  const last = all.reduce((a, b) => (a > b ? a : b))
  const out: string[] = []
  let [y, m] = first.split('-').map(Number)
  for (;;) {
    const cursor = `${y}-${String(m).padStart(2, '0')}`
    out.push(cursor)
    if (cursor === last) break
    if (++m > 12) { m = 1; y++ }
  }
  return out
})()

type Series = {
  key: string
  label: string
  sublabel: string
  color: string
  total: number
  /** Cumulative value at each month in MONTHS. */
  cumulative: number[]
}

/** Both views share one x-axis, so switching never shifts the timeline. */
function seriesFor(mode: ModeId): Series[] {
  const rows: Series[] =
    mode === 'citations'
      ? impact.papers.map((p) => ({
          key: p.key,
          label: p.label,
          sublabel: p.venue,
          color: `var(--series-${SLOT[p.key] ?? 8})`,
          total: p.citations,
          cumulative: cumulate(p.monthly),
        }))
      : impact.repos.map((r) => ({
          key: r.key,
          label: impact.papers.find((p) => p.key === r.key)?.label ?? r.label,
          sublabel: r.repo,
          color: `var(--series-${SLOT[r.key] ?? 8})`,
          total: r.stars,
          cumulative: cumulate(r.monthly),
        }))

  return rows
    .filter((s) => s.total > 0)
    .sort((a, b) => (SLOT[a.key] ?? 99) - (SLOT[b.key] ?? 99))
}

function cumulate(monthly: MonthMap) {
  let running = 0
  return MONTHS.map((month) => (running += monthly[month] ?? 0))
}

/** Running total across several month maps, for the stat tiles' trend lines. */
function totalsOver(maps: MonthMap[]) {
  return maps.reduce<number[]>(
    (acc, monthly) => cumulate(monthly).map((v, i) => v + (acc[i] ?? 0)),
    MONTHS.map(() => 0),
  )
}

/** A round tick step, so the axis never reads 0 / 375 / 750 / 1,125. */
function niceStep(rough: number) {
  if (rough <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude
    if (candidate >= rough) return candidate
  }
  return 10 * magnitude
}

const fmt = (n: number) => n.toLocaleString('en-US')

/* ------------------------------------------------------------------ */
/* Geometry                                                           */
/* ------------------------------------------------------------------ */

/**
 * The SVG scales to its container, so the viewBox has to narrow on a phone —
 * otherwise a 10px label renders at 4px. Two layouts, same chart.
 */
const LAYOUTS = {
  wide: { W: 820, H: 320, ML: 46, MR: 18, MT: 16, MB: 42, fs: 10, tickEvery: 3 },
  compact: { W: 440, H: 300, ML: 44, MR: 10, MT: 14, MB: 44, fs: 13, tickEvery: 6 },
} as const

/** True below the `sm` breakpoint. Starts wide, so SSR and hydration agree. */
function useCompact() {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setCompact(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return compact
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function ImpactChart() {
  const uid = useId().replace(/:/g, '')
  const { ref, seen } = useInView<HTMLDivElement>(0.15)
  const { W, H, ML, MR, MT, MB, fs, tickEvery } = LAYOUTS[useCompact() ? 'compact' : 'wide']
  const PLOT_BOTTOM = H - MB
  const PLOT_W = W - ML - MR
  const xAt = (i: number) =>
    MONTHS.length < 2 ? ML + PLOT_W / 2 : ML + (i / (MONTHS.length - 1)) * PLOT_W

  const [mode, setMode] = useState<ModeId>('citations')
  const [hidden, setHidden] = useState<Record<string, true>>({})
  const [focused, setFocused] = useState<string | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [milestone, setMilestone] = useState<number | null>(null)

  const all = useMemo(() => seriesFor(mode), [mode])
  const visible = useMemo(() => all.filter((s) => !hidden[s.key]), [all, hidden])

  /** Upper boundary of each band, bottom-up; the last one is the running total. */
  const stacked = useMemo(() => {
    const bands: number[][] = []
    const running = MONTHS.map(() => 0)
    for (const s of visible) {
      s.cumulative.forEach((v, i) => (running[i] += v))
      bands.push([...running])
    }
    return bands
  }, [visible])

  const totalLine = stacked.length ? stacked[stacked.length - 1] : MONTHS.map(() => 0)
  const TICK_COUNT = 4
  const step = niceStep(Math.max(...totalLine, 1) / TICK_COUNT)
  const max = step * TICK_COUNT
  const yAt = (v: number) => PLOT_BOTTOM - (v / max) * (PLOT_BOTTOM - MT)

  const ticks = useMemo(
    () => Array.from({ length: TICK_COUNT + 1 }, (_, i) => step * i),
    [step],
  )

  // Step back from the latest month so the newest tick is always labelled and
  // the spacing stays even — forcing the last one on top of a regular tick
  // collides at the right edge.
  const xTicks = useMemo(() => {
    const out: number[] = []
    for (let i = MONTHS.length - 1; i >= 0; i -= tickEvery) out.unshift(i)
    return out
  }, [tickEvery])

  const milestones = useMemo(
    () =>
      impact.milestones
        .map((m) => ({ ...m, index: MONTHS.indexOf(m.month) }))
        .filter((m) => m.index >= 0),
    [],
  )

  // Both tiles below carry a real history, not a decoration: the h-index is
  // recomputed from every paper's citations as they stood that month, and the
  // paper count steps on each release date.
  const citationHistory = useMemo(() => totalsOver(impact.papers.map((p) => p.monthly)), [])
  const starHistory = useMemo(() => totalsOver(impact.repos.map((r) => r.monthly)), [])
  const hIndexHistory = useMemo(() => {
    const curves = impact.papers.map((p) => cumulate(p.monthly))
    return MONTHS.map((_, i) => hIndexOf(curves.map((c) => c[i])))
  }, [])
  const paperHistory = useMemo(
    () => MONTHS.map((month) => impact.papers.filter((p) => p.published && p.published <= month).length),
    [],
  )
  /**
   * Widen the window until the metric actually moved. The h-index steps once
   * or twice a year, so a fixed 3-month delta reads as a blank slot rather
   * than as "slow" — each tile names the window it ended up using.
   */
  const trend = (history: number[]) => {
    for (const window of [3, 6, 12]) {
      const prior = history[history.length - 1 - window]
      if (prior === undefined) break
      const change = history[history.length - 1] - prior
      if (change > 0) return { change, window }
    }
    return null
  }

  const activeMode = MODES.find((m) => m.id === mode)!
  const hoverRows =
    hover === null
      ? []
      : visible
          .map((s, band) => ({ series: s, value: s.cumulative[hover], band }))
          .filter((row) => row.value > 0)
          .sort((a, b) => b.value - a.value)

  const hoverMilestone = hover === null ? undefined : milestones.find((m) => m.index === hover)

  function pointerMonth(clientX: number, target: SVGSVGElement) {
    const box = target.getBoundingClientRect()
    const vx = ((clientX - box.left) / box.width) * W
    const raw = Math.round(((vx - ML) / PLOT_W) * (MONTHS.length - 1))
    return Math.min(MONTHS.length - 1, Math.max(0, raw))
  }

  return (
    <div ref={ref}>
      {/* Stat tiles — the headline numbers, so no value is tooltip-only */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Citations"
          value={impact.totals.citations}
          delta={trend(citationHistory)}
          spark={citationHistory}
          seen={seen}
        />
        <StatTile
          label="h-index"
          value={impact.totals.hIndex}
          delta={trend(hIndexHistory)}
          spark={hIndexHistory}
          seen={seen}
        />
        <StatTile
          label="GitHub stars"
          value={impact.totals.stars}
          delta={trend(starHistory)}
          spark={starHistory}
          seen={seen}
        />
        <StatTile
          label="Papers"
          value={impact.totals.papers}
          delta={trend(paperHistory)}
          spark={paperHistory}
          seen={seen}
        />
      </div>

      {/* Controls — one row, above everything they scope */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Metric"
          className="inline-flex rounded-lg border bg-muted/40 p-1"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => {
                setMode(m.id)
                setHover(null)
              }}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                mode === m.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground sm:ml-auto">
          Cumulative, by month · updated {monthLabel(impact.generatedAt.slice(0, 7), true)}
        </p>
      </div>

      {/* Chart */}
      <div className="relative mt-4 rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-pan-y select-none"
          role="img"
          aria-label={`Cumulative ${activeMode.noun} by month from ${monthLabel(MONTHS[0], true)} to ${monthLabel(MONTHS[MONTHS.length - 1], true)}, stacked by ${mode === 'citations' ? 'paper' : 'repository'}. Total ${fmt(totalLine[totalLine.length - 1] ?? 0)}.`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
            e.preventDefault()
            setHover((h) => {
              const next = (h ?? MONTHS.length - 1) + (e.key === 'ArrowRight' ? 1 : -1)
              return Math.min(MONTHS.length - 1, Math.max(0, next))
            })
          }}
          onBlur={() => setHover(null)}
        >
          <defs>
            {/* Left-to-right reveal: a fill can't be drawn on like a stroke */}
            <clipPath id={`${uid}-reveal`}>
              <rect
                x={ML}
                y={0}
                height={H}
                width={seen ? PLOT_W : 0}
                style={{
                  width: seen ? PLOT_W : 0,
                  transition: 'width 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </clipPath>
          </defs>

          {/* Gridlines — solid hairlines, one step off the surface */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={ML}
                x2={W - MR}
                y1={yAt(t)}
                y2={yAt(t)}
                stroke="currentColor"
                strokeOpacity={t === 0 ? 0.22 : 0.09}
                strokeWidth="1"
              />
              <text
                x={ML - 9}
                y={yAt(t) + fs * 0.35}
                textAnchor="end"
                fontSize={fs}
                fill="currentColor"
                fillOpacity="0.5"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {fmt(Math.round(t))}
              </text>
            </g>
          ))}

          {/* Milestone rails */}
          {milestones.map((m) => (
            <line
              key={m.month}
              x1={xAt(m.index)}
              x2={xAt(m.index)}
              y1={MT}
              y2={PLOT_BOTTOM}
              stroke="currentColor"
              strokeOpacity={milestone === m.index ? 0.4 : 0.14}
              strokeWidth="1"
            />
          ))}

          <g clipPath={`url(#${uid}-reveal)`}>
            {/* Bands, bottom-up */}
            {stacked.map((upper, band) => {
              const lower = band === 0 ? MONTHS.map(() => 0) : stacked[band - 1]
              const s = visible[band]
              const up = upper.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)} ${yAt(v)}`).join(' ')
              const down = [...lower]
                .map((v, i) => ({ v, i }))
                .reverse()
                .map(({ v, i }) => `L${xAt(i)} ${yAt(v)}`)
                .join(' ')
              const dim = focused !== null && focused !== s.key
              return (
                <path
                  key={s.key}
                  d={`${up} ${down} Z`}
                  style={{
                    fill: s.color,
                    fillOpacity: dim ? 0.12 : 0.78,
                    transition: 'fill-opacity 220ms',
                  }}
                />
              )
            })}
            {/* 2px surface gaps do the separating — never a border on a mark */}
            {stacked.slice(0, -1).map((boundary, band) => (
              <path
                key={`gap-${visible[band].key}`}
                d={boundary.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)} ${yAt(v)}`).join(' ')}
                fill="none"
                strokeWidth="2"
                strokeLinejoin="round"
                style={{ stroke: 'hsl(var(--card))' }}
              />
            ))}
          </g>

          {/* X axis */}
          {xTicks.map((i) => (
            <text
              key={MONTHS[i]}
              x={xAt(i)}
              y={PLOT_BOTTOM + fs + 7}
              // The end labels hug the plot edges rather than overflowing them
              textAnchor={i === MONTHS.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
              fontSize={fs}
              fill="currentColor"
              fillOpacity="0.5"
            >
              {monthLabel(MONTHS[i])}
            </text>
          ))}

          {/* Milestone pins live below the plot, so they keep their own hover */}
          {milestones.map((m) => (
            <g
              key={`pin-${m.month}`}
              onPointerEnter={() => {
                setMilestone(m.index)
                setHover(m.index)
              }}
              onPointerLeave={() => {
                setMilestone(null)
                setHover(null)
              }}
              style={{ cursor: 'help' }}
            >
              <rect
                x={xAt(m.index) - 12}
                y={PLOT_BOTTOM + 22}
                width={24}
                height={18}
                fill="transparent"
              />
              <path
                d={`M${xAt(m.index)} ${PLOT_BOTTOM + 27} l4.5 4.5 -4.5 4.5 -4.5 -4.5 Z`}
                fill="currentColor"
                fillOpacity={milestone === m.index ? 0.85 : 0.35}
              />
              <title>{`${monthLabel(m.month, true)} — ${m.label}`}</title>
            </g>
          ))}

          {/* Crosshair */}
          {hover !== null && (
            <g pointerEvents="none">
              <line
                x1={xAt(hover)}
                x2={xAt(hover)}
                y1={MT}
                y2={PLOT_BOTTOM}
                stroke="currentColor"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              {stacked.map((upper, band) => (
                <circle
                  key={`dot-${visible[band].key}`}
                  cx={xAt(hover)}
                  cy={yAt(upper[hover])}
                  r={4}
                  style={{ fill: visible[band].color, stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                />
              ))}
            </g>
          )}

          {/* Hit layer — the reader aims at a month, never at a 1px line */}
          <rect
            x={ML}
            y={MT}
            width={PLOT_W}
            height={PLOT_BOTTOM - MT}
            fill="transparent"
            onPointerMove={(e) => setHover(pointerMonth(e.clientX, e.currentTarget.ownerSVGElement!))}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {/* Tooltip */}
        {hover !== null && hoverRows.length > 0 && (
          <div
            className="pointer-events-none absolute top-5 z-10 w-52 rounded-lg border bg-popover/95 p-3 shadow-lg backdrop-blur"
            style={{
              left: `${(xAt(hover) / W) * 100}%`,
              transform: `translateX(${hover < MONTHS.length / 3 ? '8px' : hover > (MONTHS.length * 2) / 3 ? '-100%' : '-50%'})`,
            }}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {monthLabel(MONTHS[hover], true)}
            </p>
            <p className="mt-0.5 text-lg font-semibold leading-none text-popover-foreground">
              {fmt(totalLine[hover])}{' '}
              <span className="text-xs font-normal text-muted-foreground">{activeMode.noun}</span>
            </p>
            {hoverMilestone && (
              <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                ◆ {hoverMilestone.label}
              </p>
            )}
            <div className="mt-2 space-y-1 border-t pt-2">
              {hoverRows.map(({ series, value }) => (
                <div key={series.key} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-0.5 w-3 shrink-0 rounded-full"
                    style={{ background: series.color }}
                  />
                  <span className="truncate text-muted-foreground">{series.label}</span>
                  <span
                    className="ml-auto font-semibold text-popover-foreground"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {fmt(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend — identity never rests on colour alone */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {all.map((s) => {
            const off = !!hidden[s.key]
            return (
              <button
                key={s.key}
                onClick={() => setHidden((h) => (off ? omit(h, s.key) : { ...h, [s.key]: true }))}
                onPointerEnter={() => setFocused(s.key)}
                onPointerLeave={() => setFocused(null)}
                onFocus={() => setFocused(s.key)}
                onBlur={() => setFocused(null)}
                aria-pressed={!off}
                title={`${s.sublabel} — click to ${off ? 'show' : 'hide'}`}
                className={cn(
                  'group flex items-center gap-1.5 text-xs transition-opacity',
                  off && 'opacity-40',
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: s.color, opacity: off ? 0.35 : 0.9 }}
                />
                <span className="text-muted-foreground group-hover:text-foreground">{s.label}</span>
                <span
                  className="font-medium text-foreground"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmt(s.total)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        ◆ marks a milestone. Citations come from{' '}
        <a
          href="https://www.semanticscholar.org/product/api"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:no-underline"
        >
          Semantic Scholar
        </a>
        , so they run lower than Google Scholar&apos;s count.
      </p>
    </div>
  )
}

/** h-index of a list of citation counts. */
function hIndexOf(counts: number[]) {
  const sorted = [...counts].sort((a, b) => b - a)
  let h = 0
  while (h < sorted.length && sorted[h] >= h + 1) h++
  return h
}

function omit(map: Record<string, true>, key: string) {
  const next = { ...map }
  delete next[key]
  return next
}

/* ------------------------------------------------------------------ */
/* Stat tile                                                          */
/* ------------------------------------------------------------------ */

function StatTile({
  label,
  value,
  delta,
  spark,
  seen,
}: {
  label: string
  value: number
  delta?: { change: number; window: number } | null
  spark?: number[]
  seen: boolean
}) {
  const points = spark?.slice(-12) ?? []
  const peak = Math.max(...points, 1)

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold leading-none tracking-tight sm:text-3xl">
        {fmt(value)}
      </p>
      {/* Held even when empty, so every tile's trend line shares a baseline */}
      <p className="mt-1.5 text-xs" style={delta ? { color: 'var(--series-up)' } : undefined}>
        {delta ? (
          <>
            +{fmt(delta.change)}{' '}
            <span className="text-muted-foreground">last {delta.window} months</span>
          </>
        ) : (
          <span aria-hidden="true">&nbsp;</span>
        )}
      </p>
      {points.length > 1 && (
        <svg viewBox="0 0 100 24" className="mt-2 h-6 w-full" aria-hidden="true" preserveAspectRatio="none">
          <path
            d={points
              .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (points.length - 1)) * 100} ${22 - (v / peak) * 19}`)
              .join(' ')}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: 220,
              strokeDashoffset: seen ? 0 : 220,
              transition: 'stroke-dashoffset 1400ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </svg>
      )}
    </div>
  )
}
