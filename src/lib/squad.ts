import { FORMATIONS } from '../data/formations'
import { MANAGER_PLAYERS as PLAYERS } from '../data/players'
import { eligibility, oopSeverity } from './positions'
import type { Eligibility, Position, SquadEntry } from '../types'

/** Amber (out-of-position-but-plausible) players beyond this count start taking a rating penalty. */
export const AMBER_LIMIT = 3

const playerById = new Map(PLAYERS.map((p) => [p.id, p]))

export function slotTypeMap(formationName: string): Map<string, string> {
  const f = FORMATIONS.find((x) => x.name === formationName)
  return new Map((f?.slots ?? []).map((s) => [s.id, s.type]))
}

/** Eligibility of a player if placed in a given slot of the current formation. */
export function eligibilityAt(formationName: string, slotId: string, playerId: string): Eligibility | null {
  const type = slotTypeMap(formationName).get(slotId)
  const p = playerById.get(playerId)
  if (!type || !p) return null
  return eligibility(p, type as never)
}

/** Count amber players currently in the lineup, optionally ignoring one slot. */
export function amberCount(lineup: Record<string, SquadEntry>, formationName: string, exceptSlot?: string): number {
  const types = slotTypeMap(formationName)
  let n = 0
  for (const [slotId, entry] of Object.entries(lineup)) {
    if (slotId === exceptSlot) continue
    const p = playerById.get(entry.playerId)
    const type = types.get(slotId)
    if (p && type && eligibility(p, type as never) === 'amber') n++
  }
  return n
}

export const lastName = (full: string) => full.split(' ').slice(-1)[0]

export type SlotOop = { elig: Eligibility; penalty: number }

/**
 * Per-slot out-of-position status + rating penalty for the current lineup. Any player can be
 * placed anywhere now: green is free; the first AMBER_LIMIT amber players are free; every amber
 * beyond that (in placement order) takes its severity penalty; red players always take theirs.
 * Penalty scales with how outlandish the move is (LM→LB tiny, ST→CB big, ST→GK brutal).
 */
export function oopInfo(lineup: Record<string, SquadEntry>, formationName: string): Record<string, SlotOop> {
  const types = slotTypeMap(formationName)
  const out: Record<string, SlotOop> = {}
  let amberSeen = 0
  // Object key order = placement order, so "after the 3rd amber added" is well defined.
  for (const [slotId, entry] of Object.entries(lineup)) {
    const p = playerById.get(entry.playerId)
    const type = types.get(slotId) as Position | undefined
    if (!p || !type) continue
    const elig = eligibility(p, type)
    let penalty = 0
    if (elig === 'amber') {
      amberSeen++
      if (amberSeen > AMBER_LIMIT) penalty = oopSeverity(p, type)
    } else if (elig === 'red') {
      penalty = oopSeverity(p, type)
    }
    out[slotId] = { elig, penalty }
  }
  return out
}

/**
 * Squad Builder team rating (shown at the top). Future-aware: blends current ability with
 * potential, penalises an old average age, and now docks each out-of-position player by its
 * positional penalty (see oopInfo), so a striker shoved to CB drags the whole side down.
 */
export function teamRating(lineup: Record<string, SquadEntry>, formationName: string): { rating: number; avgAge: number } {
  const info = oopInfo(lineup, formationName)
  const placed = Object.entries(lineup)
    .map(([slotId, e]) => ({ slotId, p: playerById.get(e.playerId) }))
    .filter((x) => x.p) as { slotId: string; p: { rating: number; potential: number; age: number } }[]
  if (!placed.length) return { rating: 0, avgAge: 0 }
  const future = placed.reduce((a, x) => a + 0.5 * x.p.rating + 0.5 * x.p.potential - (info[x.slotId]?.penalty ?? 0), 0) / placed.length
  const avgAge = placed.reduce((a, x) => a + x.p.age, 0) / placed.length
  const agePenalty = Math.max(0, (avgAge - 29) * 1.2)
  return { rating: Math.round(future - agePenalty), avgAge: Math.round(avgAge) }
}
