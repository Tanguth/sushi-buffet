import { BY_ID, CHARACTERS, type RoleType } from '../data/characters'

export type Quota = Record<RoleType, number>

const BASE: Record<number, [number, number, number, number]> = {
  5: [3, 0, 1, 1], 6: [3, 1, 1, 1], 7: [5, 0, 1, 1], 8: [5, 1, 1, 1],
  9: [5, 2, 1, 1], 10: [7, 0, 2, 1], 11: [7, 1, 2, 1], 12: [7, 2, 2, 1],
  13: [9, 0, 3, 1], 14: [9, 1, 3, 1], 15: [9, 2, 3, 1],
}

// Variations possibles du nombre de Marginaux quand ce personnage est en jeu (compensées par les Villageois).
// Une seule valeur = obligatoire ; plusieurs = le conteur/la draft doit en réaliser exactement une.
const OUTSIDER_SHIFT: Record<string, number[]> = {
  'TB-baron': [2],
  'SV-fanggu': [1],
  'SV-vigormortis': [-1],
  'BMR-godfather': [-1, 1],
  'CAR-balloonist': [0, 1],
}
const XAAN = 'CAR-xaan' // pas de nombre de Marginaux imposé
const SUMMONER = 'CAR-summoner' // aucun Démon
const ATHEIST = 'CAR-atheist' // aucun rôle maléfique
const KAZALI = 'CAR-kazali' // uniquement tant qu'aucun Sbire n'a été choisi
const VILLAGE_IDIOT = 'CAR-villageidiot'
const IDIOT_MAX = 3

// Rôles qui modifient la composition : ils sont explorés un par un par la vérification de faisabilité
const SPECIALS = new Set([...Object.keys(OUTSIDER_SHIFT), XAAN, SUMMONER, ATHEIST, KAZALI])

// Parties spéciales : le rôle ne peut pas être pioché, mais il est tiré au hasard avant la draft
export const LIL_MONSTA = 'CAR-lilmonsta' // un Sbire de plus à la place du Démon
export const MARIONETTE = 'CAR-marionette' // un Sbire apparaît comme un rôle bon (Villageois ou Marginal)
export const DRUNK = 'TB-drunk' // un Marginal apparaît comme un Villageois
const MODES: { id: string; type: RoleType }[] = [
  { id: LIL_MONSTA, type: 'demon' },
  { id: MARIONETTE, type: 'minion' },
  { id: DRUNK, type: 'outsider' },
]
const MODE_IDS = MODES.map((m) => m.id)

export interface Player {
  name: string
  ban?: string
  pick?: string
}

export interface State {
  phase: 'setup' | 'ban' | 'handback' | 'recap' | 'draft' | 'done'
  players: Player[]
  banned: string[]
  modes: string[] // parties spéciales (Timonstre, Marionnette, Ivrogne)
  queue: number[] // ordre de réveil aléatoire (indices de joueurs)
  ready: boolean // le joueur courant a le téléphone
  reveal: boolean // écran de rappel du rôle du joueur
  ending: boolean // écran de fin de tour du joueur
  turn: number
  offer: string[] | null
  mulligans: number
  seen: string[] // rôles refusés par le joueur courant lors d'un mulligan
}

export const initialState: State = {
  phase: 'setup', players: [], banned: [], modes: [], queue: [], ready: false, reveal: false, ending: false, turn: 0,
  offer: null, mulligans: 0, seen: [],
}

export const MIN_PLAYERS = 5
export const MAX_PLAYERS = 15

export function rollModes(banned: string[]): string[] {
  return MODES.filter(
    ({ id, type }) =>
      !banned.includes(id) &&
      Math.random() * CHARACTERS.filter((ch) => ch.type === type).length < 1,
  ).map((m) => m.id)
}

const TYPE_KEYS: RoleType[] = ['townsfolk', 'outsider', 'minion', 'demon']

// Rôles qui ne peuvent pas être proposés compte tenu des parties spéciales et des Sbires déjà piochés
const blocked = (id: string, modes: string[], minionPicked: boolean) =>
  MODE_IDS.includes(id) ||
  (id === SUMMONER && modes.includes(LIL_MONSTA)) ||
  (id === ATHEIST && (modes.includes(LIL_MONSTA) || modes.includes(MARIONETTE))) ||
  (id === KAZALI && minionPicked)

// Compositions (Villageois, Marginaux, Sbires, Démons) acceptables parmi les rôles piochés
// quand `specials` sont en jeu. Les parties Ivrogne/Marionnette décalent ce qui est pioché.
function targets(n: number, specials: string[], modes: string[]): Quota[] {
  const [, outsider0, minion0, demon0] = BASE[n] ?? BASE[MIN_PLAYERS]
  const lilMonsta = modes.includes(LIL_MONSTA)
  const marionette = modes.includes(MARIONETTE)
  const atheist = specials.includes(ATHEIST)
  const kazali = specials.includes(KAZALI)
  const demon = lilMonsta || atheist || specials.includes(SUMMONER) ? 0 : demon0
  const minion = atheist || kazali ? 0 : minion0 + (lilMonsta ? 1 : 0) - (marionette ? 1 : 0)
  if (minion < 0) return []

  let outsiders = [outsider0]
  if (specials.includes(XAAN)) outsiders = Array.from({ length: n + 1 }, (_, i) => i)
  else
    for (const id of specials) {
      const shifts = OUTSIDER_SHIFT[id]
      if (shifts) outsiders = [...new Set(outsiders.flatMap((o) => shifts.map((x) => o + x)))]
    }

  const result: Quota[] = []
  for (const o of outsiders.filter((o) => o >= 0)) {
    const drunk = modes.includes(DRUNK) ? Math.max(o, 1) - 1 : o
    for (const extra of marionette ? [0, 1] : [0]) {
      const outsider = drunk + extra
      const townsfolk = n - outsider - minion - demon
      if (townsfolk >= 0) result.push({ townsfolk, outsider, minion, demon })
    }
  }
  return result
}

// Vrai s'il existe encore une façon de compléter `picks` avec des rôles « ordinaires » encore
// disponibles. Les rôles qui modifient la composition ne sont jamais comptés comme complément :
// ils pourraient être bannis (refusés) avant d'être piochés et bloquer la draft.
function feasible(s: State, picks: string[]): boolean {
  const have: Quota = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 }
  picks.forEach((id) => have[BY_ID.get(id)!.type]++)
  const idiots = picks.filter((id) => id === VILLAGE_IDIOT).length

  const generic: Quota = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 }
  const kazaliPicked = picks.includes(KAZALI)
  for (const ch of CHARACTERS) {
    if (MODE_IDS.includes(ch.id) || SPECIALS.has(ch.id) || s.banned.includes(ch.id)) continue
    if (kazaliPicked && ch.type === 'minion') continue
    if (ch.id === VILLAGE_IDIOT) generic.townsfolk += IDIOT_MAX - idiots
    else if (!picks.includes(ch.id)) generic[ch.type]++
  }

  const pickedSpecials = picks.filter((id) => SPECIALS.has(id))
  return targets(s.players.length, pickedSpecials, s.modes).some((t) =>
    TYPE_KEYS.every((k) => t[k] >= have[k] && t[k] - have[k] <= generic[k]),
  )
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
  const minionPicked = picks.some((id) => BY_ID.get(id)!.type === 'minion')
  const kazaliPicked = picks.includes(KAZALI)
  const idiots = picks.filter((id) => id === VILLAGE_IDIOT).length
  return CHARACTERS.filter((ch) => {
    if (blocked(ch.id, s.modes, minionPicked) || s.banned.includes(ch.id) || exclude.includes(ch.id)) return false
    if (kazaliPicked && ch.type === 'minion') return false
    if (ch.id === VILLAGE_IDIOT ? idiots >= IDIOT_MAX : picks.includes(ch.id)) return false
    return feasible(s, [...picks, ch.id])
  }).map((ch) => ch.id)
}

export function draw(s: State, n: number, exclude: string[] = []): string[] {
  return shuffle(availablePool(s, exclude)).slice(0, n)
}



