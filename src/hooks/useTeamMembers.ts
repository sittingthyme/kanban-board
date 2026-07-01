import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { TeamMember } from '../lib/types'

export function useTeamMembers(userId: string | undefined) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setMembers(data ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const addMember = async (name: string) => {
    if (!userId) return null

    const { data, error: insertError } = await supabase
      .from('team_members')
      .insert({ user_id: userId, name })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setMembers((prev) => [...prev, data])
    return data
  }

  const removeMember = async (id: string) => {
    const { error: deleteError } = await supabase.from('team_members').delete().eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setMembers((prev) => prev.filter((m) => m.id !== id))
    return true
  }

  return { members, loading, error, addMember, removeMember, fetchMembers }
}
