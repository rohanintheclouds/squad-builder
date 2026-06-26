import { useEffect } from 'react'
import { useStore } from '../store'

export default function Toast() {
  const { notice, setNotice } = useStore()

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 2600)
    return () => clearTimeout(t)
  }, [notice, setNotice])

  if (!notice) return null
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="rounded-full border border-red-400/40 bg-red-500/20 px-5 py-2.5 text-sm font-semibold text-red-100 shadow-2xl backdrop-blur-md">
        {notice}
      </div>
    </div>
  )
}
