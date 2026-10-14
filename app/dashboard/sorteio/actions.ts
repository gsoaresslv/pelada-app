//dashboard/sorteio/actions.ts
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
    .map(
      (r) =>
        ({
          ...r,
          avg_fin: Number(r.avg_fin),
          avg_pas: Number(r.avg_pas),
          avg_def: Number(r.avg_def),
          avg_rit: Number(r.avg_rit),
          avg_fis: Number(r.avg_fis),
          avg_ela: Number(r.avg_ela),
          avg_pos: Number(r.avg_pos),
          avg_man: Number(r.avg_man),
          avg_agi: Number(r.avg_agi),
          avg_clu: Number(r.avg_clu),
          ratings_count: Number(r.ratings_count),
          rating_real: Number(r.rating_real),
          rating_display: Number(r.rating_display),
        }) as Player,
    )
    .sort((a, b) => a.nickname.localeCompare(b.nickname, "pt-BR"));
}
