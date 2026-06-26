import type { Player } from '../../types'
import { positionsRelation } from '../../lib/positions'
import { continentOf } from '../../lib/continents'
import { fmtValue, fmtHeight } from '../../lib/format'
import { flag } from '../../lib/flags'

export type Color = 'green' | 'yellow' | 'red' | 'plain'
export type Cell = { label: string; value: string; color: Color; dir?: 'up' | 'down' }

function clubColor(g: Player, t: Player): Color {
  if (g.club === t.club) return 'green'
  if (g.league && g.league === t.league) return 'yellow'
  return 'red'
}
function nationColor(g: Player, t: Player): Color {
  if (g.nationality === t.nationality) return 'green'
  const cg = continentOf(g.nationality), ct = continentOf(t.nationality)
  return cg && ct && cg === ct ? 'yellow' : 'red'
}
function positionColor(g: Player, t: Player): Color {
  let best: Color = 'red'
  for (const a of g.eligiblePos) for (const b of t.eligiblePos) {
    const r = positionsRelation(a, b)
    if (r === 'same') return 'green'
    if (r === 'related') best = 'yellow'
  }
  return best
}
function footColor(g: Player, t: Player): Color {
  if (g.foot === t.foot) return 'green'
  if (g.foot === 'Both' || t.foot === 'Both') return 'yellow' // two-footed overlaps either
  return 'red'
}
// numeric field: green if equal, else arrow pointing toward the target (the answer)
function numCell(label: string, display: string, guessN: number, targetN: number): Cell {
  if (guessN === targetN) return { label, value: display, color: 'green' }
  return { label, value: display, color: 'plain', dir: targetN > guessN ? 'up' : 'down' }
}

/** Compare a guessed player to the hidden target; returns one cell per field. */
export function compare(g: Player, t: Player): Cell[] {
  return [
    { label: 'Name', value: g.name, color: g.id === t.id ? 'green' : 'plain' },
    { label: 'Club', value: g.club, color: clubColor(g, t) },
    { label: 'Nation', value: `${flag(g.nationality)} ${g.nationality}`, color: nationColor(g, t) },
    { label: 'Position', value: g.eligiblePos.join('/'), color: positionColor(g, t) },
    { label: 'Foot', value: g.foot, color: footColor(g, t) },
    numCell('Age', String(g.age), g.age, t.age),
    numCell('Height', fmtHeight(g.heightCm), g.heightCm, t.heightCm),
    numCell('Value', fmtValue(g.value), g.value ?? 0, t.value ?? 0),
  ]
}

export const MAX_GUESSES = 6
