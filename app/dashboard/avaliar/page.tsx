import { getUserGroups } from '@/lib/groups'
import { RatePlayer } from '@/components/rate-player'

export default async function AvaliarPage() {
  const groups = await getUserGroups()
  return <RatePlayer groups={groups} />
}
