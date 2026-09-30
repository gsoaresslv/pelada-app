'use server'

import { createClient } from '@/lib/supabase/server'
import type { Position } from '@/lib/teams'

const POSITIONS: Position[] = ['GOL', 'DEF', 'MEI', 'ATA']

type Result = { error?: string; success?: true }

/** UPDATE em profiles (colunas liberadas pelo GRANT: full_name, nickname, position). */
export async function updateProfile(formData: FormData): Promise<Result> {
  const fullName = String(formData.get('full_name') ?? '').trim()
  const nickname = String(formData.get('nickname') ?? '').trim()
  const position = String(formData.get('position') ?? '')

  if (!fullName || !nickname) return { error: 'Preencha nome completo e apelido.' }
  if (!POSITIONS.includes(position as Position)) return { error: 'Posição inválida.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Entre novamente.' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, nickname, position })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
