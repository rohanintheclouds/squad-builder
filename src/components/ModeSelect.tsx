import { MODES } from '../modes'
import { getBestTier, getStreak, getBestStreak } from '../lib/progress'

function Banner({ id }: { id: string }) {
  if (id === 'guess') {
    const s = getStreak(), b = getBestStreak()
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
        🔥 Streak {s} · Best {b}
      </span>
    )
  }
  if (id === 'roadwc' || id === 'roadcl') {
    const best = getBestTier(id === 'roadwc' ? 'wc' : 'cl')
    if (!best) return <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/40">Not played yet</span>
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
        style={{ color: best.color, borderColor: best.color + '66', background: best.color + '1f' }}
      >
        🏆 Best: {best.label}
      </span>
    )
  }
  return null
}

export default function ModeSelect({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center px-4 py-6">
        <div className="mb-0.5 text-2xl font-black text-white sm:text-3xl">Choose a mode</div>
        <div className="mb-5 text-sm text-white/55">Pick how you want to build.</div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="glass group relative overflow-hidden rounded-2xl border border-white/10 p-4 text-left transition hover:-translate-y-1 sm:p-5"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}
            >
              <div className="absolute inset-x-0 top-0 h-1 opacity-70 transition group-hover:opacity-100" style={{ background: m.accent }} />
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="truncate text-base font-bold text-white sm:text-lg">{m.name}</span>
                </div>
                <span className="shrink-0 text-lg font-semibold transition group-hover:translate-x-1" style={{ color: m.accent }}>→</span>
              </div>
              <div className="mt-1.5 line-clamp-2 text-xs leading-snug text-white/50 sm:text-sm">{m.tagline}</div>
              <div className="mt-2.5"><Banner id={m.id} /></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
