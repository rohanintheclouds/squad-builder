import { byId, validSlotsFor, validMoveTargets, type Draft } from './engine'
import { FORMATIONS } from '../../data/formations'
import { eligibilityStrict as eligibility } from '../../lib/positions'
import PitchMarkings from '../../components/PitchMarkings'
import PlayerCard from '../../components/PlayerCard'

const HEX = 'polygon(50% 1%, 95% 25%, 95% 75%, 50% 99%, 5% 75%, 5% 25%)'

export default function DraftPitch({ draft, compact = false }: { draft: Draft; compact?: boolean }) {
  const { formationName, lineup, selectedPlayerId, selectedSlotId, selectSlot, place, movingSlotId, pickUpPlaced, movePlaced } = draft.useStore()
  if (!formationName) return null
  const formation = FORMATIONS.find((f) => f.name === formationName)!
  const selected = selectedPlayerId ? byId.get(selectedPlayerId) : undefined
  const validSlots = selected ? new Set(validSlotsFor(selected, lineup, formationName)) : new Set<string>()
  // A placed player picked up to relocate, and the empty slots he may move into (same rules as
  // placement: green anywhere, amber only within the 3-out-of-position cap).
  const moving = movingSlotId ? byId.get(lineup[movingSlotId]) : undefined
  const moveTargets = moving ? new Set(validMoveTargets(moving, lineup, movingSlotId!, formationName)) : new Set<string>()
  const movingLast = moving?.name.split(' ').slice(-1)[0]
  const scale = compact ? 0.72 : 1

  return (
    <div className="relative h-full w-full rounded-2xl ring-1 ring-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 overflow-hidden rounded-2xl" style={{ background: 'radial-gradient(120% 100% at 50% 0%, #1f7e47 0%, #156330 52%, #0b3d21 100%)' }}>
        <div className="absolute inset-0 opacity-35" style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 7%, transparent 7% 14%)' }} />
        <PitchMarkings />
        <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.6)]" />
      </div>

      <div className="absolute inset-0">
        {formation.slots.map((slot) => {
          const pid = lineup[slot.id]
          const player = pid ? byId.get(pid) : undefined
          const isPlaceTarget = selected ? validSlots.has(slot.id) : false
          const isMoveTarget = moving ? moveTargets.has(slot.id) : false
          const isSelectedSlot = selectedSlotId === slot.id
          const isMovingSelf = movingSlotId === slot.id
          const highlight = isPlaceTarget || isSelectedSlot || isMoveTarget
          return (
            <div key={slot.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
              <div style={{ transform: `scale(${scale})` }}>
                {player ? (
                  <button
                    onClick={() => pickUpPlaced(slot.id)}
                    title="Tap to move this player to an open spot in his natural position"
                    className={`block cursor-pointer rounded-[15px] transition ${isMovingSelf ? 'ring-2 ring-sky-300' : 'hover:-translate-y-0.5'}`}
                  >
                    <PlayerCard player={player} slotType={slot.type} eligibility={eligibility(player, slot.type)} dimmed={!!moving && !isMovingSelf} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (moving) {
                        if (isMoveTarget) movePlaced(slot.id)
                        else pickUpPlaced(null) // tap empty space elsewhere to cancel the move
                      } else if (isPlaceTarget && selected) place(selected.id, slot.id)
                      else selectSlot(isSelectedSlot ? null : slot.id)
                    }}
                    className="group relative flex h-[88px] w-[78px] cursor-pointer items-center justify-center"
                  >
                    <span className={`absolute inset-0 transition ${highlight ? 'animate-pulse' : 'opacity-80 group-hover:opacity-100'}`}
                      style={{ clipPath: HEX, background: highlight ? '#38bdf8' : 'rgba(56,189,248,0.5)' }} />
                    <span className="absolute inset-[2px] flex items-center justify-center"
                      style={{ clipPath: HEX, background: 'linear-gradient(160deg, rgba(20,28,38,0.95), rgba(10,15,21,0.95))' }}>
                      <span className={`text-lg font-light ${highlight ? 'text-blue-300' : 'text-emerald-300/80'}`}>{isPlaceTarget || isMoveTarget ? '↓' : '+'}</span>
                    </span>
                    <span className="absolute -bottom-1.5 rounded px-1.5 text-[10px] font-bold tracking-wide text-white/90"
                      style={{ background: isSelectedSlot ? '#0891b2' : 'rgba(0,0,0,0.7)' }}>{slot.type}</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {moving && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-sky-300/40 bg-sky-500/25 px-3 py-1 text-xs font-semibold text-sky-50 backdrop-blur-md">
          {moveTargets.size > 0
            ? `Moving ${movingLast} — tap a highlighted spot`
            : `No legal spot for ${movingLast} — tap him again to cancel`}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-5 z-10 text-2xl font-black italic text-white/85 drop-shadow">{formationName}</div>
    </div>
  )
}
