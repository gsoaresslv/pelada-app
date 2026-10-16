// app/dashboard/grupos/[id]/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";

type Result = { error?: string; success?: true };

/** Aprova uma solicitação de entrada (status 'pending' -> 'active'). RLS (gm_update) só deixa
 *  owner/admin DO GRUPO fazer isso — nenhuma checagem extra de groupId é necessária aqui. */
export async function approveGroupRequest(requestId: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .update({ status: "active" })
    .eq("id", requestId);
  if (error) return { error: error.message };
  return { success: true };
}

/** Recusa (remove) uma solicitação pendente. RLS (gm_delete) só deixa owner/admin do grupo fazer isso. */
export async function rejectGroupRequest(requestId: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("id", requestId);
  if (error) return { error: error.message };
  return { success: true };
}

/** Promove um membro a admin. A policy gm_update do schema.sql só permite essa troca de role
 *  quando quem executa é o OWNER do grupo — por isso a UI só mostra este botão para o owner. */
export async function promoteToAdmin(
  groupId: string,
  targetUserId: string,
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .update({ role: "admin" })
    .eq("group_id", groupId)
    .eq("user_id", targetUserId)
    .eq("status", "active");
  if (error) return { error: error.message };
  return { success: true };
}

/** Remove um membro ativo do grupo. RLS (gm_delete): admin só remove 'member', owner remove
 *  qualquer um menos a si mesmo, ninguém remove o owner. */
export async function removeGroupMember(
  groupId: string,
  targetUserId: string,
): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", targetUserId)
    .eq("status", "active");
  if (error) return { error: error.message };
  return { success: true };
}
