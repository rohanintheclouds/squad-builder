import type { Formation, FormationSlot, Position } from '../types'

// Each formation is defined as outfield "lines" ordered defense -> attack.
// The GK is implied. Coordinates are computed so every formation lays out cleanly
// without hand-placing each slot. x: 0 (left) -> 100 (right), y: 0 (attack) -> 100 (own goal).
type Def = { name: string; group: '3-Back' | '4-Back' | '5-Back'; lines: Position[][] }

const WIDE_CODES = new Set<Position>(['LM', 'RM', 'LW', 'RW', 'LWB', 'RWB'])

// Per-position vertical nudge within a line (negative = higher / more attacking).
const Y_OFFSET: Partial<Record<Position, number>> = {
  CAM: -6, // play higher than the midfield line
  CDM: 6, //  sit deeper than the central midfielders
  LWB: -10, RWB: -10, // wing-backs push up the pitch
}

function lineX(line: Position[]): number[] {
  const n = line.length
  if (n === 1) return [50]
  const wide = line.some((p) => WIDE_CODES.has(p))
  const margin = wide ? 8 : 22 // wide lines hug the touchline, narrow lines stay central
  const span = 100 - margin * 2
  return line.map((_, i) => margin + (span * i) / (n - 1))
}

function build({ name, lines }: Def): Formation {
  const L = lines.length
  const slots: FormationSlot[] = [{ id: 'GK1', type: 'GK', x: 50, y: 91 }]
  const counters: Record<string, number> = {}
  lines.forEach((line, li) => {
    const baseY = L === 1 ? 45 : 74 - (li * (74 - 13)) / (L - 1)
    const xs = lineX(line)
    line.forEach((code, ci) => {
      counters[code] = (counters[code] ?? 0) + 1
      const y = Math.max(8, Math.min(86, baseY + (Y_OFFSET[code] ?? 0)))
      slots.push({ id: `${code}${counters[code]}`, type: code, x: xs[ci], y })
    })
  })
  return { name, slots }
}

// Full FC26 formation list (fifplay.com/fc-26/formations).
const DEFS: Def[] = [
  // --- 3-Back ---
  { name: '3-1-4-2', group: '3-Back', lines: [['CB', 'CB', 'CB'], ['CDM'], ['LM', 'CM', 'CM', 'RM'], ['ST', 'ST']] },
  { name: '3-4-1-2', group: '3-Back', lines: [['CB', 'CB', 'CB'], ['LM', 'CM', 'CM', 'RM'], ['CAM'], ['ST', 'ST']] },
  { name: '3-4-2-1', group: '3-Back', lines: [['CB', 'CB', 'CB'], ['LM', 'CM', 'CM', 'RM'], ['CAM', 'CAM'], ['ST']] },
  { name: '3-4-3', group: '3-Back', lines: [['CB', 'CB', 'CB'], ['LM', 'CM', 'CM', 'RM'], ['LW', 'ST', 'RW']] },
  { name: '3-5-2', group: '3-Back', lines: [['CB', 'CB', 'CB'], ['LWB', 'CM', 'CDM', 'CM', 'RWB'], ['ST', 'ST']] },

  // --- 4-Back ---
  { name: '4-1-2-1-2', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM'], ['CM', 'CM'], ['CAM'], ['ST', 'ST']] },
  { name: '4-1-2-1-2 Wide', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM'], ['LM', 'RM'], ['CAM'], ['ST', 'ST']] },
  { name: '4-1-3-2', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM'], ['LM', 'CM', 'RM'], ['ST', 'ST']] },
  { name: '4-1-4-1', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM'], ['LM', 'CM', 'CM', 'RM'], ['ST']] },
  { name: '4-2-1-3', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM', 'CDM'], ['CAM'], ['LW', 'ST', 'RW']] },
  { name: '4-2-2-2', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM', 'CDM'], ['CAM', 'CAM'], ['ST', 'ST']] },
  { name: '4-2-3-1', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM', 'CDM'], ['LM', 'CAM', 'RM'], ['ST']] },
  { name: '4-2-3-1 Narrow', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM', 'CDM'], ['CAM', 'CAM', 'CAM'], ['ST']] },
  { name: '4-2-3-1 Wide', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM', 'CDM'], ['LW', 'CAM', 'RW'], ['ST']] },
  { name: '4-2-4', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CM', 'CM'], ['LW', 'ST', 'ST', 'RW']] },
  { name: '4-3-1-2', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CM', 'CM', 'CM'], ['CAM'], ['ST', 'ST']] },
  { name: '4-3-2-1', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CM', 'CM', 'CM'], ['CAM', 'CAM'], ['ST']] },
  { name: '4-3-3', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CM', 'CM', 'CM'], ['LW', 'ST', 'RW']] },
  { name: '4-3-3 (2)', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CM', 'CDM', 'CM'], ['LW', 'ST', 'RW']] },
  { name: '4-3-3 (3)', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CM', 'CAM', 'CM'], ['LW', 'ST', 'RW']] },
  { name: '4-3-3 (4)', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['CDM', 'CM', 'CDM'], ['LW', 'ST', 'RW']] },
  { name: '4-4-1-1 (2)', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['LM', 'CM', 'CM', 'RM'], ['CF'], ['ST']] },
  { name: '4-4-1-1 Midfield', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['LM', 'CM', 'CM', 'RM'], ['CAM'], ['ST']] },
  { name: '4-4-2', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['LM', 'CM', 'CM', 'RM'], ['ST', 'ST']] },
  { name: '4-4-2 Holding', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['LM', 'CDM', 'CDM', 'RM'], ['ST', 'ST']] },
  { name: '4-5-1', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['LM', 'CM', 'CM', 'CM', 'RM'], ['ST']] },
  { name: '4-5-1 (2)', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['LM', 'CM', 'CDM', 'CM', 'RM'], ['ST']] },
  { name: '4-5-1 Attack', group: '4-Back', lines: [['LB', 'CB', 'CB', 'RB'], ['LM', 'CAM', 'CAM', 'CAM', 'RM'], ['ST']] },

  // --- 5-Back ---
  { name: '5-2-1-2', group: '5-Back', lines: [['LWB', 'CB', 'CB', 'CB', 'RWB'], ['CM', 'CM'], ['CAM'], ['ST', 'ST']] },
  { name: '5-2-3', group: '5-Back', lines: [['LWB', 'CB', 'CB', 'CB', 'RWB'], ['CM', 'CM'], ['LW', 'ST', 'RW']] },
  { name: '5-3-2', group: '5-Back', lines: [['LWB', 'CB', 'CB', 'CB', 'RWB'], ['CM', 'CM', 'CM'], ['ST', 'ST']] },
  { name: '5-3-2 Holding', group: '5-Back', lines: [['LWB', 'CB', 'CB', 'CB', 'RWB'], ['CDM', 'CM', 'CM'], ['ST', 'ST']] },
  { name: '5-4-1', group: '5-Back', lines: [['LWB', 'CB', 'CB', 'CB', 'RWB'], ['LM', 'CM', 'CM', 'RM'], ['ST']] },
]

export const FORMATIONS: Formation[] = DEFS.map(build)
export const FORMATION_GROUPS = DEFS.map((d) => ({ name: d.name, group: d.group }))
