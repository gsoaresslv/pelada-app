import { createClient } from '@/lib/supabase/server'
import { GroupSearch } from '@/components/group-search'

export default async function BuscarGruposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: allGroups }, { data: myMemberships }] = await Promise.all([
    supabase.from('groups').select('id, name, description, schedule_info').order('name'),
    supabase.from('group_members').select('group_id, status').eq('user_id', user!.id),
  ])

  const statusByGroup = new Map((myMemberships ?? []).map((m) => [m.group_id, m.status]))
  const groups = (allGroups ?? []).map((g) => ({
    ...g,
    myStatus: (statusByGroup.get(g.id) as 'pending' | 'active' | undefined) ?? null,
  }))

  return <GroupSearch groups={groups} />
}
