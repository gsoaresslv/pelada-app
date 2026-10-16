import { updatePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function NovaSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Criar nova senha
        </h1>
        <p className="text-sm text-muted-foreground">
          Digite e confirme a nova senha para a sua conta.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <form
        action={updatePassword}
        className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nova Senha
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Confirmar Nova Senha
          <Input
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <Button type="submit" className="mt-1">
          Salvar nova senha
        </Button>
      </form>
    </main>
  );
}
