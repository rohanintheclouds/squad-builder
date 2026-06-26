import { useMemo, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useStore } from '../store'
import { MANAGER_PLAYERS as PLAYERS } from '../data/players'
import { FORMATIONS } from '../data/formations'
import { TACTICS } from '../data/tactics'
import { eligibility, ELIGIBILITY_COLOR } from '../lib/positions'
import { amberCount, AMBER_LIMIT } from '../lib/squad'
import { fmtValue } from '../lib/format'
import { flag } from '../lib/flags'
import type { Player, Position } from '../types'

const ALL_POS: Position[] = ['GK','RB','RWB','CB','LB','LWB','CDM','CM','CAM','RM','LM','RW','LW','CF','ST']
const LEAGUES = Array.from(new Set(PLAYERS.map((p) => p.league))).sort()

function Row({ player, eligColor, already, tooPricey, clickable, blocked, draggable, onAssign }: {
  player: Player
  eligColor?: string
  already: boolean
  tooPricey: boolean
  clickable: boolean
  blocked: boolean
  draggable: boolean
  onAssign: () => void
}) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: `search:${player.id}`, disabled: blocked || !draggable })
  const canClick = clickable && !blocked
  const dragProps = draggable && !blocked ? { ...listeners, ...attributes } : {}
  return (
    <div
      ref={setNodeRef}
      {...dragProps}
      onClick={() => canClick && onAssign()}
      className={`flex items-center gap-2.5 border-b border-white/5 px-3 py-2 text-left transition
        ${isDragging ? 'opacity-40' : ''}
        ${blocked ? 'cursor-not-allowed opacity-45' : canClick ? `${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} hover:bg-blue-500/10` : draggable ? 'cursor-grab' : 'cursor-default'}
        ${already && !blocked ? 'opacity-45' : ''}`}
    >
      {eligColor && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: eligColor }} />}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-yellow-200 to-yellow-500 text-[11px] font-black text-black shadow">
        {player.primaryPos}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
          <span>{flag(player.nationality)}</span>
          <span className="truncate">{player.name}</span>
        </span>
        <span className="block truncate text-[11px] text-white/45">
          {player.club} · {player.eligiblePos.join('/')}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className={`block text-sm font-bold ${tooPricey ? 'text-red-400' : 'text-emerald-300'}`}>{fmtValue(player.value)}</span>
        {blocked ? (
          <span className="block text-[10px] font-medium text-amber-300">OOP limit</span>
        ) : already ? (
          <span className="block text-[10px] text-white/40">in squad</span>
        ) : null}
      </span>
    </div>
  )
}

export default function SearchPanel({ draggable = true, onAfterAssign }: { draggable?: boolean; onAfterAssign?: () => void } = {}) {
  const { formationName, tacticId, lineup, budgetCap, selectedSlotId, assignPlayer } = useStore()
  const [q, setQ] = useState('')
  const [posFilter, setPosFilter] = useState<'ALL' | Position>('ALL')
  const [leagueFilter, setLeagueFilter] = useState<'ALL' | string>('ALL')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')

  const formation = FORMATIONS.find((f) => f.name === formationName)!
  const tactic = TACTICS.find((t) => t.id === tacticId)!
  const selectedSlot = selectedSlotId ? formation.slots.find((s) => s.id === selectedSlotId) ?? null : null

  const spent = useMemo(
    () => Object.values(lineup).reduce((sum, e) => sum + (PLAYERS.find((p) => p.id === e.playerId)?.value ?? 0), 0),
    [lineup],
  )
  const slotOccupantValue = selectedSlot && lineup[selectedSlot.id]
    ? PLAYERS.find((p) => p.id === lineup[selectedSlot.id].playerId)?.value ?? 0
    : 0
  const remaining = budgetCap - spent + slotOccupantValue

  const inLineup = useMemo(() => new Set(Object.values(lineup).map((e) => e.playerId)), [lineup])
  // Amber players already fielded, ignoring the slot we're filling (a swap keeps the count flat).
  const amberAtLimit = amberCount(lineup, formationName, selectedSlotId ?? undefined) >= AMBER_LIMIT

  const rows = useMemo(() => {
    let list: Player[] = PLAYERS.filter((p) => {
      if (q && !`${p.name} ${p.club}`.toLowerCase().includes(q.toLowerCase())) return false
      if (posFilter !== 'ALL' && !p.eligiblePos.includes(posFilter)) return false
      if (leagueFilter !== 'ALL' && p.league !== leagueFilter) return false
      if (maxPrice !== '' && (p.value ?? 0) > maxPrice) return false
      return true
    })

    if (selectedSlot) {
      const slotType = selectedSlot.type
      list = list
        .map((p) => {
          const elig = eligibility(p, slotType)
          let score = elig === 'green' ? 3 : elig === 'amber' ? 1 : -100
          if (tactic.emphasis.includes(p.primaryPos)) score += 1.5
          else if (p.eligiblePos.some((pos) => tactic.emphasis.includes(pos))) score += 0.5
          score += p.rating / 50
          if ((p.value ?? 0) > remaining) score -= 2
          return { p, elig, score }
        })
        .filter((r) => r.elig !== 'red')
        .sort((a, b) => b.score - a.score)
        .map((r) => r.p)
    } else {
      list = list.sort((a, b) => b.rating - a.rating)
    }
    return list
  }, [q, posFilter, leagueFilter, maxPrice, selectedSlot, tactic, remaining])

  return (
    <div className="glass flex h-full flex-col">
      <div className="border-b border-white/10 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide text-white/90">PLAYER SEARCH</span>
          <span className="text-xs text-white/45">{rows.length} players</span>
        </div>

        {selectedSlot ? (
          <div className="mb-2 rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-xs text-blue-200">
            Suggestions for <b>{selectedSlot.type}</b> · {tactic.name} · {fmtValue(remaining)} left
          </div>
        ) : (
          <div className="mb-2 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/50">
            Drag any player onto the pitch, or click a slot for tactic-aware suggestions.
          </div>
        )}

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or club…"
          className="mb-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <div className="grid grid-cols-3 gap-2">
          <select value={posFilter} onChange={(e) => setPosFilter(e.target.value as Position | 'ALL')}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs">
            <option value="ALL">All pos</option>
            {ALL_POS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={leagueFilter} onChange={(e) => setLeagueFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs">
            <option value="ALL">All leagues</option>
            {LEAGUES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <input type="number" min={0} value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Max €M"
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rows.map((p) => {
          const elig = selectedSlot ? eligibility(p, selectedSlot.type) : undefined
          return (
            <Row
              key={p.id}
              player={p}
              eligColor={elig ? ELIGIBILITY_COLOR[elig] : undefined}
              already={inLineup.has(p.id)}
              tooPricey={selectedSlot ? (p.value ?? 0) > remaining : false}
              clickable={!!selectedSlot}
              blocked={elig === 'amber' && amberAtLimit && lineup[selectedSlot!.id]?.playerId !== p.id}
              draggable={draggable}
              onAssign={() => {
                if (!selectedSlot) return
                assignPlayer(selectedSlot.id, p.id)
                onAfterAssign?.()
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
