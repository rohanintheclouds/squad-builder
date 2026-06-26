export default function RulesModal({ title, emoji, rules, onClose }: {
  title: string
  emoji: string
  rules: string[]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="glass w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-500/15 to-transparent px-4 py-3">
          <div className="flex items-center gap-2 text-lg font-bold text-white">{emoji} {title}</div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-white/60 hover:bg-white/10">✕</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-3">
          <div className="flex flex-col gap-1.5">
            {rules.map((r, i) => (
              <div key={i} className="rounded-lg bg-white/5 px-3 py-2 text-[13px] leading-snug text-white/85">{r}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
