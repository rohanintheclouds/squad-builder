import { createDraft } from './draft/engine'
import { CL_TIERS } from './draft/scoring'
import DraftMode from './draft/DraftMode'

// Base pool: the top-20 clubs (user-approved). Extra clubs get appended here once approved
// (candidates surfaced from the dataset by player count).
const CLUB_POOL = [
  // base 20
  'Bayern', 'Arsenal', 'Real Madrid', 'PSG', 'Man City', 'Barcelona', 'Liverpool', 'Inter',
  'Dortmund', 'Leverkusen', 'Man United', 'Atlético', 'Juventus', 'RB Leipzig', 'Chelsea',
  'AC Milan', 'Benfica', 'Porto', 'Roma', 'Atalanta',
  // approved extras (deepest squads in the dataset)
  'Newcastle', 'Tottenham', 'Bournemouth', 'Brighton', 'Nottm Forest', 'Crystal Palace',
  'Aston Villa', 'Brentford', 'Sporting',
]

const draft = createDraft({
  id: 'cl', kind: 'club', noun: 'club',
  groupOf: (p) => p.club, pool: CLUB_POOL, tiers: CL_TIERS,
})

export default function RoadToCL({ onExit }: { onExit: () => void }) {
  return <DraftMode draft={draft} onExit={onExit} />
}
