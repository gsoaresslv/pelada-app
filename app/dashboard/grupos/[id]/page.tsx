// app/dashboard/grupos/[id]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GroupDetail } from "@/components/group-detail";
import type { Player } from "@/lib/teams";

type PlayerStatsRow = {
  id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  position: Player["position"];
  avg_fin: number | string;
  avg_pas: number | string;
  avg_def: number | string;
  avg_rit: number | string;
  avg_fis: number | string;
  avg_ela: number | string;
  avg_pos: number | string;
  avg_man: number | string;
  avg_agi: number | string;
  avg_clu: number | string;
  ratings_count: number | string;
  rating_real: number | string;
  rating_display: number | string;
};

const ROLE_WEIGHT: Record<string, number> = {
  owner: 1,
  admin: 2,
  member: 3,
};

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
    : { data: [] };

  const typedStatsRows = (statsRows ?? []) as unknown as PlayerStatsRow[];

  const members = typedStatsRows
    .map((row) => ({
      player: {
        ...row,
        avg_fin: Number(row.avg_fin),
        avg_pas: Number(row.avg_pas),
        avg_def: Number(row.avg_def),
        avg_rit: Number(row.avg_rit),
        avg_fis: Number(row.avg_fis),
        avg_ela: Number(row.avg_ela),
        avg_pos: Number(row.avg_pos),
        avg_man: Number(row.avg_man),
        avg_agi: Number(row.avg_agi),
        avg_clu: Number(row.avg_clu),
        ratings_count: Number(row.ratings_count),
        rating_real: Number(row.rating_real),
        rating_display: Number(row.rating_display),
      } as Player,
      role: (roleByUser.get(row.id) ?? "member") as
        | "owner"
        | "admin"
        | "member",
    }))
    .sort((a, b) => {
      const weightA = ROLE_WEIGHT[a.role] ?? 99; 
      const weightB = ROLE_WEIGHT[b.role] ?? 99;

      const roleDifference = weightA - weightB;
      if (roleDifference !== 0) {
        return roleDifference;
      }
      return a.player.nickname.localeCompare(b.player.nickname, "pt-BR");
    });

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
