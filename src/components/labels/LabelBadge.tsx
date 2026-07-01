import { cn } from '../../lib/utils'
import type { Label } from '../../lib/types'

interface LabelBadgeProps {
  label: Label
  size?: 'sm' | 'md'
  onClick?: () => void
  active?: boolean
}

export function LabelBadge({ label, size = 'sm', onClick, active }: LabelBadgeProps) {
  const Component = onClick ? 'button' : 'span'

  return (
    <Component
      {...(onClick ? { type: 'button' as const } : {})}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        onClick && 'cursor-pointer transition-opacity hover:opacity-80',
        active && 'ring-2 ring-ring ring-offset-1 ring-offset-surface-raised',
      )}
      style={{
        backgroundColor: `${label.color}18`,
        color: label.color,
      }}
    >
      {label.name}
    </Component>
  )
}
