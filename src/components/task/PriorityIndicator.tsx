import type { CSSProperties } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PRIORITY_OPTIONS, type TaskPriority } from '../../lib/types'

const PRIORITY_ICONS = {
  low: ChevronDown,
  normal: null,
  high: ChevronUp,
} as const

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  if (priority === 'normal') return null

  const option = PRIORITY_OPTIONS.find((p) => p.value === priority)
  const Icon = PRIORITY_ICONS[priority]
  if (!option || !Icon) return null

  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        backgroundColor: `${option.color}18`,
        color: option.color,
      }}
      title={`${option.label} priority`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {option.label}
    </span>
  )
}

export function priorityAccentStyle(priority: TaskPriority): CSSProperties | undefined {
  if (priority === 'normal') return undefined
  const option = PRIORITY_OPTIONS.find((p) => p.value === priority)
  if (!option) return undefined
  return {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: option.color,
  }
}
