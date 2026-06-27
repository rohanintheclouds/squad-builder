import type { ComponentType } from 'react'
import ManagerMode from './manager/ManagerMode'
import RoadToWorldCup from './roadwc'
import RoadToCL from './roadcl'
import GuessThePlayer from './guess/GuessThePlayer'

export type Swatch = 'green' | 'amber' | 'red' | 'neutral'

/** One content block inside a mode's "How to play" panel. */
export type RuleBlock =
  | { type: 'steps'; heading: string; items: string[] } // numbered sequence
  | { type: 'list'; heading: string; items: string[] } // bulleted points
  | { type: 'legend'; heading: string; items: { swatch: Swatch; term: string; desc: string }[] }

export type ModeRules = {
  /** One-line statement of the goal, shown prominently at the top. */
  objective: string
  blocks: RuleBlock[]
}

export type GameMode = {
  id: string
  name: string
  tagline: string
  emoji: string
  accent: string
  rules: ModeRules
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
    rules: {
      objective: 'Build the strongest possible starting XI without exceeding your budget cap.',
      blocks: [
        {
          type: 'steps',
          heading: 'How to play',
          items: [
            'Set your **budget cap**, **formation** and **tactic** in the toolbar.',
            'Tap an **empty slot** for tactic-aware suggestions, or **drag any player** onto the pitch.',
            'Each card shows the player’s **real transfer value** — keep the running total **under your cap**.',
            'Tap a player already on the pitch to assign a **role** and **attacking focus**.',
          ],
        },
        {
          type: 'legend',
          heading: 'Position fit',
          items: [
            { swatch: 'green', term: 'Natural', desc: 'The player’s best position. No rating penalty.' },
            { swatch: 'amber', term: 'Out of position', desc: 'Plausible but not ideal. The first three are free; each one after that costs rating points.' },
            { swatch: 'red', term: 'Heavily out of position', desc: 'A real stretch, such as a striker at centre-back. Always costs rating points.' },
          ],
        },
        {
          type: 'list',
          heading: 'Scoring',
          items: [
            '**Any player can fill any slot.** The further the move from their natural role, the larger the penalty.',
            'The **squad rating** at the top already accounts for every out-of-position penalty.',
          ],
        },
      ],
    },
    Component: ManagerMode,
  },
  {
    id: 'roadwc',
    name: 'Road to the World Cup',
    tagline: 'A random nation is drawn each pick. Choose players blind to their rating and chase the trophy.',
    emoji: '🏆',
    accent: '#fbbf24',
    rules: {
      objective: 'Draft a full XI from random nations and earn the highest possible tournament finish.',
      blocks: [
        {
          type: 'steps',
          heading: 'How to play',
          items: [
            'Choose one of **five random formations** to begin.',
            'A **random nation** is drawn for each pick. Select one of its players for an open slot.',
            '**Ratings are hidden** — judge each player by club, transfer value and position.',
            'Fill all **eleven slots** to receive your **World Cup placement**.',
          ],
        },
        {
          type: 'legend',
          heading: 'Position fit',
          items: [
            { swatch: 'green', term: 'Natural', desc: 'The player’s best position.' },
            { swatch: 'amber', term: 'Out of position', desc: 'Allowed, but limited to three across the XI.' },
            { swatch: 'red', term: 'Not allowed', desc: 'The player cannot fill that slot.' },
          ],
        },
        {
          type: 'list',
          heading: 'Rerolls & scoring',
          items: [
            '**Two rerolls** let you skip a nation you don’t want. The same nation can still appear again.',
            '**Stronger, better-rated squads finish higher.** The very best win the title.',
          ],
        },
      ],
    },
    Component: RoadToWorldCup,
  },
  {
    id: 'roadcl',
    name: 'Road to the Champions League',
    tagline: 'A random elite club is drawn each pick. Build a blind XI and chase the European crown.',
    emoji: '⭐',
    accent: '#818cf8',
    rules: {
      objective: 'Draft a full XI from random elite clubs and earn the highest possible European finish.',
      blocks: [
        {
          type: 'steps',
          heading: 'How to play',
          items: [
            'Choose one of **five random formations** to begin.',
            'A **random elite club** is drawn for each pick. Select one of its players for an open slot.',
            '**Ratings are hidden** — judge each player by reputation, transfer value and position.',
            'Fill all **eleven slots** to receive your **Champions League placement**.',
          ],
        },
        {
          type: 'legend',
          heading: 'Position fit',
          items: [
            { swatch: 'green', term: 'Natural', desc: 'The player’s best position.' },
            { swatch: 'amber', term: 'Out of position', desc: 'Allowed, but limited to three across the XI.' },
            { swatch: 'red', term: 'Not allowed', desc: 'The player cannot fill that slot.' },
          ],
        },
        {
          type: 'list',
          heading: 'Rerolls & scoring',
          items: [
            '**Two rerolls** let you skip a club you don’t want. The same club can still appear again.',
            '**Stronger, better-rated squads finish higher.** The very best win the trophy.',
          ],
        },
      ],
    },
    Component: RoadToCL,
  },
  {
    id: 'guess',
    name: 'Do You Know Ball',
    tagline: 'Six guesses to find the mystery player. Each guess reveals club, nation, position, age, height and value clues.',
    emoji: '🔍',
    accent: '#22d3ee',
    rules: {
      objective: 'Identify the mystery player within six guesses.',
      blocks: [
        {
          type: 'steps',
          heading: 'How to play',
          items: [
            'Type a player’s name and choose from the list to **lock in a guess**.',
            'Each guess is compared to the answer across **seven clues**.',
            'Use the **colours and arrows** to narrow down who it is.',
          ],
        },
        {
          type: 'legend',
          heading: 'Clue colours',
          items: [
            { swatch: 'green', term: 'Exact match', desc: 'This detail is identical to the answer.' },
            { swatch: 'amber', term: 'Close', desc: 'Same league, same continent, or a related position.' },
            { swatch: 'red', term: 'No match', desc: 'This detail is unrelated to the answer.' },
          ],
        },
        {
          type: 'list',
          heading: 'Reading the clues',
          items: [
            '**Club** — green: **same club** · amber: **same league** · red: neither.',
            '**Nationality** — green: **same country** · amber: **same continent** · red: neither.',
            '**Position** — green: **exact position** · amber: **related** (e.g. CM and CDM) · red: unrelated.',
            '**Age, Height & Value** — an arrow points toward the answer (**↑ higher**, **↓ lower**); green when **exact**. Height is shown in feet and inches.',
          ],
        },
        {
          type: 'list',
          heading: 'Difficulty & streaks',
          items: [
            '**Futbol Fanatic** — the answer can be any player in the database.',
            '**Casual** — only the 150 most valuable players are in play.',
            'Each win **extends your streak**; three or more in a row marks a **hot streak**.',
          ],
        },
      ],
    },
    Component: GuessThePlayer,
  },
]
