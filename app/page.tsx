// app/page.tsx
import Link from "next/link";
import { Shuffle, Star, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

const HIGHLIGHTS = [
  { icon: Shuffle, text: "Times equilibrados em segundos" },
  { icon: Star, text: "Notas por Ataque, Defesa e Físico" },
  { icon: Users, text: "Peladas organizadas em grupos" },
];

// Pública. Usuário logado nunca chega aqui: o middleware redireciona para /dashboard.
export default function Landing() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70dvh] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:repeating-linear-gradient(0deg,hsl(var(--foreground))_0,hsl(var(--foreground))_1px,transparent_1px,transparent_64px)]"
      />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent-foreground dark:text-accent">
            Pelada App
          </span>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Times equilibrados, pelada sem discussão.
          </h1>
          <p className="max-w-[34ch] text-muted-foreground">
            Avalie os jogadores do seu grupo e deixe o sorteio montar os times
            certos, toda semana.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 text-sm text-foreground/90"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <Button asChild size="lg" className="flex-1">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
