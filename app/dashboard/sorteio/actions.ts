'use server'

import { createClient } from '@/lib/supabase/server'
import type { Player } from '@/lib/teams'

/** Lê no servidor (sessão HttpOnly). O RLS garante que só membros do grupo enxergam a lista. */
export async function getGroupPlayers(groupId: string): Promise<Player[]> {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('group_members').select('user_id')
    .eq('group_id', groupId).eq('status', 'active')
  if (error) throw new Error(error.message)

  const { data, error: statsError } = await supabase
    .from('player_stats').select('*')
    .in('id', (members ?? []).map((m) => m.user_id))
  if (statsError) throw new Error(statsError.message)

  return (data ?? [])
    .map((r) => ({
      ...r,
      avg_attack: Number(r.avg_attack),
      avg_defense: Number(r.avg_defense),
      avg_physical: Number(r.avg_physical),
      ratings_count: Number(r.ratings_count),
      rating_real: Number(r.rating_real),
      rating_display: Number(r.rating_display),
    }) as Player)
    .sort((a, b) => a.nickname.localeCompare(b.nickname, 'pt-BR'))
}
