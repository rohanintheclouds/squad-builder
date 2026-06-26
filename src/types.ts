// Position taxonomy used across the app.
export type Position =
  | 'GK'
  | 'RB' | 'RWB' | 'CB' | 'LB' | 'LWB'
  | 'CDM' | 'CM' | 'CAM' | 'RM' | 'LM'
  | 'RW' | 'LW' | 'CF' | 'ST'

export type Player = {
  id: string
  name: string
  club: string
  league: string
  nationality: string
  /** Market value in millions of euros. Real-life value, not a game price. */
  value: number
  /** Overall quality 0-99, used for sorting and suggestions. */
  rating: number
  primaryPos: Position
  /** All positions the player can credibly fill (includes primary). */
  eligiblePos: Position[]
}

export type FormationSlot = {
  id: string
  type: Position
  /** Percentage coordinates on the pitch. x: 0 (left) - 100 (right), y: 0 (attack) - 100 (own goal). */
  x: number
  y: number
}

export type Formation = {
  name: string
  slots: FormationSlot[]
}

export type Tactic = {
  id: string
  name: string
  blurb: string
  /** Positions this tactic leans on, used to rank suggestions in search. */
  emphasis: Position[]
  /** Short tags describing the player profile this tactic wants. */
  wants: string
}

export type Eligibility = 'green' | 'amber' | 'red'

export type Role = {
  name: string
  /** Available focuses for this role, e.g. ['Defend', 'Balanced']. */
  focuses: string[]
}

/** What occupies a slot: the player plus their assigned role + focus. */
export type SquadEntry = {
  playerId: string
  role?: string
  focus?: string
}
