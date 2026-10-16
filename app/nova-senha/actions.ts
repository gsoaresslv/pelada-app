"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updatePassword(formData: FormData) {
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirm_password")?.toString();

  if (!password || password.length < 6) {
    redirect("/nova-senha?error=A senha deve ter pelo menos 6 caracteres.");
  }
  
  // Verifica se o campo de confirmação é idêntico à senha
  if (password !== confirmPassword) {
    redirect("/nova-senha?error=As senhas precisam ser iguais.");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect(`/nova-senha?error=${error.message}`);
  }

  // Se der tudo certo, manda pro login com uma mensagem de sucesso
  redirect("/login?registered=Senha atualizada com sucesso! Faça login.");
}
