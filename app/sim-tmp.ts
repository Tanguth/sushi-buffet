import { BY_ID, CHARACTERS } from './src/data/characters'
import { draw, initialState, rollModes, shuffle, picksOf, MIN_PLAYERS, MAX_PLAYERS, type State } from './src/logic/draft'

let stuck = 0, games = 0, atheistEvil = 0
const modeCount: Record<string, number> = {}
for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
  for (let g = 0; g < 300; g++) {
    games++
    const ids = shuffle(CHARACTERS.map((c) => c.id))
    const banned = ids.slice(0, n)
    let s: State = {
      ...initialState, phase: 'draft', banned,
      players: Array.from({ length: n }, (_, i) => ({ name: `P${i}` })),
      queue: shuffle(Array.from({ length: n }, (_, i) => i)),
    }
    s.modes = rollModes(banned)
    s.modes.forEach((m) => (modeCount[m] = (modeCount[m] ?? 0) + 1))
    for (const idx of s.queue) {
      const offer = draw(s, 3)
      if (offer.length === 0) { stuck++; break }
      const pick = offer[0]
      s = { ...s, banned: [...s.banned, ...offer.slice(1)], players: s.players.map((p, i) => (i === idx ? { ...p, pick } : p)) }
    }
    const p = picksOf(s)
    if (p.includes('CAR-atheist') && p.some((id) => BY_ID.get(id)!.type !== 'townsfolk' && BY_ID.get(id)!.type !== 'outsider')) atheistEvil++
    if (p.includes('CAR-atheist') && s.modes.length && s.modes.some((m) => m !== 'TB-drunk')) atheistEvil++
  }
}
console.log({ games, stuck, atheistEvil, modeCount })
