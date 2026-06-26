import { useEffect, useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import Toolbar from '../../components/Toolbar'
import MobileBar from '../../components/MobileBar'
import Pitch from '../../components/Pitch'
import SearchPanel from '../../components/SearchPanel'
import PlayerCard from '../../components/PlayerCard'
import Toast from '../../components/Toast'
import { useStore } from '../../store'
import { FORMATIONS } from '../../data/formations'
import { MANAGER_PLAYERS as PLAYERS } from '../../data/players'
import { eligibility } from '../../lib/positions'
import { useMediaQuery } from '../../lib/useMediaQuery'
import type { Player, Position } from '../../types'

const byId = new Map(PLAYERS.map((p) => [p.id, p]))

export default function ManagerMode() {
  const { formationName, lineup, assignPlayer, swapSlots, selectedSlotId, selectSlot } = useStore()
  const [active, setActive] = useState<{ player: Player; pos: Position } | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const formation = FORMATIONS.find((f) => f.name === formationName)!

  const isMobile = useMediaQuery('(max-width: 900px)')
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (isMobile && selectedSlotId) setSheetOpen(true)
  }, [isMobile, selectedSlotId])

  function closeSheet() {
    setSheetOpen(false)
    selectSlot(null)
  }

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
      {isMobile ? (
        <div className="flex h-full flex-col">
          <MobileBar />
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="mx-auto w-full max-w-[560px]" style={{ aspectRatio: '80 / 105' }}>
              <Pitch compact draggable={false} />
            </div>
            <div className="h-16" />
          </div>

          {!sheetOpen && (
            <button
              onClick={() => setSheetOpen(true)}
              className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-bold text-black shadow-xl shadow-cyan-500/30"
            >
              🔍 Search players
            </button>
          )}

          {sheetOpen && (
            <div className="fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/60" onClick={closeSheet} />
              <div className="absolute inset-x-0 bottom-0 flex h-[82%] flex-col overflow-hidden rounded-t-2xl border-t border-white/15">
                <div className="glass relative flex items-center justify-center border-b border-white/10 py-2.5">
                  <div className="h-1 w-10 rounded-full bg-white/25" />
                  <button onClick={closeSheet} className="absolute right-2 top-1.5 rounded-md px-2 py-1 text-white/60 hover:bg-white/10">✕</button>
                </div>
                <div className="min-h-0 flex-1">
                  <SearchPanel draggable={false} onAfterAssign={() => setSheetOpen(false)} />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <Toolbar />
          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 items-center justify-center p-4">
              <div className="h-full max-w-full" style={{ aspectRatio: '98 / 105' }}>
                <Pitch />
              </div>
            </div>
            <div className="w-[372px] shrink-0 border-l border-white/10">
              <SearchPanel />
            </div>
          </div>
        </div>
      )}

      <Toast />

      <DragOverlay dropAnimation={null}>
        {active && (
          <div className="rotate-3 scale-110">
            <PlayerCard player={active.player} slotType={active.pos} eligibility={eligibility(active.player, active.pos)} hideRating />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
