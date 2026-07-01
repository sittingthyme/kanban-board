import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Comment } from '../lib/types'

export function useComments(taskId: string | null, userId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!taskId) {
      setComments([])
      return
    }

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setComments(data ?? [])
    }
    setLoading(false)
  }, [taskId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = async (body: string) => {
    if (!taskId || !userId) return null

    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({ task_id: taskId, user_id: userId, body })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setComments((prev) => [...prev, data])
    return data
  }

  return { comments, loading, error, addComment, fetchComments }
}
