import { cn } from '@/lib/utils'
import type { Player } from '@/lib/teams'

const TIERS = {
  gold: 'bg-amber-400/20 text-amber-800 ring-amber-500/40 dark:text-amber-300',
  silver: 'bg-slate-400/20 text-slate-700 ring-slate-400/50 dark:text-slate-200',
  bronze: 'bg-orange-700/15 text-orange-800 ring-orange-700/30 dark:text-orange-300',
}
const tier = (r: number) => (r >= 80 ? TIERS.gold : r >= 65 ? TIERS.silver : TIERS.bronze)

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')

function StatBar({ label, value }: { label: string; value: number }) {
  const v = Math.min(10, Math.max(0, value))
  return (
    <div
      className="flex items-center gap-2"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={Number(v.toFixed(1))}
    >
      <span className="w-6 text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${v * 10}%` }} />
      </div>
      <span className="w-6 text-right text-[11px] tabular-nums text-muted-foreground">
        {v.toFixed(1)}
      </span>
    </div>
  )
}

/** Card compacto estilo FIFA: rating_display em destaque + barras ATA/DEF/FIS (médias 0–10). */
export function PlayerCard({ player, className }: { player: Player; className?: string }) {
  const overall = Math.round(player.rating_display)
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border bg-card p-2.5', className)}>
      <div
        className={cn(
          'flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg ring-1',
          tier(player.rating_display)
        )}
        title={`Overall ${overall}`}
      >
        <span className="text-2xl font-bold leading-none tabular-nums">{overall}</span>
        <span className="mt-1 text-[11px] font-semibold leading-none">{player.position}</span>
      </div>

      {player.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
        >
          {initials(player.nickname || player.full_name)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.nickname}</p>
        <div className="mt-1 space-y-0.5">
          <StatBar label="ATA" value={player.avg_attack} />
          <StatBar label="DEF" value={player.avg_defense} />
          <StatBar label="FIS" value={player.avg_physical} />
        </div>
      </div>
    </div>
  )
}
