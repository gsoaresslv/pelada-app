// app/login/page.tsx
import Link from "next/link";
import { signIn } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { error, registered } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <ThemeToggle />
      </div>

      {registered && !error && (
        <p
          role="status"
          className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          Conta criada! Se a confirmação por e-mail estiver ativa, verifique sua
          caixa de entrada antes de entrar.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <form
        action={signIn}
        className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <Input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Senha
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <Button type="submit" className="mt-1">
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-primary underline underline-offset-4"
        >
          Cadastre-se
        </Link>
      </p>
    </main>
  );
}
