'use client'

const STUDENT = '#4285f4'
const TEACHER = '#d6582b'

/** A tiny abstract "photo" — the same building seen from a shifting viewpoint. */
function Thumb({ x, y, k, masked }: { x: number; y: number; k: number; masked: boolean }) {
  const w = 52
  const h = 34
  const shift = (k - 3.5) * 3.2
  const id = `p3-sky-${k}`
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.20" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.07" />
        </linearGradient>
        <clipPath id={`clip-${k}`}>
          <rect width={w} height={h} rx="3" />
        </clipPath>
      </defs>
      <rect width={w} height={h} rx="3" fill={`url(#${id})`} />
      <g clipPath={`url(#clip-${k})`}>
        <path
          d={`M${14 + shift} ${h} L${14 + shift} ${13 + k * 0.5} L${26 + shift} ${6} L${38 + shift} ${13 + k * 0.5} L${38 + shift} ${h} Z`}
          fill="currentColor"
          opacity="0.30"
        />
        <rect x={0} y={h - 7} width={w} height={7} fill="currentColor" opacity="0.16" />
        {masked && (
          <g className="p3-breathe" style={{ animationDelay: `${k * 0.32}s` }}>
            <rect x={6 + ((k * 11) % 20)} y={4} width={15} height={13} rx="1.5" fill="currentColor" opacity="0.72" />
            <rect x={24 + ((k * 7) % 14)} y={17} width={19} height={12} rx="1.5" fill="currentColor" opacity="0.72" />
            <rect x={3} y={20} width={11} height={10} rx="1.5" fill="currentColor" opacity="0.72" />
          </g>
        )}
      </g>
      <rect width={w} height={h} rx="3" fill="none" stroke="currentColor" strokeOpacity="0.22" />
    </g>
  )
}

/** One frame's worth of output tokens: patch tokens above, a [CLS] token below. */
function TokenStack({
  x,
  y,
  color,
  masked,
  faded = false,
  seed = 0,
}: {
  x: number
  y: number
  color: string
  masked?: number[]
  faded?: boolean
  seed?: number
}) {
  const rows = 5
  const th = 13
  const gap = 4
  return (
    <g transform={`translate(${x} ${y})`} opacity={faded ? 0.35 : 1}>
      {Array.from({ length: rows }).map((_, i) => {
        const isMask = masked?.includes(i)
        return (
          <rect
            key={i}
            y={i * (th + gap)}
            width="30"
            height={th}
            rx="3"
            fill={isMask ? 'currentColor' : color}
            fillOpacity={isMask ? 0.28 : 0.85}
            stroke={isMask ? 'currentColor' : 'none'}
            strokeOpacity={0.35}
            strokeDasharray={isMask ? '3 2' : undefined}
            className={isMask ? 'p3-breathe' : undefined}
            style={isMask ? { animationDelay: `${(seed + i) * 0.28}s` } : undefined}
          />
        )
      })}
      <rect
        y={rows * (th + gap) + 5}
        width="30"
        height={th}
        rx="3"
        fill={color}
        fillOpacity="0.95"
      />
      <text
        x="15"
        y={rows * (th + gap) + 5 + th - 3.5}
        textAnchor="middle"
        fontSize="7.5"
        fill="#fff"
        fontWeight="600"
        letterSpacing="0.2"
      >
        CLS
      </text>
    </g>
  )
}

export function MethodDiagram() {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <svg
        viewBox="0 0 1060 396"
        className="w-full min-w-[820px] text-foreground"
        role="img"
        aria-label="Poincar3 architecture: a student sees M masked views, an EMA teacher sees M+T clean views, and the two are aligned with a patch loss and an image-level loss."
      >
        <defs>
          <marker id="p3-arrow-s" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={STUDENT} />
          </marker>
          <marker id="p3-arrow-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={TEACHER} />
          </marker>
          <marker id="p3-arrow-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.55" />
          </marker>
        </defs>

        {/* ---------- column headings ---------- */}
        <g fontSize="10.5" fill="currentColor" fillOpacity="0.45" letterSpacing="1.4" fontWeight="600">
          <text x="18" y="16">IMAGE SEQUENCE</text>
          <text x="286" y="16">MULTI-VIEW TRANSFORMER</text>
          <text x="612" y="16">OUTPUT TOKENS</text>
          <text x="930" y="16">OBJECTIVE</text>
        </g>

        {/* ---------- input frames ---------- */}
        {Array.from({ length: 8 }).map((_, k) => (
          <Thumb key={k} x={56} y={34 + k * 42} k={k} masked={false} />
        ))}

        {/* student subset box */}
        <rect x="48" y="27" width="68" height="216" rx="7" fill="none" stroke={STUDENT} strokeWidth="1.4" strokeDasharray="5 4" />
        <text x="36" y="135" textAnchor="middle" fontSize="10" fill={STUDENT} fontWeight="700" transform="rotate(-90 36 135)">
          M views
        </text>
        {/* teacher superset box */}
        <rect x="40" y="19" width="84" height="356" rx="9" fill="none" stroke={TEACHER} strokeWidth="1.4" strokeDasharray="5 4" />
        <text x="22" y="292" textAnchor="middle" fontSize="10" fill={TEACHER} fontWeight="700" transform="rotate(-90 22 292)">
          M + T views
        </text>
        <text x="18" y="386" fontSize="9" fill="currentColor" fillOpacity="0.5">
          the extra T frames give the
        </text>
        <text x="18" y="396" fontSize="9" fill="currentColor" fillOpacity="0.5">
          teacher context, never a loss
        </text>

        {/* ---------- arrows into the two networks ---------- */}
        <path d="M128 118 C 168 118, 180 96, 214 96" fill="none" stroke={STUDENT} strokeWidth="1.8" markerEnd="url(#p3-arrow-s)" className="p3-flow" />
        <text x="171" y="88" textAnchor="middle" fontSize="10.5" fill={STUDENT} fontWeight="600">mask + augment</text>

        <path d="M128 262 C 168 262, 180 292, 214 292" fill="none" stroke={TEACHER} strokeWidth="1.8" markerEnd="url(#p3-arrow-t)" className="p3-flow" />
        <text x="171" y="316" textAnchor="middle" fontSize="10.5" fill={TEACHER} fontWeight="600">augment</text>

        {/* ---------- student / teacher networks ---------- */}
        <g>
          <rect x="220" y="60" width="180" height="72" rx="10" fill={STUDENT} fillOpacity="0.12" stroke={STUDENT} strokeWidth="1.6" />
          <text x="310" y="91" textAnchor="middle" fontSize="18" fill={STUDENT} fontWeight="700">Student</text>
          <text x="310" y="110" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.6" fontStyle="italic">gradients flow here</text>
        </g>
        <g>
          <rect x="220" y="256" width="180" height="72" rx="10" fill={TEACHER} fillOpacity="0.12" stroke={TEACHER} strokeWidth="1.6" />
          <text x="310" y="287" textAnchor="middle" fontSize="18" fill={TEACHER} fontWeight="700">Teacher</text>
          <text x="310" y="306" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.6" fontStyle="italic">frozen, no gradients</text>
        </g>

        {/* ---------- EMA ---------- */}
        <path d="M310 136 L310 250" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" markerEnd="url(#p3-arrow-g)" className="p3-flow-slow" />
        <rect x="258" y="172" width="104" height="42" rx="6" fill="hsl(var(--background))" stroke="currentColor" strokeOpacity="0.18" />
        <text x="310" y="188" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity="0.85" fontWeight="700">EMA</text>
        <text x="310" y="204" textAnchor="middle" fontSize="9.5" fill="currentColor" fillOpacity="0.62" fontStyle="italic">
          θt ← λθt + (1−λ)θs
        </text>

        {/* ---------- transformer to tokens ---------- */}
        <path d="M400 96 L462 96" fill="none" stroke={STUDENT} strokeWidth="1.8" markerEnd="url(#p3-arrow-s)" className="p3-flow" />
        <path d="M400 292 L462 292" fill="none" stroke={TEACHER} strokeWidth="1.8" markerEnd="url(#p3-arrow-t)" className="p3-flow" />

        {/* ---------- token columns ---------- */}
        {[0, 1, 2].map((c) => {
          const x = 480 + c * 62
          return (
            <g key={c}>
              <TokenStack x={x} y={34} color={STUDENT} masked={[0, 2, 3]} seed={c} />
              <TokenStack x={x} y={230} color={TEACHER} seed={c} />
              <text x={x + 15} y={392} textAnchor="middle" fontSize="9.5" fill="currentColor" fillOpacity="0.45">
                i = {c + 1}
              </text>
            </g>
          )
        })}
        <text x="682" y="120" fontSize="15" fill="currentColor" fillOpacity="0.4" letterSpacing="2">···</text>
        <text x="682" y="300" fontSize="15" fill="currentColor" fillOpacity="0.4" letterSpacing="2">···</text>
        <g>
          <TokenStack x={706} y={34} color={STUDENT} masked={[1, 4]} seed={5} />
          <TokenStack x={706} y={230} color={TEACHER} seed={5} />
          <text x="721" y="392" textAnchor="middle" fontSize="9.5" fill="currentColor" fillOpacity="0.45">i = M</text>
        </g>
        {/* ---------- losses ---------- */}
        {/* patch loss: masked student tokens vs teacher tokens */}
        <path d="M740 84 C 812 84, 812 110, 878 110" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" markerEnd="url(#p3-arrow-g)" className="p3-flow-slow" />
        <path d="M740 280 C 812 280, 812 132, 878 132" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" markerEnd="url(#p3-arrow-g)" className="p3-flow-slow" />
        <g>
          <rect x="884" y="86" width="162" height="62" rx="9" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.2" />
          <text x="898" y="108" fontSize="13" fill="currentColor" fontWeight="700">ℒ patch</text>
          <text x="898" y="124" fontSize="9.5" fill="currentColor" fillOpacity="0.6">cross-entropy over</text>
          <text x="898" y="137" fontSize="9.5" fill="currentColor" fillOpacity="0.6">masked patches only</text>
        </g>

        {/* image-level loss on CLS */}
        <path d="M740 152 C 812 152, 812 220, 878 220" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" markerEnd="url(#p3-arrow-g)" className="p3-flow-slow" />
        <path d="M740 348 C 812 348, 812 242, 878 242" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" markerEnd="url(#p3-arrow-g)" className="p3-flow-slow" />
        <g>
          <rect x="884" y="196" width="162" height="62" rx="9" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.2" />
          <text x="898" y="218" fontSize="13" fill="currentColor" fontWeight="700">ℒ global</text>
          <text x="898" y="234" fontSize="9.5" fill="currentColor" fillOpacity="0.6">cross-entropy on the</text>
          <text x="898" y="247" fontSize="9.5" fill="currentColor" fillOpacity="0.6">per-frame [CLS] tokens</text>
        </g>

        <g>
          <rect x="884" y="292" width="162" height="46" rx="9" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="4 3" />
          <text x="898" y="312" fontSize="11" fill="currentColor" fillOpacity="0.8" fontWeight="700">+ KoLeo, Sinkhorn</text>
          <text x="898" y="328" fontSize="9.5" fill="currentColor" fillOpacity="0.55">anti-collapse regularizers</text>
        </g>
      </svg>
    </div>
  )
}
