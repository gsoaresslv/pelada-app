import { createClient } from "@/lib/supabase/server";
import { EditProfile } from "@/components/edit-profile";
import { AccountSettings } from "@/components/account-settings"; // <-- Importe aqui
import type { Player } from "@/lib/teams";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: row } = await supabase
    .from("player_stats")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!row) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-sm text-muted-foreground">
        Não foi possível carregar o seu perfil.
      </div>
    );
  }

  const player: Player = {
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
  };

  return (
    <>
      <EditProfile player={player} />
      <AccountSettings /> {/* <-- Adicione os botões aqui */}
    </>
  );
}
