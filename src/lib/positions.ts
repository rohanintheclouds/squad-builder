import type { Position, Player, Eligibility } from '../types'

// Positions each role can credibly flex into ("amber" / out of position but plausible).
// Keep this conservative: a CB should never be amber at ST.
const ADJACENCY: Record<Position, Position[]> = {
  GK: [],
  RB: ['RWB', 'RM', 'CB', 'LB'],
  RWB: ['RB', 'RM', 'RW', 'LWB'],
  LB: ['LWB', 'LM', 'CB', 'RB'],
  LWB: ['LB', 'LM', 'LW', 'RWB'],
  CB: ['RB', 'LB', 'CDM'],
  CDM: ['CM', 'CB'],
  CM: ['CDM', 'CAM'],
  CAM: ['CM', 'CF', 'RW', 'LW'],
  RM: ['RW', 'RWB', 'RB', 'LM'],
  LM: ['LW', 'LWB', 'LB', 'RM'],
  RW: ['RM', 'CAM', 'CF', 'ST', 'LW'],
  LW: ['LM', 'CAM', 'CF', 'ST', 'RW'],
  CF: ['ST', 'CAM', 'RW', 'LW'],
  ST: ['CF', 'RW', 'LW'],
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
