'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('full_name') ?? '').trim()
  const nickname = String(formData.get('nickname') ?? '').trim()
  const position = String(formData.get('position') ?? 'MEI')

  if (password.length < 6) {
    redirect(`/cadastro?error=${encodeURIComponent('A senha precisa ter pelo menos 6 caracteres.')}`)
  }

  // full_name/nickname/position vão em options.data: a trigger handle_new_user()
  // no banco lê esses campos de raw_user_meta_data para criar o registro em "profiles".
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, nickname, position } },
  })

  if (error) redirect(`/cadastro?error=${encodeURIComponent(error.message)}`)

  // Se a confirmação por e-mail estiver ativada no projeto Supabase, ainda não há
  // sessão aqui — o usuário só consegue entrar depois de clicar no link do e-mail.
  if (data.session) redirect('/dashboard')
  redirect('/login?registered=1')
}
