'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useInView } from '@/components/poincar3/reveal'
import { MU, OMEGA, OTHER, PI3 } from './palette'

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs transition-colors',
            o.value === value ? 'bg-background font-medium text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

const log10 = (x: number) => Math.log(x) / Math.LN10

/* ------------------------------------------------------------------ */
/* Scaling with sequence length — Table "efficient VGGT variants".     */
/* ------------------------------------------------------------------ */

type Series = { name: string; color: string; ours?: boolean; dashed?: boolean; time: number[]; mem: number[]; camb3: number[]; scan3: number[] }

const FRAMES = [100, 500, 1000]

const SCALING: Series[] = [
  { name: 'VGGT-μ', color: MU, ours: true, time: [0.13, 1.38, 4.61], mem: [1.4, 5.3, 9.8], camb3: [57.9, 60.3, 60.1], scan3: [65.5, 67.0, 66.8] },
  { name: 'VGGT-μ + merging', color: MU, ours: true, dashed: true, time: [0.12, 0.86, 2.47], mem: [1.4, 5.3, 9.8], camb3: [47.2, 56.9, 58.7], scan3: [58.1, 64.9, 64.9] },
  { name: 'VGGT-Ω₅₁₂', color: OMEGA, time: [3.01, 51.7, 203.6], mem: [11.7, 41.8, 79.4], camb3: [57.4, 51.6, 47.6], scan3: [32.7, 32.9, 32.6] },
  { name: 'LiteVGGT', color: PI3, time: [2.08, 26.5, 91.7], mem: [9.2, 36.1, 66.5], camb3: [36.1, 31.9, 28.3], scan3: [21.5, 16.1, 14.7] },
  { name: 'FastVGGT', color: OTHER, time: [4.53, 69.6, 246.1], mem: [10.5, 44.2, 86.3], camb3: [33.8, 28.1, 22.7], scan3: [12.4, 12.1, 11.8] },
]

type ScalingMetric = 'time' | 'mem' | 'camb3' | 'scan3'
const SCALING_META: Record<ScalingMetric, { label: string; axis: string; log: boolean; lo: number; hi: number; fmt: (v: number) => string }> = {
  time: { label: 'Runtime', axis: 'seconds, log scale ↓', log: true, lo: 0.1, hi: 400, fmt: (v) => (v < 10 ? v.toFixed(2) : v.toFixed(0)) + ' s' },
  mem: { label: 'Memory', axis: 'peak GiB ↓', log: false, lo: 0, hi: 96, fmt: (v) => v.toFixed(1) + ' GiB' },
  camb3: { label: 'Cambridge', axis: 'AUC@3° on Cambridge ↑', log: false, lo: 0, hi: 70, fmt: (v) => v.toFixed(1) },
  scan3: { label: 'ScanNet++', axis: 'AUC@3° on ScanNet++ ↑', log: false, lo: 0, hi: 70, fmt: (v) => v.toFixed(1) },
}

export function ScalingChart() {
  // accuracy is one view with a dataset switch, so the top level reads runtime / memory / accuracy
  const [view, setView] = useState<'time' | 'mem' | 'acc'>('time')
  const [dataset, setDataset] = useState<'camb3' | 'scan3'>('camb3')
  const metric: ScalingMetric = view === 'acc' ? dataset : view
  const [hover, setHover] = useState<string | null>(null)
  const { ref, seen } = useInView<HTMLDivElement>()
  const m = SCALING_META[metric]

  const W = 640
  const H = 300
  const L = 52
  const R = 175
  const T = 16
  const B = 34
  const x = (f: number) => L + ((f - 100) / 900) * (W - L - R)
  const y = (v: number) => {
    const t = m.log ? (log10(v) - log10(m.lo)) / (log10(m.hi) - log10(m.lo)) : (v - m.lo) / (m.hi - m.lo)
    return H - B - t * (H - T - B)
  }
  const ticks = m.log ? [0.1, 1, 10, 100] : metric === 'mem' ? [0, 24, 48, 72, 96] : [0, 20, 40, 60]

  // end-of-line labels: nudge apart so lines that finish close together stay readable
  const labelY = new Map<string, number>()
  const GAP = 14
  const order = [...SCALING].sort((a, b) => y(a[metric][2]) - y(b[metric][2]))
  order.forEach((s, i) => {
    const want = y(s[metric][2])
    const prev = i > 0 ? labelY.get(order[i - 1].name)! : -Infinity
    labelY.set(s.name, Math.max(want, prev + GAP))
  })

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card/40 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'time', label: 'Runtime' },
              { value: 'mem', label: 'Memory' },
              { value: 'acc', label: 'Accuracy' },
            ]}
          />
          {view === 'acc' && (
            <Segmented
              value={dataset}
              onChange={setDataset}
              options={[
                { value: 'camb3', label: 'Cambridge' },
                { value: 'scan3', label: 'ScanNet++' },
              ]}
            />
          )}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{m.axis}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${m.label} against number of frames`}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={L} x2={W - R} y1={y(tk)} y2={y(tk)} stroke="hsl(var(--border))" />
            <text x={L - 8} y={y(tk)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[10px]">
              {m.log ? (tk < 1 ? tk : tk.toLocaleString('en-US')) : tk}
            </text>
          </g>
        ))}
        {metric === 'mem' && (
          <text x={W - R} y={y(96) - 5} textAnchor="end" className="fill-muted-foreground text-[10px]">
            GH200 capacity
          </text>
        )}
        {FRAMES.map((f) => (
          <text key={f} x={x(f)} y={H - B + 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            {f.toLocaleString('en-US')} frames
          </text>
        ))}
        {SCALING.map((s, si) => {
          const vals = s[metric]
          const pts = vals.map((v, i) => `${x(FRAMES[i])},${y(v)}`).join(' ')
          const dim = hover !== null && hover !== s.name
          const last = vals[vals.length - 1]
          return (
            <g
              key={s.name}
              onMouseEnter={() => setHover(s.name)}
              onMouseLeave={() => setHover(null)}
              style={{ opacity: dim ? 0.2 : 1, transition: 'opacity 200ms' }}
            >
              <polyline
                points={pts}
                fill="none"
                stroke={s.color}
                strokeWidth={s.ours ? 2.75 : 1.75}
                // pathLength=1 lets a solid line draw itself on; the dashed one fades in instead
                pathLength={1}
                strokeDasharray={s.dashed ? '0.014 0.01' : 1}
                strokeDashoffset={s.dashed || seen ? 0 : 1}
                style={{
                  opacity: s.dashed && !seen ? 0 : 1,
                  transition: `stroke-dashoffset 1100ms ease-out ${si * 90}ms, opacity 600ms ease-out 900ms`,
                }}
              />
              {vals.map((v, i) => (
                <circle key={i} cx={x(FRAMES[i])} cy={y(v)} r={s.ours ? 4 : 3} fill={s.color} style={{ transition: 'all 500ms ease-out' }}>
                  <title>{`${s.name} · ${FRAMES[i]} frames · ${m.fmt(v)}`}</title>
                </circle>
              ))}
              <text
                x={x(1000) + 10}
                y={labelY.get(s.name)}
                dy="0.32em"
                className={cn('text-[11px]', s.ours ? 'font-semibold' : '')}
                fill={s.ours ? MU : 'hsl(var(--muted-foreground))'}
                style={{ transition: 'all 500ms ease-out' }}
              >
                {s.name} <tspan className="fill-muted-foreground font-mono text-[10px] font-normal">{m.fmt(last)}</tspan>
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Efficiency vs. accuracy at 500 frames — Table "model efficiency".   */
/* ------------------------------------------------------------------ */

const EFFICIENCY: { name: string; params: number; mem: number; time: number; auc: number; color: string; ours?: boolean; labelLeft?: boolean }[] = [
  { name: 'VGGT-μ', params: 120, mem: 5.3, time: 1.4, auc: 90.3, color: MU, ours: true },
  { name: 'VGGT-Ω₂₅₆', params: 1112, mem: 13.9, time: 4.7, auc: 78.1, color: OMEGA },
  { name: 'VGGT-Ω₅₁₂', params: 1112, mem: 41.8, time: 51.8, auc: 89.2, color: OMEGA },
  { name: 'DejaView', params: 117, mem: 22.4, time: 45.0, auc: 88.8, color: OTHER, labelLeft: true },
  { name: 'R³', params: 373, mem: 56.9, time: 32.0, auc: 77.9, color: OTHER },
  { name: 'DA3-G', params: 1377, mem: 74.7, time: 109.2, auc: 88.1, color: OTHER },
  { name: 'π³', params: 959, mem: 28.8, time: 113.3, auc: 91.9, color: PI3 },
  { name: 'VGGT', params: 1257, mem: 48.5, time: 130.1, auc: 82.3, color: OTHER },
]

export function EfficiencyScatter() {
  const [hover, setHover] = useState<string | null>(null)
  const { ref, seen } = useInView<HTMLDivElement>()
  const W = 640
  const H = 320
  const L = 44
  const R = 20
  const T = 26
  const B = 36
  const x = (t: number) => L + ((log10(t) - log10(1)) / (log10(200) - log10(1))) * (W - L - R)
  const y = (a: number) => H - B - ((a - 75) / (95 - 75)) * (H - T - B)
  const rad = (p: number) => 4 + Math.sqrt(p) * 0.42
  const focus = EFFICIENCY.find((e) => e.name === hover)

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card/40 p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">500 frames · one GH200</h3>
        <span className="font-mono text-[11px] text-muted-foreground">bubble area = parameters</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Average AUC@30 against runtime">
        {[75, 80, 85, 90, 95].map((a) => (
          <g key={a}>
            <line x1={L} x2={W - R} y1={y(a)} y2={y(a)} stroke="hsl(var(--border))" />
            <text x={L - 8} y={y(a)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[10px]">
              {a}
            </text>
          </g>
        ))}
        {[1, 2, 5, 10, 20, 50, 100, 200].map((t) => (
          <text key={t} x={x(t)} y={H - B + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            {t}
          </text>
        ))}
        <text x={(W + L - R) / 2} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          runtime (s, log scale) →  faster on the left
        </text>
        <text x={L} y={T - 6} className="fill-muted-foreground text-[10px]">
          AUC@30° ↑
        </text>
        {EFFICIENCY.map((e, i) => {
          const dim = hover !== null && hover !== e.name
          return (
            <g
              key={e.name}
              onMouseEnter={() => setHover(e.name)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default"
              style={{ opacity: dim ? 0.25 : 1, transition: 'opacity 200ms' }}
            >
              <circle
                cx={x(e.time)}
                cy={y(e.auc)}
                r={seen ? rad(e.params) : 0}
                fill={e.color}
                fillOpacity={e.ours ? 0.9 : 0.35}
                stroke={e.color}
                strokeWidth={e.ours ? 0 : 1}
                style={{ transition: `r 700ms cubic-bezier(.2,1.4,.4,1) ${i * 70}ms` }}
              />
              {e.ours && seen && (
                <circle cx={x(e.time)} cy={y(e.auc)} r={rad(e.params)} fill="none" stroke={MU} className="animate-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center', animationIterationCount: 3 }} />
              )}
              <text
                // DejaView sits right under VGGT-Ω₅₁₂, so its label goes on the left
                x={e.labelLeft ? x(e.time) - rad(e.params) - 5 : x(e.time) + rad(e.params) + 5}
                y={y(e.auc)}
                dy="0.32em"
                textAnchor={e.labelLeft ? 'end' : 'start'}
                className={cn('text-[11px]', e.ours && 'font-semibold')}
                fill={e.ours ? MU : 'hsl(var(--muted-foreground))'}
              >
                {e.name}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mt-2 h-4 font-mono text-[11px] text-muted-foreground">
        {focus
          ? `${focus.name} · ${focus.params}M params · ${focus.mem} GiB · ${focus.time} s · AUC@30° ${focus.auc}`
          : 'Hover a model. Average AUC@30° over RE10K, ScanNet++ and MegaDepth.'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Robustness to distractors and mixed scenes — Table "mixed drop".    */
/* ------------------------------------------------------------------ */

type DropRow = { name: string; vals: Record<'re10k' | 'scannet' | 'mega' | 'mean', [number, number, number]> }
const DROP: DropRow[] = [
  { name: 'π³', vals: { re10k: [88.4, 82.5, 57.1], scannet: [91.8, 88.2, 51.8], mega: [93.8, 92.7, 82.1], mean: [91.3, 87.8, 63.7] } },
  { name: 'VGGT-Ω', vals: { re10k: [90.3, 74.0, 56.2], scannet: [81.3, 70.8, 47.8], mega: [93.0, 90.2, 83.0], mean: [88.2, 78.3, 62.3] } },
  { name: 'DA3-G', vals: { re10k: [90.1, 75.8, 52.8], scannet: [81.0, 67.9, 41.0], mega: [89.2, 81.2, 60.9], mean: [86.8, 75.0, 51.5] } },
  { name: 'R³', vals: { re10k: [82.5, 66.4, 39.9], scannet: [72.1, 56.5, 28.2], mega: [76.9, 68.1, 51.4], mean: [77.2, 63.7, 39.8] } },
  { name: 'DejaView', vals: { re10k: [89.3, 74.2, 55.9], scannet: [93.2, 78.5, 51.0], mega: [81.8, 73.1, 57.4], mean: [88.1, 75.2, 54.8] } },
  { name: 'VGGT', vals: { re10k: [79.4, 65.3, 46.0], scannet: [72.0, 59.6, 33.5], mega: [89.3, 78.8, 51.6], mean: [80.2, 67.9, 43.7] } },
  { name: 'VGGT-μ', vals: { re10k: [92.0, 91.7, 91.2], scannet: [86.9, 86.0, 83.5], mega: [87.8, 87.3, 86.9], mean: [88.9, 88.3, 87.2] } },
]

type DropKey = keyof DropRow['vals']

export function RobustnessChart() {
  const [ds, setDs] = useState<DropKey>('mean')
  const [stage, setStage] = useState<0 | 1 | 2>(2)
  const { ref, seen } = useInView<HTMLDivElement>()
  const lo = 25
  const hi = 100
  const pct = (v: number) => ((v - lo) / (hi - lo)) * 100
  const STAGES = ['one scene', '+3 distractors', '3 scenes mixed'] as const

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card/40 p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={ds}
          onChange={setDs}
          options={[
            { value: 'mean', label: 'Mean' },
            { value: 're10k', label: 'RE10K' },
            { value: 'scannet', label: 'ScanNet++' },
            { value: 'mega', label: 'MegaDepth' },
          ]}
        />
        <Segmented
          value={String(stage) as '0' | '1' | '2'}
          onChange={(v) => setStage(Number(v) as 0 | 1 | 2)}
          options={STAGES.map((s, i) => ({ value: String(i) as '0' | '1' | '2', label: s }))}
        />
      </div>
      <div className="space-y-3">
        {DROP.map((row, ri) => {
          const [a, , ] = row.vals[ds]
          const cur = seen ? row.vals[ds][stage] : a
          const ours = row.name === 'VGGT-μ'
          const drop = cur - a
          const color = ours ? MU : row.name === 'π³' ? PI3 : row.name === 'VGGT-Ω' ? OMEGA : 'hsl(var(--muted-foreground))'
          return (
            <div key={row.name} className="flex items-center gap-3">
              <span className={cn('w-[70px] shrink-0 text-right text-xs', ours ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-muted-foreground')}>
                {row.name}
              </span>
              <div className="relative h-6 flex-1">
                <div className="absolute inset-y-[11px] left-0 right-0 rounded-full bg-muted/60" />
                <div
                  className="absolute inset-y-[10px] rounded-full transition-all duration-700 ease-out"
                  style={{ left: `${pct(cur)}%`, width: `${pct(a) - pct(cur)}%`, background: color, opacity: 0.35, transitionDelay: `${ri * 40}ms` }}
                />
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background"
                  style={{ left: `${pct(a)}%`, borderColor: color }}
                  title={`one scene: ${a}`}
                />
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
                  style={{ left: `${pct(cur)}%`, background: color, transitionDelay: `${ri * 40}ms` }}
                />
              </div>
              <span className={cn('w-[46px] shrink-0 text-right font-mono text-xs tabular-nums', ours ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-muted-foreground')}>
                {stage === 0 ? a.toFixed(1) : drop.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="ml-[82px] mr-[58px] mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        {[25, 50, 75, 100].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        AUC@30° on same-scene pairs, every input in one forward pass and no clustering. Hollow: each scene alone. Filled:{' '}
        {STAGES[stage]}. Right column: the change from one scene.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Scene separation — Table "scene separation" (ARI).                  */
/* ------------------------------------------------------------------ */

const SEPARATION = [
  { name: 'NetVLAD', ari: [93.2, 67.4, 66.6], sr: [77.5, 2.0, 0.0] },
  { name: 'DINOv2', ari: [88.3, 53.5, 96.1], sr: [65.0, 0.5, 75.5] },
  { name: 'MegaLoc', ari: [91.8, 86.7, 98.1], sr: [81.5, 31.0, 80.0] },
  { name: 'VGGT-μ', ari: [99.5, 96.4, 98.6], sr: [98.5, 83.0, 94.0], ours: true },
]

export function SeparationChart() {
  const [metric, setMetric] = useState<'sr' | 'ari'>('sr')
  const { ref, seen } = useInView<HTMLDivElement>()
  const DS = ['RE10K', 'ScanNet++', 'MegaDepth']
  return (
    <div ref={ref} className="rounded-xl border border-border bg-card/40 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Recovering the scenes from a shuffled mix</h3>
        <Segmented
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'sr', label: 'Exact recovery %' },
            { value: 'ari', label: 'ARI' },
          ]}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {DS.map((d, di) => (
          <div key={d}>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{d}</p>
            <div className="space-y-1.5">
              {SEPARATION.map((s, si) => {
                const v = s[metric][di]
                return (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className={cn('w-[58px] shrink-0 text-right text-[11px]', s.ours ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-muted-foreground')}>
                      {s.name}
                    </span>
                    <div className="h-4 flex-1 overflow-hidden rounded-[3px] bg-muted/50">
                      <div
                        className="h-full rounded-[3px] transition-[width] duration-700 ease-out"
                        style={{ width: seen ? `${v}%` : '0%', background: s.ours ? MU : 'hsl(var(--muted-foreground) / 0.35)', transitionDelay: `${di * 80 + si * 50}ms` }}
                      />
                    </div>
                    <span className="w-[32px] shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{v.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        8 frames from each of 3 unrelated scenes, shuffled. Retrieval baselines cluster global descriptors; VGGT-μ clusters
        its own edge confidences ĉ<sub>ij</sub>. One threshold per method, tuned on separate mixes.
      </p>
    </div>
  )
}
