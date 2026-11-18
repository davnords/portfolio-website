'use client'

import { useEffect, useState } from 'react'
import { useInView } from '@/components/poincar3/reveal'

/** Counts from 0 to `to` once in view, easing out. */
export function CountUp({ to, decimals = 0, ms = 1400, delay = 0 }: { to: number; decimals?: number; ms?: number; delay?: number }) {
  const { ref, seen } = useInView<HTMLSpanElement>(0.1)
  const [v, setV] = useState(0)

  useEffect(() => {
    if (!seen) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(to)
      return
    }
    let raf = 0
    const start = performance.now() + delay
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / ms))
      setV(to * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, ms, delay])

  return (
    <span ref={ref} className="tabular-nums">
      {v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  )
}
