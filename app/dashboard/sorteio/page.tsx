import { createClient } from '@/lib/supabase/server'
import { TeamSplit } from '@/components/team-split'

export default async function SorteioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('group_members').select('groups(id, name)')
    .eq('user_id', user!.id).eq('status', 'active')

  const groups = (data ?? []).flatMap((r) => {
    const g = r.groups as unknown as { id: string; name: string } | { id: string; name: string }[] | null
    return Array.isArray(g) ? g : g ? [g] : []
  })

  return <TeamSplit groups={groups} />
}
