import { create } from 'zustand'
import { FORMATIONS } from './data/formations'
import { TACTICS } from './data/tactics'
import { PLAYERS } from './data/players'
import { eligibility } from './lib/positions'
import { AMBER_LIMIT, amberCount, slotTypeMap, lastName } from './lib/squad'
import type { Position, SquadEntry } from './types'

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

  assignPlayer: (slotId, playerId) =>
    set((s) => {
      const type = slotTypeMap(s.formationName).get(slotId) as Position | undefined
      const p = playerById.get(playerId)
      if (!type || !p) return s
      const elig = eligibility(p, type)
      if (elig === 'red') return { notice: `${lastName(p.name)} can't play ${type}.` }
      if (elig === 'amber' && amberCount(s.lineup, s.formationName, slotId) >= AMBER_LIMIT)
        return { notice: `Max ${AMBER_LIMIT} out-of-position players. Free one up first.` }

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

      // Reject the swap if it would drop a player into a position they can't play,
      // or push the squad past the out-of-position cap.
      const types = slotTypeMap(s.formationName)
      for (const slotId of [a, b]) {
        const entry = lineup[slotId]
        if (!entry) continue
        const p = playerById.get(entry.playerId)
        const type = types.get(slotId) as Position | undefined
        if (p && type && eligibility(p, type) === 'red')
          return { notice: `${lastName(p.name)} can't play ${type}.` }
      }
      if (amberCount(lineup, s.formationName) > AMBER_LIMIT)
        return { notice: `Max ${AMBER_LIMIT} out-of-position players.` }

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
