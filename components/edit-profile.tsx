'use client'

import { useMemo, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlayerCard } from '@/components/player-card'
import { computeRatings, type Player, type Position } from '@/lib/teams'
import { updateProfile } from '@/app/dashboard/perfil/actions'

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'ATA', label: 'Ataque' },
  { value: 'MEI', label: 'Meio-campo' },
  { value: 'DEF', label: 'Defesa' },
  { value: 'GOL', label: 'Goleiro' },
]// components/edit-profile.tsx
'use client'

import { useMemo, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlayerCard } from '@/components/player-card'
import { TopBar } from '@/components/top-bar'
import { computeRatings, type Player, type Position } from '@/lib/teams'
import { updateProfile } from '@/app/dashboard/perfil/actions'

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'ATA', label: 'Ataque' },
  { value: 'MEI', label: 'Meio-campo' },
  { value: 'DEF', label: 'Defesa' },
  { value: 'GOL', label: 'Goleiro' },
]

/** RF01: edita nickname/full_name/position com preview do Card FIFA em tempo real. */
export function EditProfile({ player }: { player: Player }) {
  const [fullName, setFullName] = useState(player.full_name)
  const [nickname, setNickname] = useState(player.nickname)
  const [position, setPosition] = useState<Position>(player.position)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [saving, startSave] = useTransition()

  // Avatar propositalmente não editado aqui: PlayerCard já cai para iniciais quando avatar_url é null.
  const preview: Player = useMemo(() => {
    const { rating_real, rating_display } = computeRatings(
      player.avg_attack, player.avg_defense, player.avg_physical, position
    )
    return {
      ...player,
      full_name: fullName,
      nickname: nickname || player.nickname,
      position,
      rating_real,
      rating_display,
    }
  }, [player, fullName, nickname, position])

  function save() {
    setMessage(null)
    const fd = new FormData()
    fd.set('full_name', fullName)
    fd.set('nickname', nickname)
    fd.set('position', position)

    startSave(async () => {
      const result = await updateProfile(fd)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
        return
      }
      setMessage({ type: 'success', text: 'Perfil atualizado!' })
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-10 pt-4">
      <TopBar title="Meu perfil" />

      <PlayerCard player={preview} />

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

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
        <label className="flex flex-col gap-1 text-sm">
          Apelido
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Nome completo
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Posição principal
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as Position)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <Button onClick={save} disabled={saving} className="mt-1">
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}

/** RF01: edita nickname/full_name/position com preview do Card FIFA em tempo real. */
export function EditProfile({ player }: { player: Player }) {
  const [fullName, setFullName] = useState(player.full_name)
  const [nickname, setNickname] = useState(player.nickname)
  const [position, setPosition] = useState<Position>(player.position)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [saving, startSave] = useTransition()

  // Avatar propositalmente não editado aqui: PlayerCard já cai para iniciais quando avatar_url é null.
  const preview: Player = useMemo(() => {
    const { rating_real, rating_display } = computeRatings(
      player.avg_attack, player.avg_defense, player.avg_physical, position
    )
    return {
      ...player,
      full_name: fullName,
      nickname: nickname || player.nickname,
      position,
      rating_real,
      rating_display,
    }
  }, [player, fullName, nickname, position])

  function save() {
    setMessage(null)
    const fd = new FormData()
    fd.set('full_name', fullName)
    fd.set('nickname', nickname)
    fd.set('position', position)

    startSave(async () => {
      const result = await updateProfile(fd)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
        return
      }
      setMessage({ type: 'success', text: 'Perfil atualizado!' })
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-10 pt-4">
      <header>
        <h1 className="text-lg font-semibold">Meu perfil</h1>
      </header>

      <PlayerCard player={preview} />

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

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Apelido
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Nome completo
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Posição principal
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as Position)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <Button onClick={save} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
