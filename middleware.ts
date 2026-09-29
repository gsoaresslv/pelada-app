import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Redireciona preservando os cookies de sessão renovados
  const redirect = (to: string) => {
    const url = request.nextUrl.clone()
    url.pathname = to
    url.search = ''
    const res = NextResponse.redirect(url)
    response.cookies.getAll().forEach((c) => res.cookies.set(c))
    return res
  }

  const isPrivate = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  if (!user && isPrivate) return redirect('/login')
  if (user && (pathname === '/' || pathname === '/login' || pathname === '/cadastro')) return redirect('/dashboard')

  if (user && pathname.startsWith('/admin')) {
    const { data } = await supabase
      .from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (!data?.is_super_admin) return redirect('/dashboard')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
