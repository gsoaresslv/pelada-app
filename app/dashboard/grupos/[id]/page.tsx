// app/dashboard/grupos/[id]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GroupDetail } from "@/components/group-detail";
import type { Player } from "@/lib/teams";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, description, schedule_info")
    .eq("id", id)
    .single();

  if (!group) notFound();

  const { data: myMembership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", id)
    .eq("user_id", user!.id)
    .eq("status", "active")
    .maybeSingle();

  const myRole =
    (myMembership?.role as "owner" | "admin" | "member" | undefined) ?? null;

  const { data: memberRows } = await supabase
    .from("group_members")
    .select("user_id, role")
    .eq("group_id", id)
    .eq("status", "active");

  const memberIds = (memberRows ?? []).map((m) => m.user_id);
  const roleByUser = new Map(
    (memberRows ?? []).map((m) => [m.user_id, m.role as string]),
  );

  const { data: statsRows } = memberIds.length
    ? await supabase.from("player_stats").select("*").in("id", memberIds)
    : { data: [] as Record<string, unknown>[] };

  const members = (statsRows ?? [])
    .map((row: any) => ({
      player: {
        ...row,
        avg_attack: Number(row.avg_attack),
        avg_defense: Number(row.avg_defense),
        avg_physical: Number(row.avg_physical),
        ratings_count: Number(row.ratings_count),
        rating_real: Number(row.rating_real),
        rating_display: Number(row.rating_display),
      } as Player,
      role: (roleByUser.get(row.id) ?? "member") as
        | "owner"
        | "admin"
        | "member",
    }))
    .sort((a, b) =>
      a.player.nickname.localeCompare(b.player.nickname, "pt-BR"),
    );

  const isAdmin = myRole === "owner" || myRole === "admin";

  let pendingRequests: {
    id: string;
    full_name: string;
    nickname: string;
    position: string;
  }[] = [];
  if (isAdmin) {
    const { data: pendingRows } = await supabase
      .from("group_members")
      .select("id, profiles(full_name, nickname, position)")
      .eq("group_id", id)
      .eq("status", "pending");

    pendingRequests = (pendingRows ?? []).map((r) => {
      const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      return {
        id: r.id,
        full_name: p?.full_name ?? "",
        nickname: p?.nickname ?? "",
        position: p?.position ?? "",
      };
    });
  }

  return (
    <GroupDetail
      group={group}
      myRole={myRole}
      myUserId={user!.id}
      members={members}
      pendingRequests={pendingRequests}
    />
  );
}
