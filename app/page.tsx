// app/dashboard/page.tsx
import Link from "next/link";
import {
  ClipboardList,
  Pencil,
  Search,
  Shuffle,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PlayerCard } from "@/components/player-card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import type { Player } from "@/lib/teams";

type GroupRow = { id: string; name: string; role: string };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: statsRow }, { data: memberRows }] = await Promise.all([
    supabase.from("player_stats").select("*").eq("id", user!.id).single(),
    supabase
      .from("group_members")
      .select("role, groups(id, name)")
      .eq("user_id", user!.id)
      .eq("status", "active"),
  ]);

  const me: Player | null = statsRow
    ? {
        ...statsRow,
        avg_attack: Number(statsRow.avg_attack),
        avg_defense: Number(statsRow.avg_defense),
        avg_physical: Number(statsRow.avg_physical),
        ratings_count: Number(statsRow.ratings_count),
        rating_real: Number(statsRow.rating_real),
        rating_display: Number(statsRow.rating_display),
      }
    : null;

  const groups: GroupRow[] = (memberRows ?? []).flatMap((r) => {
    const g = r.groups as unknown as
      | { id: string; name: string }
      | { id: string; name: string }[]
      | null;
    const group = Array.isArray(g) ? g[0] : g;
    return group ? [{ ...group, role: r.role as string }] : [];
  });

  const ROLE_LABEL: Record<string, string> = {
    owner: "Dono",
    admin: "Admin",
    member: "Membro",
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-4">
      <TopBar title="Meu painel" hideBack />

      {/* 1. Resumo do perfil — Card FIFA clicável, leva para /dashboard/perfil */}
      {me && (
        <Link
          href="/dashboard/perfil"
          className="group relative block rounded-xl transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlayerCard player={me} className="group-hover:shadow-md" />
          <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-110">
            <Pencil className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}

      {/* 2. Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/sorteio"
          className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shuffle className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">Sortear Times</span>
        </Link>
        <Link
          href="/dashboard/avaliar"
          className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-accent/50 hover:shadow-md active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-foreground dark:text-accent">
            <ClipboardList className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">Avaliar Jogadores</span>
        </Link>
      </div>

      {/* 3. Minhas peladas + 4. Empty state */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Minhas peladas
        </h2>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Você ainda não faz parte de nenhuma pelada
            </p>
            <p className="text-sm text-muted-foreground">
              Crie a sua própria pelada ou peça para entrar em uma já existente.
            </p>
            <div className="mt-1 flex w-full gap-2">
              <Button asChild className="flex-1 gap-1.5" size="sm">
                <Link href="/dashboard/grupos/novo">
                  <UserPlus className="h-4 w-4" /> Criar um Grupo
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 gap-1.5"
                size="sm"
                variant="outline"
              >
                <Link href="/dashboard/grupos/buscar">
                  <Search className="h-4 w-4" /> Buscar uma Pelada
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/dashboard/grupos/${g.id}`}
                    className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
                  >
                    <span className="font-medium">{g.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {ROLE_LABEL[g.role] ?? g.role}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex gap-2">
              <Button asChild size="sm" variant="ghost" className="gap-1.5">
                <Link href="/dashboard/grupos/novo">
                  <UserPlus className="h-4 w-4" /> Criar outro grupo
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="gap-1.5">
                <Link href="/dashboard/grupos/buscar">
                  <Search className="h-4 w-4" /> Buscar mais peladas
                </Link>
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
