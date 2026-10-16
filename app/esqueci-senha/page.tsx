import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendResetLink } from "./actions";

export default async function EsqueciSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sucesso?: string }>;
}) {
  const { error, sucesso } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recuperar senha
        </h1>
        <p className="text-sm text-muted-foreground">
          Digite seu e-mail para receber um link de redefinição.
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

      {sucesso ? (
        <div className="rounded-lg border bg-card p-5 shadow-sm text-center">
          <p className="text-sm font-medium text-primary mb-4">
            E-mail enviado com sucesso!
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Verifique sua caixa de entrada e sua pasta de spam.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Voltar para o Login
            </Button>
          </Link>
        </div>
      ) : (
        <form
          action={sendResetLink}
          className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm"
        >
          <label className="flex flex-col gap-1 text-sm">
            E-mail
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <Button type="submit" className="mt-1">
            Enviar link
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline underline-offset-4"
        >
          Voltar ao login
        </Link>
      </p>
    </main>
  );
}
