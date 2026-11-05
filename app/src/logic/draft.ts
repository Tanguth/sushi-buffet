import { BY_ID, CHARACTERS, type RoleType } from '../data/characters'

export type Quota = Record<RoleType, number>

const BASE: Record<number, [number, number, number, number]> = {
  5: [3, 0, 1, 1], 6: [3, 1, 1, 1], 7: [5, 0, 1, 1], 8: [5, 1, 1, 1],
  9: [5, 2, 1, 1], 10: [7, 0, 2, 1], 11: [7, 1, 2, 1], 12: [7, 2, 2, 1],
  13: [9, 0, 3, 1], 14: [9, 1, 3, 1], 15: [9, 2, 3, 1],
}

// Variation du nombre d'Étrangers quand ce personnage est tiré (compensée par les Villageois)
const OUTSIDER_SHIFT: Record<string, number> = {
  'TB-baron': 2,
  'SV-fang-gu': 1,
  'SV-vigormortis': -1,
}

export interface Player {
  name: string
  ban?: string
  pick?: string
}

export interface State {
  phase: 'setup' | 'ban' | 'draft' | 'done'
  players: Player[]
  banned: string[]
  current: number | null // joueur actuellement réveillé
  turn: number
  offer: string[] | null
  mulliganed: boolean
  seen: string[] // rôles refusés par le joueur courant lors d'un mulligan
}

export const initialState: State = {
  phase: 'setup', players: [], banned: [], current: null, turn: 0,
  offer: null, mulliganed: false, seen: [],
}

export const MIN_PLAYERS = 5
export const MAX_PLAYERS = 15

export function quotaFor(count: number, picks: string[]): Quota {
  const [townsfolk, outsider, minion, demon] = BASE[count] ?? BASE[MIN_PLAYERS]
  const shift = picks.reduce((s, id) => s + (OUTSIDER_SHIFT[id] ?? 0), 0)
  return {
    townsfolk: Math.max(0, townsfolk - shift),
    outsider: Math.max(0, outsider + shift),
    minion,
    demon,
  }
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const picksOf = (s: State) =>
  s.players.flatMap((p) => (p.pick ? [p.pick] : []))

export function availablePool(s: State, exclude: string[] = []): string[] {
  const picks = picksOf(s)
  const quota = quotaFor(s.players.length, picks)
  const count: Quota = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 }
  picks.forEach((id) => count[BY_ID.get(id)!.type]++)
  return CHARACTERS.filter(
    (ch) =>
      !s.banned.includes(ch.id) &&
      !picks.includes(ch.id) &&
      !exclude.includes(ch.id) &&
      count[ch.type] < quota[ch.type],
  ).map((ch) => ch.id)
}

export function draw(s: State, n: number, exclude: string[] = []): string[] {
  return shuffle(availablePool(s, exclude)).slice(0, n)
}

