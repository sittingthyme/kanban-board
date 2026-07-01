export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Label {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  body: string
  created_at: string
}

export interface TaskWithRelations extends Task {
  assignees: TeamMember[]
  labels: Label[]
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string | null
  status?: TaskStatus
  assigneeIds?: string[]
  labelIds?: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  priority?: TaskPriority
  due_date?: string | null
  status?: TaskStatus
  position?: number
}

export const COLUMNS: { id: TaskStatus; title: string; headerColor: string }[] = [
  { id: 'todo', title: 'TO DO', headerColor: '#0d9488' },
  { id: 'in_progress', title: 'IN PROGRESS', headerColor: '#f97316' },
  { id: 'in_review', title: 'IN REVIEW', headerColor: '#1e3a5f' },
  { id: 'done', title: 'DONE', headerColor: '#22c55e' },
]

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#0ea5e9' },
  { value: 'normal', label: 'Normal', color: '#6366f1' },
  { value: 'high', label: 'High', color: '#ef4444' },
]

export const LABEL_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#06b6d4',
  '#64748b',
]

export const MEMBER_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#22c55e',
  '#06b6d4',
  '#ef4444',
  '#a855f7',
]

