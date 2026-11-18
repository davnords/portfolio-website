'use client'

import { useEffect, useRef } from 'react'
import { inferno } from './palette'

type V3 = [number, number, number]

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const normalize = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / n, a[1] / n, a[2] / n]
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A walk around a courtyard, then across it, loosely after Great Court:
 *  the kind of hand-held capture the model is fed in one pass. */
function courtyardPath(n: number): { p: V3; fwd: V3 }[] {
  const waypoints: [number, number][] = [
    [-3, -2.2], [3, -2.2], [3.2, 2.1], [-3, 2.2], [-3.1, -2.1],
    [0, -2.3], [0.1, 2.2], [3.1, 2.0], [3, 0], [-3.2, 0.1], [-2.9, -2.2],
  ]
  // centripetal-ish Catmull-Rom through the waypoints
  const pts: [number, number][] = []
  const segs = waypoints.length - 1
  for (let k = 0; k < n; k++) {
    const s = (k / (n - 1)) * segs
    const i = Math.min(segs - 1, Math.floor(s))
    const t = s - i
    const p0 = waypoints[Math.max(0, i - 1)]
    const p1 = waypoints[i]
    const p2 = waypoints[i + 1]
    const p3 = waypoints[Math.min(waypoints.length - 1, i + 2)]
    const cr = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
    pts.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])])
  }
  const rnd = mulberry32(7)
  return pts.map((q, k) => {
    const a = pts[Math.max(0, k - 2)]
    const b = pts[Math.min(n - 1, k + 2)]
    // hand-held: a little lateral jitter and a slowly wandering gaze
    const wob = Math.sin(k * 0.21) * 0.35 + (rnd() - 0.5) * 0.25
    const tx = b[0] - a[0]
    const tz = b[1] - a[1]
    const c = Math.cos(wob)
    const s = Math.sin(wob)
    const fwd = normalize([tx * c - tz * s, 0, tx * s + tz * c])
    const p: V3 = [q[0] + (rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.05 + Math.sin(k * 0.05) * 0.04, q[1] + (rnd() - 0.5) * 0.06]
    return { p, fwd }
  })
}

const N_CAMS = 760
const BUILD_MS = 4000 // the headline: a full trajectory in four seconds
const BUCKETS = 24

export function HeroCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cams = courtyardPath(N_CAMS)

    // frustum geometry in world space, computed once
    const frusta = cams.map(({ p, fwd }) => {
      const r = normalize(cross(fwd, [0, 1, 0]))
      const u = cross(r, fwd)
      const d = 0.2
      const w = 0.13
      const h = 0.085
      const c = add(p, mul(fwd, d))
      const corners: V3[] = [
        add(add(c, mul(r, w)), mul(u, h)),
        add(add(c, mul(r, -w)), mul(u, h)),
        add(add(c, mul(r, -w)), mul(u, -h)),
        add(add(c, mul(r, w)), mul(u, -h)),
      ]
      return { p, corners }
    })

    let raf = 0
    let w = 0
    let h = 0
    let dark = document.documentElement.classList.contains('dark')
    const start = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const mo = new MutationObserver(() => {
      dark = document.documentElement.classList.contains('dark')
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const draw = (now: number) => {
      const elapsed = now - start
      const built = reduced ? 1 : Math.min(1, elapsed / BUILD_MS)
      const shown = Math.floor(built * N_CAMS)

      // slow orbit around the courtyard, looking down at it
      const yaw = (reduced ? 0.6 : 0.6 + elapsed * 0.000045) % (Math.PI * 2)
      const eye: V3 = [Math.cos(yaw) * 8.6, 5.4, Math.sin(yaw) * 8.6]
      const target: V3 = [0, -0.4, 0]
      const f = normalize(sub(target, eye))
      const r = normalize(cross(f, [0, 1, 0]))
      const u = cross(r, f)
      // keep the courtyard wide on landscape screens and whole on portrait ones
      const scale = Math.min(w * 0.95, h * 1.55)
      const project = (q: V3): [number, number, number] => {
        const v = sub(q, eye)
        const z = dot(v, f)
        return [w / 2 + (dot(v, r) / z) * scale, h * 0.52 - (dot(v, u) / z) * scale, z]
      }

      ctx.clearRect(0, 0, w, h)

      // ground-truth ghost: the full path, faint, so the build reads as "filling in"
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
      ctx.beginPath()
      cams.forEach(({ p }, i) => {
        const [x, y] = project(p)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // frusta, batched by colour so a whole bucket is one stroke
      ctx.lineWidth = 0.9
      for (let b = 0; b < BUCKETS; b++) {
        const lo = Math.floor((b / BUCKETS) * N_CAMS)
        const hi = Math.min(shown, Math.floor(((b + 1) / BUCKETS) * N_CAMS))
        if (hi <= lo) continue
        // dark mode skips the near-black end of inferno, light mode the pale end
        const [cr, cg, cb] = inferno(dark ? 0.25 + (b / BUCKETS) * 0.72 : 0.08 + (b / BUCKETS) * 0.72)
        ctx.strokeStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${dark ? 0.85 : 0.75})`
        ctx.beginPath()
        for (let i = lo; i < hi; i += 1) {
          const fr = frusta[i]
          const a = project(fr.p)
          const cs = fr.corners.map(project)
          if (a[2] <= 0.1) continue
          for (const c of cs) {
            ctx.moveTo(a[0], a[1])
            ctx.lineTo(c[0], c[1])
          }
          ctx.moveTo(cs[0][0], cs[0][1])
          for (let k = 1; k <= 4; k++) ctx.lineTo(cs[k % 4][0], cs[k % 4][1])
        }
        ctx.stroke()
      }

      // the newest camera gets a soft glow while the trajectory is still building
      if (built < 1 && shown > 0) {
        const [x, y] = project(frusta[shown - 1].p)
        const g = ctx.createRadialGradient(x, y, 0, x, y, 26)
        g.addColorStop(0, 'rgba(201,58,76,0.55)')
        g.addColorStop(1, 'rgba(201,58,76,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, 26, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduced) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
