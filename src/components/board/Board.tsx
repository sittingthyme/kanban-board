import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { COLUMNS } from '../../lib/types'
import type { TaskStatus, TaskWithRelations } from '../../lib/types'

interface BoardProps {
  tasks: TaskWithRelations[]
  search?: string
  selectedLabelId?: string | null
  onMoveTask: (
    taskId: string,
    newStatus: TaskStatus,
    newPosition: number,
    optimisticTasks: TaskWithRelations[],
  ) => Promise<boolean>
  onTaskClick: (task: TaskWithRelations) => void
  onAddTask: (status: TaskStatus) => void
  disabled?: boolean
}

function filterTasks(
  tasks: TaskWithRelations[],
  search?: string,
  selectedLabelId?: string | null,
) {
  return tasks.filter((task) => {
    const query = search?.trim().toLowerCase() ?? ''
    const matchesSearch =
      !query ||
      task.title.toLowerCase().includes(query) ||
      (task.description?.toLowerCase().includes(query) ?? false)
    const matchesLabel =
      !selectedLabelId || task.labels.some((l) => l.id === selectedLabelId)
    return matchesSearch && matchesLabel
  })
}

function getTasksByColumn(tasks: TaskWithRelations[], status: TaskStatus) {
  return tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position)
}

function isColumnId(id: string): id is TaskStatus {
  return COLUMNS.some((c) => c.id === id)
}

function moveTaskBetweenColumns(
  tasks: TaskWithRelations[],
  activeId: string,
  overColumn: TaskStatus,
  overId: string,
): TaskWithRelations[] {
  const activeTask = tasks.find((t) => t.id === activeId)
  if (!activeTask) return tasks

  const activeColumn = activeTask.status
  const withoutActive = tasks.filter((t) => t.id !== activeId)

  const sourceColumnTasks = getTasksByColumn(withoutActive, activeColumn).map((t, i) => ({
    ...t,
    position: i,
  }))

  const targetColumnTasks = getTasksByColumn(withoutActive, overColumn)
  let insertIndex = targetColumnTasks.length
  if (!isColumnId(overId)) {
    const overIndex = targetColumnTasks.findIndex((t) => t.id === overId)
    if (overIndex >= 0) insertIndex = overIndex
  }

  const newTargetColumn = [
    ...targetColumnTasks.slice(0, insertIndex),
    { ...activeTask, status: overColumn },
    ...targetColumnTasks.slice(insertIndex),
  ].map((t, i) => ({ ...t, position: i }))

  const otherTasks = withoutActive.filter(
    (t) => t.status !== activeColumn && t.status !== overColumn,
  )

  return [...otherTasks, ...sourceColumnTasks, ...newTargetColumn]
}

function reorderTaskInColumn(
  tasks: TaskWithRelations[],
  activeId: string,
  overId: string,
  column: TaskStatus,
): TaskWithRelations[] {
  const columnTasks = getTasksByColumn(tasks, column)
  const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
  const newIndex = columnTasks.findIndex((t) => t.id === overId)
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return tasks

  const reordered = arrayMove(columnTasks, oldIndex, newIndex)
  return tasks.map((t) => {
    if (t.status !== column) return t
    const idx = reordered.findIndex((r) => r.id === t.id)
    return idx >= 0 ? { ...t, position: idx } : t
  })
}

export function Board({
  tasks,
  search,
  selectedLabelId,
  onMoveTask,
  onTaskClick,
  onAddTask,
  disabled,
}: BoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)
  const [localTasks, setLocalTasks] = useState(tasks)

  const visibleTasks = filterTasks(localTasks, search, selectedLabelId)

  useEffect(() => {
    if (!activeTask) {
      setLocalTasks(tasks)
    }
  }, [tasks, activeTask])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const findColumn = (taskId: string): TaskStatus | null => {
    const task = localTasks.find((t) => t.id === taskId)
    return task?.status ?? null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = localTasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumn(activeId)
    const overColumn = isColumnId(overId) ? overId : findColumn(overId)

    if (!activeColumn || !overColumn) return
    if (activeColumn === overColumn && activeId === overId) return

    setLocalTasks((prev) => {
      if (activeColumn === overColumn) {
        return reorderTaskInColumn(prev, activeId, overId, activeColumn)
      }
      return moveTaskBetweenColumns(prev, activeId, overColumn, overId)
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over || disabled) {
      setLocalTasks(tasks)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const overColumn = isColumnId(overId) ? overId : findColumn(overId)
    const activeColumn = findColumn(activeId)

    if (!overColumn || !activeColumn) {
      setLocalTasks(tasks)
      return
    }

    let updated = localTasks

    if (activeColumn === overColumn && activeId !== overId && !isColumnId(overId)) {
      updated = reorderTaskInColumn(localTasks, activeId, overId, overColumn)
      setLocalTasks(updated)
    } else if (activeColumn !== overColumn) {
      updated = moveTaskBetweenColumns(localTasks, activeId, overColumn, overId)
      setLocalTasks(updated)
    }

    const finalTask = updated.find((t) => t.id === activeId)
    if (!finalTask) return

    const success = await onMoveTask(activeId, finalTask.status, finalTask.position, updated)
    if (!success) {
      setLocalTasks(tasks)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-thin">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            headerColor={col.headerColor}
            tasks={getTasksByColumn(visibleTasks, col.id)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-1 opacity-95">
            <TaskCard task={activeTask} onClick={() => {}} isDone={activeTask.status === 'done'} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
