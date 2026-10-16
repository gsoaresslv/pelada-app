// components/back-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Botão universal de voltar: por padrão usa router.back(), mas aceita um onClick customizado (ex: voltar um passo num wizard). */
export function BackButton({
  onClick,
  label = "Voltar",
}: {
  onClick?: () => void;
  label?: string;
}) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick ?? (() => router.back())}
      aria-label={label}
      className="shrink-0"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
