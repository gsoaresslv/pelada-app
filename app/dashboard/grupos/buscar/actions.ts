'use server'

import { createClient } from '@/lib/supabase/server'

type Result = { error?: string; success?: true }

/** Cria a solicitação de entrada (status 'pending'); o dono/admin aprova depois. */
export async function requestToJoin(groupId: string): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Entre novamente.' }

  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: user.id, role: 'member', status: 'pending' })

  if (error) {
    // unique_violation (group_id, user_id): já existe pedido pendente ou você já é membro.
    if (error.code === '23505') {
      return { error: 'Você já tem uma solicitação pendente ou já participa dessa pelada.' }
    }
    return { error: error.message }
  }
  return { success: true }
}
