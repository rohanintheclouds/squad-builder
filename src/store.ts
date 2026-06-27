import { create } from 'zustand'
import { FORMATIONS } from './data/formations'
import { TACTICS } from './data/tactics'
import { MANAGER_PLAYERS as PLAYERS } from './data/players'
import type { SquadEntry } from './types'

const playerById = new Map(PLAYERS.map((p) => [p.id, p]))

type State = {
  formationName: string
  tacticId: string
  budgetCap: number // € millions
  /** slotId -> squad entry (player + role + focus) */
  lineup: Record<string, SquadEntry>
  selectedSlotId: string | null
  notice: string | null

  setFormation: (name: string) => void
  setTactic: (id: string) => void
  setBudget: (cap: number) => void
  selectSlot: (slotId: string | null) => void
  assignPlayer: (slotId: string, playerId: string) => void
  removeFromSlot: (slotId: string) => void
  swapSlots: (a: string, b: string) => void
  setRole: (slotId: string, role: string, focus: string) => void
  clearAll: () => void
  setNotice: (msg: string | null) => void
}

export const useStore = create<State>((set) => ({
  formationName: '4-3-3',
  tacticId: TACTICS[0].id,
  budgetCap: 500,
  lineup: {},
  selectedSlotId: null,
  notice: null,

  setFormation: (name) =>
    set((s) => {
      const slots = FORMATIONS.find((f) => f.name === name)?.slots ?? []
      const valid = new Set(slots.map((sl) => sl.id))
      const lineup: Record<string, SquadEntry> = {}
      for (const [slotId, entry] of Object.entries(s.lineup)) {
        if (valid.has(slotId)) lineup[slotId] = entry
      }
      return { formationName: name, lineup, selectedSlotId: null }
    }),

  setTactic: (id) => set({ tacticId: id }),
  setBudget: (cap) => set({ budgetCap: Math.max(0, cap) }),
  selectSlot: (slotId) => set({ selectedSlotId: slotId }),

  // Any player can be placed in any slot. Out-of-position players are allowed; they just take a
  // rating penalty (see oopInfo/teamRating) and show an "out of position" callout on the pitch.
  assignPlayer: (slotId, playerId) =>
    set((s) => {
      const p = playerById.get(playerId)
      if (!p) return s
      const lineup = { ...s.lineup }
      for (const [sid, entry] of Object.entries(lineup)) {
        if (entry.playerId === playerId) delete lineup[sid]
      }
      lineup[slotId] = { playerId }
      return { lineup, selectedSlotId: null, notice: null }
    }),

  removeFromSlot: (slotId) =>
    set((s) => {
      const lineup = { ...s.lineup }
      delete lineup[slotId]
      return { lineup }
    }),

  swapSlots: (a, b) =>
    set((s) => {
      if (a === b) return s
      const lineup = { ...s.lineup }
      const ea = lineup[a]
      const eb = lineup[b]
      if (eb) lineup[a] = eb
      else delete lineup[a]
      if (ea) lineup[b] = ea
      else delete lineup[b]
      // Swaps are always allowed; any resulting out-of-position players just take a rating penalty.
      return { lineup, notice: null }
    }),

  setRole: (slotId, role, focus) =>
    set((s) => {
      const entry = s.lineup[slotId]
      if (!entry) return s
      return { lineup: { ...s.lineup, [slotId]: { ...entry, role, focus } } }
    }),

  clearAll: () => set({ lineup: {}, selectedSlotId: null }),
  setNotice: (msg) => set({ notice: msg }),
}))
