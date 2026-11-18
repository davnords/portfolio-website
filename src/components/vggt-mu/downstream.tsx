'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Cell = string | number
type Block = { group?: string; rows: Cell[][] }
type Task = {
  key: string
  label: string
  title: string
  body: string
  highlights: { value: string; label: string }[]
  columns: string[]
  /** per numeric column, whether higher or lower is better; best is bolded within each block */
  better: ('max' | 'min')[]
  blocks: Block[]
  /** row names to dim, e.g. a reference method in a different regime */
  dim?: string[]
  note: string
}

const OURS = /VGGT-μ/

const TASKS: Task[] = [
  {
    key: 'loc',
    label: 'Localization',
    title: 'Visual localization without a map',
    body:
      'Retrieve ten reference images, condition on their known poses (and intrinsics, when calibrated), and predict the query pose in one pass. No SfM model, no local feature matching.',
    highlights: [
      { value: '87.1%', label: 'within 0.5 m, 5° on Cambridge' },
      { value: '45 ms', label: 'per query, 5.6× faster than hloc' },
      { value: '0.61 GiB', label: 'peak GPU memory' },
    ],
    columns: ['Method', 'm ↓', '° ↓', '% ↑', 'cm ↓', '° ↓', '% ↑', 'ms ↓', 'GiB ↓'],
    better: ['min', 'min', 'max', 'min', 'min', 'max', 'min', 'min'],
    blocks: [
      { rows: [['hloc SP+LG', 0.11, 0.21, 90.7, 1.1, 0.19, 94.5, 250.7, 0.73]] },
      {
        group: 'Calibrated — known query focal length',
        rows: [
          ['π³ T,f', '0.25', '1.49', '76.6', '3.5', '1.16', '87.6', '414.7', '8.86'],
          ['MapAnything T,f', '0.31', '0.75', '76.0', '5.4', '0.96', '81.4', '778.2', '9.61'],
          ['VGGT-μ T,f', '0.18', '0.31', '87.1', '2.1', '0.38', '95.0', '45.1', '0.61'],
        ],
      },
      {
        group: 'Uncalibrated — unknown query focal length',
        rows: [
          ['Reloc3r₅₁₂', '0.57', '0.54', '57.4', '9.0', '0.78', '59.7', '145.8', '2.70'],
          ['DejaView', '0.28', '2.08', '69.5', '3.3', '1.75', '81.0', '144.2', '2.30'],
          ['VGGT-Ω₅₁₂', '0.32', '2.29', '66.0', '3.5', '1.67', '81.3', '182.2', '6.00'],
          ['π³ T', '0.36', '1.93', '65.6', '4.9', '1.63', '80.3', '408.6', '8.86'],
          ['VGGT-μ T', '0.31', '0.32', '74.0', '4.1', '0.43', '84.3', '46.8', '0.61'],
        ],
      },
    ],
    dim: ['hloc SP+LG'],
    note: 'Cambridge (m, °, % within 0.5 m/5°) and Indoor6 (cm, °, % within 10 cm/10°): mean per-scene median errors. Subscripts: conditioned on reference poses T / focal lengths f. hloc builds an SfM map first.',
  },
  {
    key: 'sfm',
    label: 'SfM',
    title: 'Replacing the global stage of SfM',
    body:
      'One forward pass plus anisotropic pose averaging gives every camera and focal length, replacing rotation averaging and global positioning. Then triangulate the same verified matches GLOMAP uses and bundle-adjust.',
    highlights: [
      { value: '81 s', label: 'vs 358 s for GLOMAP' },
      { value: '28×', label: 'faster than incremental COLMAP' },
      { value: '56.2', label: 'AUC@1°, best of the three' },
    ],
    columns: ['Method', '@0.5° ↑', '@1° ↑', '@5° ↑', '@10° ↑', 'Time (s) ↓'],
    better: ['max', 'max', 'max', 'max', 'min'],
    blocks: [
      {
        rows: [
          ['COLMAP', '12.3', '25.7', '61.9', '73.6', '2290'],
          ['GLOMAP', '40.5', '55.6', '80.5', '86.2', '358'],
          ['VGGT-μ', '40.6', '56.2', '81.3', '87.0', '81'],
        ],
      },
    ],
    note: 'IMC23 Phototourism, mean relative-pose AUC (%) over five scenes, exhaustive SIFT matches shared by all methods. Runtime on an RTX 4090, excluding feature extraction and matching.',
  },
  {
    key: 'vo',
    label: 'Odometry',
    title: 'Real-time visual odometry',
    body:
      'Stream frames in overlapping keyframe blocks, localize each new frame against the latest block with cached keys and values, and stitch blocks with a scale-aware pose graph. Periodic joint passes close loops.',
    highlights: [
      { value: '67 FPS', label: 'on Cambridge, RTX 4090' },
      { value: '16 ms', label: 'latency per frame' },
      { value: '0.6 GiB', label: 'VRAM, 8× below DROID-SLAM' },
    ],
    columns: ['Method', 'Succ. ↑', 'FPS ↑', 'Lat. ms ↓', 'VRAM ↓', 'ATE m ↓'],
    better: ['max', 'max', 'min', 'min', 'min'],
    blocks: [
      {
        group: 'Cambridge Landmarks',
        rows: [
          ['DROID-SLAM', '8/8', '14.9', '61.3', '5.0', '7.00'],
          ['ORB-SLAM3', '5/8', '42.1', '27.8', 'n/a', '0.78'],
          ['VGGT-SLAM 2.0', '8/8', '26.6', '840.9', '5.5', '1.36'],
          ['VGGT-μ', '8/8', '67.1', '16.4', '0.6', '1.13'],
        ],
      },
      {
        group: 'ETH3D SLAM',
        rows: [
          ['DROID-SLAM', '6/6', '37.2', '54.4', '3.8', '0.39'],
          ['ORB-SLAM3', '5/6', '221.5', '5.3', 'n/a', '0.73'],
          ['VGGT-SLAM 2.0', '6/6', '213.1', '800.0', '5.4', '0.68'],
          ['VGGT-μ', '6/6', '94.5', '10.6', '0.7', '0.54'],
        ],
      },
    ],
    note: 'Success counts sequences with an evaluable trajectory. ORB-SLAM3 fails on some, and its ATE is over the ones it completes.',
  },
]

export function Downstream() {
  const [active, setActive] = useState(TASKS[0].key)
  const task = TASKS.find((t) => t.key === active)!

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex overflow-x-auto border-b border-border bg-muted/30" role="tablist">
        {TASKS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === active}
            onClick={() => setActive(t.key)}
            className={cn(
              'relative shrink-0 px-5 py-3 text-sm transition-colors',
              t.key === active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="mr-1.5 font-mono text-[10px] text-muted-foreground">VGGT-μ meets</span>
            {t.label}
            {t.key === active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-rose-600 dark:bg-rose-400" />}
          </button>
        ))}
      </div>

      <div key={task.key} className="animate-in fade-in-0 slide-in-from-bottom-1 p-5 duration-500 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{task.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{task.body}</p>
          </div>
          <div className="grid grid-cols-3 gap-px self-start overflow-hidden rounded-xl border border-border bg-border">
            {task.highlights.map((h) => (
              <div key={h.label} className="bg-background p-4">
                <p className="text-xl font-bold tracking-tight tabular-nums text-rose-600 dark:text-rose-400 sm:text-2xl">{h.value}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{h.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {task.columns.map((c, i) => (
                  <th key={i} className={cn('px-3 py-2 text-[11px] font-medium text-muted-foreground', i === 0 ? 'text-left' : 'text-right')}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {task.blocks.map((b, bi) => (
                <FragmentRows key={bi} block={b} cols={task.columns.length} better={task.better} dim={task.dim} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{task.note}</p>
      </div>
    </div>
  )
}

/** "8/8" counts as a fraction; "n/a" never wins */
function num(v: Cell) {
  const [a, b] = String(v).split('/')
  return b !== undefined ? Number(a) / Number(b) : Number(a)
}

function FragmentRows({ block, cols, better, dim }: { block: Block; cols: number; better: ('max' | 'min')[]; dim?: string[] }) {
  const ranked = block.rows.filter((r) => !dim?.includes(String(r[0])))
  const best = better.map((dir, c) => {
    const vals = ranked.map((r) => num(r[c + 1])).filter((x) => !Number.isNaN(x))
    return dir === 'max' ? Math.max(...vals) : Math.min(...vals)
  })
  return (
    <>
      {block.group && (
        <tr>
          <td colSpan={cols} className="bg-muted/20 px-3 py-1.5 text-xs italic text-muted-foreground">
            {block.group}
          </td>
        </tr>
      )}
      {block.rows.map((r) => {
        const name = String(r[0])
        const ours = OURS.test(name)
        const muted = dim?.includes(name)
        return (
          <tr key={name} className={cn('border-b border-border/60 last:border-0', ours && 'bg-rose-500/[0.05]')}>
            {r.map((v, i) => (
              <td
                key={i}
                className={cn(
                  'px-3 py-2 tabular-nums',
                  i === 0 ? 'text-left' : 'text-right font-mono text-xs',
                  muted ? 'text-muted-foreground/60' : 'text-muted-foreground',
                  i === 0 && ours && 'font-medium text-rose-600 dark:text-rose-400',
                  i > 0 && !muted && num(v) === best[i - 1] && 'font-semibold text-foreground',
                )}
              >
                {v}
              </td>
            ))}
          </tr>
        )
      })}
    </>
  )
}
