import { useEffect, useState } from 'react'
import { ABILITIES } from './data/abilities'
import { BY_ID, CHARACTERS, TYPE_LABELS, TYPE_PLURALS, type RoleType } from './data/characters'
import {
  MAX_PLAYERS, MIN_PLAYERS, draw, initialState, picksOf, rollModes, shuffle, type State,
} from './logic/draft'
import './App.css'

const KEY = 'botc-draft-v3'
const TYPES: RoleType[] = ['townsfolk', 'outsider', 'minion', 'demon']
type SetState = (s: State) => void

function load(): State {
  try {
    const s: State = { ...initialState, ...JSON.parse(localStorage.getItem(KEY) ?? '') }
    const ids = [...s.banned, ...s.players.flatMap((p) => [p.ban, p.pick, ...(s.offer ?? [])])]
    return ids.every((id) => !id || BY_ID.has(id)) ? s : initialState
  } catch {
    return initialState
  }
}

function Icon({ id }: { id: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <img
      className="icon" alt="" src={`${import.meta.env.BASE_URL}icons/${id}.webp`}
      onError={() => setOk(false)}
    />
  )
}

function RoleButton({
  id, onClick, disabled, selected, big, note,
}: {
  id: string; onClick?: () => void; disabled?: boolean; selected?: boolean; big?: boolean; note?: string
}) {
  const ch = BY_ID.get(id)!
  return (
    <button
      className={`role ${ch.type} ${selected ? 'selected' : ''} ${big ? 'big' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon id={id} />
      <span>{ch.name}</span>
      {big && <small>{TYPE_LABELS[ch.type]}</small>}
      {note && <small>{note}</small>}
    </button>
  )
}

function RoleModal({
  id, action, onConfirm, onClose,
}: {
  id: string; action: string; onConfirm: () => void; onClose: () => void
}) {
  const ch = BY_ID.get(id)!
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${ch.type}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="close" aria-label="Fermer" onClick={onClose}>✕</button>
        <Icon id={id} />
        <h2>{ch.name}</h2>
        <small>{TYPE_LABELS[ch.type]}</small>
        <p className="ability">{ABILITIES[id] ?? 'Capacité non disponible.'}</p>
        <button className="primary" onClick={onConfirm}>{action}</button>
      </div>
    </div>
  )
}

function Transition({
  title, text, button, onNext, children,
}: {
  title: string; text?: string; button: string; onNext: () => void; children?: React.ReactNode
}) {
  return (
    <div className="screen center">
      <h1>{title}</h1>
      {text && <p className="lead">{text}</p>}
      {children}
      <div className="bar">
        <button className="primary" onClick={onNext}>{button}</button>
      </div>
    </div>
  )
}

function Setup({ onStart }: { onStart: (names: string[]) => void }) {
  const [names, setNames] = useState<string[]>(Array(7).fill(''))
  const resize = (n: number) =>
    setNames((p) => Array.from({ length: n }, (_, i) => p[i] ?? ''))
  return (
    <div className="screen">
      <h1>Nouvelle partie</h1>
      <label>
        Nombre de joueurs
        <input
          type="number" inputMode="numeric" min={MIN_PLAYERS} max={MAX_PLAYERS}
          value={names.length}
          onChange={(e) =>
            resize(Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, +e.target.value || MIN_PLAYERS)))
          }
        />
      </label>
      {names.map((n, i) => (
        <input
          key={i} placeholder={`Joueur ${i + 1}`} value={n}
          onChange={(e) => setNames((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
        />
      ))}
      <button className="primary" onClick={() => onStart(names.map((n, i) => n.trim() || `Joueur ${i + 1}`))}>
        Commencer les bans
      </button>
    </div>
  )
}

function Ban({ s, set }: { s: State; set: SetState }) {
  const [sel, setSel] = useState<string | null>(null)
  const player = s.players[s.turn]

  if (!s.ready) {
    return (
      <Transition
        title={`Passe le téléphone à ${player.name}`}
        text={`Phase de ban — ${s.turn + 1}/${s.players.length}`}
        button="J'ai le téléphone"
        onNext={() => set({ ...s, ready: true })}
      >
        {s.turn > 0 && (
          <div className="bans">
            <h3>Rôles bannis</h3>
            <ul>
              {s.players.slice(0, s.turn).map((p, i) => (
                <li key={i}><b>{p.name}</b> → {BY_ID.get(p.ban!)!.name}</li>
              ))}
            </ul>
          </div>
        )}
      </Transition>
    )
  }

  const validate = (id: string) => {
    const players = s.players.map((p, i) => (i === s.turn ? { ...p, ban: id } : p))
    const banned = [...s.banned, id]
    const last = s.turn + 1 >= s.players.length
    setSel(null)
    set(
      last
        ? {
            ...s, players, banned, phase: 'handback', turn: 0, ready: false,
            queue: shuffle(s.players.map((_, i) => i)), modes: rollModes(banned),
          }
        : { ...s, players, banned, turn: s.turn + 1, ready: false },
    )
  }
  return (
    <div className="screen">
      <h2>{player.name}, bannis un rôle</h2>
      {TYPES.map((t) => (
        <section key={t}>
          <h3>{TYPE_PLURALS[t]}</h3>
          <div className="grid">
            {CHARACTERS.filter((c) => c.type === t).map((c) => {
              const by = s.players.find((p) => p.ban === c.id)
              return (
                <RoleButton
                  key={c.id} id={c.id}
                  disabled={s.banned.includes(c.id)}
                  note={by ? `banni par ${by.name}` : undefined}
                  onClick={() => setSel(c.id)}
                />
              )
            })}
          </div>
        </section>
      ))}
      {sel && (
        <RoleModal
          id={sel} action={`Bannir ${BY_ID.get(sel)!.name}`}
          onConfirm={() => validate(sel)} onClose={() => setSel(null)}
        />
      )}
    </div>
  )
}

function Modes({ modes }: { modes: string[] }) {
  return (
    <>
      {modes.map((id) => (
        <p key={id} className={`mode ${BY_ID.get(id)!.type}`}>
          <Icon id={id} />
          <span>C'est une partie {BY_ID.get(id)!.name}</span>
        </p>
      ))}
    </>
  )
}

function Recap({ s, set }: { s: State; set: SetState }) {
  return (
    <div className="screen">
      <h2>Rôles bannis</h2>
      <ul className="result">
        {s.players.map((p, i) => (
          <li key={i}>
            <b>{p.name}</b>
            <RoleButton id={p.ban!} />
          </li>
        ))}
      </ul>
      <Modes modes={s.modes} />
      <div className="bar">
        <button className="primary" onClick={() => set({ ...s, phase: 'draft' })}>
          Commencer la draft
        </button>
      </div>
    </div>
  )
}

function Draft({ s, set }: { s: State; set: SetState }) {
  const [sel, setSel] = useState<string | null>(null)

  if (s.turn >= s.queue.length) {
    return <Done s={s} set={set} />
  }
  const idx = s.queue[s.turn]
  const player = s.players[idx]

  if (!s.ready) {
    return (
      <Transition
        title={`Réveille ${player.name}`}
        text={`Draft — ${s.turn + 1}/${s.queue.length}. Donne-lui le téléphone.`}
        button={`${player.name} a le téléphone`}
        onNext={() => set({ ...s, ready: true, offer: draw(s, 3), seen: [] })}
      />
    )
  }

  if (s.reveal) {
    return (
      <Transition
        title="Ton rôle"
        text="Retiens-le bien, il ne sera plus affiché."
        button="J'ai compris"
        onNext={() => set({ ...s, reveal: false, ending: true })}
      >
        {player.pick && (
          <>
            <RoleButton id={player.pick} big />
            <p className="ability">{ABILITIES[player.pick]}</p>
          </>
        )}
      </Transition>
    )
  }

  if (s.ending) {
    return (
      <Transition
        title="Tirage terminé"
        text="Rends le téléphone au conteur."
        button="Continuer"
        onNext={() => set({ ...s, turn: s.turn + 1, ready: false, ending: false })}
      />
    )
  }

  const offer = s.offer ?? []
  const assign = (id: string, banned: string[]) => {
    const players = s.players.map((p, i) => (i === idx ? { ...p, pick: id } : p))
    setSel(null)
    set({ ...s, players, banned: [...s.banned, ...banned], offer: null, seen: [], reveal: true })
  }
  const pick = () => {
    if (sel) assign(sel, offer.filter((id) => id !== sel))
  }
  const mulligan = () => {
    const next = draw(s, offer.length - 1)
    setSel(null)
    if (next.length === 1) assign(next[0], [])
    else set({ ...s, offer: next, mulligans: s.mulligans + 1 })
  }
  return (
    <div className="screen">
      <h2>Choisis ton rôle</h2>
      {offer.length === 0 && <p>Plus aucun rôle disponible.</p>}
      <div className="offer">
        {offer.map((id) => (
          <RoleButton key={id} id={id} big onClick={() => setSel(id)} />
        ))}
      </div>
      {sel && (
        <RoleModal
          id={sel} action={`Choisir ${BY_ID.get(sel)!.name}`}
          onConfirm={pick} onClose={() => setSel(null)}
        />
      )}
      <p className="hint">Les rôles refusés sont bannis. Un mulligan ne bannit rien.</p>
      {offer.length > 1 && (
        <div className="bar">
          <button onClick={mulligan}>
            Mulligan ({offer.length - 1 === 1 ? 'rôle imposé' : `${offer.length - 1} choix`})
          </button>
        </div>
      )}
    </div>
  )
}
function Done({ s, set }: { s: State; set: SetState }) {
  const count = (t: RoleType) => picksOf(s).filter((id) => BY_ID.get(id)!.type === t).length
  return (
    <div className="screen">
      <h2>Résultat (conteur)</h2>
      <ul className="result">
        {s.players.map((p, i) => (
          <li key={i}>
            <b>{p.name}</b>
            {p.pick ? <RoleButton id={p.pick} /> : <em>—</em>}
          </li>
        ))}
      </ul>
      <Modes modes={s.modes} />
      <p className="hint">
        Composition : {TYPES.map((t) => `${count(t)} ${TYPE_PLURALS[t]}`).join(' / ')}
      </p>
      <button className="primary" onClick={() => set(initialState)}>Nouvelle partie</button>
    </div>
  )
}

export default function App() {
  const [s, set] = useState<State>(load)
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(s)), [s])

  if (s.phase === 'setup')
    return (
      <Setup
        onStart={(names) =>
          set({ ...initialState, phase: 'ban', players: names.map((name) => ({ name })) })
        }
      />
    )
  if (s.phase === 'ban') return <Ban s={s} set={set} />
  if (s.phase === 'handback')
    return (
      <Transition
        title="Bans terminés"
        text="Rends le téléphone au conteur."
        button="Voir les bans"
        onNext={() => set({ ...s, phase: 'recap' })}
      />
    )
  if (s.phase === 'recap') return <Recap s={s} set={set} />
  if (s.phase === 'draft') return <Draft s={s} set={set} />
  return <Done s={s} set={set} />
}
