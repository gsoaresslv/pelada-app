'use server'

import { createClient } from '@/lib/supabase/server'

export type PendingRequest = {
  id: string
  group_id: string
  group_name: string
  user_id: string
  full_name: string
  nickname: string
  position: string
}

/** Solicitações pendentes só das peladas onde o usuário logado é owner ou admin. */
export async function getPendingRequests(): Promise<PendingRequest[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: adminGroups } = await supabase
    .from('group_members').select('group_id')
    .eq('user_id', user.id).eq('status', 'active').in('role', ['owner', 'admin'])

  const groupIds = (adminGroups ?? []).map((g) => g.group_id)
  if (groupIds.length === 0) return []

  const { data, error } = await supabase
    .from('group_members')
    .select('id, group_id, user_id, groups(name), profiles(full_name, nickname, position)')
    .eq('status', 'pending')
    .in('group_id', groupIds)
  if (error) throw new Error(error.message)

  return (data ?? []).map((r) => {
    const group = Array.isArray(r.groups) ? r.groups[0] : r.groups
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id: r.id,
      group_id: r.group_id,
      group_name: group?.name ?? '',
      user_id: r.user_id,
      full_name: profile?.full_name ?? '',
      nickname: profile?.nickname ?? '',
      position: profile?.position ?? '',
    }
  })
}

type Result = { error?: string; success?: true }

export async function approveRequest(memberId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('group_members').update({ status: 'active' }).eq('id', memberId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function rejectRequest(memberId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from('group_members').delete().eq('id', memberId)
  if (error) return { error: error.message }
  return { success: true }
}
