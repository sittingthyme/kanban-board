import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Label } from '../lib/types'

export function useLabels(userId: string | undefined) {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('labels')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setLabels(data ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  const addLabel = async (name: string, color: string) => {
    if (!userId) return null

    const { data, error: insertError } = await supabase
      .from('labels')
      .insert({ user_id: userId, name, color })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setLabels((prev) => [...prev, data])
    return data
  }

  const removeLabel = async (id: string) => {
    const { error: deleteError } = await supabase.from('labels').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setLabels((prev) => prev.filter((l) => l.id !== id))
    return true
  }

  return { labels, loading, error, addLabel, removeLabel, fetchLabels }
}
