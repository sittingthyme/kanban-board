import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check } from 'lucide-react'
import { LabelBadge } from '../labels/LabelBadge'
import { MemberAvatar, MemberAvatarGroup } from '../team/MemberAvatar'
import { PriorityBadge, priorityAccentStyle } from '../task/PriorityIndicator'
import { cn, formatDueDate } from '../../lib/utils'
import type { TaskWithRelations } from '../../lib/types'

interface TaskCardProps {
  task: TaskWithRelations
  onClick: () => void
  isDone?: boolean
}

export function TaskCard({ task, onClick, isDone }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const primaryAssignee = task.assignees[0]

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        ...priorityAccentStyle(task.priority),
      }}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative cursor-grab rounded-xl bg-surface-card p-4 shadow-md ring-1 ring-black/5 transition-shadow active:cursor-grabbing hover:shadow-lg dark:ring-white/5',
        isDragging && 'opacity-50 shadow-xl ring-2 ring-accent',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-text-primary">
          {task.title}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {isDone && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>

      {task.labels.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          {task.assignees.length > 0 ? (
            <MemberAvatarGroup members={task.assignees} max={4} />
          ) : (
            <span />
          )}
        </div>

        {task.due_date && (
          <span className="flex-1 text-center text-[11px] font-medium text-text-muted">
            {formatDueDate(task.due_date)}
          </span>
        )}

        <div className="flex min-w-0 flex-1 justify-end">
          {primaryAssignee && <MemberAvatar member={primaryAssignee} size="md" />}
        </div>
      </div>
    </div>
  )
}
