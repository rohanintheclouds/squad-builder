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

// Every position placed on a 2D pitch grid: x = width (−1 left · 0 centre · +1 right),
// y = depth (0 GK → 5 striker). The penalty for an out-of-position move is derived from the
// distance between a player's nearest natural position and the slot, so EVERY pairing is scored:
// a CM shifted wide to RM, a striker dropped to CDM, a left back flipped to the right, etc.
const COORD: Record<Position, [number, number]> = {
  GK:  [0, 0],
  CB:  [0, 2],
  LB:  [-1, 2],   RB:  [1, 2],
  LWB: [-1, 2.4], RWB: [1, 2.4],
  CDM: [0, 3],
  CM:  [0, 3.4],
  LM:  [-1, 3.4], RM:  [1, 3.4],
  CAM: [0, 3.9],
  LW:  [-1, 4.4], RW:  [1, 4.4],
  CF:  [0, 4.6],
  ST:  [0, 5],
}

// Penalty (rating points) for moving between two specific positions. Depth gaps hurt the most
// (quadratically: a striker at CB is a disaster), width gaps hurt moderately (a wrong-side or
// central↔wide move), and anything to/from GK is brutal. Same position = 0.
function posPenalty(from: Position, slot: Position): number {
  if (from === slot) return 0
  if ((from === 'GK') !== (slot === 'GK')) return 40 // keeper ↔ outfield is off the charts
  const [fx, fy] = COORD[from]
  const [sx, sy] = COORD[slot]
  const dy = Math.abs(fy - sy)
  const dx = Math.abs(fx - sx)
  return Math.min(40, Math.round(2.5 * dy * dy + 3 * dx))
}

/**
 * Rating penalty (points) for playing a player out of position, taken from their BEST natural
 * position. 0 if natural (green). Scales with how far the move is across the pitch in both depth
 * and width: small for near moves (CM→RM ≈ 3, CB→CDM ≈ 3), bigger across lines (ST→CDM ≈ 10,
 * ST→CB ≈ 23), brutal to/from GK (40). Used by Squad Builder's team rating + card callout.
 */
export function oopSeverity(player: Player, slot: Position): number {
  if (eligibility(player, slot) === 'green') return 0
  let best = Infinity
  for (const p of player.eligiblePos) best = Math.min(best, posPenalty(p, slot))
  return best === Infinity ? 0 : best
}

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
