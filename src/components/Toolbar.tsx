import { useMemo } from 'react'
import { useStore } from '../store'
import { FORMATIONS, FORMATION_GROUPS } from '../data/formations'
import { TACTICS } from '../data/tactics'
import { MANAGER_PLAYERS as PLAYERS } from '../data/players'
import { teamRating } from '../lib/squad'
import { fmtValue } from '../lib/format'

const GROUPS = ['3-Back', '4-Back', '5-Back'] as const

export default function Toolbar() {
  const { formationName, setFormation, tacticId, setTactic, budgetCap, setBudget, lineup, clearAll } = useStore()
  const tactic = TACTICS.find((t) => t.id === tacticId)!

  const spent = useMemo(
    () => Object.values(lineup).reduce((s, e) => s + (PLAYERS.find((p) => p.id === e.playerId)?.value ?? 0), 0),
    [lineup],
  )
  const remaining = budgetCap - spent
  const over = remaining < 0
  const pct = Math.min(100, budgetCap > 0 ? (spent / budgetCap) * 100 : 0)
  const entries = Object.values(lineup)
  const filled = entries.length
  const total = FORMATIONS.find((f) => f.name === formationName)!.slots.length
  const { rating: teamRtg, avgAge } = teamRating(entries.map((e) => e.playerId))
  const stars = Math.min(5, Math.round(teamRtg / 20))

  return (
    <div className="glass border-b border-white/10">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3">
        <div className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
          <span className="text-blue-400">●</span> Squad Builder
        </div>

        <label className="flex items-center gap-2 text-xs text-white/55">
          Formation
          <select value={formationName} onChange={(e) => setFormation(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm font-medium text-white">
            {GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {FORMATION_GROUPS.filter((f) => f.group === g).map((f) => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-white/55">
          Tactic
          <select value={tacticId} onChange={(e) => setTactic(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm font-medium text-white">
            {TACTICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <span className="hidden max-w-72 text-[11px] italic text-white/40 xl:block">{tactic.blurb}</span>

        <label className="flex items-center gap-2 text-xs text-white/55">
          Budget €M
          <input type="number" min={0} value={budgetCap}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-24 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm font-medium text-white" />
        </label>

        <div className="ml-auto flex items-center gap-5">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-white/40">Team Rating</div>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-sm font-bold text-white">{teamRtg}</span>
              <span className="text-[11px] tracking-tight">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < stars ? 'text-amber-400' : 'text-white/20'}>★</span>
                ))}
              </span>
            </div>
          </div>
          <Stat label="Avg Age" value={avgAge ? String(avgAge) : '—'} />
          <Stat label="Spent" value={fmtValue(spent)} />
          <Stat label="Remaining" value={over ? `-${fmtValue(Math.abs(remaining))}` : fmtValue(remaining)} tone={over ? 'bad' : 'good'} />
          <Stat label="Filled" value={`${filled}/${total}`} />
          <button onClick={clearAll}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10">
            Clear
          </button>
        </div>
      </div>

      {/* budget bar */}
      <div className="h-1 w-full bg-white/5">
        <div className={`h-full transition-all ${over ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
      </div>

      {over && (
        <div className="bg-red-500/15 px-5 py-1.5 text-xs font-medium text-red-300">
          Over budget by {fmtValue(Math.abs(remaining))}. Swap in cheaper players or raise the cap.
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wide text-white/40">{label}</div>
      <div className={`text-sm font-bold ${tone === 'bad' ? 'text-red-400' : tone === 'good' ? 'text-emerald-300' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
