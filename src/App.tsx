import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import Toolbar from './components/Toolbar'
import Pitch from './components/Pitch'
import SearchPanel from './components/SearchPanel'
import PlayerCard from './components/PlayerCard'
import Toast from './components/Toast'
import { useStore } from './store'
import { FORMATIONS } from './data/formations'
import { PLAYERS } from './data/players'
import { eligibility } from './lib/positions'
import type { Player, Position } from './types'

const byId = new Map(PLAYERS.map((p) => [p.id, p]))

export default function App() {
  const { formationName, lineup, assignPlayer, swapSlots } = useStore()
  const [active, setActive] = useState<{ player: Player; pos: Position } | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const formation = FORMATIONS.find((f) => f.name === formationName)!

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    if (id.startsWith('search:')) {
      const p = byId.get(id.slice(7))
      if (p) setActive({ player: p, pos: p.primaryPos })
    } else if (id.startsWith('pitch:')) {
      const slotId = id.slice(6)
      const slot = formation.slots.find((s) => s.id === slotId)
      const entry = lineup[slotId]
      const p = entry ? byId.get(entry.playerId) : undefined
      if (p && slot) setActive({ player: p, pos: slot.type })
    }
  }

  function onDragEnd(e: DragEndEvent) {
    setActive(null)
    const over = e.over
    if (!over) return
    const overId = String(over.id)
    if (!overId.startsWith('slot:')) return
    const targetSlot = overId.slice(5)
    const id = String(e.active.id)
    if (id.startsWith('search:')) assignPlayer(targetSlot, id.slice(7))
    else if (id.startsWith('pitch:')) swapSlots(id.slice(6), targetSlot)
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
      <div className="flex h-full flex-col">
        <Toolbar />
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 items-center justify-center p-4">
            {/* portrait pitch: real 68 x 105 proportions, height-driven */}
            <div className="h-full max-w-full" style={{ aspectRatio: '98 / 105' }}>
              <Pitch />
            </div>
          </div>
          <div className="w-[372px] shrink-0 border-l border-white/10">
            <SearchPanel />
          </div>
        </div>
      </div>

      <Toast />

      <DragOverlay dropAnimation={null}>
        {active && (
          <div className="rotate-3 scale-110">
            <PlayerCard player={active.player} slotType={active.pos} eligibility={eligibility(active.player, active.pos)} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
