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

// STRICTER amber for the draft modes (Road to the World Cup / Champions League): drops the
// "stretch" pairs that aren't really plausible unless a player actually plays both — CB↔CDM,
// CB↔fullback, and wide-mid/winger↔fullback/wingback. Players who genuinely play both keep it
// green via their own listed positions (e.g. Tchouaméni has CB in his data).
const DRAFT_ADJACENCY: Record<Position, Position[]> = {
  GK: [], RB: [], RWB: [], LB: [], LWB: [], CB: [], CDM: [], CM: [],
  CAM: ['RW', 'LW'],
  RM: [], LM: [],
  RW: ['ST', 'CF'], LW: ['ST', 'CF'],
  CF: ['CAM'], ST: ['RW', 'LW'],
}

function classify(player: Player, slot: Position, adj: Record<Position, Position[]>): Eligibility {
  if (player.eligiblePos.includes(slot)) return 'green'
  for (const p of player.eligiblePos) if (GREEN_FLEX[p]?.includes(slot)) return 'green'
  const flex = new Set<Position>()
  for (const p of player.eligiblePos) for (const a of adj[p]) flex.add(a)
  return flex.has(slot) ? 'amber' : 'red'
}

/**
 * Decide whether a player can fill a given slot (Squad Builder rules).
 *  green = natural (own position or a natural interchange like CM<->CDM, RM<->RW)
 *  amber = out of position but plausible (counts toward the 3-OOP cap) · red = blocked
 */
export const eligibility = (player: Player, slot: Position): Eligibility => classify(player, slot, ADJACENCY)

/** Stricter eligibility used by the draft modes (fewer amber stretches). */
export const eligibilityStrict = (player: Player, slot: Position): Eligibility => classify(player, slot, DRAFT_ADJACENCY)

/** Relation between two positions (for Guess the Player): exact, semi-related, or unrelated. */
export function positionsRelation(a: Position, b: Position): 'same' | 'related' | 'none' {
  if (a === b) return 'same'
  if (GREEN_FLEX[a]?.includes(b) || GREEN_FLEX[b]?.includes(a) || ADJACENCY[a].includes(b) || ADJACENCY[b].includes(a)) return 'related'
  return 'none'
}

export const ELIGIBILITY_COLOR: Record<Eligibility, string> = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
}
