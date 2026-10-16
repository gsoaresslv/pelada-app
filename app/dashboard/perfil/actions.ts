"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { Position } from "@/lib/teams";

const POSITIONS: Position[] = ["GOL", "ZAG", "ALA", "VOL", "MEI", "ATA"];

type Result = { error?: string; success?: true };

/** UPDATE em profiles (colunas liberadas pelo GRANT: full_name, nickname, position). */
export async function updateProfile(formData: FormData): Promise<Result> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const position = String(formData.get("position") ?? "");

  if (!fullName || !nickname)
    return { error: "Preencha nome completo e apelido." };
  if (!POSITIONS.includes(position as Position))
    return { error: "Posição inválida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, nickname, position })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Para excluir a conta definitivamente, usamos o cliente Admin com a chave secreta
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // O Supabase apaga o usuário do auth.users
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Erro ao excluir usuário:", error);
    throw new Error("Não foi possível excluir a conta.");
  }

  await supabase.auth.signOut(); // Limpa os cookies
  redirect("/cadastro?registered=Sua conta foi excluída com sucesso.");
}
