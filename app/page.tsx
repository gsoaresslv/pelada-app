import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Pública. Usuário logado nunca chega aqui: o middleware redireciona para /dashboard.
export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Times equilibrados, pelada sem discussão.</h1>
      <p className="text-muted-foreground">
        Avalie os jogadores do seu grupo e sorteie os times com base nas notas.
      </p>
      <Button asChild size="lg">
        <Link href="/login">Entrar</Link>
      </Button>
    </main>
  )
}
