import { createClient } from '@/lib/supabase/server'

export type UserGroup = { id: string; name: string }

/** Peladas (grupos) em que o usuário logado é membro ativo. */
export async function getUserGroups(): Promise<UserGroup[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('group_members').select('groups(id, name)')
    .eq('user_id', user.id).eq('status', 'active')

  return (data ?? []).flatMap((r) => {
    const g = r.groups as unknown as UserGroup | UserGroup[] | null
    return Array.isArray(g) ? g : g ? [g] : []
  })
}
