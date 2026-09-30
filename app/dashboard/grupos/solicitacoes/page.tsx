import { getPendingRequests } from './actions'
import { PendingRequests } from '@/components/pending-requests'

export default async function SolicitacoesPage() {
  const requests = await getPendingRequests()
  return <PendingRequests initialRequests={requests} />
}
