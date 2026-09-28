import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options?: CookieOptionsWithName }

/** Renova o access token (via refresh token) a cada requisição e devolve o usuário validado. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list: CookieToSet[]) {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, httpOnly: true })
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user, response }
}
