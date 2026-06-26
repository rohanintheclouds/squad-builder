import { useEffect, useState } from 'react'
import { useWcStore } from './store'
import { useMediaQuery } from '../../lib/useMediaQuery'
import FormationChoice from './FormationChoice'
import WcPitch from './WcPitch'
import NationPanel from './NationPanel'
import ResultView from './ResultView'

export default function RoadToWorldCup({ onExit }: { onExit: () => void }) {
  const { phase, start, selectedSlotId } = useWcStore()
  const isMobile = useMediaQuery('(max-width: 900px)')
  const [expanded, setExpanded] = useState(false)

  // Fresh game whenever the mode is entered.
  useEffect(() => { start() }, [start])

  // Tapping a position on the pitch expands the picker so you can choose a player comfortably.
  useEffect(() => { if (selectedSlotId) setExpanded(true) }, [selectedSlotId])

  if (phase === 'formation') return <FormationChoice />
  if (phase === 'result') return <ResultView onExit={onExit} />

  // draft
  if (isMobile) {
    // Split the screen: pitch fills the top (sized to fit, fully visible), the nation
    // panel gets a guaranteed bottom slice so the player list is always usable.
    return (
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1 items-center justify-center p-1.5 transition-all duration-300">
          <div className="h-full" style={{ aspectRatio: '76 / 105' }}>
            <WcPitch compact />
          </div>
        </div>
        <div
          className="shrink-0 border-t border-white/10 transition-all duration-300"
          style={{ height: expanded ? '74vh' : '34vh' }}
        >
          <NationPanel
            expanded={expanded}
            onToggleExpand={() => setExpanded((e) => !e)}
            onPick={() => setExpanded(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 items-center justify-center p-4">
        <div className="h-full max-w-full" style={{ aspectRatio: '98 / 105' }}>
          <WcPitch />
        </div>
      </div>
      <div className="w-[372px] shrink-0 border-l border-white/10">
        <NationPanel />
      </div>
    </div>
  )
}
