export type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon'

export interface Character {
  id: string
  name: string
  type: RoleType
  script: 'TB' | 'BMR' | 'SV' | 'CAR'
}

export const TYPE_LABELS: Record<RoleType, string> = {
  townsfolk: 'Villageois',
  outsider: 'Étranger',
  minion: 'Sbire',
  demon: 'Démon',
}

const c = (
  script: Character['script'],
  type: RoleType,
  names: string[],
): Character[] =>
  names.map((name) => ({
    id: `${script}-${name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}`,
    name,
    type,
    script,
  }))

export const CHARACTERS: Character[] = [
  // Trouble Brewing
  ...c('TB', 'townsfolk', ['Lavandière', 'Bibliothécaire', 'Enquêteur', 'Cuisinier', 'Empathe', 'Diseuse de bonne aventure', 'Fossoyeur', 'Moine', 'Gardien de corbeaux', 'Vierge', 'Tueur', 'Soldat', 'Maire']),
  ...c('TB', 'outsider', ['Majordome', 'Ivrogne', 'Reclus', 'Saint']),
  ...c('TB', 'minion', ['Empoisonneur', 'Espion', 'Baron', 'Femme écarlate']),
  ...c('TB', 'demon', ['Diablotin']),
  // Bad Moon Rising
  ...c('BMR', 'townsfolk', ['Grand-mère', 'Marin', 'Femme de chambre', 'Exorciste', 'Aubergiste', 'Joueur', 'Commère', 'Courtisan', 'Professeur', 'Bouffon', 'Ménestrel', 'Dame du thé', 'Pacifiste']),
  ...c('BMR', 'outsider', ['Bricoleur', 'Enfant de la lune', 'Homme de main', 'Lunatique']),
  ...c('BMR', 'minion', ['Parrain', 'Avocat du diable', 'Assassin', 'Cerveau']),
  ...c('BMR', 'demon', ['Zombuul', 'Pukka', 'Shabaloth', 'Po']),
  // Sects & Violets
  ...c('SV', 'townsfolk', ['Horloger', 'Rêveur', 'Charmeur de serpents', 'Mathématicien', 'Bouquetière', 'Crieur public', 'Oracle', 'Savant', 'Couturière', 'Philosophe', 'Artiste', 'Jongleur', 'Sage']),
  ...c('SV', 'outsider', ['Mutant', 'Chérie', 'Barbier', 'Maladroit']),
  ...c('SV', 'minion', ['Jumeau maléfique', 'Sorcière', 'Cerenovus', 'Mégère']),
  ...c('SV', 'demon', ['Fang Gu', 'Vigormortis', 'No Dashii', 'Vortox']),
  // Carousel (à compléter)
  ...c('CAR', 'townsfolk', ['Athée']),
  ...c('CAR', 'minion', ['Marionnette']),
  ...c('CAR', 'demon', ['Legion']),
]

export const BY_ID = new Map(CHARACTERS.map((ch) => [ch.id, ch]))
