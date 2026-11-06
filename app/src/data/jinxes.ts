import source from './jinxes.json'
import { CHARACTERS, type Character } from './characters'

// Source: https://github.com/ThePandemoniumInstitute/botc-release/blob/main/resources/data/jinxes.json
const charactersBySlug = new Map(
  CHARACTERS.map((character) => [character.id.slice(character.id.indexOf('-') + 1), character]),
)

export interface Jinx {
  first: Character
  second: Character
  reason: string
}

export function jinxesFor(roleIds: string[]): Jinx[] {
  const pickedSlugs = new Set(
    roleIds.map((id) => id.slice(id.indexOf('-') + 1)),
  )

  return source.flatMap((entry) => {
    const first = charactersBySlug.get(entry.id)
    if (!first || !pickedSlugs.has(entry.id)) return []

    return entry.jinx.flatMap(({ id, reason }) => {
      const second = charactersBySlug.get(id)
      return second && pickedSlugs.has(id) ? [{ first, second, reason }] : []
    })
  })
}
