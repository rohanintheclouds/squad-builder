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
  // mobile panel size: 'list' (big list) | 'normal' | 'pitch' (panel minimised, pitch big)
  const [panelMode, setPanelMode] = useState<'list' | 'normal' | 'pitch'>('normal')

  useEffect(() => { start() }, [start])
  useEffect(() => { if (selectedSlotId) setPanelMode('list') }, [selectedSlotId])

  if (phase === 'formation') return <FormationChoice draft={draft} />
  if (phase === 'result') return <ResultView draft={draft} onExit={onExit} />

  if (isMobile) {
    const panelH = panelMode === 'list' ? '76vh' : panelMode === 'pitch' ? '15vh' : '40vh'
    return (
      <div className="flex h-full flex-col">
        <div className="relative flex min-h-0 flex-1 items-center justify-center p-1.5 transition-all duration-300">
          <div className="h-full" style={{ aspectRatio: '76 / 105' }}>
            <DraftPitch draft={draft} compact />
          </div>
          <button
            onClick={() => setPanelMode((m) => (m === 'pitch' ? 'normal' : 'pitch'))}
            className="absolute right-3 top-3 z-20 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-md"
          >
            {panelMode === 'pitch' ? '⤡ Show list' : '⤢ Bigger pitch'}
          </button>
        </div>
        <div className="shrink-0 border-t border-white/10 transition-all duration-300" style={{ height: panelH }}>
          <GroupPanel
            draft={draft}
            expanded={panelMode === 'list'}
            onToggleExpand={() => setPanelMode((m) => (m === 'list' ? 'normal' : 'list'))}
            onPick={() => setPanelMode('normal')}
          />
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
