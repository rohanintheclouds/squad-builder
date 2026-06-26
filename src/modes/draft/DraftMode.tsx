import { useEffect, useState } from 'react'
import { useMediaQuery } from '../../lib/useMediaQuery'
import type { Draft } from './engine'
import FormationChoice from './FormationChoice'
import DraftPitch from './DraftPitch'
import GroupPanel from './GroupPanel'
import ResultView from './ResultView'

/** Shared orchestrator for any draft mode (World Cup, Champions League, ...). */
export default function DraftMode({ draft, onExit }: { draft: Draft; onExit: () => void }) {
  const { phase, start, selectedSlotId } = draft.useStore()
  const isMobile = useMediaQuery('(max-width: 900px)')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => { start() }, [start])
  useEffect(() => { if (selectedSlotId) setExpanded(true) }, [selectedSlotId])

  if (phase === 'formation') return <FormationChoice draft={draft} />
  if (phase === 'result') return <ResultView draft={draft} onExit={onExit} />

  if (isMobile) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1 items-center justify-center p-1.5 transition-all duration-300">
          <div className="h-full" style={{ aspectRatio: '76 / 105' }}>
            <DraftPitch draft={draft} compact />
          </div>
        </div>
        <div className="shrink-0 border-t border-white/10 transition-all duration-300" style={{ height: expanded ? '76vh' : '40vh' }}>
          <GroupPanel draft={draft} expanded={expanded} onToggleExpand={() => setExpanded((e) => !e)} onPick={() => setExpanded(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 items-center justify-center p-4">
        <div className="h-full max-w-full" style={{ aspectRatio: '98 / 105' }}>
          <DraftPitch draft={draft} />
        </div>
      </div>
      <div className="w-[372px] shrink-0 border-l border-white/10">
        <GroupPanel draft={draft} />
      </div>
    </div>
  )
}
