// components/team-split.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { Repeat2, Search, Shuffle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PlayerCard } from "@/components/player-card";
import { TopBar } from "@/components/top-bar";
import { getGroupPlayers } from "@/app/dashboard/sorteio/actions";
import {
  MIN_PER_TEAM,
  canDraw,
  drawTeams,
  resortTeams,
  type Draw,
  type Player,
} from "@/lib/teams";

type Group = { id: string; name: string };
type Step = "group" | "presence" | "config" | "result";

const STEPS: { id: Step; title: string }[] = [
  { id: "group", title: "Escolha a pelada" },
  { id: "presence", title: "Quem vai jogar hoje?" },
  { id: "config", title: "Quantos times?" },
  { id: "result", title: "Times sorteados" },
];

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const avg = (list: Player[]) =>
  list.length
    ? Math.round(list.reduce((s, p) => s + p.rating_display, 0) / list.length)
    : 0;

export function TeamSplit({ groups }: { groups: Group[] }) {
  const [step, setStep] = useState<Step>("group");
  const [players, setPlayers] = useState<Player[]>([]);
  const [present, setPresent] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [n, setN] = useState(2);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const confirmed = useMemo(
    () => players.filter((p) => present.has(p.id)),
    [players, present],
  );
  const visible = useMemo(() => {
    const q = fold(query.trim());
    return q
      ? players.filter(
          (p) => fold(p.nickname).includes(q) || fold(p.full_name).includes(q),
        )
      : players;
  }, [players, query]);

  const minToStart = 2 * MIN_PER_TEAM;
  const maxTeams = Math.min(5, Math.floor(confirmed.length / MIN_PER_TEAM));
  const reserveCount = n > 0 ? confirmed.length % n : 0;

  function pickGroup(g: Group) {
    setMessage(null);
    setPresent(new Set());
    setDraw(null);
    setQuery("");
    start(async () => {
      try {
        setPlayers(await getGroupPlayers(g.id));
        setStep("presence");
      } catch {
        setMessage("Não foi possível carregar os jogadores. Tente de novo.");
      }
    });
  }

  function toggle(id: string, on: boolean) {
    setPresent((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function goConfig() {
    setN((cur) => Math.min(Math.max(cur, 2), Math.max(2, maxTeams)));
    setStep("config");
  }

  function runDraw() {
    setDraw(drawTeams(confirmed, n));
    setMessage(null);
    setStep("result");
  }

  function runResort() {
    if (!draw) return;
    const r = resortTeams(draw);
    setDraw(r.draw);
    setMessage(
      r.swaps
        ? `${r.swaps} trocas feitas entre jogadores da mesma posição.`
        : "Não há trocas possíveis sem desequilibrar os times.",
    );
  }

  const back = () => setStep(STEPS[Math.max(0, stepIndex - 1)].id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-28 pt-4">
      <TopBar
        title={STEPS[stepIndex].title}
        subtitle={`Passo ${stepIndex + 1} de ${STEPS.length}`}
        onBack={stepIndex > 0 ? back : undefined}
      />

      {message && (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
          {message}
        </p>
      )}

      {step === "group" && (
        <ul className="flex flex-col gap-2">
          {groups.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Você ainda não participa de nenhuma pelada. Crie uma ou peça para
              entrar.
            </li>
          )}
          {groups.map((g) => (
            <li key={g.id}>
              <button
                disabled={pending}
                onClick={() => pickGroup(g)}
                className="w-full rounded-xl border bg-card p-4 text-left text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
              >
                {g.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {step === "presence" && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou apelido"
              className="pl-9"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {confirmed.length} confirmados
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresent(new Set(players.map((p) => p.id)))}
              >
                Marcar todos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresent(new Set())}
              >
                Limpar
              </Button>
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {visible.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={present.has(p.id)}
                    onCheckedChange={(v) => toggle(p.id, v === true)}
                    aria-label={`Confirmar ${p.nickname}`}
                  />
                  <PlayerCard player={p} className="flex-1" />
                </label>
              </li>
            ))}
            {visible.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Nenhum jogador encontrado.
              </li>
            )}
          </ul>
        </>
      )}

      {step === "config" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm">
            <strong>{confirmed.length}</strong> jogadores confirmados.
          </p>
          <div
            role="radiogroup"
            aria-label="Número de times"
            className="grid grid-cols-4 gap-2"
          >
            {[2, 3, 4, 5].map((v) => (
              <Button
                key={v}
                role="radio"
                aria-checked={n === v}
                variant={n === v ? "default" : "outline"}
                disabled={!canDraw(confirmed.length, v)}
                onClick={() => setN(v)}
              >
                {v}
              </Button>
            ))}
          </div>
          {!canDraw(confirmed.length, n) ? (
            <p className="text-sm text-destructive">
              Cada time precisa de pelo menos {MIN_PER_TEAM} jogadores. Confirme
              mais {n * MIN_PER_TEAM - confirmed.length} para {n} times.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {n} times de {Math.floor(confirmed.length / n)} jogadores
              {reserveCount > 0 &&
                `, e ${reserveCount} no Time ${n + 1} (reserva)`}
              .
            </p>
          )}
        </div>
      )}

      {step === "result" && draw && (
        <Accordion
          type="multiple"
          defaultValue={[...draw.teams.map((_, i) => `t${i}`), "reserve"]}
        >
          {draw.teams.map((team, i) => (
            <AccordionItem key={i} value={`t${i}`}>
              <AccordionTrigger>
                <span className="flex flex-1 items-baseline justify-between pr-2">
                  <span className="font-semibold">Time {i + 1}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {team.length} jogadores · média {avg(team)}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-2">
                {team.map((p) => (
                  <PlayerCard key={p.id} player={p} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
          <AccordionItem value="reserve">
            <AccordionTrigger>
              <span className="flex flex-1 items-baseline justify-between pr-2">
                <span className="font-semibold">
                  Time {draw.teams.length + 1} · Reserva
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  aguardando próximo rodízio
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              {draw.reserve.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Todos os confirmados jogam.
                </p>
              )}
              {draw.reserve.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {(step === "presence" || step === "config" || step === "result") && (
        <div className="fixed inset-x-0 bottom-0 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-md gap-2">
            {step === "presence" && (
              <Button
                className="flex-1"
                disabled={confirmed.length < minToStart}
                onClick={goConfig}
              >
                Continuar com {confirmed.length}
              </Button>
            )}
            {step === "config" && (
              <Button
                className="flex-1"
                disabled={!canDraw(confirmed.length, n)}
                onClick={runDraw}
              >
                Sortear times
              </Button>
            )}
            {step === "result" && (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={runResort}
                >
                  <Repeat2 className="mr-2 h-4 w-4" /> Re-sort
                </Button>
                <Button className="flex-1" onClick={runDraw}>
                  <Shuffle className="mr-2 h-4 w-4" /> Sortear de novo
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
