import { createClient } from '@/lib/supabase/server'
import { EditProfile } from '@/components/edit-profile'
import type { Player } from '@/lib/teams'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: row } = await supabase.from('player_stats').select('*').eq('id', user!.id).single()

  if (!row) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-sm text-muted-foreground">
        Não foi possível carregar o seu perfil.
      </div>
    )
  }

  const player: Player = {
    ...row,
    avg_attack: Number(row.avg_attack),
    avg_defense: Number(row.avg_defense),
    avg_physical: Number(row.avg_physical),
    ratings_count: Number(row.ratings_count),
    rating_real: Number(row.rating_real),
    rating_display: Number(row.rating_display),
  }

  return <EditProfile player={player} />
}
