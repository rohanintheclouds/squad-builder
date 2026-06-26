import { useWcStore, byId, validSlotsFor } from './store'
import { FORMATIONS } from '../../data/formations'
import { eligibility } from '../../lib/positions'
import PitchMarkings from '../../components/PitchMarkings'
import PlayerCard from '../../components/PlayerCard'

const HEX = 'polygon(50% 1%, 95% 25%, 95% 75%, 50% 99%, 5% 75%, 5% 25%)'

export default function WcPitch({ compact = false }: { compact?: boolean }) {
  const { formationName, lineup, selectedPlayerId, selectedSlotId, selectSlot, place } = useWcStore()
  if (!formationName) return null
  const formation = FORMATIONS.find((f) => f.name === formationName)!
  const selected = selectedPlayerId ? byId.get(selectedPlayerId) : undefined
  const validSlots = selected ? new Set(validSlotsFor(selected, lineup, formationName)) : new Set<string>()
  const scale = compact ? 0.64 : 1

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
          const isPlaceTarget = selected ? validSlots.has(slot.id) : false // a player is picked and can go here
          const isSelectedSlot = selectedSlotId === slot.id
          const highlight = isPlaceTarget || isSelectedSlot
          return (
            <div key={slot.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
              <div style={{ transform: `scale(${scale})` }}>
                {player ? (
                  <PlayerCard player={player} slotType={slot.type} eligibility={eligibility(player, slot.type)} hideRating />
                ) : (
                  <button
                    onClick={() => {
                      if (isPlaceTarget && selected) place(selected.id, slot.id)
                      else selectSlot(isSelectedSlot ? null : slot.id)
                    }}
                    className="group relative flex h-[88px] w-[78px] cursor-pointer items-center justify-center"
                  >
                    <span
                      className={`absolute inset-0 transition ${highlight ? 'animate-pulse' : 'opacity-80 group-hover:opacity-100'}`}
                      style={{ clipPath: HEX, background: highlight ? '#22d3ee' : 'rgba(52,211,153,0.5)' }}
                    />
                    <span
                      className="absolute inset-[2px] flex items-center justify-center"
                      style={{ clipPath: HEX, background: 'linear-gradient(160deg, rgba(20,28,38,0.95), rgba(10,15,21,0.95))' }}
                    >
                      <span className={`text-lg font-light ${highlight ? 'text-cyan-300' : 'text-emerald-300/80'}`}>{isPlaceTarget ? '↓' : '+'}</span>
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

      <div className="pointer-events-none absolute bottom-3 left-5 z-10 text-2xl font-black italic text-white/85 drop-shadow">{formationName}</div>
    </div>
  )
}
