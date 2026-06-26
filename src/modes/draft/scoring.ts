import { PLAYERS } from '../../data/players'

// Draft scoring uses each player's hidden rating (see src/data/ratings.ts).
// Calibrated by Monte-Carlo: casual play averages ~82 rating, expert ~84.4. Centering the
// curve here puts an average team mid-table and makes the top tier genuinely rare.
const MEAN = 82.5
const TEAM_SD = 2.0

const byId = new Map(PLAYERS.map((p) => [p.id, p]))

function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  if (z > 0) p = 1 - p
  return p
}

export type Tier = { key: string; label: string; blurb: string; color: string; minPercentile: number }

export const WC_TIERS: Tier[] = [
  { key: 'winner', label: 'World Cup Winner', blurb: 'Top 3% of all possible teams. Legendary.', color: '#fbbf24', minPercentile: 0.97 },
  { key: 'final', label: 'Finalist', blurb: 'So close to glory. A truly elite squad.', color: '#e5e7eb', minPercentile: 0.92 },
  { key: 'semi', label: 'Semi-Finalist', blurb: 'Among the very best in the world.', color: '#a78bfa', minPercentile: 0.85 },
  { key: 'quarter', label: 'Quarter-Finalist', blurb: 'A strong, well-balanced side.', color: '#38bdf8', minPercentile: 0.62 },
  { key: 'r16', label: 'Round of 16', blurb: 'Solid knockout-round material.', color: '#34d399', minPercentile: 0.38 },
  { key: 'r32', label: 'Round of 32', blurb: 'Squeaked out of the group.', color: '#60a5fa', minPercentile: 0.18 },
  { key: 'group', label: 'Group Stage Exit', blurb: 'Made the tournament, went home early.', color: '#f59e0b', minPercentile: 0.03 },
  { key: 'none', label: "Didn't Qualify", blurb: 'Bottom 3%. Back to the drawing board.', color: '#ef4444', minPercentile: 0 },
]

export const CL_TIERS: Tier[] = [
  { key: 'winner', label: 'Champions League Winner', blurb: 'Top 3% of all possible squads. Kings of Europe.', color: '#fbbf24', minPercentile: 0.97 },
  { key: 'final', label: 'Finalist', blurb: 'One night from the trophy.', color: '#e5e7eb', minPercentile: 0.92 },
  { key: 'semi', label: 'Semi-Finalist', blurb: 'Among Europe’s elite four.', color: '#a78bfa', minPercentile: 0.85 },
  { key: 'quarter', label: 'Quarter-Finalist', blurb: 'A genuine European heavyweight.', color: '#38bdf8', minPercentile: 0.62 },
  { key: 'r16', label: 'Round of 16', blurb: 'Through to the knockouts.', color: '#34d399', minPercentile: 0.38 },
  { key: 'playoff', label: 'Knockout Playoff', blurb: 'Scraped into the playoff round.', color: '#60a5fa', minPercentile: 0.18 },
  { key: 'league', label: 'League Phase Exit', blurb: 'Out after the league phase.', color: '#f59e0b', minPercentile: 0.03 },
  { key: 'none', label: 'Missed Europe', blurb: 'Bottom 3%. No European football.', color: '#ef4444', minPercentile: 0 },
]

export function scoreTeam(playerIds: string[], tiers: Tier[]): { avg: number; percentile: number; tier: Tier } {
  const ratings = playerIds.map((id) => byId.get(id)).filter(Boolean).map((p) => p!.rating)
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
  const z = TEAM_SD > 0 ? (avg - MEAN) / TEAM_SD : 0
  const percentile = normalCdf(z)
  const tier = tiers.find((t) => percentile >= t.minPercentile) ?? tiers[tiers.length - 1]
  return { avg, percentile, tier }
}
