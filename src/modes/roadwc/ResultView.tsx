import { useWcStore, byId } from './store'
import { FORMATIONS } from '../../data/formations'
import { scoreTeam, TIERS } from './scoring'
import { eligibility } from '../../lib/positions'
import PlayerCard from '../../components/PlayerCard'

export default function ResultView({ onExit }: { onExit: () => void }) {
  const { pickedIds, lineup, formationName, start } = useWcStore()
  const { percentile, tier } = scoreTeam(pickedIds)
  const topPct = Math.max(1, Math.round((1 - percentile) * 100))
  const formation = formationName ? FORMATIONS.find((f) => f.name === formationName)! : null

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-y-auto px-4 py-6">
      <div className="mb-6 text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Your result</div>
        <div className="my-2 text-4xl font-black sm:text-5xl" style={{ color: tier.color }}>{tier.label}</div>
        <div className="text-sm text-white/70">{tier.blurb}</div>
        <div className="mt-1 text-xs text-white/45">Top {topPct}% of all possible teams</div>
      </div>

      {/* tier ladder */}
      <div className="mx-auto mb-8 flex w-full max-w-md flex-col gap-1">
        {TIERS.map((t) => (
          <div
            key={t.key}
            className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition ${t.key === tier.key ? 'font-bold' : 'opacity-45'}`}
            style={{ background: t.key === tier.key ? `${t.color}22` : 'transparent', color: t.key === tier.key ? t.color : '#cbd5e1' }}
          >
            <span>{t.label}</span>
            {t.key === tier.key && <span>← you</span>}
          </div>
        ))}
      </div>

      {/* the squad, ratings revealed */}
      <div className="mb-2 text-center text-sm font-semibold text-white/70">Your {formationName} XI (ratings revealed)</div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {formation?.slots.map((slot) => {
          const pid = lineup[slot.id]
          const p = pid ? byId.get(pid) : undefined
          if (!p) return null
          return (
            <div key={slot.id} style={{ transform: 'scale(0.82)' }}>
              <PlayerCard player={p} slotType={slot.type} eligibility={eligibility(p, slot.type)} />
            </div>
          )
        })}
      </div>

      <div className="mb-4 flex justify-center gap-3">
        <button onClick={start} className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-cyan-400">Play again</button>
        <button onClick={onExit} className="rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10">Back to modes</button>
      </div>
    </div>
  )
}
