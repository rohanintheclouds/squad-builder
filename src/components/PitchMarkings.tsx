// Regulation pitch markings drawn to real proportions (68 x 105 m), stretched to fill
// the container so they line up with the percentage-positioned player slots.
const LINE = 'rgba(255,255,255,0.5)'

export default function PitchMarkings() {
  const common = { fill: 'none', stroke: LINE, strokeWidth: 2, vectorEffect: 'non-scaling-stroke' as const }
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 68 105" preserveAspectRatio="none">
      {/* boundary */}
      <rect x="2" y="2" width="64" height="101" {...common} />
      {/* halfway line + centre circle + spot */}
      <line x1="2" y1="52.5" x2="66" y2="52.5" {...common} />
      <circle cx="34" cy="52.5" r="9.15" {...common} />
      <circle cx="34" cy="52.5" r="0.5" fill={LINE} stroke="none" />
      {/* penalty areas (16.5m deep, 40.32m wide) */}
      <rect x="13.84" y="86.5" width="40.32" height="16.5" {...common} />
      <rect x="13.84" y="2" width="40.32" height="16.5" {...common} />
      {/* goal areas (5.5m deep, 18.32m wide) */}
      <rect x="24.84" y="97.5" width="18.32" height="5.5" {...common} />
      <rect x="24.84" y="2" width="18.32" height="5.5" {...common} />
      {/* penalty spots */}
      <circle cx="34" cy="92" r="0.5" fill={LINE} stroke="none" />
      <circle cx="34" cy="13" r="0.5" fill={LINE} stroke="none" />
      {/* penalty arcs (only the part outside the box) */}
      <path d="M 26.69 86.5 A 9.15 9.15 0 0 1 41.31 86.5" {...common} />
      <path d="M 26.69 18.5 A 9.15 9.15 0 0 0 41.31 18.5" {...common} />
      {/* goals */}
      <rect x="30.34" y="103" width="7.32" height="1.2" {...common} />
      <rect x="30.34" y="0.8" width="7.32" height="1.2" {...common} />
      {/* corner arcs */}
      <path d="M 2 4 A 2 2 0 0 1 4 2" {...common} />
      <path d="M 64 2 A 2 2 0 0 1 66 4" {...common} />
      <path d="M 4 103 A 2 2 0 0 1 2 101" {...common} />
      <path d="M 66 101 A 2 2 0 0 1 64 103" {...common} />
    </svg>
  )
}
