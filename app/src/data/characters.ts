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

// Chaque entrée : "Nom français|slug" où le slug est le nom du fichier du jeton (sans suffixe)
// et l'id devient `${script}-${slug}` (ex. TB-washerwoman, utilisé aussi pour public/icons/<id>.webp)
const c = (
  script: Character['script'],
  type: RoleType,
  entries: string[],
): Character[] =>
  entries.map((entry) => {
    const [name, slug] = entry.split('|')
    return { id: `${script}-${slug}`, name, type, script }
  })

export const CHARACTERS: Character[] = [
  // Trouble Brewing
  ...c('TB', 'townsfolk', ['Lavandière|washerwoman', 'Bibliothécaire|librarian', 'Enquêteur|investigator', 'Cuisinier|chef', 'Empathe|empath', 'Diseuse de bonne aventure|fortuneteller', 'Fossoyeur|undertaker', 'Moine|monk', 'Gardien de corbeaux|ravenkeeper', 'Vierge|virgin', 'Tueur|slayer', 'Soldat|soldier', 'Maire|mayor']),
  ...c('TB', 'outsider', ['Majordome|butler', 'Ivrogne|drunk', 'Reclus|recluse', 'Saint|saint']),
  ...c('TB', 'minion', ['Empoisonneur|poisoner', 'Espion|spy', 'Baron|baron', 'Femme écarlate|scarletwoman']),
  ...c('TB', 'demon', ['Diablotin|imp']),
  // Bad Moon Rising
  ...c('BMR', 'townsfolk', ['Grand-mère|grandmother', 'Marin|sailor', 'Femme de chambre|chambermaid', 'Exorciste|exorcist', 'Aubergiste|innkeeper', 'Joueur|gambler', 'Commère|gossip', 'Courtisan|courtier', 'Professeur|professor', 'Bouffon|fool', 'Ménestrel|minstrel', 'Dame du thé|tealady', 'Pacifiste|pacifist']),
  ...c('BMR', 'outsider', ['Bricoleur|tinker', 'Enfant de la lune|moonchild', 'Homme de main|goon', 'Lunatique|lunatic']),
  ...c('BMR', 'minion', ['Parrain|godfather', 'Avocat du diable|devilsadvocate', 'Assassin|assassin', 'Cerveau|mastermind']),
  ...c('BMR', 'demon', ['Zombuul|zombuul', 'Pukka|pukka', 'Shabaloth|shabaloth', 'Po|po']),
  // Sects & Violets
  ...c('SV', 'townsfolk', ['Horloger|clockmaker', 'Rêveur|dreamer', 'Charmeur de serpents|snakecharmer', 'Mathématicien|mathematician', 'Bouquetière|flowergirl', 'Crieur public|towncrier', 'Oracle|oracle', 'Savant|savant', 'Couturière|seamstress', 'Philosophe|philosopher', 'Artiste|artist', 'Jongleur|juggler', 'Sage|sage']),
  ...c('SV', 'outsider', ['Mutant|mutant', 'Chérie|sweetheart', 'Barbier|barber', 'Maladroit|klutz']),
  ...c('SV', 'minion', ['Jumeau maléfique|eviltwin', 'Sorcière|witch', 'Cerenovus|cerenovus', 'Mégère|pithag']),
  ...c('SV', 'demon', ['Fang Gu|fanggu', 'Vigormortis|vigormortis', 'No Dashii|nodashii', 'Vortox|vortox']),
  // Carousel
  ...c('CAR', 'townsfolk', ['Acrobate|acrobat', 'Alchimiste|alchemist', 'Al-Saahir|alsaahir', 'Amnésique|amnesiac', 'Athée|atheist', 'Aéronaute|balloonist', 'Banshee|banshee', 'Chasseur de primes|bountyhunter', 'Cannibale|cannibal', 'Enfant de chœur|choirboy', 'Chef de secte|cultleader', 'Ingénieur|engineer', 'Fermier|farmer', 'Pêcheur|fisherman', 'Général|general', 'Grande prêtresse|highpriestess', 'Chasseur|huntsman', 'Roi|king', 'Chevalier|knight', 'Lycanthrope|lycanthrope', 'Magicien|magician', 'Veilleur de nuit|nightwatchman', 'Noble|noble', 'Lutin|pixie', 'Cultivateur de pavots|poppygrower', 'Prédicateur|preacher', 'Princesse|princess', 'Shugenja|shugenja', 'Intendant|steward', 'Idiot du village|villageidiot']),
  ...c('CAR', 'outsider', ['Damoiselle|damsel', 'Golem|golem', 'Chapelier|hatter', 'Hérétique|heretic', 'Ermite|hermit', 'Ogre|ogre', 'Médecin de la peste|plaguedoctor', 'Politicien|politician', 'Maître des énigmes|puzzlemaster', 'Mouchard|snitch', 'Zélote|zealot']),
  ...c('CAR', 'minion', ['Boffin|boffin', 'Boom Dandy|boomdandy', 'Semeur de peur|fearmonger', 'Gobelin|goblin', 'Harpie|harpy', 'Lil\' Monsta|lilmonsta', 'Marionnette|marionette', 'Mézéphélès|mezepheles', 'Joueur d\'orgue|organgrinder', 'Psychopathe|psychopath', 'Invocateur|summoner', 'Vizir|vizier', 'Sorcier|wizard', 'Spectre|wraith', 'Xaan|xaan', 'Veuve|widow']),
  ...c('CAR', 'demon', ['Al-Hadikhia|alhadikhia', 'Kazali|kazali', 'Legion|legion', 'Léviathan|leviathan', 'Lleech|lleech', 'Seigneur de Typhon|lordoftyphon', 'Ojo|ojo', 'Riot|riot', 'Yaggababble|yaggababble']),
]

export const BY_ID = new Map(CHARACTERS.map((ch) => [ch.id, ch]))
