import type { ComponentType } from 'react'
import ManagerMode from './manager/ManagerMode'
import RoadToWorldCup from './roadwc/RoadToWorldCup'

export type GameMode = {
  id: string
  name: string
  tagline: string
  emoji: string
  accent: string
  Component: ComponentType<{ onExit: () => void }>
}

// Add future modes here. Each is fully self-contained under src/modes/<id>/.
export const MODES: GameMode[] = [
  {
    id: 'manager',
    name: 'Squad Builder',
    tagline: 'Build a dream XI under a budget cap, with real transfer values, formations and player roles.',
    emoji: '⚽',
    accent: '#22d3ee',
    Component: ManagerMode,
  },
  {
    id: 'roadwc',
    name: 'Road to the World Cup',
    tagline: 'A random nation is drawn each pick. Choose players blind to their rating and chase the trophy.',
    emoji: '🏆',
    accent: '#fbbf24',
    Component: RoadToWorldCup,
  },
]
