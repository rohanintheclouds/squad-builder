import { useEffect } from 'react'
import { useWcStore } from './store'
import { useMediaQuery } from '../../lib/useMediaQuery'
import FormationChoice from './FormationChoice'
import WcPitch from './WcPitch'
import NationPanel from './NationPanel'
import ResultView from './ResultView'

export default function RoadToWorldCup({ onExit }: { onExit: () => void }) {
  const { phase, start } = useWcStore()
  const isMobile = useMediaQuery('(max-width: 900px)')

  // Fresh game whenever the mode is entered.
  useEffect(() => { start() }, [start])

  if (phase === 'formation') return <FormationChoice />
  if (phase === 'result') return <ResultView onExit={onExit} />

  // draft
  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        <div className="px-3 pt-3">
          <div className="mx-auto w-full max-w-[520px]" style={{ aspectRatio: '80 / 105' }}>
            <WcPitch compact />
          </div>
        </div>
        <div className="mt-2 min-h-0 flex-1 border-t border-white/10">
          <NationPanel />
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
