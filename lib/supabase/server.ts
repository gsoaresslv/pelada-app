import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = { name: string; value: string; options?: CookieOptionsWithName }

/** Cookies de sessão HttpOnly: o navegador nunca lê o token; só o servidor. */
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list: CookieToSet[]) {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, httpOnly: true })
            )
          } catch {
            // Chamado de Server Component: o middleware já renova a sessão.
          }
        },
      },
    }
  )
}
