import type { Position, Player, Eligibility } from '../types'

// Positions each role can credibly flex into ("amber" / out of position but plausible).
// Keep this conservative: a CB should never be amber at ST.
// Conservative "grace" flex (amber). Only near-identical roles. Cross-side moves (LB↔RB,
// LW↔RW), fullback→CB, and striker↔winger are NOT blanket-allowed here — those come from a
// player's own listed positions in the data (e.g. Alphonso Davies actually plays LW).
const ADJACENCY: Record<Position, Position[]> = {
  GK: [],
  RB: ['RWB'],
  RWB: ['RB'],
  LB: ['LWB'],
  LWB: ['LB'],
  CB: [],
  CDM: ['CM'],
  CM: ['CDM', 'CAM'],
  CAM: ['CM', 'CF'],
  RM: ['RW'],
  LM: ['LW'],
  RW: ['RM'],
  LW: ['LM'],
  CF: ['ST'],
  ST: ['CF'],
}

/**
 * Decide whether a player can fill a given slot.
 *  green  = a natural position for the player
 *  amber  = out of position but adjacent / plausible
 *  red    = blocked (e.g. a CB at ST)
 */
export function eligibility(player: Player, slot: Position): Eligibility {
  if (player.eligiblePos.includes(slot)) return 'green'
  const flex = new Set<Position>()
  for (const p of player.eligiblePos) {
    for (const a of ADJACENCY[p]) flex.add(a)
  }
  return flex.has(slot) ? 'amber' : 'red'
}

export const ELIGIBILITY_COLOR: Record<Eligibility, string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
}
