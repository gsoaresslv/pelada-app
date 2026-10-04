// app/cadastro/page.tsx
import Link from "next/link";
import { signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

const POSITIONS = [
  { value: "GOL", label: "Goleiro" },
  { value: "DEF", label: "Defensor" },
  { value: "MEI", label: "Meio-campo" },
  { value: "ATA", label: "Atacante" },
];

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
        <ThemeToggle />
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
        action={signUp}
        className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nome completo
          <Input name="full_name" autoComplete="name" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Apelido
          <Input name="nickname" autoComplete="nickname" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Posição
          <select
            name="position"
            defaultValue="MEI"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <Input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Senha
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <Button type="submit" className="mt-1">
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </main>
  );
}
