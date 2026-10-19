import { Resend } from "resend";

// Inicializa o cliente puxando a chave que você colocou no .env.local
export const resend = new Resend(process.env.RESEND_API_KEY);

// Função genérica que reaproveitaremos em todas as nossas Actions
export async function sendAppEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Pelada App <onboarding@resend.dev>", // O remetente padrão de teste do Resend
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Erro do Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Falha ao disparar e-mail:", err);
    return { success: false, error: "Falha no servidor de e-mail" };
  }
}
