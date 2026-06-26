import type { ComponentType } from 'react'
import ManagerMode from './manager/ManagerMode'
import RoadToWorldCup from './roadwc'
import RoadToCL from './roadcl'
import GuessThePlayer from './guess/GuessThePlayer'

export type GameMode = {
  id: string
  name: string
  tagline: string
  emoji: string
  accent: string
  rules: string[]
  Component: ComponentType<{ onExit: () => void }>
}

// Add future modes here. Each is fully self-contained under src/modes/<id>/.
export const MODES: GameMode[] = [
  {
    id: 'manager',
    name: 'Squad Builder',
    tagline: 'Build a dream XI under a budget cap, with real transfer values, formations and player roles.',
    emoji: '⚽',
    accent: '#38bdf8',
    rules: [
      'Build a starting XI and keep the total under your budget cap (set it in the toolbar).',
      'Every card shows the player’s real transfer value; the running total must fit the cap.',
      'Pick any formation and a tactic, then tap a slot and a player to fill it (or drag on desktop).',
      'Position fit: 🟩 natural · 🟨 out of position · 🟥 can’t play there. Max 3 🟨 players.',
      'Tap a player on the pitch to set their role.',
    ],
    Component: ManagerMode,
  },
  {
    id: 'roadwc',
    name: 'Road to the World Cup',
    tagline: 'A random nation is drawn each pick. Choose players blind to their rating and chase the trophy.',
    emoji: '🏆',
    accent: '#fbbf24',
    rules: [
      'Pick 1 of 5 random formations to start.',
      'A random nation is drawn each pick — choose one of its players for an open spot.',
      'You can’t see ratings; pick by club, value and position.',
      'Position fit: 🟩 natural · 🟨 out of position (max 3) · 🟥 not allowed.',
      '2 rerolls if you don’t want a nation. The same nation can come up again.',
      'Fill all 11 to get your World Cup placement — better players finish higher.',
    ],
    Component: RoadToWorldCup,
  },
  {
    id: 'roadcl',
    name: 'Road to the Champions League',
    tagline: 'A random elite club is drawn each pick. Build a blind XI and chase the European crown.',
    emoji: '⭐',
    accent: '#818cf8',
    rules: [
      'Pick 1 of 5 random formations to start.',
      'A random elite club is drawn each pick — choose one of its players for an open spot.',
      'You can’t see ratings; pick by player, value and position.',
      'Position fit: 🟩 natural · 🟨 out of position (max 3) · 🟥 not allowed.',
      '2 rerolls if you don’t want a club. The same club can come up again.',
      'Fill all 11 to get your Champions League placement — better players finish higher.',
    ],
    Component: RoadToCL,
  },
  {
    id: 'guess',
    name: 'Do You Know Ball',
    tagline: 'Six guesses to find the mystery player. Each guess reveals club, nation, position, age, height and value clues.',
    emoji: '🔍',
    accent: '#22d3ee',
    rules: [
      'Guess the mystery player in 6 tries — type a name and pick from the list.',
      'Each guess colours the clues compared to the answer:',
      'Club — 🟩 same club · 🟨 same league · 🟥 neither',
      'Nation — 🟩 same · 🟨 same continent (confederation) · 🟥 neither',
      'Position — 🟩 exact shared position · 🟨 related (e.g. CM≈CDM) · 🟥 neither',
      'Age / Height / Value — ↑ / ↓ toward the answer, 🟩 if exact (height in feet/inches)',
      'Win to build a streak; 3+ in a row = on fire 🔥.',
    ],
    Component: GuessThePlayer,
  },
]
