import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  CreateTaskInput,
  Task,
  TaskWithRelations,
  TaskStatus,
  UpdateTaskInput,
} from '../lib/types'

function mergeTaskRelations(
  tasks: Task[],
  assigneeRows: { task_id: string; member_id: string; team_members: unknown }[],
  labelRows: { task_id: string; label_id: string; labels: unknown }[],
): TaskWithRelations[] {
  const assigneeMap = new Map<string, TaskWithRelations['assignees']>()
  for (const row of assigneeRows) {
    const member = row.team_members as TaskWithRelations['assignees'][0]
    if (!member) continue
    const list = assigneeMap.get(row.task_id) ?? []
    list.push(member)
    assigneeMap.set(row.task_id, list)
  }

  const labelMap = new Map<string, TaskWithRelations['labels']>()
  for (const row of labelRows) {
    const label = row.labels as TaskWithRelations['labels'][0]
    if (!label) continue
    const list = labelMap.get(row.task_id) ?? []
    list.push(label)
    labelMap.set(row.task_id, list)
  }

  return tasks.map((task) => ({
    ...task,
    assignees: assigneeMap.get(task.id) ?? [],
    labels: labelMap.get(task.id) ?? [],
  }))
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchTasks = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    const [tasksRes, assigneesRes, labelsRes] = await Promise.all([
      supabase.from('tasks').select('*').order('position', { ascending: true }),
      supabase.from('task_assignees').select('task_id, member_id, team_members(*)'),
      supabase.from('task_labels').select('task_id, label_id, labels(*)'),
    ])

    if (tasksRes.error) {
      setError(tasksRes.error.message)
      setLoading(false)
      return
    }

    const merged = mergeTaskRelations(
      tasksRes.data ?? [],
      assigneesRes.data ?? [],
      labelsRes.data ?? [],
    )

    setTasks(merged)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (input: CreateTaskInput) => {
    if (!userId) return null

    setSaving(true)
    setError(null)

    const status = input.status ?? 'todo'
    const columnTasks = tasks.filter((t) => t.status === status)
    const position = columnTasks.length

    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? 'normal',
        due_date: input.due_date ?? null,
        status,
        position,
      })
      .select()
      .single()

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return null
    }

    const taskId = data.id

    if (input.assigneeIds?.length) {
      const { error: assigneeError } = await supabase.from('task_assignees').insert(
        input.assigneeIds.map((member_id) => ({ task_id: taskId, member_id })),
      )
      if (assigneeError) {
        setError(assigneeError.message)
        return null
      }
    }

    if (input.labelIds?.length) {
      const { error: labelError } = await supabase.from('task_labels').insert(
        input.labelIds.map((label_id) => ({ task_id: taskId, label_id })),
      )
      if (labelError) {
        setError(labelError.message)
        return null
      }
    }

    const [assigneesRes, labelsRes] = await Promise.all([
      supabase.from('task_assignees').select('task_id, member_id, team_members(*)').eq('task_id', taskId),
      supabase.from('task_labels').select('task_id, label_id, labels(*)').eq('task_id', taskId),
    ])

    const merged = mergeTaskRelations([data], assigneesRes.data ?? [], labelsRes.data ?? [])
    const newTask = merged[0]
    setTasks((prev) => [...prev, newTask])
    return newTask
  }

  const updateTask = async (id: string, input: UpdateTaskInput) => {
    setSaving(true)
    setError(null)

    const { data, error: updateError } = await supabase
      .from('tasks')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return false
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, assignees: t.assignees, labels: t.labels } : t)),
    )
    return true
  }

  const deleteTask = async (id: string) => {
    setSaving(true)
    setError(null)

    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id)

    setSaving(false)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setTasks((prev) => prev.filter((t) => t.id !== id))
    return true
  }

  const moveTask = async (
    taskId: string,
    newStatus: TaskStatus,
    newPosition: number,
    optimisticTasks: TaskWithRelations[],
  ) => {
    const previous = tasks
    setTasks(optimisticTasks)
    setSaving(true)
    setError(null)

    const { error: moveError } = await supabase
      .from('tasks')
      .update({ status: newStatus, position: newPosition })
      .eq('id', taskId)

    if (moveError) {
      setTasks(previous)
      setError(moveError.message)
      setSaving(false)
      return false
    }

    const statuses = [...new Set(optimisticTasks.map((t) => t.status))]
    const updates = statuses.flatMap((status) =>
      optimisticTasks
        .filter((t) => t.status === status)
        .map((t, index) => ({ id: t.id, position: index })),
    )

    await Promise.all(
      updates.map(({ id, position }) =>
        supabase.from('tasks').update({ position }).eq('id', id),
      ),
    )

    setSaving(false)
    return true
  }

  const setAssignees = async (taskId: string, memberIds: string[]) => {
    setSaving(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('task_assignees')
      .delete()
      .eq('task_id', taskId)

    if (deleteError) {
      setSaving(false)
      setError(deleteError.message)
      return false
    }

    if (memberIds.length > 0) {
      const { error: insertError } = await supabase.from('task_assignees').insert(
        memberIds.map((member_id) => ({ task_id: taskId, member_id })),
      )

      if (insertError) {
        setSaving(false)
        setError(insertError.message)
        return false
      }
    }

    setSaving(false)
    await fetchTasks()
    return true
  }

  const setLabels = async (taskId: string, labelIds: string[]) => {
    setSaving(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('task_labels')
      .delete()
      .eq('task_id', taskId)

    if (deleteError) {
      setSaving(false)
      setError(deleteError.message)
      return false
    }

    if (labelIds.length > 0) {
      const { error: insertError } = await supabase.from('task_labels').insert(
        labelIds.map((label_id) => ({ task_id: taskId, label_id })),
      )

      if (insertError) {
        setSaving(false)
        setError(insertError.message)
        return false
      }
    }

    setSaving(false)
    await fetchTasks()
    return true
  }

  return {
    tasks,
    loading,
    error,
    saving,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    setAssignees,
    setLabels,
  }
}
