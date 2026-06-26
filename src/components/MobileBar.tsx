import { useMemo } from 'react'
import { useStore } from '../store'
import { FORMATIONS, FORMATION_GROUPS } from '../data/formations'
import { TACTICS } from '../data/tactics'
import { MANAGER_PLAYERS as PLAYERS } from '../data/players'
import { teamRating } from '../lib/squad'
import { fmtValue } from '../lib/format'

const GROUPS = ['3-Back', '4-Back', '5-Back'] as const

export default function MobileBar() {
  const { formationName, setFormation, tacticId, setTactic, budgetCap, setBudget, lineup, clearAll } = useStore()

  const entries = Object.values(lineup)
  const spent = useMemo(
    () => entries.reduce((s, e) => s + (PLAYERS.find((p) => p.id === e.playerId)?.value ?? 0), 0),
    [entries],
  )
  const remaining = budgetCap - spent
  const over = remaining < 0
  const pct = Math.min(100, budgetCap > 0 ? (spent / budgetCap) * 100 : 0)
  const filled = entries.length
  const total = FORMATIONS.find((f) => f.name === formationName)!.slots.length
  const { rating: teamRtg, avgAge } = teamRating(entries.map((e) => e.playerId))

  return (
    <div className="glass border-b border-white/10 px-3 pb-2 pt-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-base font-black tracking-tight text-white">
          <span className="text-blue-400">●</span> Squad Builder
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-white/70">RTG <b className="text-white">{teamRtg}</b></span>
          {avgAge > 0 && <span className="text-white/50">{avgAge}y</span>}
          <span className={over ? 'text-red-400' : 'text-emerald-300'}>
            {over ? `-${fmtValue(Math.abs(remaining))}` : fmtValue(remaining)}
          </span>
          <span className="text-white/70">{filled}/{total}</span>
          <button onClick={clearAll} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-white/70">
            Clear
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={formationName}
          onChange={(e) => setFormation(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm font-medium text-white"
        >
          {GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {FORMATION_GROUPS.filter((f) => f.group === g).map((f) => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <select
          value={tacticId}
          onChange={(e) => setTactic(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm font-medium text-white"
        >
          {TACTICS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input
          type="number"
          min={0}
          value={budgetCap}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm font-medium text-white"
          aria-label="Budget cap in millions"
        />
      </div>

      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full transition-all ${over ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
