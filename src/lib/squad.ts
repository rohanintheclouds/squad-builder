import { FORMATIONS } from '../data/formations'
import { MANAGER_PLAYERS as PLAYERS } from '../data/players'
import { eligibility } from './positions'
import type { Eligibility, SquadEntry } from '../types'

/** How many "amber" (partially out of position) players a squad may field. */
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

/**
 * Squad Builder team rating (shown at the top). Future-aware: blends current ability with
 * potential and penalises an old average age, so you can't stack cheap veterans for a top team.
 */
export function teamRating(playerIds: string[]): { rating: number; avgAge: number } {
  const ps = playerIds.map((id) => playerById.get(id)).filter(Boolean) as { rating: number; potential: number; age: number }[]
  if (!ps.length) return { rating: 0, avgAge: 0 }
  const future = ps.reduce((a, p) => a + 0.5 * p.rating + 0.5 * p.potential, 0) / ps.length
  const avgAge = ps.reduce((a, p) => a + p.age, 0) / ps.length
  const agePenalty = Math.max(0, (avgAge - 29) * 1.2)
  return { rating: Math.round(future - agePenalty), avgAge: Math.round(avgAge) }
}
