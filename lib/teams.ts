export type Position = 'GOL' | 'DEF' | 'MEI' | 'ATA'

export interface Player {
  id: string
  full_name: string
  nickname: string
  position: Position
  avatar_url: string | null
  avg_attack: number
  avg_defense: number
  avg_physical: number
  ratings_count: number
  rating_real: number    // só o algoritmo usa
  rating_display: number // só a interface usa
}

export interface Draw {
  teams: Player[][] // Times 1..N
  reserve: Player[] // Time N+1
}

const POSITION_WEIGHTS: Record<Position, { attack: number; defense: number; physical: number }> = {
  GOL: { attack: 0.05, defense: 0.85, physical: 0.10 },
  DEF: { attack: 0.20, defense: 0.50, physical: 0.30 },
  MEI: { attack: 0.40, defense: 0.40, physical: 0.20 },
  ATA: { attack: 0.50, defense: 0.20, physical: 0.30 },
}

/** Espelha a fórmula e os pesos de rating_real/rating_display da view player_stats (supabase/schema.sql). */
export function computeRatings(
  avgAttack: number,
  avgDefense: number,
  avgPhysical: number,
  position: Position
): { rating_real: number; rating_display: number } {
  const w = POSITION_WEIGHTS[position]
  const real = (avgAttack * w.attack + avgDefense * w.defense + avgPhysical * w.physical) * 10
  return { rating_real: real, rating_display: 25 + 0.75 * real }
}

export const MIN_PER_TEAM = 2
const POSITIONS: Position[] = ['GOL', 'DEF', 'MEI', 'ATA']

export const canDraw = (confirmed: number, n: number) =>
  n >= 2 && n <= 5 && confirmed >= n * MIN_PER_TEAM

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const strength = (team: Player[]) => team.reduce((s, p) => s + p.rating_real, 0)
const spread = (teams: Player[][]) => {
  const s = teams.map(strength)
  return Math.max(...s) - Math.min(...s)
}

/**
 * Snake draft por pote de posição.
 * 1) Sobras (confirmados % N) vão para o Time N+1 (reserva), sorteadas para o rodízio ser justo.
 *    Goleiros só ficam de fora se houver goleiros de sobra (> N).
 * 2) Cada pote (GOL, DEF, MEI, ATA) é ordenado por rating_real e distribuído em "cobrinha";
 *    o ponteiro continua entre potes, então os times fecham com o mesmo tamanho.
 */
export function drawTeams(
  players: Player[],
  n: number,
  rand: () => number = Math.random
): Draw {
  if (!canDraw(players.length, n)) {
    throw new Error(`São necessários ao menos ${n * MIN_PER_TEAM} jogadores para ${n} times.`)
  }

  const extras = players.length % n
  const gkCount = players.filter((p) => p.position === 'GOL').length
  const protectedGk = (p: Player) => p.position === 'GOL' && gkCount <= n
  const pool = [
    ...shuffle(players.filter((p) => !protectedGk(p)), rand),
    ...shuffle(players.filter(protectedGk), rand), // último recurso
  ]
  const reserve = pool.slice(0, extras)
  const out = new Set(reserve.map((p) => p.id))
  const active = players.filter((p) => !out.has(p.id))

  const teams: Player[][] = Array.from({ length: n }, () => [])
  let i = 0
  let dir = 1
  for (const pos of POSITIONS) {
    const pot = active
      .filter((p) => p.position === pos)
      .sort((a, b) => b.rating_real - a.rating_real)
    for (const p of pot) {
      teams[i].push(p)
      if ((dir === 1 && i === n - 1) || (dir === -1 && i === 0)) dir = -dir
      else i += dir
    }
  }
  return { teams, reserve }
}

const BALANCE_TOLERANCE = 5 // pontos de rating_real somados por time

/**
 * Re-sort: troca 2–3 pares de jogadores da mesma posição, de times diferentes e com
 * rating_real parecido. A tolerância de "parecido" cresce a cada tentativa; só aceita
 * o resultado se o equilíbrio global (max − min da força dos times) não piorar.
 * Retorna swaps = 0 quando não achou troca válida.
 */
export function resortTeams(
  draw: Draw,
  rand: () => number = Math.random
): { draw: Draw; swaps: number } {
  const before = spread(draw.teams)
  const limit = Math.max(before, BALANCE_TOLERANCE)

  for (let attempt = 0; attempt < 200; attempt++) {
    const tol = 4 + attempt * 0.25
    const pairs: [number, Player, number, Player][] = []
    for (let i = 0; i < draw.teams.length; i++)
      for (let j = i + 1; j < draw.teams.length; j++)
        for (const a of draw.teams[i])
          for (const b of draw.teams[j])
            if (a.position === b.position && Math.abs(a.rating_real - b.rating_real) <= tol)
              pairs.push([i, a, j, b])

    const target = rand() < 0.5 ? 2 : 3
    const used = new Set<string>()
    const chosen: typeof pairs = []
    for (const pair of shuffle(pairs, rand)) {
      if (used.has(pair[1].id) || used.has(pair[3].id)) continue
      used.add(pair[1].id)
      used.add(pair[3].id)
      chosen.push(pair)
      if (chosen.length === target) break
    }
    if (chosen.length < 2) continue

    const teams = draw.teams.map((t) => [...t])
    for (const [i, a, j, b] of chosen) {
      teams[i] = teams[i].map((p) => (p.id === a.id ? b : p))
      teams[j] = teams[j].map((p) => (p.id === b.id ? a : p))
    }
    if (spread(teams) <= limit) return { draw: { ...draw, teams }, swaps: chosen.length }
  }
  return { draw, swaps: 0 }
}
