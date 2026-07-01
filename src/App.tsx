import { useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useTeamMembers } from './hooks/useTeamMembers'
import { useLabels } from './hooks/useLabels'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { Board } from './components/board/Board'
import { CreateTaskModal } from './components/board/CreateTaskModal'
import { TaskDetailPanel } from './components/task/TaskDetailPanel'
import { LoadingScreen, SkeletonBoard } from './components/ui/Spinner'
import { ErrorBanner } from './components/ui/ErrorBanner'
import { ConfigMissing } from './components/ConfigMissing'
import type { TaskStatus, TaskWithRelations } from './lib/types'

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigMissing />
  }

  return <AppContent />
}

function AppContent() {
  const { user, loading: authLoading, error: authError } = useAuth()
  const userId = user?.id

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    saving,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    setAssignees,
    setLabels,
  } = useTasks(userId)

  const {
    members,
    addMember,
    removeMember,
  } = useTeamMembers(userId)

  const {
    labels,
    addLabel,
    removeLabel,
  } = useLabels(userId)

  const { theme, toggleTheme } = useTheme()

  const [search, setSearch] = useState('')
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<TaskStatus>('todo')
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null)

  const error = authError || tasksError

  if (authLoading) return <LoadingScreen />

  return (
    <div className="flex min-h-screen flex-col">
      {error && <ErrorBanner message={error} />}

      <Header
        search={search}
        onSearchChange={setSearch}
        onNewTask={() => {
          setCreateStatus('todo')
          setCreateOpen(true)
        }}
        members={members}
        labels={labels}
        onAddMember={addMember}
        onRemoveMember={removeMember}
        onAddLabel={addLabel}
        onRemoveLabel={removeLabel}
        selectedLabelId={selectedLabelId}
        onLabelFilter={setSelectedLabelId}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="board-grid-bg flex-1 overflow-auto px-6 py-5">
        {tasksLoading ? (
          <SkeletonBoard />
        ) : (
          <Board
            tasks={tasks}
            search={search}
            selectedLabelId={selectedLabelId}
            onMoveTask={moveTask}
            onTaskClick={setSelectedTask}
            onAddTask={(status) => {
              setCreateStatus(status)
              setCreateOpen(true)
            }}
            disabled={saving}
          />
        )}
      </main>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createTask}
        defaultStatus={createStatus}
        saving={saving}
        members={members}
        labels={labels}
      />

      {selectedTask && (
        <>
          <div
            className="fixed inset-0 z-30 bg-overlay"
            onClick={() => setSelectedTask(null)}
          />
          <TaskDetailPanel
            task={tasks.find((t) => t.id === selectedTask.id) ?? selectedTask}
            userId={userId}
            members={members}
            labels={labels}
            onClose={() => setSelectedTask(null)}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onSetAssignees={setAssignees}
            onSetLabels={setLabels}
          />
        </>
      )}
    </div>
  )
}
