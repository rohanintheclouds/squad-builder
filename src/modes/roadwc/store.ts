import { create } from 'zustand'
import { FORMATIONS } from '../../data/formations'
import { PLAYERS } from '../../data/players'
import { eligibility } from '../../lib/positions'
import type { Player, Position } from '../../types'

export const REROLLS = 2
export const AMBER_LIMIT = 3
const FORMATION_CHOICES = 5

const byNation: Record<string, Player[]> = {}
for (const p of PLAYERS) (byNation[p.nationality] ??= []).push(p)
export const byId = new Map(PLAYERS.map((p) => [p.id, p]))

// Pool = nations with at least 3 players (gives the drafter real choice).
export const POOL_NATIONS = Object.entries(byNation)
  .filter(([, ps]) => ps.length >= 3)
  .map(([n]) => n)

function slots(formationName: string) {
  return FORMATIONS.find((f) => f.name === formationName)?.slots ?? []
}

function amberCount(lineup: Record<string, string>, formationName: string): number {
  const types = new Map(slots(formationName).map((s) => [s.id, s.type]))
  let n = 0
  for (const [slotId, pid] of Object.entries(lineup)) {
    const p = byId.get(pid)
    const t = types.get(slotId)
    if (p && t && eligibility(p, t) === 'amber') n++
  }
  return n
}

/** Slots a player can be legally placed into right now (green always; amber only under the cap). */
export function validSlotsFor(player: Player, lineup: Record<string, string>, formationName: string): string[] {
  const amberOk = amberCount(lineup, formationName) < AMBER_LIMIT
  return slots(formationName)
    .filter((s) => !lineup[s.id])
    .filter((s) => {
      const e = eligibility(player, s.type as Position)
      return e === 'green' || (e === 'amber' && amberOk)
    })
    .map((s) => s.id)
}

export function availableForNation(nation: string, pickedIds: string[]): Player[] {
  const picked = new Set(pickedIds)
  return (byNation[nation] ?? []).filter((p) => !picked.has(p.id))
}

function nationUsable(nation: string, lineup: Record<string, string>, pickedIds: string[], formationName: string): boolean {
  return availableForNation(nation, pickedIds).some((p) => validSlotsFor(p, lineup, formationName).length > 0)
}

function pickNation(lineup: Record<string, string>, pickedIds: string[], formationName: string): string | null {
  const usable = POOL_NATIONS.filter((n) => nationUsable(n, lineup, pickedIds, formationName))
  const fromPool = usable.length ? usable : Object.keys(byNation).filter((n) => nationUsable(n, lineup, pickedIds, formationName))
  if (!fromPool.length) return null
  return fromPool[Math.floor(Math.random() * fromPool.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Phase = 'formation' | 'draft' | 'result'

type State = {
  phase: Phase
  formationChoices: string[]
  formationName: string | null
  lineup: Record<string, string>
  pickedIds: string[]
  nation: string | null
  selectedPlayerId: string | null
  selectedSlotId: string | null
  rerollsLeft: number

  start: () => void
  chooseFormation: (name: string) => void
  selectPlayer: (id: string | null) => void
  selectSlot: (slotId: string | null) => void
  place: (playerId: string, slotId: string) => void
  reroll: () => void
}

export const useWcStore = create<State>((set, get) => ({
  phase: 'formation',
  formationChoices: shuffle(FORMATIONS.map((f) => f.name)).slice(0, FORMATION_CHOICES),
  formationName: null,
  lineup: {},
  pickedIds: [],
  nation: null,
  selectedPlayerId: null,
  selectedSlotId: null,
  rerollsLeft: REROLLS,

  start: () =>
    set({
      phase: 'formation',
      formationChoices: shuffle(FORMATIONS.map((f) => f.name)).slice(0, FORMATION_CHOICES),
      formationName: null,
      lineup: {},
      pickedIds: [],
      nation: null,
      selectedPlayerId: null,
      selectedSlotId: null,
      rerollsLeft: REROLLS,
    }),

  chooseFormation: (name) =>
    set(() => ({
      formationName: name,
      phase: 'draft',
      nation: pickNation({}, [], name),
      selectedPlayerId: null,
      selectedSlotId: null,
    })),

  selectPlayer: (id) => set({ selectedPlayerId: id, selectedSlotId: null }),
  selectSlot: (slotId) => set({ selectedSlotId: slotId, selectedPlayerId: null }),

  place: (playerId, slotId) => {
    const { lineup, formationName, pickedIds } = get()
    if (!formationName) return
    const player = byId.get(playerId)
    if (!player) return
    if (!validSlotsFor(player, lineup, formationName).includes(slotId)) return

    const nextLineup = { ...lineup, [slotId]: playerId }
    const nextPicked = [...pickedIds, playerId]
    const total = slots(formationName).length
    if (Object.keys(nextLineup).length >= total) {
      set({ lineup: nextLineup, pickedIds: nextPicked, selectedPlayerId: null, selectedSlotId: null, nation: null, phase: 'result' })
    } else {
      set({
        lineup: nextLineup,
        pickedIds: nextPicked,
        selectedPlayerId: null,
        selectedSlotId: null,
        nation: pickNation(nextLineup, nextPicked, formationName),
      })
    }
  },

  reroll: () => {
    const { rerollsLeft, lineup, pickedIds, formationName } = get()
    if (rerollsLeft <= 0 || !formationName) return
    set({ rerollsLeft: rerollsLeft - 1, selectedPlayerId: null, selectedSlotId: null, nation: pickNation(lineup, pickedIds, formationName) })
  },
}))
