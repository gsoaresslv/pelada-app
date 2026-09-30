'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = String(formData.get('name') ?? '').trim()
  const schedule_info = String(formData.get('schedule_info') ?? '').trim() || null
  const description = String(formData.get('description') ?? '').trim() || null

  if (!name) {
    redirect(`/dashboard/grupos/novo?error=${encodeURIComponent('Dê um nome para a pelada.')}`)
  }

  // created_by = user.id satisfaz a policy groups_insert; a trigger add_group_owner()
  // já cria o group_members com role 'owner' e status 'active' para esse usuário.
  const { error } = await supabase
    .from('groups')
    .insert({ name, schedule_info, description, created_by: user.id })

  if (error) {
    redirect(`/dashboard/grupos/novo?error=${encodeURIComponent(error.message)}`)
  }
  redirect('/dashboard')
}
