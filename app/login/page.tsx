import Link from 'next/link'
import { signIn } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>
}) {
  const { error, registered } = await searchParams
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Entrar</h1>
      {registered && !error && (
        <p role="status" className="text-sm text-muted-foreground">
          Conta criada! Se a confirmação por e-mail estiver ativa, verifique sua caixa de entrada antes de entrar.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          E-mail ou senha incorretos.
        </p>
      )}
      <form action={signIn} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <Input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Senha
          <Input name="password" type="password" autoComplete="current-password" required />
        </label>
        <Button type="submit">Entrar</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{' '}
        <Link href="/cadastro" className="font-medium text-foreground underline underline-offset-4">
          Cadastre-se
        </Link>
      </p>
    </main>
  )
}
