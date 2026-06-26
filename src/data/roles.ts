import type { Position, Role } from '../types'

// FC26 player roles + focuses, mapped to our position taxonomy.
// Source: fifauteam.com/fc-26-roles (FUTBIN role system).
const GK: Role[] = [
  { name: 'Goalkeeper', focuses: ['Defend', 'Balanced'] },
  { name: 'Sweeper Keeper', focuses: ['Balanced', 'Build-Up'] },
  { name: 'Ball-Playing Keeper', focuses: ['Build-Up'] },
]

const FULLBACK: Role[] = [
  { name: 'Fullback', focuses: ['Defend', 'Balanced', 'Versatile'] },
  { name: 'Falseback', focuses: ['Defend', 'Balanced'] },
  { name: 'Wingback', focuses: ['Support', 'Balanced'] },
  { name: 'Attacking Wingback', focuses: ['Attack', 'Balanced'] },
  { name: 'Inverted Wingback', focuses: ['Build-Up', 'Attack'] },
]

const CB: Role[] = [
  { name: 'Defender', focuses: ['Defend', 'Balanced'] },
  { name: 'Stopper', focuses: ['Balanced', 'Aggressive', 'Defend'] },
  { name: 'Ball-Playing Defender', focuses: ['Build-Up', 'Aggressive', 'Defend'] },
  { name: 'Wide Back', focuses: ['Defend', 'Aggressive', 'Support'] },
]

const CDM: Role[] = [
  { name: 'Holding', focuses: ['Defend', 'Roaming'] },
  { name: 'Centre-Half', focuses: ['Defend'] },
  { name: 'Deep-Lying Playmaker', focuses: ['Defend', 'Roaming'] },
  { name: 'Wide Half', focuses: ['Build-Up', 'Defend'] },
  { name: 'Box Crasher', focuses: ['Balanced'] },
]

const CM: Role[] = [
  { name: 'Box-to-Box', focuses: ['Balanced', 'Ball Winning'] },
  { name: 'Holding', focuses: ['Defend'] },
  { name: 'Deep-Lying Playmaker', focuses: ['Defend'] },
  { name: 'Playmaker', focuses: ['Attack', 'Roaming'] },
  { name: 'Half-Winger', focuses: ['Support', 'Balanced', 'Attack'] },
]

const CAM: Role[] = [
  { name: 'Playmaker', focuses: ['Balanced', 'Roaming'] },
  { name: 'Shadow Striker', focuses: ['Attack'] },
  { name: 'Half-Winger', focuses: ['Roaming', 'Balanced', 'Attack'] },
  { name: 'Classic 10', focuses: ['Versatile', 'Wide', 'Attack'] },
]

const WIDE_MID: Role[] = [
  { name: 'Winger', focuses: ['Balanced', 'Attack', 'Versatile'] },
  { name: 'Wide Midfielder', focuses: ['Defend', 'Support', 'Build-Up'] },
  { name: 'Wide Playmaker', focuses: ['Attack'] },
  { name: 'Inside Forward', focuses: ['Balanced', 'Attack'] },
]

const WINGER: Role[] = [
  { name: 'Winger', focuses: ['Balanced', 'Attack', 'Versatile'] },
  { name: 'Inside Forward', focuses: ['Roaming', 'Balanced', 'Attack'] },
  { name: 'Wide Playmaker', focuses: ['Build-Up', 'Attack'] },
]

const STRIKER: Role[] = [
  { name: 'Advanced Forward', focuses: ['Attack', 'Versatile'] },
  { name: 'Poacher', focuses: ['Attack', 'Versatile'] },
  { name: 'False 9', focuses: ['Build-Up', 'Attack'] },
  { name: 'Target Forward', focuses: ['Balanced', 'Attack', 'Wide'] },
]

const ROLES_BY_POSITION: Record<Position, Role[]> = {
  GK,
  RB: FULLBACK, LB: FULLBACK, RWB: FULLBACK, LWB: FULLBACK,
  CB,
  CDM,
  CM,
  CAM,
  RM: WIDE_MID, LM: WIDE_MID,
  RW: WINGER, LW: WINGER,
  CF: STRIKER, ST: STRIKER,
}

export function rolesFor(pos: Position): Role[] {
  return ROLES_BY_POSITION[pos] ?? []
}
