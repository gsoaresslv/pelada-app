import Link from 'next/link'
import { createGroup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default async function NovoGrupoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Criar pelada</h1>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <form action={createGroup} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Nome do grupo
          <Input name="name" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Local / dia padrão <span className="text-muted-foreground">(opcional)</span>
          <Input name="schedule_info" placeholder="Ex: Quadra do Zé, terças 20h" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Descrição <span className="text-muted-foreground">(opcional)</span>
          <Textarea name="description" rows={3} />
        </label>
        <Button type="submit">Criar pelada</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="font-medium text-foreground underline underline-offset-4">
          Voltar ao painel
        </Link>
      </p>
    </main>
  )
}
