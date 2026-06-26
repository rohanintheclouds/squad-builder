import { useState } from 'react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useStore } from '../store'
import { FORMATIONS } from '../data/formations'
import { PLAYERS } from '../data/players'
import { eligibility } from '../lib/positions'
import { amberCount, AMBER_LIMIT } from '../lib/squad'
import type { FormationSlot, Position } from '../types'
import PlayerCard from './PlayerCard'
import PitchMarkings from './PitchMarkings'
import RoleModal from './RoleModal'

const byId = new Map(PLAYERS.map((p) => [p.id, p]))
const HEX = 'polygon(50% 1%, 95% 25%, 95% 75%, 50% 99%, 5% 75%, 5% 25%)'

function Slot({ slot, onEditRole, compact, draggable }: {
  slot: FormationSlot
  onEditRole: (slotId: string, pos: Position) => void
  compact: boolean
  draggable: boolean
}) {
  const { lineup, selectedSlotId, selectSlot, removeFromSlot } = useStore()
  const entry = lineup[slot.id]
  const player = entry ? byId.get(entry.playerId) : undefined
  const selected = selectedSlotId === slot.id

  const { setNodeRef: dropRef, isOver } = useDroppable({ id: `slot:${slot.id}` })
  const { setNodeRef: dragRef, listeners, attributes, isDragging } = useDraggable({
    id: `pitch:${slot.id}`,
    disabled: !player || !draggable,
  })
  const dragProps = draggable ? { ...listeners, ...attributes } : {}

  const elig = player ? eligibility(player, slot.type) : null
  const scale = (compact ? 0.7 : 1) * (isOver ? 1.05 : 1)

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
      <div ref={dropRef} className="transition" style={{ transform: `scale(${scale})` }}>
        {player && elig ? (
          <div className={`relative transition ${isDragging ? 'opacity-30' : draggable ? 'hover:-translate-y-0.5' : ''}`}>
            <button
              ref={dragRef}
              {...dragProps}
              onClick={() => onEditRole(slot.id, slot.type)}
              className={`block ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
              title={draggable ? 'Drag to move · click to set role' : 'Tap to set role'}
            >
              <PlayerCard player={player} slotType={slot.type} eligibility={elig} role={entry?.role} focus={entry?.focus} />
            </button>
            <span
              role="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                removeFromSlot(slot.id)
              }}
              className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow hover:bg-red-500"
            >
              ×
            </span>
          </div>
        ) : (
          <button
            onClick={() => selectSlot(selected ? null : slot.id)}
            className="group relative flex h-[88px] w-[78px] items-center justify-center"
          >
            <span
              className={`absolute inset-0 transition ${selected || isOver ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
              style={{ clipPath: HEX, background: selected || isOver ? '#22d3ee' : 'rgba(52,211,153,0.55)' }}
            />
            <span
              className="absolute inset-[2px] flex items-center justify-center"
              style={{ clipPath: HEX, background: 'linear-gradient(160deg, rgba(20,28,38,0.95), rgba(10,15,21,0.95))' }}
            >
              <span className={`text-2xl font-light ${selected || isOver ? 'text-cyan-300' : 'text-emerald-300/90'}`}>+</span>
            </span>
            <span className="absolute -bottom-1.5 rounded bg-black/70 px-1.5 text-[10px] font-bold tracking-wide text-white/90">
              {slot.type}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export default function Pitch({ compact = false, draggable = true }: { compact?: boolean; draggable?: boolean }) {
  const { formationName, lineup } = useStore()
  const formation = FORMATIONS.find((f) => f.name === formationName)!
  const [roleModal, setRoleModal] = useState<{ slotId: string; pos: Position } | null>(null)
  const oop = amberCount(lineup, formationName)

  return (
    <div className="relative h-full w-full rounded-2xl ring-1 ring-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      {/* turf surface (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden rounded-2xl"
        style={{ background: 'radial-gradient(120% 100% at 50% 0%, #1f7e47 0%, #156330 52%, #0b3d21 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-35"
          style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 7%, transparent 7% 14%)' }}
        />
        <PitchMarkings />
        <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.6)]" />
      </div>

      {/* players layer (not clipped, so cards near the edges aren't cut off) */}
      <div className="absolute inset-0">
        {formation.slots.map((slot) => (
          <Slot
            key={slot.id}
            slot={slot}
            compact={compact}
            draggable={draggable}
            onEditRole={(slotId, pos) => setRoleModal({ slotId, pos })}
          />
        ))}
      </div>

      {/* overlays */}
      <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs backdrop-blur-md">
        <span className="text-white/60">Out of position</span>
        <span className={`font-bold ${oop >= AMBER_LIMIT ? 'text-amber-300' : 'text-white'}`}>{oop}/{AMBER_LIMIT}</span>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-5 z-10 text-3xl font-black italic text-white/85 drop-shadow">
        {formationName}
      </div>

      {roleModal && <RoleModal slotId={roleModal.slotId} position={roleModal.pos} onClose={() => setRoleModal(null)} />}
    </div>
  )
}
