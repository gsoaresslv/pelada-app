import Link from 'next/link'
import { ClipboardList, Shuffle, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PlayerCard } from '@/components/player-card'
import type { Player } from '@/lib/teams'

type GroupRow = { id: string; name: string; role: string }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: statsRow }, { data: memberRows }] = await Promise.all([
    supabase.from('player_stats').select('*').eq('id', user!.id).single(),
    supabase
      .from('group_members').select('role, groups(id, name)')
      .eq('user_id', user!.id).eq('status', 'active'),
  ])

  const me: Player | null = statsRow
    ? {
        ...statsRow,
        avg_attack: Number(statsRow.avg_attack),
        avg_defense: Number(statsRow.avg_defense),
        avg_physical: Number(statsRow.avg_physical),
        ratings_count: Number(statsRow.ratings_count),
        rating_real: Number(statsRow.rating_real),
        rating_display: Number(statsRow.rating_display),
      }
    : null

  const groups: GroupRow[] = (memberRows ?? []).flatMap((r) => {
    const g = r.groups as unknown as { id: string; name: string } | { id: string; name: string }[] | null
    const group = Array.isArray(g) ? g[0] : g
    return group ? [{ ...group, role: r.role as string }] : []
  })

  const ROLE_LABEL: Record<string, string> = { owner: 'Dono', admin: 'Admin', member: 'Membro' }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-4">
      <header>
        <h1 className="text-lg font-semibold">Meu painel</h1>
      </header>

      {/* 1. Resumo do perfil — reaproveita o Card FIFA */}
      {me && <PlayerCard player={me} />}

      {/* 2. Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/sorteio"
          className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:bg-accent"
        >
          <Shuffle className="h-6 w-6" />
          <span className="text-sm font-medium">Sortear Times</span>
        </Link>
        <Link
          href="/dashboard/avaliar"
          className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:bg-accent"
        >
          <ClipboardList className="h-6 w-6" />
          <span className="text-sm font-medium">Avaliar Jogadores</span>
        </Link>
      </div>

      {/* 3. Minhas peladas + 4. Empty state */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Minhas peladas</h2>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Você ainda não faz parte de nenhuma pelada</p>
            <p className="text-sm text-muted-foreground">
              Peça para o organizador do seu grupo te adicionar, ou crie uma nova pelada assim que
              essa opção estiver disponível no app.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {groups.map((g) => (
              <li key={g.id} className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm">
                <span className="font-medium">{g.name}</span>
                <span className="text-xs text-muted-foreground">{ROLE_LABEL[g.role] ?? g.role}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
