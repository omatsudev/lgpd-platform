'use client'

import { cn } from '@/lib/utils'
import { useId, useState } from 'react'

type Tab = { key: string; label: string; content: React.ReactNode }

export function LessonTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key)
  const baseId = useId()

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const next = tabs[(index + offset + tabs.length) % tabs.length]
    setActive(next.key)
    document.getElementById(`${baseId}-tab-${next.key}`)?.focus()
  }

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-1 border-b border-white/10">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            id={`${baseId}-tab-${tab.key}`}
            role="tab"
            type="button"
            aria-selected={active === tab.key}
            aria-controls={`${baseId}-panel-${tab.key}`}
            tabIndex={active === tab.key ? 0 : -1}
            onClick={() => setActive(tab.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300',
              active === tab.key
                ? 'border-[#2BB3FF] text-white'
                : 'border-transparent text-slate-400 hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          id={`${baseId}-panel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={active !== tab.key}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
