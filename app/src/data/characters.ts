export type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon'

export interface Character {
  id: string
  name: string
  type: RoleType
  script: 'TB' | 'BMR' | 'SV' | 'CAR'
}

export const TYPE_LABELS: Record<RoleType, string> = {
  townsfolk: 'Villageois',
  outsider: 'Marginal',
  minion: 'Sbire',
  demon: 'Démon',
}

export const TYPE_PLURALS: Record<RoleType, string> = {
  townsfolk: 'Villageois',
  outsider: 'Marginaux',
  minion: 'Sbires',
  demon: 'Démons',
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
  ...c('TB', 'townsfolk', ['Lavandière|washerwoman', 'Archiviste|librarian', 'Détective|investigator', 'Cuisinier|chef', 'Empathe|empath', 'Voyante|fortuneteller', 'Fossoyeur|undertaker', 'Moine|monk', 'Corneille|ravenkeeper', 'Immaculée|virgin', 'Pourfendeuse|slayer', 'Soldat|soldier', 'Maire|mayor']),
  ...c('TB', 'outsider', ['Majordome|butler', 'Ivrogne|drunk', 'Recluse|recluse', 'Saint|saint']),
  ...c('TB', 'minion', ['Empoisonneur|poisoner', 'Espionne|spy', 'Baron|baron', 'Femme écarlate|scarletwoman']),
  ...c('TB', 'demon', ['Diablotin|imp']),
  // Bad Moon Rising
  ...c('BMR', 'townsfolk', ['Grand-mère|grandmother', 'Marin|sailor', 'Femme de chambre|chambermaid', 'Exorciste|exorcist', 'Aubergiste|innkeeper', 'Parieur|gambler', 'Commère|gossip', 'Courtisan|courtier', 'Professeur|professor', 'Fou du roi|fool', 'Ménestrel|minstrel', 'Tisanière|tealady', 'Pacifiste|pacifist']),
  ...c('BMR', 'outsider', ['Bricoleur|tinker', 'Sélénite|moonchild', 'Gros Bras|goon', 'Lunatique|lunatic']),
  ...c('BMR', 'minion', ['Parrain|godfather', 'Avocat du diable|devilsadvocate', 'Assassin|assassin', 'Conspirateur|mastermind']),
  ...c('BMR', 'demon', ['Zombuul|zombuul', 'Pukka|pukka', 'Shabaloth|shabaloth', 'Po|po']),
  // Sects & Violets
  ...c('SV', 'townsfolk', ['Horloger|clockmaker', 'Rêveur|dreamer', 'Charmeur de serpents|snakecharmer', 'Mathématicien|mathematician', 'Fleuriste|flowergirl', 'Crieur public|towncrier', 'Oracle|oracle', 'Savant|savant', 'Couturière|seamstress', 'Philosophe|philosopher', 'Artiste|artist', 'Jongleur|juggler', 'Sage|sage']),
  ...c('SV', 'outsider', ['Bête de foire|mutant', 'Dulcinée|sweetheart', 'Barbier|barber', 'Maladroit|klutz']),
  ...c('SV', 'minion', ['Jumelle maléfique|eviltwin', 'Sorcière|witch', 'Cerenovus|cerenovus', 'Guenaude|pithag']),
  ...c('SV', 'demon', ['Fang Gu|fanggu', 'Vigormortis|vigormortis', 'No Dashii|nodashii', 'Vortox|vortox']),
  // Carousel
  ...c('CAR', 'townsfolk', ['Acrobate|acrobat', 'Alchimiste|alchemist', 'Al-Saahir|alsaahir', 'Amnésique|amnesiac', 'Athée|atheist', 'Aéronaute|balloonist', 'Banshee|banshee', 'Chasseur de primes|bountyhunter', 'Cannibale|cannibal', 'Choriste|choirboy', 'Chef de secte|cultleader', 'Ingénieur|engineer', 'Fermier|farmer', 'Pêcheur|fisherman', 'Général|general', 'Grande prêtresse|highpriestess', 'Chasseur|huntsman', 'Roi|king', 'Chevalier|knight', 'Lycanthrope|lycanthrope', 'Magicien|magician', 'Veilleur de nuit|nightwatchman', 'Noble|noble', 'Pixie|pixie', 'Planteur de pavot|poppygrower', 'Prédicateur|preacher', 'Princesse|princess', 'Shugenja|shugenja', 'Intendante|steward', 'Idiot du village|villageidiot']),
  ...c('CAR', 'outsider', ['Damoiselle|damsel', 'Golem|golem', 'Chapelier|hatter', 'Hérétique|heretic', 'Ogre|ogre', 'Médecin de peste|plaguedoctor', 'Politicien|politician', 'Maître des puzzles|puzzlemaster', 'Balance|snitch', 'Zélote|zealot']),
  ...c('CAR', 'minion', ['Laborantin|boffin', 'Boumdandy|boomdandy', 'Tourmenteur|fearmonger', 'Gobelin|goblin', 'Harpie|harpy', 'Marionnette|marionette', 'Mézéphélès|mezepheles', 'Organiste de rue|organgrinder', 'Psychopathe|psychopath', 'Invocatrice|summoner', 'Vizir|vizier', 'Mage|wizard', 'Spectre|wraith', 'Xaan|xaan', 'Veuve|widow']),
  ...c('CAR', 'demon', ['Al-Hadikhia|alhadikhia', 'Kazali|kazali', 'Léviathan|leviathan', 'Timonstre|lilmonsta', 'Sansgue|lleech', 'Ojo|ojo', 'Emeutier|riot', 'Yaggablabla|yaggababble']),
]

export const BY_ID = new Map(CHARACTERS.map((ch) => [ch.id, ch]))
