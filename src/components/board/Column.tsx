import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { EmptyState } from '../ui/EmptyState'
import type { TaskStatus, TaskWithRelations } from '../../lib/types'

interface ColumnProps {
  id: TaskStatus
  title: string
  headerColor: string
  tasks: TaskWithRelations[]
  onTaskClick: (task: TaskWithRelations) => void
  onAddTask: (status: TaskStatus) => void
}

export function Column({ id, title, headerColor, tasks, onTaskClick, onAddTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: 'column', status: id } })

  return (
    <div className="flex min-w-[280px] flex-1 flex-col">
      <div
        className="mb-3 flex items-center justify-between rounded-lg px-4 py-2.5 shadow-sm"
        style={{ backgroundColor: headerColor }}
      >
        <h3 className="text-xs font-bold tracking-wider text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
            {tasks.length}
          </span>
          <button
            type="button"
            onClick={() => onAddTask(id)}
            className="rounded-md p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label={`Add task to ${title}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[420px] flex-1 flex-col gap-3 rounded-xl p-1 transition-colors ${
          isOver ? 'bg-accent/5 ring-2 ring-accent/30' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <EmptyState message="Drop tasks here" />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                isDone={id === 'done'}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
