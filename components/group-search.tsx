'use client'

import { useMemo, useState, useTransition } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestToJoin } from '@/app/dashboard/grupos/buscar/actions'

type Group = {
  id: string
  name: string
  description: string | null
  schedule_info: string | null
  myStatus: 'pending' | 'active' | null
}

const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function GroupSearch({ groups: initial }: { groups: Group[] }) {
  const [groups, setGroups] = useState(initial)
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const visible = useMemo(() => {
    const q = fold(query.trim())
    return q ? groups.filter((g) => fold(g.name).includes(q)) : groups
  }, [groups, query])

  function join(id: string) {
    setBusyId(id)
    setMessage(null)
    startTransition(async () => {
      const result = await requestToJoin(id)
      setBusyId(null)
      if (result?.error) {
        setMessage(result.error)
        return
      }
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, myStatus: 'pending' } : g)))
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-10 pt-4">
      <header>
        <h1 className="text-lg font-semibold">Buscar peladas</h1>
        <p className="text-sm text-muted-foreground">Encontre um grupo e peça para entrar.</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome da pelada"
          className="pl-9"
        />
      </div>

      {message && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {visible.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhuma pelada encontrada.</li>
        )}
        {visible.map((g) => (
          <li key={g.id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{g.name}</p>
              {g.schedule_info && (
                <p className="truncate text-xs text-muted-foreground">{g.schedule_info}</p>
              )}
              {g.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{g.description}</p>
              )}
            </div>

            {g.myStatus === 'active' ? (
              <span className="shrink-0 self-center text-xs text-muted-foreground">Você participa</span>
            ) : g.myStatus === 'pending' ? (
              <span className="shrink-0 self-center text-xs text-muted-foreground">Pedido enviado</span>
            ) : (
              <Button
                size="sm"
                disabled={busyId === g.id}
                onClick={() => join(g.id)}
                className={cn('shrink-0 gap-1.5')}
              >
                <UserPlus className="h-4 w-4" />
                Pedir para entrar
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
