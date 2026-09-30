'use client'

import { useMemo, useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  getGroupPlayersToRate, submitRating, type RateablePlayer,
} from '@/app/dashboard/avaliar/actions'

type Group = { id: string; name: string }
type Scores = { attack: number; defense: number; physical: number }

const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const CRITERIA: { key: keyof Scores; label: string; hint: string }[] = [
  { key: 'attack', label: 'Ataque', hint: 'Finalização, passe, dribles' },
  { key: 'defense', label: 'Defesa', hint: 'Desarme, posicionamento, marcação' },
  { key: 'physical', label: 'Físico', hint: 'Velocidade, resistência, força' },
]

const BASE_SCORES: Scores = { attack: 5, defense: 5, physical: 5 }

/** RF03: dropdowns encadeados (pelada → jogador) + sliders 0–10 + salvar. */
export function RatePlayer({ groups }: { groups: Group[] }) {
  const [groupId, setGroupId] = useState('')
  const [players, setPlayers] = useState<RateablePlayer[]>([])
  const [query, setQuery] = useState('')
  const [ratedId, setRatedId] = useState('')
  const [scores, setScores] = useState<Scores>(BASE_SCORES)
  const [lastRatedId, setLastRatedId] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [loadingPlayers, startLoad] = useTransition()
  const [saving, startSave] = useTransition()

  const visible = useMemo(() => {
    const q = fold(query.trim())
    return q
      ? players.filter((p) => fold(p.nickname).includes(q) || fold(p.full_name).includes(q))
      : players
  }, [players, query])

  const ratedPlayer = players.find((p) => p.id === ratedId) ?? null

  function pickGroup(id: string) {
    setGroupId(id)
    setRatedId('')
    setLastRatedId('')
    setQuery('')
    setMessage(null)
    setPlayers([])
    if (!id) return
    startLoad(async () => {
      try {
        setPlayers(await getGroupPlayersToRate(id))
      } catch {
        setMessage({ type: 'error', text: 'Não foi possível carregar os jogadores dessa pelada.' })
      }
    })
  }

  function pickPlayer(id: string) {
    setRatedId(id)
    setScores(BASE_SCORES)
    setMessage(null)
  }

  function save() {
    if (!groupId || !ratedId) return
    const fd = new FormData()
    fd.set('group_id', groupId)
    fd.set('rated_id', ratedId)
    fd.set('attack', String(scores.attack))
    fd.set('defense', String(scores.defense))
    fd.set('physical', String(scores.physical))

    const nickname = ratedPlayer?.nickname
    startSave(async () => {
      const result = await submitRating(fd)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
        return
      }
      setMessage({ type: 'success', text: `Avaliação de ${nickname} enviada!` })
      setLastRatedId(ratedId)
      // Fica na lista de propósito: o PRD permite reavaliar o mesmo jogador depois.
      // Cada envio cria um novo registro imutável em "ratings" — não substitui o anterior.
      setRatedId('')
      setScores(BASE_SCORES)
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-28 pt-4">
      <header>
        <h1 className="text-lg font-semibold">Avaliar jogador</h1>
        <p className="text-sm text-muted-foreground">As notas ajudam a equilibrar os times.</p>
      </header>

      {message && (
        <p
          role="status"
          className={cn(
            'rounded-lg px-3 py-2 text-sm',
            message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          )}
        >
          {message.text}
        </p>
      )}

      {/* Dropdown 1: Pelada */}
      <label className="flex flex-col gap-1 text-sm">
        Pelada
        <select
          value={groupId}
          onChange={(e) => pickGroup(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Selecione uma pelada</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        {groups.length === 0 && (
          <span className="text-xs text-muted-foreground">
            Você ainda não participa de nenhuma pelada.
          </span>
        )}
      </label>

      {/* Dropdown 2: Jogador — bloqueado até escolher a pelada */}
      <div className="flex flex-col gap-2">
        <span className="text-sm">Jogador a avaliar</span>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={groupId ? 'Buscar por nome ou apelido' : 'Escolha uma pelada primeiro'}
            disabled={!groupId}
            className="pl-9"
          />
        </div>
        {groupId && (
          <ul className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-lg border p-1">
            {loadingPlayers && <li className="p-2 text-sm text-muted-foreground">Carregando…</li>}
            {!loadingPlayers && visible.length === 0 && (
              <li className="p-2 text-sm text-muted-foreground">Nenhum jogador encontrado.</li>
            )}
            {visible.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => pickPlayer(p.id)}
                  aria-pressed={ratedId === p.id}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent',
                    ratedId === p.id && 'bg-accent font-medium'
                  )}
                >
                  <span>{p.nickname}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {p.id === lastRatedId && p.id !== ratedId && (
                      <span className="text-primary">Avaliado ✓</span>
                    )}
                    {p.position}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sliders 0–10 */}
      {ratedPlayer && (
        <div className="flex flex-col gap-5 rounded-xl border bg-card p-4">
          <p className="text-sm font-medium">Avaliando: {ratedPlayer.nickname}</p>
          {CRITERIA.map(({ key, label, hint }) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="tabular-nums text-muted-foreground">{scores[key].toFixed(0)}</span>
              </div>
              <Slider
                min={0}
                max={10}
                step={1}
                value={[scores[key]]}
                onValueChange={([v]) => setScores((s) => ({ ...s, [key]: v }))}
                aria-label={label}
              />
              <span className="text-xs text-muted-foreground">{hint}</span>
            </div>
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md">
          <Button className="w-full" disabled={!ratedId || saving} onClick={save}>
            {saving ? 'Salvando…' : 'Salvar avaliação'}
          </Button>
        </div>
      </div>
    </div>
  )
}
