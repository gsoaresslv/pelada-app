"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  signOutAction,
  deleteAccountAction,
} from "@/app/dashboard/perfil/actions";

export function AccountSettings() {
  const [isPendingOut, startOut] = useTransition();
  const [isPendingDel, startDel] = useTransition();

  function handleSignOut() {
    if (window.confirm("Tem certeza que deseja sair da sua conta?")) {
      startOut(() => signOutAction());
    }
  }

  function handleDelete() {
    if (
      window.confirm(
        "ALERTA VERMELHO: Essa ação é irreversível! Tem certeza que deseja excluir sua conta e apagar todos os seus dados do sistema?",
      )
    ) {
      startDel(() => deleteAccountAction());
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 pb-20 pt-8 mt-4 border-t">
      <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Ações destrutivas relacionadas à sua conta.
      </p>

      <Button
        variant="outline"
        className="w-full border-destructive text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
        disabled={isPendingOut || isPendingDel}
      >
        {isPendingOut ? "Saindo..." : "Deslogar da conta"}
      </Button>

      <Button
        variant="destructive"
        className="w-full"
        onClick={handleDelete}
        disabled={isPendingOut || isPendingDel}
      >
        {isPendingDel ? "Excluindo..." : "Excluir minha conta"}
      </Button>
    </div>
  );
}
