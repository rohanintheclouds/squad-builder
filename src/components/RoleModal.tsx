import { useState } from 'react'
import { useStore } from '../store'
import { rolesFor } from '../data/roles'
import { MANAGER_PLAYERS as PLAYERS } from '../data/players'
import type { Position } from '../types'

const byId = new Map(PLAYERS.map((p) => [p.id, p]))

export default function RoleModal({
  slotId,
  position,
  onClose,
}: {
  slotId: string
  position: Position
  onClose: () => void
}) {
  const { lineup, setRole } = useStore()
  const entry = lineup[slotId]
  const player = entry ? byId.get(entry.playerId) : undefined
  const roles = rolesFor(position)
  const [openRole, setOpenRole] = useState<string | null>(entry?.role ?? roles[0]?.name ?? null)

  if (!player) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#11171f] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-500/15 to-transparent px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-blue-300">Player Instructions · {position}</div>
            <div className="text-lg font-bold text-white">{player.name}</div>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-white/60 hover:bg-white/10">✕</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {roles.map((r) => {
            const active = openRole === r.name
            const chosen = entry?.role === r.name
            return (
              <div key={r.name} className="mb-2 overflow-hidden rounded-xl border border-white/10">
                <button
                  onClick={() => setOpenRole(active ? null : r.name)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold
                    ${chosen ? 'bg-blue-500/20 text-blue-100' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  <span>{r.name}{chosen && entry?.focus ? ` · ${entry.focus}` : ''}</span>
                  <span className="text-white/40">{active ? '▾' : '▸'}</span>
                </button>
                {active && (
                  <div className="flex flex-wrap gap-2 bg-black/30 p-3">
                    {r.focuses.map((f) => {
                      const sel = chosen && entry?.focus === f
                      return (
                        <button
                          key={f}
                          onClick={() => {
                            setRole(slotId, r.name, f)
                            onClose()
                          }}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition
                            ${sel ? 'border-blue-400 bg-blue-400 text-black' : 'border-white/15 bg-white/5 text-white/80 hover:border-blue-400 hover:text-white'}`}
                        >
                          {f}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
