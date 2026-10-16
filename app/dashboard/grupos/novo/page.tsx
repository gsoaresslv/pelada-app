// app/dashboard/grupos/novo/page.tsx
import { createGroup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TopBar } from "@/components/top-bar";

export default async function NovoGrupoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 p-6">
      <TopBar title="Criar pelada" />
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <form
        action={createGroup}
        className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nome do grupo
          <Input name="name" required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Local / dia padrão{" "}
          <span className="text-muted-foreground">(opcional)</span>
          <Input
            name="schedule_info"
            placeholder="Ex: Quadra do Zé, terças 20h"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Descrição <span className="text-muted-foreground">(opcional)</span>
          <Textarea name="description" rows={3} />
        </label>
        <Button type="submit" className="mt-1">
          Criar pelada
        </Button>
      </form>
    </div>
  );
}
