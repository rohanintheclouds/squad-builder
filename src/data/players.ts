import type { Player, Position } from '../types'
import raw from './players.json'
import { ratingFor, potentialFor, uncuratedRating, OVERRIDES } from './ratings'

// players.json is the single source of truth (edited / refreshed monthly). This module
// loads it, attaches the hidden rating, and exposes the two views the app needs:
//   PLAYERS         — everyone (World Cup mode)
//   MANAGER_PLAYERS — only players with a transfer value (Squad Builder needs a price)
//
// Dedupe-by-name here is a safety net; scripts/qa.mjs is the real guard against bad data.

type RawPlayer = {
  name: string
  nationality: string
  club: string
  league: string
  value: number | null
  positions: Position[]
  age?: number
  heightCm?: number
  foot?: 'Left' | 'Right' | 'Both'
}

const seen = new Set<string>()
const deduped = (raw as RawPlayer[]).filter((p) => {
  if (seen.has(p.name)) return false
  seen.add(p.name)
  return true
})

// Ratings come from two sources: curated players use OVERRIDES (+ light form blend) via ratingFor;
// everyone else is spread across a harsh rank-based bell curve (60-80). We rank the uncurated set by
// transfer value (deterministic tie-break by name) and map each to a bell-curve rating, so unknowns
// form a realistic 60-80 distribution that never reaches the curated/elite tier (81+).
const uncurated = deduped
  .filter((p) => !(p.name in OVERRIDES))
  .sort((a, b) => (a.value ?? 0) - (b.value ?? 0) || a.name.localeCompare(b.name))
const rankRating = new Map<string, number>()
uncurated.forEach((p, idx) => rankRating.set(p.name, uncuratedRating((idx + 0.5) / uncurated.length)))

export const PLAYERS: Player[] = deduped.map((p, i) => {
  const rating = p.name in OVERRIDES ? ratingFor(p.name, p.value, p.league) : rankRating.get(p.name)!
  const age = p.age ?? 25
  return {
    id: `p${i + 1}`,
    name: p.name,
    club: p.club,
    league: p.league,
    nationality: p.nationality,
    value: p.value,
    rating,
    potential: potentialFor(rating, age),
    age,
    heightCm: p.heightCm ?? 180,
    foot: p.foot ?? 'Right',
    primaryPos: p.positions[0],
    eligiblePos: p.positions,
  }
})

/** Squad Builder pool: only players with a real transfer value. */
export const MANAGER_PLAYERS: Player[] = PLAYERS.filter((p) => p.value != null)
