'use client'

import { useState, useTransition } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  approveRequest, rejectRequest, type PendingRequest,
} from '@/app/dashboard/grupos/solicitacoes/actions'

export function PendingRequests({ initialRequests }: { initialRequests: PendingRequest[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function respond(id: string, action: 'approve' | 'reject') {
    setBusyId(id)
    setMessage(null)
    startTransition(async () => {
      const result = action === 'approve' ? await approveRequest(id) : await rejectRequest(id)
      setBusyId(null)
      if (result?.error) {
        setMessage(result.error)
        return
      }
      setRequests((prev) => prev.filter((r) => r.id !== id))
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-10 pt-4">
      <header>
        <h1 className="text-lg font-semibold">Solicitações de entrada</h1>
        <p className="text-sm text-muted-foreground">Peladas onde você é dono ou admin.</p>
      </header>

      {message && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      )}

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente no momento.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {requests.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.nickname}</p>
                <p className="truncate text-xs text-muted-foreground">{r.group_name} · {r.position}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="icon" variant="outline" disabled={busyId === r.id}
                  onClick={() => respond(r.id, 'reject')} aria-label={`Recusar ${r.nickname}`}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon" disabled={busyId === r.id}
                  onClick={() => respond(r.id, 'approve')} aria-label={`Aprovar ${r.nickname}`}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
