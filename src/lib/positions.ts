import type { Position, Player, Eligibility } from '../types'

// Positions each role can credibly flex into ("amber" / out of position but plausible).
// Keep this conservative: a CB should never be amber at ST.
// Conservative "grace" flex (amber). Only near-identical roles. Cross-side moves (LB↔RB,
// LW↔RW), fullback→CB, and striker↔winger are NOT blanket-allowed here — those come from a
// player's own listed positions in the data (e.g. Alphonso Davies actually plays LW).
// Natural interchanges treated as GREEN (no out-of-position penalty). Note CM links to both
// CDM and CAM, but CDM and CAM do NOT link to each other (only through CM).
const GREEN_FLEX: Partial<Record<Position, Position[]>> = {
  CM: ['CDM', 'CAM'],
  CDM: ['CM'],
  CAM: ['CM'],
  RM: ['RW'], RW: ['RM'],
  LM: ['LW'], LW: ['LM'],
  LB: ['LWB'], LWB: ['LB'],
  RB: ['RWB'], RWB: ['RB'],
  CF: ['ST'], ST: ['CF'],
}

// Looser "grace" flex (amber, counts toward the out-of-position cap). Wider, more of a stretch.
const ADJACENCY: Record<Position, Position[]> = {
  GK: [],
  RB: ['RM'],
  RWB: ['RW', 'RM'],
  LB: ['LM'],
  LWB: ['LW', 'LM'],
  CB: ['CDM'],
  CDM: ['CB'],
  CM: [],
  CAM: ['RW', 'LW'],
  RM: ['RB', 'RWB'],
  LM: ['LB', 'LWB'],
  RW: ['ST', 'CF'],
  LW: ['ST', 'CF'],
  CF: ['CAM'],
  ST: ['RW', 'LW'],
}

/**
 * Decide whether a player can fill a given slot.
 *  green  = a natural position (their own, or a natural interchange like CM<->CDM, RM<->RW)
 *  amber  = out of position but plausible (counts toward the 3-OOP cap)
 *  red    = blocked (e.g. a CB at ST)
 */
export function eligibility(player: Player, slot: Position): Eligibility {
  if (player.eligiblePos.includes(slot)) return 'green'
  for (const p of player.eligiblePos) {
    if (GREEN_FLEX[p]?.includes(slot)) return 'green'
  }
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
