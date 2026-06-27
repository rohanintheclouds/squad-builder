import type { ModeRules, RuleBlock, Swatch } from '../modes'

const SWATCH: Record<Swatch, string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  neutral: '#64748b',
}

function SectionHeading({ children }: { children: string }) {
  return <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{children}</h3>
}

function Block({ block }: { block: RuleBlock }) {
  if (block.type === 'steps') {
    return (
      <section>
        <SectionHeading>{block.heading}</SectionHeading>
        <ol className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white/80">
                {i + 1}
              </span>
              <span className="text-[13px] leading-relaxed text-white/80">{item}</span>
            </li>
          ))}
        </ol>
      </section>
    )
  }

  if (block.type === 'legend') {
    return (
      <section>
        <SectionHeading>{block.heading}</SectionHeading>
        <div className="flex flex-col gap-2">
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SWATCH[item.swatch] }} />
              <p className="text-[13px] leading-relaxed text-white/80">
                <span className="font-semibold text-white">{item.term}</span>
                <span className="text-white/45"> — {item.desc}</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionHeading>{block.heading}</SectionHeading>
      <ul className="flex flex-col gap-2">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/35" />
            <span className="text-[13px] leading-relaxed text-white/80">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function RulesModal({ title, accent, rules, onClose }: {
  title: string
  accent: string
  rules: ModeRules
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="relative border-b border-white/10 px-5 py-4">
          <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent }} />
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">How to play</div>
              <div className="mt-0.5 text-lg font-bold text-white">{title}</div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-0.5 rounded-md px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div
            className="mb-5 rounded-lg border-l-2 px-3.5 py-2.5 text-[13px] leading-relaxed text-white/85"
            style={{ borderColor: accent, background: `${accent}14` }}
          >
            <span className="font-semibold text-white">Objective. </span>
            {rules.objective}
          </div>

          <div className="flex flex-col gap-5">
            {rules.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
