'use client'

import { useState } from 'react'
import { useInView } from './reveal'
import { cn } from '@/lib/utils'

const OURS = '#4285f4'

/* ------------------------------------------------------------------ */
/* Headline results — the six panels from the paper's teaser figure.   */
/* ------------------------------------------------------------------ */

type Bar = { name: string; value: number }
type Panel = {
  title: string
  metric: string
  higherIsBetter: boolean
  bars: Bar[]
}

const HEADLINE: Panel[] = [
  {
    title: 'Pose estimation · RE10K',
    metric: 'AUC@30°',
    higherIsBetter: true,
    bars: [
      { name: 'Poincar3', value: 62.2 },
      { name: 'Muskie', value: 41.5 },
      { name: 'MuM', value: 40.1 },
      { name: 'DINOv3', value: 29.1 },
    ],
  },
  {
    title: 'Pose estimation · ScanNet++',
    metric: 'AUC@30°',
    higherIsBetter: true,
    bars: [
      { name: 'Poincar3', value: 52.1 },
      { name: 'MuM', value: 30.2 },
      { name: 'Muskie', value: 28.1 },
      { name: 'DINOv3', value: 22.0 },
    ],
  },
  {
    title: 'Point cloud error · ETH3D',
    metric: 'mm',
    higherIsBetter: false,
    bars: [
      { name: 'Poincar3', value: 0.75 },
      { name: 'Muskie', value: 0.88 },
      { name: 'DINOv3', value: 0.95 },
      { name: 'MuM', value: 1.0 },
    ],
  },
  {
    title: 'Normal consistency · DTU',
    metric: 'cos θ',
    higherIsBetter: true,
    bars: [
      { name: 'Poincar3', value: 0.61 },
      { name: 'Muskie', value: 0.58 },
      { name: 'DINOv3', value: 0.58 },
      { name: 'MuM', value: 0.56 },
    ],
  },
  {
    title: 'Matching · ScanNet',
    metric: 'PCK@25',
    higherIsBetter: true,
    bars: [
      { name: 'Poincar3', value: 79.5 },
      { name: 'Muskie', value: 70.1 },
      { name: 'MuM', value: 66.9 },
      { name: 'DINOv3', value: 56.8 },
    ],
  },
  {
    title: 'SE(3) decodability',
    metric: 'R² > 0',
    higherIsBetter: true,
    bars: [
      { name: 'Poincar3', value: 55.7 },
      { name: 'MuM', value: 51.7 },
      { name: 'Muskie', value: 46.3 },
      { name: 'DINOv3', value: 42.5 },
    ],
  },
]

function HeadlinePanel({ panel, delay }: { panel: Panel; delay: number }) {
  const { ref, seen } = useInView<HTMLDivElement>()
  const values = panel.bars.map((b) => b.value)
  const best = panel.higherIsBetter ? Math.max(...values) : Math.min(...values)

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card/40 p-5">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight">{panel.title}</h3>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          {panel.metric} {panel.higherIsBetter ? '↑' : '↓'}
        </span>
      </div>
      <div className="space-y-2.5">
        {panel.bars.map((bar, i) => {
          // Bar length always encodes "better = longer", so the winner reads
          // the same way whether the metric is maximised or minimised.
          const frac = panel.higherIsBetter ? bar.value / best : best / bar.value
          const ours = bar.name === 'Poincar3'
          return (
            <div key={bar.name} className="flex items-center gap-3">
              <span
                className={cn(
                  'w-[68px] shrink-0 text-right text-xs',
                  ours ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {bar.name}
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded-[3px] bg-muted/60">
                <div
                  className="h-full rounded-[3px] transition-[width] duration-[900ms] ease-out"
                  style={{
                    width: seen ? `${frac * 100}%` : '0%',
                    transitionDelay: `${delay + i * 80}ms`,
                    background: ours ? OURS : 'hsl(var(--muted-foreground) / 0.35)',
                  }}
                />
              </div>
              <span
                className={cn(
                  'w-[46px] shrink-0 font-mono text-xs tabular-nums',
                  ours ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {bar.value.toFixed(panel.metric === 'mm' || panel.metric === 'cos θ' ? 2 : 1)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function HeadlineResults() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {HEADLINE.map((p, i) => (
        <HeadlinePanel key={p.title} panel={p} delay={i * 60} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Ablation ladder — each ingredient, stacked.                         */
/* ------------------------------------------------------------------ */

type Step = {
  numeral: string
  label: string
  scannet: number
  navi: number
  kind?: 'rgb' | 'ours'
}

const LADDER: Step[] = [
  { numeral: 'I', label: 'RGB reconstruction (MuM objective)', scannet: 54.5, navi: 46.3, kind: 'rgb' },
  { numeral: 'II', label: 'Baseline (DINOv2 objective)', scannet: 47.2, navi: 35.7 },
  { numeral: 'III', label: 'Multi-view DINOv2', scannet: 49.7, navi: 35.9 },
  { numeral: 'IV', label: 'Multi-view iBOT (drop local crops)', scannet: 55.7, navi: 46.4 },
  { numeral: 'V', label: '+ image-level objective', scannet: 66.7, navi: 58.1 },
  { numeral: 'VI', label: '+ teacher sees extra views', scannet: 70.2, navi: 61.5 },
  { numeral: 'VII', label: '+ scale up  →  Poincar3', scannet: 83.7, navi: 74.5, kind: 'ours' },
]

export function AblationLadder() {
  const { ref, seen } = useInView<HTMLDivElement>()
  const max = 90

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: OURS }} />
          ScanNet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: OURS, opacity: 0.42 }} />
          NAVI
        </span>
        <span className="ml-auto font-mono">PCK@25 ↑ · fixed compute, data &amp; architecture</span>
      </div>

      <div className="space-y-3">
        {LADDER.map((step, i) => {
          const accent =
            step.kind === 'ours' ? OURS : step.kind === 'rgb' ? '#d6582b' : 'hsl(var(--muted-foreground))'
          const strong = step.kind === 'ours'
          return (
            <div key={step.numeral} className="flex items-center gap-3">
              <span
                className={cn(
                  'w-8 shrink-0 text-right font-mono text-[11px]',
                  strong ? 'text-foreground' : 'text-muted-foreground/70',
                )}
              >
                {step.numeral}
              </span>
              <span
                className={cn(
                  'hidden w-[236px] shrink-0 truncate text-xs sm:block',
                  strong ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
                title={step.label}
              >
                {step.label}
              </span>
              <div className="flex-1 space-y-1">
                {(['scannet', 'navi'] as const).map((key, j) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-[2px] bg-muted/60">
                      <div
                        className="h-full rounded-[2px] transition-[width] duration-[900ms] ease-out"
                        style={{
                          width: seen ? `${(step[key] / max) * 100}%` : '0%',
                          transitionDelay: `${i * 90 + j * 45}ms`,
                          background: accent,
                          opacity: j === 0 ? (step.kind ? 0.95 : 0.4) : step.kind ? 0.45 : 0.22,
                        }}
                      />
                    </div>
                    <span
                      className={cn(
                        'w-9 shrink-0 font-mono text-[11px] tabular-nums',
                        strong ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {step[key].toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground sm:hidden">
        Rows I–VII follow the ablation in the paper; hover labels are hidden on small screens.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Multi-view correspondence — accuracy across PCK thresholds.         */
/* ------------------------------------------------------------------ */

type Series = { name: string; values: number[]; color: string; dashed?: boolean; ours?: boolean }

const THRESHOLDS = [5, 10, 25, 50]

const CORR: Record<'nn' | 'attn', Record<'scannet' | 'navi', Series[]>> = {
  nn: {
    scannet: [
      { name: 'Poincar3', values: [27.9, 46.2, 79.5, 89.6], color: OURS, ours: true },
      { name: 'Muskie', values: [27.7, 42.4, 70.1, 83.1], color: '#14b8a6' },
      { name: 'MuM', values: [27.0, 40.5, 66.9, 79.9], color: '#ec4899' },
      { name: 'DINOv3', values: [24.7, 33.9, 56.8, 72.2], color: '#a855f7' },
      { name: 'π³', values: [26.7, 38.6, 61.3, 75.6], color: '#f59e0b', dashed: true },
      { name: 'VGGT-Ω', values: [24.5, 32.8, 52.9, 69.0], color: '#64748b', dashed: true },
      { name: 'DA3', values: [21.5, 22.9, 28.2, 35.2], color: '#94a3b8', dashed: true },
    ],
    navi: [
      { name: 'Poincar3', values: [19.2, 33.7, 68.7, 84.2], color: OURS, ours: true },
      { name: 'Muskie', values: [18.7, 32.7, 64.7, 80.5], color: '#14b8a6' },
      { name: 'MuM', values: [17.9, 30.2, 60.2, 74.9], color: '#ec4899' },
      { name: 'DINOv3', values: [17.6, 28.7, 59.6, 78.7], color: '#a855f7' },
      { name: 'π³', values: [18.2, 30.3, 60.2, 78.8], color: '#f59e0b', dashed: true },
      { name: 'VGGT-Ω', values: [16.8, 25.9, 51.6, 70.9], color: '#64748b', dashed: true },
      { name: 'DA3', values: [14.6, 18.6, 30.5, 46.9], color: '#94a3b8', dashed: true },
    ],
  },
  attn: {
    scannet: [
      { name: 'Poincar3', values: [27.0, 43.9, 83.7, 94.9], color: OURS, ours: true },
      { name: 'MuM', values: [25.6, 37.2, 64.7, 77.2], color: '#ec4899' },
      { name: 'Muskie', values: [24.6, 34.7, 62.9, 81.5], color: '#14b8a6' },
      { name: 'π³', values: [27.0, 40.7, 68.7, 83.8], color: '#f59e0b', dashed: true },
      { name: 'VGGT-Ω', values: [24.3, 32.9, 54.2, 68.9], color: '#64748b', dashed: true },
      { name: 'DA3', values: [21.4, 23.2, 28.2, 34.0], color: '#94a3b8', dashed: true },
    ],
    navi: [
      { name: 'Poincar3', values: [19.3, 34.7, 74.5, 86.5], color: OURS, ours: true },
      { name: 'MuM', values: [17.4, 28.5, 56.6, 68.7], color: '#ec4899' },
      { name: 'Muskie', values: [15.5, 22.3, 46.2, 67.9], color: '#14b8a6' },
      { name: 'π³', values: [18.3, 30.4, 62.2, 82.0], color: '#f59e0b', dashed: true },
      { name: 'VGGT-Ω', values: [16.3, 23.9, 46.8, 63.7], color: '#64748b', dashed: true },
      { name: 'DA3', values: [14.8, 19.1, 31.6, 46.7], color: '#94a3b8', dashed: true },
    ],
  },
}

function CorrPlot({
  series,
  title,
  animate,
  hovered,
}: {
  series: Series[]
  title: string
  animate: boolean
  hovered: string | null
}) {
  const W = 330
  const H = 230
  const ML = 34
  const MR = 12
  const MT = 14
  const MB = 30
  const px = (i: number) => ML + (i / (THRESHOLDS.length - 1)) * (W - ML - MR)
  const py = (v: number) => MT + (1 - v / 100) * (H - MT - MB)

  return (
    <figure className="min-w-0">
      <figcaption className="mb-1 text-center text-xs font-semibold text-foreground">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line
              x1={ML}
              x2={W - MR}
              y1={py(g)}
              y2={py(g)}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
            <text
              x={ML - 7}
              y={py(g) + 3.5}
              textAnchor="end"
              fontSize="9"
              fill="currentColor"
              fillOpacity="0.45"
            >
              {g}
            </text>
          </g>
        ))}
        {THRESHOLDS.map((t, i) => (
          <text
            key={t}
            x={px(i)}
            y={H - MB + 16}
            textAnchor="middle"
            fontSize="9.5"
            fill="currentColor"
            fillOpacity="0.55"
          >
            {t}px
          </text>
        ))}
        <text x={(ML + W - MR) / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.4">
          PCK threshold
        </text>

        {series.map((s) => {
          const dim = hovered !== null && hovered !== s.name
          const d = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)} ${py(v)}`).join(' ')
          return (
            <g key={s.name} opacity={dim ? 0.15 : 1} style={{ transition: 'opacity 200ms' }}>
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={s.ours ? 2.6 : 1.5}
                strokeDasharray={s.dashed ? '5 4' : animate ? '600' : undefined}
                strokeDashoffset={s.dashed ? undefined : animate ? 0 : 600}
                style={
                  s.dashed
                    ? undefined
                    : { transition: 'stroke-dashoffset 1200ms cubic-bezier(0.4,0,0.2,1)' }
                }
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={px(i)}
                  cy={py(v)}
                  r={s.ours ? 3.2 : 2.1}
                  fill={s.color}
                  opacity={animate ? 1 : 0}
                  style={{ transition: `opacity 400ms ${600 + i * 100}ms` }}
                />
              ))}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export function CorrespondenceChart() {
  const [mode, setMode] = useState<'attn' | 'nn'>('attn')
  const [hovered, setHovered] = useState<string | null>(null)
  const { ref, seen } = useInView<HTMLDivElement>()
  const data = CORR[mode]

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          {(
            [
              ['attn', 'Attention matching'],
              ['nn', 'Feature NN matching'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                mode === key
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          zero-shot, 8 views · accuracy ↑
        </span>
      </div>

      <div className="grid gap-6 text-foreground sm:grid-cols-2">
        <CorrPlot series={data.scannet} title="ScanNet" animate={seen} hovered={hovered} />
        <CorrPlot series={data.navi} title="NAVI" animate={seen} hovered={hovered} />
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4">
        {data.scannet.map((s) => (
          <button
            key={s.name}
            onMouseEnter={() => setHovered(s.name)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-opacity',
              hovered && hovered !== s.name ? 'opacity-40' : 'opacity-100',
              s.ours ? 'font-semibold text-foreground' : 'text-muted-foreground',
            )}
          >
            <svg width="16" height="8" aria-hidden="true">
              <line
                x1="0"
                y1="4"
                x2="16"
                y2="4"
                stroke={s.color}
                strokeWidth={s.ours ? 2.6 : 1.8}
                strokeDasharray={s.dashed ? '4 3' : undefined}
              />
            </svg>
            {s.name}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          dashed = trained with 3D supervision
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Poincaré adapter — does motion become linear in feature space?      */
/* ------------------------------------------------------------------ */

const ADAPTER = [
  { name: 'DINOv3', single: 0.046, multi: null },
  { name: 'Muskie', single: 0.042, multi: 0.061 },
  { name: 'MuM', single: 0.059, multi: 0.081 },
  { name: 'Poincar3', single: 0.053, multi: 0.098, ours: true },
]

export function AdapterChart() {
  const { ref, seen } = useInView<HTMLDivElement>()
  const max = 0.105

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-muted-foreground/50" />
          single view
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: OURS }} />
          multi-view
        </span>
        <span className="ml-auto font-mono">avg. R² ↑ · 20 held-out ScanNet++ scenes</span>
      </div>

      <div className="space-y-4">
        {ADAPTER.map((row, i) => (
          <div key={row.name} className="flex items-center gap-3">
            <span
              className={cn(
                'w-[68px] shrink-0 text-right text-xs',
                row.ours ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {row.name}
            </span>
            <div className="relative h-7 flex-1">
              {/* track */}
              <div className="absolute inset-y-0 left-0 right-0 my-auto h-[1px] bg-border" />
              {/* single-view marker */}
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-muted-foreground/60 bg-background transition-[left] duration-[900ms] ease-out"
                style={{ left: seen ? `${(row.single / max) * 100}%` : '0%', transitionDelay: `${i * 80}ms` }}
              />
              {/* connector + multi-view marker */}
              {row.multi !== null && (
                <>
                  <div
                    className="absolute top-1/2 h-[2px] -translate-y-1/2 transition-all duration-[900ms] ease-out"
                    style={{
                      left: `${(row.single / max) * 100}%`,
                      width: seen ? `${((row.multi - row.single) / max) * 100}%` : '0%',
                      background: row.ours ? OURS : 'hsl(var(--muted-foreground) / 0.4)',
                      transitionDelay: `${i * 80 + 120}ms`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-[900ms] ease-out"
                    style={{
                      left: seen ? `${(row.multi / max) * 100}%` : '0%',
                      background: row.ours ? OURS : 'hsl(var(--muted-foreground) / 0.55)',
                      transitionDelay: `${i * 80 + 120}ms`,
                    }}
                  />
                </>
              )}
            </div>
            <span
              className={cn(
                'w-[52px] shrink-0 font-mono text-xs tabular-nums',
                row.ours ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {(row.multi ?? row.single).toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Every model improves once the feature is allowed to see the scene move — the gap between the two
        markers is exactly what a motionless observer cannot acquire. DINOv3 has no multi-view mode.
      </p>
    </div>
  )
}
