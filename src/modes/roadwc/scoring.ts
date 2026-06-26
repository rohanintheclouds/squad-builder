import { PLAYERS } from '../../data/players'

// A hidden "skill" with more spread than the displayed rating, derived from market value.
// €23M -> ~78, €50M -> ~86, €100M -> ~92, €200M -> 99. Never shown to the player.
export function skill(value: number): number {
  return Math.max(70, Math.min(99, Math.round(47.7 + 22.3 * Math.log10(value))))
}

// Bell-curve calibration from a Monte-Carlo of real drafts (2000 casual + 1000 expert runs):
// casual play averages ~82.5 skill, expert play ~86.7. Centering the curve here puts an
// average team at Round of 16 / Quarter and makes the World Cup Winner tier genuinely rare.
const MEAN = 82.5
const TEAM_SD = 3.0

// Standard normal CDF (Abramowitz & Stegun approximation).
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  if (z > 0) p = 1 - p
  return p
}

export type Tier = {
  key: string
  label: string
  blurb: string
  color: string
  minPercentile: number
}

// Ordered best -> worst. Tails are exponentially hard (Gaussian); the bulk lands R16/Quarter.
export const TIERS: Tier[] = [
  { key: 'winner', label: 'World Cup Winner', blurb: 'Top 3% of all possible teams. Legendary.', color: '#fbbf24', minPercentile: 0.97 },
  { key: 'final', label: 'Finalist', blurb: 'So close to glory. A truly elite squad.', color: '#e5e7eb', minPercentile: 0.92 },
  { key: 'semi', label: 'Semi-Finalist', blurb: 'Among the very best in the world.', color: '#a78bfa', minPercentile: 0.85 },
  { key: 'quarter', label: 'Quarter-Finalist', blurb: 'A strong, well-balanced side.', color: '#22d3ee', minPercentile: 0.62 },
  { key: 'r16', label: 'Round of 16', blurb: 'Solid knockout-round material.', color: '#34d399', minPercentile: 0.38 },
  { key: 'r32', label: 'Round of 32', blurb: 'Squeaked out of the group.', color: '#60a5fa', minPercentile: 0.18 },
  { key: 'group', label: 'Group Stage Exit', blurb: 'Made the tournament, went home early.', color: '#f59e0b', minPercentile: 0.03 },
  { key: 'none', label: "Didn't Qualify", blurb: 'Bottom 3%. Back to the drawing board.', color: '#ef4444', minPercentile: 0 },
]

export function scoreTeam(playerIds: string[]): { avg: number; percentile: number; tier: Tier } {
  const byId = new Map(PLAYERS.map((p) => [p.id, p]))
  const vals = playerIds.map((id) => byId.get(id)).filter(Boolean).map((p) => skill(p!.value))
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  const z = TEAM_SD > 0 ? (avg - MEAN) / TEAM_SD : 0
  const percentile = normalCdf(z)
  const tier = TIERS.find((t) => percentile >= t.minPercentile) ?? TIERS[TIERS.length - 1]
  return { avg, percentile, tier }
}
