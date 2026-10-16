"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function sendResetLink(formData: FormData) {
  const email = formData.get("email")?.toString();

  if (!email) {
    redirect("/esqueci-senha?error=O e-mail é obrigatório.");
  }

  const supabase = await createClient();

  // Dispara o e-mail de recuperação
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Redireciona o usuário para a página de criar a nova senha após clicar no e-mail
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/nova-senha`,
  });

  if (error) {
    redirect(`/esqueci-senha?error=${error.message}`);
  }

  // Redireciona para a tela de sucesso
  redirect("/esqueci-senha?sucesso=true");
}
