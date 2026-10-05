// components/group-detail.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Check,
  Crown,
  Search,
  Shield,
  UserCog,
  UserMinus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerCard } from "@/components/player-card";
import { TopBar } from "@/components/top-bar";
import type { Player } from "@/lib/teams";
import {
  approveGroupRequest,
  rejectGroupRequest,
  promoteToAdmin,
  removeGroupMember,
} from "@/app/dashboard/grupos/[id]/actions";

type Role = "owner" | "admin" | "member";
type Member = { player: Player; role: Role };
type PendingRequest = {
  id: string;
  full_name: string;
  nickname: string;
  position: string;
};
type Group = {
  id: string;
  name: string;
  description: string | null;
  schedule_info: string | null;
};

const ROLE_LABEL: Record<Role, string> = {
  owner: "Dono",
  admin: "Admin",
  member: "Membro",
};
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        role === "owner"
          ? "bg-accent/20 text-accent-foreground dark:text-accent"
          : role === "admin"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
      )}
    >
      {role === "owner" && <Crown className="h-3.5 w-3.5" />}
      {role === "admin" && <Shield className="h-3.5 w-3.5" />}
      {ROLE_LABEL[role]}
    </span>
  );
}

/** Detalhe do grupo: membros + (se owner/admin) solicitações pendentes, promoção e remoção. */
export function GroupDetail({
  group,
  myRole,
  myUserId,
  members: initialMembers,
  pendingRequests: initialPending,
}: {
  group: Group;
  myRole: Role | null;
  myUserId: string;
  members: Member[];
  pendingRequests: PendingRequest[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [pending, setPending] = useState(initialPending);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [, startTransition] = useTransition();

  const isOwner = myRole === "owner";
  const isAdmin = myRole === "owner" || myRole === "admin";

  const visibleMembers = useMemo(() => {
    const q = fold(query.trim());
    return q
      ? members.filter(
          (m) =>
            fold(m.player.nickname).includes(q) ||
            fold(m.player.full_name).includes(q),
        )
      : members;
  }, [members, query]);

  function respondRequest(
    id: string,
    action: "approve" | "reject",
    nickname: string,
  ) {
    setBusyId(id);
    setMessage(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveGroupRequest(id)
          : await rejectGroupRequest(id);
      setBusyId(null);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setPending((prev) => prev.filter((r) => r.id !== id));
      if (action === "approve") {
        // O novo membro só aparece com o Card FIFA completo depois de recarregar a página
        // (os dados de rating vêm de player_stats, que não foi buscado de novo aqui).
        setMessage({
          type: "success",
          text: `${nickname} entrou na pelada. Atualize a página para vê-lo na lista.`,
        });
      }
    });
  }

  function promote(userId: string, nickname: string) {
    setBusyId(userId);
    setMessage(null);
    startTransition(async () => {
      const result = await promoteToAdmin(group.id, userId);
      setBusyId(null);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.player.id === userId ? { ...m, role: "admin" } : m)),
      );
      setMessage({ type: "success", text: `${nickname} agora é admin.` });
    });
  }

  function remove(userId: string, nickname: string) {
    setBusyId(userId);
    setMessage(null);
    setConfirmRemoveId(null);
    startTransition(async () => {
      const result = await removeGroupMember(group.id, userId);
      setBusyId(null);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMembers((prev) => prev.filter((m) => m.player.id !== userId));
      setMessage({
        type: "success",
        text: `${nickname} foi removido da pelada.`,
      });
    });
  }

  if (!myRole) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-10 pt-4">
        <TopBar title={group.name} />
        <p className="text-sm text-muted-foreground">
          Você não participa desta pelada.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-4">
      <TopBar title={group.name} subtitle={group.schedule_info ?? undefined} />

      <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <RoleBadge role={myRole} />
          <span className="text-xs text-muted-foreground">
            {members.length} membros
          </span>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground">{group.description}</p>
        )}
      </div>

      {message && (
        <p
          role="status"
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            message.type === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary",
          )}
        >
          {message.text}
        </p>
      )}

      {isAdmin && pending.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Solicitações pendentes ({pending.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {pending.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.nickname}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.position}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={busyId === r.id}
                    onClick={() => respondRequest(r.id, "reject", r.nickname)}
                    aria-label={`Recusar ${r.nickname}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    disabled={busyId === r.id}
                    onClick={() => respondRequest(r.id, "approve", r.nickname)}
                    aria-label={`Aprovar ${r.nickname}`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Membros</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou apelido"
            className="pl-9"
          />
        </div>

        <ul className="flex flex-col gap-2">
          {visibleMembers.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Nenhum membro encontrado.
            </li>
          )}
          {visibleMembers.map(({ player, role }) => {
            const canPromote = isOwner && role === "member";
            const canRemove =
              (isOwner && role !== "owner") ||
              (myRole === "admin" && role === "member");
            const isMe = player.id === myUserId;

            return (
              <li key={player.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <PlayerCard player={player} className="flex-1" />
                  <RoleBadge role={role} />
                </div>

                {!isMe && (canPromote || canRemove) && (
                  <div className="flex flex-wrap items-center gap-2 pl-1">
                    {canPromote && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === player.id}
                        onClick={() => promote(player.id, player.nickname)}
                        className="gap-1.5"
                      >
                        <UserCog className="h-3.5 w-3.5" /> Promover a Admin
                      </Button>
                    )}
                    {canRemove && confirmRemoveId !== player.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === player.id}
                        onClick={() => setConfirmRemoveId(player.id)}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        <UserMinus className="h-3.5 w-3.5" /> Remover
                      </Button>
                    )}
                    {canRemove && confirmRemoveId === player.id && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Remover {player.nickname}?
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === player.id}
                          onClick={() => remove(player.id, player.nickname)}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmRemoveId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
