import { MODES } from '../modes'

export default function ModeSelect({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col justify-center px-5 py-8">
      <div className="mb-1 text-2xl font-black text-white sm:text-3xl">Choose a mode</div>
      <div className="mb-7 text-sm text-white/55">Pick how you want to build.</div>
      <div className="grid gap-4 sm:grid-cols-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 text-left transition hover:-translate-y-1"
            style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}
          >
            <div
              className="absolute inset-x-0 top-0 h-1 opacity-70 transition group-hover:opacity-100"
              style={{ background: m.accent }}
            />
            <div className="mb-3 text-4xl">{m.emoji}</div>
            <div className="text-lg font-bold text-white">{m.name}</div>
            <div className="mt-1 text-sm leading-snug text-white/55">{m.tagline}</div>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: m.accent }}>
              Play <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
