/** Colours shared with the paper's figures: crimson for VGGT-μ, the
 *  blue-grey and tan the teaser uses for VGGT-Ω and π³. */
export const MU = '#c93a4c'
export const OMEGA = '#7f93cf'
export const PI3 = '#b49a6c'
export const OTHER = 'hsl(var(--muted-foreground) / 0.55)'

/** A compact sample of matplotlib's inferno, which the paper uses for error. */
const INFERNO: [number, number, number][] = [
  [0, 0, 4],
  [40, 11, 84],
  [101, 21, 110],
  [159, 42, 99],
  [212, 72, 66],
  [245, 125, 21],
  [250, 193, 39],
  [252, 255, 164],
]

export function inferno(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t)) * (INFERNO.length - 1)
  const i = Math.min(INFERNO.length - 2, Math.floor(x))
  const f = x - i
  const a = INFERNO[i]
  const b = INFERNO[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}
