'use server'

import { createClient } from '@/lib/supabase/server'

export type RateablePlayer = {
  id: string
  full_name: string
  nickname: string
  position: 'GOL' | 'DEF' | 'MEI' | 'ATA'
}

/** Jogadores ativos do grupo, excluindo o próprio usuário logado (RF02). */
export async function getGroupPlayersToRate(groupId: string): Promise<RateablePlayer[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão expirada. Entre novamente.')

  const { data: members, error } = await supabase
    .from('group_members').select('user_id')
    .eq('group_id', groupId).eq('status', 'active')
  if (error) throw new Error(error.message)

  const ids = (members ?? []).map((m) => m.user_id).filter((id) => id !== user.id)
  if (ids.length === 0) return []

  const { data, error: profError } = await supabase
    .from('profiles').select('id, full_name, nickname, position')
    .in('id', ids)
  if (profError) throw new Error(profError.message)

  return (data ?? []).sort((a, b) => a.nickname.localeCompare(b.nickname, 'pt-BR'))
}

type RatingResult = { error?: string; success?: true }

const clamp = (n: number) => Math.min(10, Math.max(0, Math.round(n)))

/** Cria um novo registro em ratings (RF03). Cada envio é um registro imutável e independente. */
export async function submitRating(formData: FormData): Promise<RatingResult> {
  const groupId = String(formData.get('group_id') ?? '')
  const ratedId = String(formData.get('rated_id') ?? '')
  const attack = Number(formData.get('attack'))
  const defense = Number(formData.get('defense'))
  const physical = Number(formData.get('physical'))

  if (!groupId || !ratedId) return { error: 'Selecione a pelada e o jogador.' }
  if ([attack, defense, physical].some((n) => Number.isNaN(n))) {
    return { error: 'Notas inválidas.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Entre novamente.' }
  if (ratedId === user.id) return { error: 'Você não pode avaliar a si mesmo.' }

  const { error } = await supabase.from('ratings').insert({
    rater_id: user.id,
    rated_id: ratedId,
    attack: clamp(attack),
    defense: clamp(defense),
    physical: clamp(physical),
  })
  // O RLS (shares_group_with) barra avaliações fora de um grupo em comum.
  if (error) return { error: error.message }
  return { success: true }
}
