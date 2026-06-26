import type { Player, Position } from '../types'
import raw from './players.json'
import { ratingFor, potentialFor } from './ratings'

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
export const PLAYERS: Player[] = (raw as RawPlayer[])
  .filter((p) => {
    if (seen.has(p.name)) return false
    seen.add(p.name)
    return true
  })
  .map((p, i) => {
    const rating = ratingFor(p.name, p.value, p.league)
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
