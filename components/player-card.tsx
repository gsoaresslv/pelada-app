import { cn } from "@/lib/utils";
import type { Player } from "@/lib/teams";

const TIERS = {
  gold: "bg-accent/20 text-accent-foreground ring-accent/50 dark:bg-accent/15 dark:text-accent dark:ring-accent/40",
  silver:
    "bg-slate-400/20 text-slate-700 ring-slate-400/50 dark:bg-slate-300/10 dark:text-slate-200 dark:ring-slate-300/30",
  bronze:
    "bg-orange-700/15 text-orange-800 ring-orange-700/30 dark:bg-orange-600/15 dark:text-orange-300 dark:ring-orange-500/30",
};
const tier = (r: number) =>
  r >= 80 ? TIERS.gold : r >= 65 ? TIERS.silver : TIERS.bronze;

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function StatBar({ label, value }: { label: string; value: number }) {
  const v = Math.min(10, Math.max(0, value));
  return (
    <div className="flex items-center gap-2" role="meter" aria-label={label}>
      <span className="w-6 text-[10px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${v * 10}%` }}
        />
      </div>
      <span className="w-5 text-right text-[10px] tabular-nums text-muted-foreground">
        {v.toFixed(1)}
      </span>
    </div>
  );
}

export function PlayerCard({
  player,
  className,
}: {
  player: Player;
  className?: string;
}) {
  const overall = Math.round(player.rating_display);

  // Decide quais barrinhas desenhar baseado na posição
  const stats =
    player.position === "GOL"
      ? [
          { label: "POS", value: player.avg_pos },
          { label: "ELA", value: player.avg_ela },
          { label: "CLU", value: player.avg_clu },
          { label: "MAN", value: player.avg_man },
          { label: "AGI", value: player.avg_agi },
        ]
      : [
          { label: "RIT", value: player.avg_rit },
          { label: "FIN", value: player.avg_fin },
          { label: "PAS", value: player.avg_pas },
          { label: "DEF", value: player.avg_def },
          { label: "FIS", value: player.avg_fis },
        ];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-2.5 shadow-sm transition-all duration-200",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg ring-1",
          tier(player.rating_display),
        )}
        title={`Overall ${overall}`}
      >
        <span className="font-display text-2xl font-bold leading-none tabular-nums">
          {overall}
        </span>
        <span className="mt-1 text-[11px] font-semibold leading-none">
          {player.position}
        </span>
      </div>

      {player.avatar_url ? (
        <img
          src={player.avatar_url}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
        >
          {initials(player.nickname || player.full_name)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.nickname}</p>
        <div className="mt-1 space-y-[3px]">
          {stats.map((s) => (
            <StatBar key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>
    </div>
  );
}
