"use server";

import { createClient } from "@/lib/supabase/server";
import type { Position } from "@/lib/teams";

export type RateablePlayer = {
  id: string;
  full_name: string;
  nickname: string;
  position: Position;
  previous_rating: Record<string, number> | null;
};

/** RF02: Jogadores ativos do grupo, com a avaliação prévia anexada se existir. */
export async function getGroupPlayersToRate(
  groupId: string,
): Promise<RateablePlayer[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");

  const { data: members, error } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("status", "active");
  if (error) throw new Error(error.message);

  const ids = (members ?? [])
    .map((m) => m.user_id)
    .filter((id) => id !== user.id);
  if (ids.length === 0) return [];

  // Busca em paralelo os perfis e as avaliações que o usuário logado já fez desses caras
  const [{ data: profiles, error: profError }, { data: ratings }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, nickname, position")
        .in("id", ids),
      supabase
        .from("ratings")
        .select("*")
        .eq("rater_id", user.id)
        .in("rated_id", ids),
    ]);

  if (profError) throw new Error(profError.message);

  // Cria um dicionário rápido para anexar a nota ao perfil correspondente
  const ratingsMap = new Map((ratings ?? []).map((r) => [r.rated_id, r]));

  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      full_name: p.full_name,
      nickname: p.nickname,
      position: p.position as Position,
      previous_rating: ratingsMap.get(p.id) ?? null,
    }))
    .sort((a, b) => a.nickname.localeCompare(b.nickname, "pt-BR"));
}

type RatingResult = { error?: string; success?: true };
const clamp = (n: number) => Math.min(10, Math.max(0, Math.round(n)));

/** RF03: O novo motor 1:1. Usa UPSERT para atualizar ou criar a nota única. */
export async function submitRating(formData: FormData): Promise<RatingResult> {
  const groupId = String(formData.get("group_id") ?? "");
  const ratedId = String(formData.get("rated_id") ?? "");
  const position = String(formData.get("position") ?? "");

  if (!groupId || !ratedId) return { error: "Selecione a pelada e o jogador." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };
  if (ratedId === user.id)
    return { error: "Você não pode avaliar a si mesmo." };

let payload: Record<string, string | number> = {
  rater_id: user.id,
  rated_id: ratedId,
};

  // Preenche apenas as 5 colunas relevantes para a posição, mantendo as outras nulas/ignoradas
  if (position === "GOL") {
    payload = {
      ...payload,
      ela: clamp(Number(formData.get("ela"))),
      pos: clamp(Number(formData.get("pos"))),
      man: clamp(Number(formData.get("man"))),
      agi: clamp(Number(formData.get("agi"))),
      clu: clamp(Number(formData.get("clu"))),
    };
  } else {
    payload = {
      ...payload,
      fin: clamp(Number(formData.get("fin"))),
      pas: clamp(Number(formData.get("pas"))),
      def: clamp(Number(formData.get("def"))),
      rit: clamp(Number(formData.get("rit"))),
      fis: clamp(Number(formData.get("fis"))),
    };
  }

  const { error } = await supabase.from("ratings").upsert(payload, {
    onConflict: "rater_id, rated_id",
  });

  if (error) return { error: error.message };
  return { success: true };
}
