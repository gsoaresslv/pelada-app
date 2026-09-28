import { signIn } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Entrar</h1>
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
    </main>
  )
}
