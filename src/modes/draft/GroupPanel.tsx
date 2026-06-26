import { useEffect, useMemo, useState } from 'react'
import { validSlotsFor, emergencyPlayers, EMERGENCY_MAX, type Draft } from './engine'
import { FORMATIONS } from '../../data/formations'
import { fmtValue } from '../../lib/format'
import GroupBadge from './GroupBadge'
import type { Position } from '../../types'

export default function GroupPanel({ draft, onPick, expanded, onToggleExpand }: {
  draft: Draft
  onPick?: () => void
  expanded?: boolean
  onToggleExpand?: () => void
}) {
  const { kind, noun } = draft.config
  const { group, emergency, rerollsLeft, lineup, pickedIds, formationName, selectedPlayerId, selectedSlotId, selectPlayer, selectSlot, place, reroll } = draft.useStore()
  const total = formationName ? FORMATIONS.find((f) => f.name === formationName)!.slots.length : 11
  const filled = Object.keys(lineup).length
  const selectedSlotType = selectedSlotId && formationName
    ? FORMATIONS.find((f) => f.name === formationName)!.slots.find((s) => s.id === selectedSlotId)?.type
    : null

  const [rolling, setRolling] = useState(false)
  const [display, setDisplay] = useState(group)
  const [q, setQ] = useState('')
  const [posFilter, setPosFilter] = useState<'ALL' | Position>('ALL')

  // Spin through random groups before settling on the drawn one.
  useEffect(() => {
    if (!group) return
    setRolling(true); setQ(''); setPosFilter('ALL')
    let ticks = 0
    const iv = setInterval(() => {
      setDisplay(draft.pool[Math.floor(Math.random() * draft.pool.length)])
      if (++ticks > 11) { clearInterval(iv); setDisplay(group); setRolling(false) }
    }, 90)
    return () => clearInterval(iv)
  }, [group, draft.pool])

  const base = emergency
    ? emergencyPlayers(lineup, pickedIds, formationName ?? '')
    : group && !rolling ? draft.availableForGroup(group, pickedIds) : []

  const posOptions = useMemo(() => {
    const set = new Set<Position>()
    base.forEach((p) => p.eligiblePos.forEach((pos) => set.add(pos)))
    return Array.from(set)
  }, [base])

  const players = useMemo(() => base.filter((p) => {
    if (selectedSlotId && formationName && !validSlotsFor(p, lineup, formationName).includes(selectedSlotId)) return false
    if (posFilter !== 'ALL' && !p.eligiblePos.includes(posFilter)) return false
    if (q && !`${p.name} ${p.club}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  }), [base, selectedSlotId, formationName, lineup, posFilter, q])

  const shown = rolling ? display : group

  return (
    <div className="glass flex h-full flex-col">
      {onToggleExpand && (
        <button onClick={onToggleExpand}
          className="flex w-full shrink-0 items-center justify-center gap-2 border-b border-white/10 py-1.5 text-xs font-semibold text-white/60 active:bg-white/5">
          <span className="h-1 w-10 rounded-full bg-white/25" />
          <span>{expanded ? 'Show pitch ▼' : 'Bigger player list ▲'}</span>
        </button>
      )}
      <div className="border-b border-white/10 p-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-bold tracking-wide text-white/80">PICK {Math.min(filled + 1, total)} / {total}</span>
          {!emergency && (
            <button onClick={reroll} disabled={rerollsLeft <= 0 || rolling}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-semibold text-white/80 transition enabled:hover:bg-white/10 disabled:opacity-40">
              🎲 Reroll
              <span className="flex gap-0.5">
                {Array.from({ length: 2 }, (_, i) => (
                  <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < rerollsLeft ? 'bg-blue-400' : 'bg-white/20'}`} />
                ))}
              </span>
            </button>
          )}
        </div>

        {emergency ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2">
            <span className="text-3xl">🆓</span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-amber-300/70">No eligible {noun} left for these spots</div>
              <div className="truncate text-lg font-black leading-tight text-amber-200">Free agents · under €{EMERGENCY_MAX}M</div>
            </div>
          </div>
        ) : (
        <div className={`flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/30 px-3 py-2 ${rolling ? 'animate-pulse' : ''}`}>
          {shown ? <GroupBadge kind={kind} name={shown} size="lg" /> : <span className="text-4xl">—</span>}
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-white/40">{rolling ? 'Spinning…' : `Your ${noun}`}</div>
            <div className="truncate text-lg font-black leading-tight text-white">{shown ?? '—'}</div>
          </div>
        </div>
        )}

        {(!rolling || emergency) && (
          <>
            <div className="mt-2 flex gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or club…"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm outline-none focus:border-blue-400" />
              <select value={posFilter} onChange={(e) => setPosFilter(e.target.value as Position | 'ALL')} disabled={!!selectedSlotId}
                className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs disabled:opacity-40">
                <option value="ALL">All pos</option>
                {posOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {selectedSlotType ? (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-500/15 px-2.5 py-1.5 text-xs text-blue-200">
                <span>Filling <b>{selectedSlotType}</b> · tap a player to place</span>
                <button onClick={() => selectSlot(null)} className="rounded px-1.5 hover:bg-white/10">clear ✕</button>
              </div>
            ) : selectedPlayerId ? (
              <div className="mt-2 rounded-lg bg-blue-500/15 px-2.5 py-1.5 text-xs text-blue-200">Now tap a highlighted position on the pitch.</div>
            ) : null}
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {rolling ? (
          <div className="p-6 text-center text-sm text-white/40">Rolling the {noun}…</div>
        ) : players.length === 0 ? (
          <div className="p-6 text-center text-sm text-white/40">No players match.</div>
        ) : (
          players.map((p) => {
            const placeable = formationName ? validSlotsFor(p, lineup, formationName).length > 0 : false
            const sel = selectedPlayerId === p.id
            const canClick = placeable || sel
            return (
              <button key={p.id} disabled={!canClick}
                onClick={() => {
                  if (selectedSlotId && formationName && validSlotsFor(p, lineup, formationName).includes(selectedSlotId)) {
                    place(p.id, selectedSlotId); onPick?.()
                  } else {
                    selectPlayer(sel ? null : p.id); if (!sel) onPick?.()
                  }
                }}
                className={`flex w-full items-center gap-2.5 border-b border-white/5 px-3 py-2.5 text-left transition
                  ${sel ? 'bg-blue-500/20' : canClick ? 'hover:bg-white/5' : 'opacity-40'}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-yellow-200 to-yellow-500 text-[12px] font-black text-black shadow">
                  {p.primaryPos}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                  <span className="block truncate text-[11px] text-white/45">{kind === 'nation' ? p.club : p.nationality} · {p.eligiblePos.join('/')}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-bold text-emerald-300">{fmtValue(p.value)}</span>
                  {!placeable && <span className="block text-[10px] text-white/40">no open spot</span>}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
