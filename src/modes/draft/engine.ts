import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { FORMATIONS } from '../../data/formations'
import { PLAYERS } from '../../data/players'
import { eligibilityStrict as eligibility } from '../../lib/positions'
import type { Player, Position } from '../../types'
import type { Tier } from './scoring'

// Generic draft engine shared by Road to the World Cup (group = nation) and
// Road to the Champions League (group = club). A "group" is whatever you draft from.

export const AMBER_LIMIT = 3
export const REROLLS = 2
const FORMATION_CHOICES = 5
/** When the pool can't fill a slot, you may draft any free agent under this value (€M). */
export const EMERGENCY_MAX = 40
export const byId = new Map(PLAYERS.map((p) => [p.id, p]))

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

/**
 * Empty slots a player ALREADY on the pitch may be moved into. A move follows the SAME rules as
 * an initial placement: green (natural) anywhere, amber (out of position) only while the squad is
 * within the 3-out-of-position cap — and that cap still applies after he's been moved off his
 * current slot. We drop him from the lineup first so his own slot is treated as open and his
 * current amber (if any) no longer counts against the cap.
 */
export function validMoveTargets(player: Player, lineup: Record<string, string>, fromSlotId: string, formationName: string): string[] {
  const without = { ...lineup }
  delete without[fromSlotId]
  return validSlotsFor(player, without, formationName).filter((id) => id !== fromSlotId)
}

/** Free agents (any club/nation) under EMERGENCY_MAX that can fill an open slot right now. */
export function emergencyPlayers(lineup: Record<string, string>, pickedIds: string[], formationName: string): Player[] {
  const picked = new Set(pickedIds)
  return PLAYERS
    .filter((p) => p.value != null && p.value < EMERGENCY_MAX && !picked.has(p.id) && validSlotsFor(p, lineup, formationName).length > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
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

export type DraftState = {
  phase: Phase
  formationChoices: string[]
  formationName: string | null
  lineup: Record<string, string>
  pickedIds: string[]
  group: string | null
  /** True when no pooled group can fill a remaining slot: draft any free agent under €40M. */
  emergency: boolean
  rerollsLeft: number
  /** How many times each group has been rerolled away from -> lowers its future draw odds. */
  skips: Record<string, number>
  selectedPlayerId: string | null
  selectedSlotId: string | null
  /** A player already on the pitch, picked up to be moved to his primary position. */
  movingSlotId: string | null

  start: () => void
  chooseFormation: (name: string) => void
  selectPlayer: (id: string | null) => void
  selectSlot: (slotId: string | null) => void
  place: (playerId: string, slotId: string) => void
  pickUpPlaced: (slotId: string | null) => void
  movePlaced: (toSlotId: string) => void
  reroll: () => void
}

export type DraftConfig = {
  id: string
  kind: 'nation' | 'club'
  noun: string // singular label, e.g. 'nation' / 'club'
  groupOf: (p: Player) => string
  pool: string[] // group names eligible to be drawn
  tiers: Tier[]
}

export type Draft = {
  config: DraftConfig
  useStore: UseBoundStore<StoreApi<DraftState>>
  availableForGroup: (group: string, pickedIds: string[]) => Player[]
  pool: string[]
}

export function createDraft(config: DraftConfig): Draft {
  const byGroup: Record<string, Player[]> = {}
  for (const p of PLAYERS) (byGroup[config.groupOf(p)] ??= []).push(p)
  const pool = config.pool.filter((g) => (byGroup[g]?.length ?? 0) > 0)

  const availableForGroup = (group: string, pickedIds: string[]) => {
    const picked = new Set(pickedIds)
    return (byGroup[group] ?? []).filter((p) => !picked.has(p.id))
  }
  const groupUsable = (group: string, lineup: Record<string, string>, pickedIds: string[], fn: string) =>
    availableForGroup(group, pickedIds).some((p) => validSlotsFor(p, lineup, fn).length > 0)

  // Auto-mulligan: keep drawing ONLY from the approved pool, skipping any group that has no
  // placeable player right now (re-randomize). The same group can come up again; only its
  // already-picked players are unavailable. Never draws from outside the pool.
  // Weighted random: a group rerolled away from gets slightly less likely each time, with a
  // diminishing penalty (1 skip ≈ 17% less, then less and less) so it never erodes to nothing.
  const weightedPick = (groups: string[], skips: Record<string, number>): string => {
    const w = groups.map((g) => 1 / (1 + (skips[g] ?? 0) * 0.2))
    const total = w.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (let i = 0; i < groups.length; i++) {
      r -= w[i]
      if (r <= 0) return groups[i]
    }
    return groups[groups.length - 1]
  }

  const pickGroup = (lineup: Record<string, string>, pickedIds: string[], fn: string, skips: Record<string, number>): string | null => {
    const usable = pool.filter((g) => groupUsable(g, lineup, pickedIds, fn))
    if (!usable.length) return null
    return weightedPick(usable, skips)
  }

  const freshChoices = () => shuffle(FORMATIONS.map((f) => f.name)).slice(0, FORMATION_CHOICES)

  const useStore = create<DraftState>((set, get) => ({
    phase: 'formation',
    formationChoices: freshChoices(),
    formationName: null,
    lineup: {},
    pickedIds: [],
    group: null,
    emergency: false,
    rerollsLeft: REROLLS,
    skips: {},
    selectedPlayerId: null,
    selectedSlotId: null,
    movingSlotId: null,

    start: () =>
      set({
        phase: 'formation', formationChoices: freshChoices(), formationName: null,
        lineup: {}, pickedIds: [], group: null, emergency: false, rerollsLeft: REROLLS, skips: {}, selectedPlayerId: null, selectedSlotId: null, movingSlotId: null,
      }),

    chooseFormation: (name) =>
      set({ formationName: name, phase: 'draft', group: pickGroup({}, [], name, {}), emergency: false, rerollsLeft: REROLLS, skips: {}, selectedPlayerId: null, selectedSlotId: null, movingSlotId: null }),

    selectPlayer: (id) => set({ selectedPlayerId: id, selectedSlotId: null, movingSlotId: null }),
    selectSlot: (slotId) => set({ selectedSlotId: slotId, selectedPlayerId: null, movingSlotId: null }),

    place: (playerId, slotId) => {
      const { lineup, formationName, pickedIds, skips } = get()
      if (!formationName) return
      const player = byId.get(playerId)
      if (!player || !validSlotsFor(player, lineup, formationName).includes(slotId)) return
      const nextLineup = { ...lineup, [slotId]: playerId }
      const nextPicked = [...pickedIds, playerId]
      if (Object.keys(nextLineup).length >= slots(formationName).length) {
        set({ lineup: nextLineup, pickedIds: nextPicked, selectedPlayerId: null, selectedSlotId: null, movingSlotId: null, group: null, emergency: false, phase: 'result' })
        return
      }
      // If no pooled group can fill a remaining slot, drop into emergency (free-agent) mode
      // instead of getting stuck or drawing from outside the pool.
      const next = pickGroup(nextLineup, nextPicked, formationName, skips)
      set({
        lineup: nextLineup, pickedIds: nextPicked, selectedPlayerId: null, selectedSlotId: null, movingSlotId: null,
        group: next, emergency: next === null,
      })
    },

    // Pick up / put down a player already on the pitch to relocate him (toggle).
    pickUpPlaced: (slotId) =>
      set((s) => ({ movingSlotId: s.movingSlotId === slotId ? null : slotId, selectedPlayerId: null, selectedSlotId: null })),

    // Move a picked-up player into an empty slot of his PRIMARY position. Frees his old slot;
    // the squad count is unchanged, so this never completes the draft. The current draw is kept
    // unless the move left it unable to fill any open slot (then re-pick / recover from emergency).
    movePlaced: (toSlotId) => {
      const { movingSlotId, lineup, formationName, pickedIds, skips, group, emergency } = get()
      if (!movingSlotId || !formationName) return
      const playerId = lineup[movingSlotId]
      const player = playerId ? byId.get(playerId) : undefined
      if (!player || !validMoveTargets(player, lineup, movingSlotId, formationName).includes(toSlotId)) return
      const nextLineup = { ...lineup }
      delete nextLineup[movingSlotId]
      nextLineup[toSlotId] = playerId
      let nextGroup = group
      let nextEmergency = emergency
      const groupStillOk = !emergency && !!group && groupUsable(group, nextLineup, pickedIds, formationName)
      if (!groupStillOk) {
        nextGroup = pickGroup(nextLineup, pickedIds, formationName, skips)
        nextEmergency = nextGroup === null
      }
      set({ lineup: nextLineup, movingSlotId: null, selectedPlayerId: null, selectedSlotId: null, group: nextGroup, emergency: nextEmergency })
    },

    // Manual reroll: skip the current group for a different usable one (2 per game).
    // The skipped group becomes slightly less likely to be drawn again (diminishing penalty).
    reroll: () => {
      const { rerollsLeft, group, emergency, lineup, pickedIds, formationName, skips } = get()
      if (rerollsLeft <= 0 || emergency || !group || !formationName) return
      const others = pool.filter((g) => g !== group && groupUsable(g, lineup, pickedIds, formationName))
      if (!others.length) return // nothing else to roll to
      const nextSkips = { ...skips, [group]: (skips[group] ?? 0) + 1 }
      set({ rerollsLeft: rerollsLeft - 1, skips: nextSkips, group: weightedPick(others, nextSkips), selectedPlayerId: null, selectedSlotId: null, movingSlotId: null })
    },
  }))

  return { config, useStore, availableForGroup, pool }
}
