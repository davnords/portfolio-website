'use client'

import { useEffect, useRef, useState } from 'react'
import { FastForwardIcon, RotateCcwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInView } from '@/components/poincar3/reveal'
import { MU, OMEGA, PI3 } from './palette'

/** Numbers printed in the paper's Cambridge Landmarks figure (Suppl.):
 *  all mapping frames of a scene, one forward pass, one GH200 (96 GiB). */
type Run = { time: number; mem: number; pos: number; rot: number } | 'oom'
type Scene = { name: string; frames: number; mu: Run; pi3: Run; omega: Run }

const SCENES: Scene[] = [
  {
    name: 'Shop Facade',
    frames: 231,
    mu: { time: 0.3, mem: 2, pos: 0.3, rot: 2.3 },
    pi3: { time: 26, mem: 15, pos: 0.4, rot: 2.2 },
    omega: { time: 15, mem: 22, pos: 0.3, rot: 1.9 },
  },
  {
    name: 'Old Hospital',
    frames: 895,
    mu: { time: 2, mem: 8, pos: 0.5, rot: 0.7 },
    pi3: { time: 370, mem: 49, pos: 0.6, rot: 0.7 },
    omega: { time: 198, mem: 72, pos: 0.4, rot: 0.7 },
  },
  {
    name: "King's College",
    frames: 1220,
    mu: { time: 3, mem: 9, pos: 0.9, rot: 0.5 },
    pi3: { time: 12 * 60, mem: 65, pos: 0.6, rot: 0.7 },
    omega: 'oom',
  },
  {
    name: "St Mary's Church",
    frames: 1487,
    mu: { time: 4, mem: 9, pos: 1.2, rot: 1.7 },
    pi3: { time: 17 * 60, mem: 78, pos: 8.5, rot: 18.3 },
    omega: 'oom',
  },
  {
    name: 'Great Court',
    frames: 1500,
    mu: { time: 4, mem: 9, pos: 0.9, rot: 0.8 },
    pi3: { time: 18 * 60, mem: 79, pos: 1.8, rot: 2.2 },
    omega: 'oom',
  },
]

const GPU = 96

const LANES = [
  { key: 'mu' as const, name: 'VGGT-μ', sub: '120M params · 256 px', color: MU, ours: true },
  { key: 'pi3' as const, name: 'π³', sub: '959M params · 504 px', color: PI3 },
  { key: 'omega' as const, name: 'VGGT-Ω', sub: '1.1B params · 512 px', color: OMEGA },
]

function clock(s: number) {
  if (s < 60) return `${s.toFixed(1)} s`
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')} min`
}

function duration(s: number) {
  return s < 60 ? `${s} s` : `${Math.round(s / 60)} min`
}

export function Race() {
  const [sceneIdx, setSceneIdx] = useState(4)
  const [elapsed, setElapsed] = useState(0)
  const [skipped, setSkipped] = useState(false)
  const [runId, setRunId] = useState(0)
  const { ref, seen } = useInView<HTMLDivElement>(0.35)
  const startRef = useRef(0)

  const scene = SCENES[sceneIdx]
  const longest = Math.max(
    ...LANES.map((l) => {
      const r = scene[l.key]
      return r === 'oom' ? 0 : r.time
    }),
  )

  // the clock is wall time: VGGT-μ is shown finishing in exactly as long as it takes
  useEffect(() => {
    if (!seen || skipped) return
    startRef.current = performance.now()
    setElapsed(0)
    let raf = 0
    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000
      setElapsed(t)
      if (t < longest) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, skipped, runId, longest])

  const t = skipped ? Infinity : elapsed
  const mu = scene.mu as Exclude<Run, 'oom'>
  const muDone = t >= mu.time
  const pi3 = scene.pi3 as Exclude<Run, 'oom'>

  const restart = (idx = sceneIdx) => {
    setSceneIdx(idx)
    setSkipped(false)
    setRunId((r) => r + 1)
  }

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-border bg-card/40">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Scene</span>
        {SCENES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => restart(i)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              i === sceneIdx
                ? 'border-foreground/20 bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {s.name}
            <span className="ml-1.5 tabular-nums opacity-60">{s.frames.toLocaleString('en-US')}</span>
          </button>
        ))}
      </div>

      <div className="space-y-px bg-border">
        {LANES.map((lane) => {
          const run = scene[lane.key]
          const oom = run === 'oom'
          const done = !oom && t >= run.time
          const frac = oom ? 0 : Math.min(1, t / run.time)
          const now = oom ? 0 : Math.min(t, run.time)
          // memory climbs over the first few hundred ms of a run, as weights then activations load
          const memFrac = oom ? 1 : Math.min(1, t / Math.min(run.time, 0.6))
          const mem = oom ? GPU : run.mem * memFrac
          return (
            <div key={lane.key} className={cn('bg-background px-4 py-4 sm:px-5', lane.ours && 'bg-rose-500/[0.03]')}>
              <div className="grid items-center gap-x-5 gap-y-3 sm:grid-cols-[150px_1fr_170px]">
                <div>
                  <p className={cn('font-semibold', lane.ours && 'text-rose-600 dark:text-rose-400')}>{lane.name}</p>
                  <p className="text-[11px] text-muted-foreground">{lane.sub}</p>
                </div>

                <div className="space-y-2">
                  {/* progress through the forward pass */}
                  <div className="relative h-7 overflow-hidden rounded-md bg-muted/60">
                    {oom ? (
                      <div
                        className="flex h-full items-center px-3 text-xs font-semibold text-red-600 dark:text-red-400"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(135deg, rgba(239,68,68,0.12) 0 8px, transparent 8px 16px)',
                        }}
                      >
                        out of memory — needs more than {GPU} GiB
                      </div>
                    ) : (
                      <>
                        <div
                          className="h-full rounded-md"
                          style={{ width: `${frac * 100}%`, background: lane.color, opacity: done ? 1 : 0.85 }}
                        />
                        <span
                          className={cn(
                            'absolute inset-y-0 left-3 flex items-center font-mono text-xs font-medium tabular-nums',
                            frac > 0.18 ? 'text-white' : 'text-foreground',
                          )}
                        >
                          {done ? `done · ${scene.frames.toLocaleString('en-US')} poses` : `${(frac * 100).toFixed(frac < 0.01 ? 2 : 1)}%`}
                        </span>
                      </>
                    )}
                  </div>
                  {/* peak GPU memory against the card's 96 GiB */}
                  <div className="flex items-center gap-2">
                    <div className="relative h-1.5 flex-1 rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full transition-[width] duration-300"
                        style={{
                          width: `${(Math.min(mem, GPU) / GPU) * 100}%`,
                          background: oom ? '#ef4444' : lane.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className="w-[70px] shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                      {oom ? `> ${GPU} GiB` : `${mem.toFixed(0)} GiB`}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-3 sm:block sm:text-right">
                  <p
                    className={cn(
                      'font-mono text-2xl font-semibold tabular-nums tracking-tight',
                      oom && 'text-muted-foreground/50',
                      lane.ours && done && 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {oom ? '—' : done ? duration(run.time) : clock(now)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {oom ? 'no poses' : done ? `error ${run.pos} m · ${run.rot}°` : 'running…'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
        <p className="text-sm text-muted-foreground">
          {muDone && t < pi3.time ? (
            <>
              VGGT-μ is done. π³ is{' '}
              <span className="font-mono font-semibold text-foreground">
                {((mu.time / pi3.time) * 100).toFixed(1)}%
              </span>{' '}
              of the way through.
            </>
          ) : t >= longest ? (
            <>Every run finished. Mean camera-centre and rotation error after similarity alignment.</>
          ) : (
            <>Wall-clock time, in real time. One NVIDIA GH200.</>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => restart()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcwIcon className="h-3.5 w-3.5" /> Replay
          </button>
          <button
            onClick={() => setSkipped(true)}
            disabled={t >= longest}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <FastForwardIcon className="h-3.5 w-3.5" /> Skip to the end
          </button>
        </div>
      </div>
    </div>
  )
}
