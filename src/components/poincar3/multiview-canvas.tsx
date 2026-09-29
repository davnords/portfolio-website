'use client'

import { useEffect, useRef } from 'react'

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

function frame(eye: V3, target: V3) {
  const f = normalize(sub(target, eye))
  const r = normalize(cross(f, [0, 1, 0]))
  const u = cross(r, f)
  return { f, r, u }
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

/** The observer's path: a closed loop that both orbits and bobs, so the
 *  views it produces differ in all six degrees of freedom. */
function cameraAt(s: number): V3 {
  const a = s * Math.PI * 2
  return [Math.cos(a) * 3.55, 0.45 + Math.sin(a * 2) * 0.95, Math.sin(a) * 3.55]
}

const M_STUDENT = 5 // views the student sees
const T_TEACHER = 3 // extra views only the teacher sees
const N_VIEWS = M_STUDENT + T_TEACHER

const TRACK_COLORS = ['34,197,94', '168,85,247', '6,182,212']

export function MultiViewCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ---- the scene: a sparse point cloud, as a reconstruction would give ----
    const rnd = mulberry32(11)
    const cloud: V3[] = []
    // a hollow shell of points — the structure the observer is circling
    const N_BLOB = 260
    for (let i = 0; i < N_BLOB; i++) {
      const y = 1 - (i / (N_BLOB - 1)) * 2
      const rad = Math.sqrt(Math.max(0, 1 - y * y))
      const th = i * 2.399963229728653
      const j = 0.88 + rnd() * 0.24
      cloud.push([Math.cos(th) * rad * 2.3 * j, y * 1.5 * j, Math.sin(th) * rad * 2.3 * j])
    }
    // three scene points we follow across every view — the "tracks"
    const trackPoints: V3[] = [cloud[58], cloud[146], cloud[242]]

    let raf = 0
    let w = 0
    let h = 0
    const start = performance.now()

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas!.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function render(now: number) {
      const t = reduced ? 6000 : now - start
      const dark = document.documentElement.classList.contains('dark')
      const fg = dark ? '236,240,244' : '15,18,22'
      const studentRGB = '66,133,244'
      const teacherRGB = '214,88,43'

      ctx!.clearRect(0, 0, w, h)
      if (w < 2 || h < 2) {
        raf = requestAnimationFrame(render)
        return
      }

      // ---- spectator camera (what *we* look through) ----
      const az = t * 0.000075
      const el = 0.30 + Math.sin(t * 0.00006) * 0.13
      const R = 9.4
      const eye: V3 = [
        R * Math.cos(el) * Math.cos(az),
        R * Math.sin(el),
        R * Math.cos(el) * Math.sin(az),
      ]
      const spec = frame(eye, [0, 0.05, 0])
      // keeps the camera loop a ring of roughly a third of the viewport,
      // so it frames the title rather than running off the edges
      const focal = Math.min(w * 0.92, h * 1.3)

      const project = (p: V3) => {
        const d = sub(p, eye)
        const z = dot(d, spec.f)
        if (z < 0.08) return null
        return { x: w / 2 + (focal * dot(d, spec.r)) / z, y: h / 2 - (focal * dot(d, spec.u)) / z, z }
      }

      // ---- camera trajectory ----
      const phase = (t * 0.00004) % 1
      ctx!.lineWidth = 1
      ctx!.beginPath()
      let started = false
      for (let i = 0; i <= 160; i++) {
        const q = project(cameraAt(i / 160))
        if (!q) { started = false; continue }
        if (!started) { ctx!.moveTo(q.x, q.y); started = true } else ctx!.lineTo(q.x, q.y)
      }
      ctx!.strokeStyle = `rgba(${fg},${dark ? 0.24 : 0.2})`
      ctx!.stroke()

      // ---- point cloud ----
      // fades towards the edges so the scene stays inside the hero
      const vignette = (x: number, y: number) => {
        const d = Math.hypot((x - w / 2) / (w * 0.46), (y - h / 2) / (h * 0.46))
        return Math.max(0, Math.min(1, (1.0 - d) / 0.45))
      }
      for (const p of cloud) {
        const q = project(p)
        if (!q) continue
        const edge = vignette(q.x, q.y)
        if (edge <= 0) continue
        // uniform dot size reads as a point cloud; depth is carried by opacity alone
        const a = Math.max(0.08, Math.min(0.3, 2.0 / q.z)) * edge
        const rr = Math.max(1.0, Math.min(1.9, (focal * 0.014) / q.z))
        ctx!.beginPath()
        ctx!.arc(q.x, q.y, rr, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${fg},${dark ? a : a * 0.95})`
        ctx!.fill()
      }

      // ---- the views ----
      const D = 0.30, HW = 0.235, HH = 0.165
      type View = {
        eye: V3
        basis: ReturnType<typeof frame>
        student: boolean
        pulse: number
      }
      const views: View[] = []
      for (let k = 0; k < N_VIEWS; k++) {
        const s = (phase + k / N_VIEWS) % 1
        const e = cameraAt(s)
        views.push({
          eye: e,
          basis: frame(e, [0, 0, 0]),
          student: k < M_STUDENT,
          // a slow travelling highlight so the eye is led around the loop
          pulse: Math.pow(Math.max(0, Math.cos((s - (t * 0.00012) % 1) * Math.PI * 2)), 6),
        })
      }

      for (const v of views) {
        const rgb = v.student ? studentRGB : teacherRGB
        const base = (v.student ? 0.62 : 0.54) + v.pulse * 0.38
        const corners: V3[] = [
          add(add(v.eye, mul(v.basis.f, D)), add(mul(v.basis.r, -HW), mul(v.basis.u, HH))),
          add(add(v.eye, mul(v.basis.f, D)), add(mul(v.basis.r, HW), mul(v.basis.u, HH))),
          add(add(v.eye, mul(v.basis.f, D)), add(mul(v.basis.r, HW), mul(v.basis.u, -HH))),
          add(add(v.eye, mul(v.basis.f, D)), add(mul(v.basis.r, -HW), mul(v.basis.u, -HH))),
        ]
        const pa = project(v.eye)
        const pc = corners.map(project)
        if (!pa || pc.some((c) => !c)) continue
        const cs = pc as { x: number; y: number; z: number }[]

        ctx!.fillStyle = `rgba(${rgb},${0.09 + v.pulse * 0.13})`
        ctx!.beginPath()
        ctx!.moveTo(cs[0].x, cs[0].y)
        for (let i = 1; i < 4; i++) ctx!.lineTo(cs[i].x, cs[i].y)
        ctx!.closePath()
        ctx!.fill()

        ctx!.strokeStyle = `rgba(${rgb},${base})`
        ctx!.lineWidth = 1 + v.pulse * 0.6
        ctx!.stroke()

        ctx!.beginPath()
        for (const c of cs) { ctx!.moveTo(pa.x, pa.y); ctx!.lineTo(c.x, c.y) }
        ctx!.strokeStyle = `rgba(${rgb},${base * 0.55})`
        ctx!.lineWidth = 1
        ctx!.stroke()

        ctx!.beginPath()
        ctx!.arc(pa.x, pa.y, 2 + v.pulse * 1.4, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${rgb},${Math.min(1, base + 0.2)})`
        ctx!.fill()
      }

      // ---- correspondence tracks: the same scene point, seen in every view ----
      trackPoints.forEach((q, ti) => {
        const rgb = TRACK_COLORS[ti]
        const pts: { x: number; y: number }[] = []
        for (const v of views) {
          const d = sub(q, v.eye)
          const z = dot(d, v.basis.f)
          if (z < 0.1) { pts.push(null as never); continue }
          const ix = (dot(d, v.basis.r) / z) * D
          const iy = (dot(d, v.basis.u) / z) * D
          if (Math.abs(ix) > HW || Math.abs(iy) > HH) { pts.push(null as never); continue }
          const world = add(add(v.eye, mul(v.basis.f, D)), add(mul(v.basis.r, ix), mul(v.basis.u, iy)))
          const s = project(world)
          pts.push(s ? { x: s.x, y: s.y } : (null as never))
        }
        ctx!.lineWidth = 1.4
        ctx!.strokeStyle = `rgba(${rgb},0.55)`
        for (let i = 0; i < pts.length - 1; i++) {
          if (!pts[i] || !pts[i + 1]) continue
          ctx!.beginPath()
          ctx!.moveTo(pts[i].x, pts[i].y)
          ctx!.lineTo(pts[i + 1].x, pts[i + 1].y)
          ctx!.stroke()
        }
        for (const p of pts) {
          if (!p) continue
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, 2.6, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${rgb},0.95)`
          ctx!.fill()
        }
        const qp = project(q)
        if (qp) {
          ctx!.beginPath()
          ctx!.arc(qp.x, qp.y, 3.4, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${rgb},0.9)`
          ctx!.fill()
        }
      })

      if (!reduced) raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
