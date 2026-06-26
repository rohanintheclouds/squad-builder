import { PLAYERS } from '../data/players'
import { createDraft } from './draft/engine'
import { WC_TIERS } from './draft/scoring'
import DraftMode from './draft/DraftMode'

// Pool = nations with at least 3 players, so each draw offers real choice.
const byNat: Record<string, number> = {}
for (const p of PLAYERS) byNat[p.nationality] = (byNat[p.nationality] ?? 0) + 1
const NATION_POOL = Object.keys(byNat).filter((n) => byNat[n] >= 3)

const draft = createDraft({
  id: 'wc', kind: 'nation', noun: 'nation',
  groupOf: (p) => p.nationality, pool: NATION_POOL, tiers: WC_TIERS,
})

export default function RoadToWorldCup({ onExit }: { onExit: () => void }) {
  return <DraftMode draft={draft} onExit={onExit} />
}
