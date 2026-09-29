import { getUserGroups } from '@/lib/groups'
import { TeamSplit } from '@/components/team-split'

export default async function SorteioPage() {
  const groups = await getUserGroups()
  return <TeamSplit groups={groups} />
}
