import { useEffect, useState } from 'react'
import { BY_ID, CHARACTERS, TYPE_LABELS, type RoleType } from './data/characters'
import {
  MAX_PLAYERS, MIN_PLAYERS, draw, initialState, quotaFor, picksOf, type State,
} from './logic/draft'
import './App.css'

const KEY = 'botc-draft-v1'
const TYPES: RoleType[] = ['townsfolk', 'outsider', 'minion', 'demon']

function load(): State {
  try {
    return { ...initialState, ...JSON.parse(localStorage.getItem(KEY) ?? '') }
  } catch {
    return initialState
  }
}

function RoleButton({
  id, onClick, disabled, selected, big,
}: {
  id: string; onClick?: () => void; disabled?: boolean; selected?: boolean; big?: boolean
}) {
  const ch = BY_ID.get(id)!
  return (
    <button
      className={`role ${ch.type} ${selected ? 'selected' : ''} ${big ? 'big' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {ch.name}
      {big && <small>{TYPE_LABELS[ch.type]}</small>}
    </button>
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

function Ban({ s, set }: { s: State; set: (s: State) => void }) {
  const [sel, setSel] = useState<string | null>(null)
  const player = s.players[s.turn]
  const validate = () => {
    if (!sel) return
    const players = s.players.map((p, i) => (i === s.turn ? { ...p, ban: sel } : p))
    const banned = [...s.banned, sel]
    const last = s.turn + 1 >= s.players.length
    set({ ...s, players, banned, turn: s.turn + 1, phase: last ? 'draft' : 'ban' })
    setSel(null)
  }
  return (
    <div className="screen">
      <h2>Ban — {player.name} ({s.turn + 1}/{s.players.length})</h2>
      {TYPES.map((t) => (
        <section key={t}>
          <h3>{TYPE_LABELS[t]}s</h3>
          <div className="grid">
            {CHARACTERS.filter((c) => c.type === t).map((c) => (
              <RoleButton
                key={c.id} id={c.id} selected={sel === c.id}
                disabled={s.banned.includes(c.id)}
                onClick={() => setSel(c.id)}
              />
            ))}
          </div>
        </section>
      ))}
      <div className="bar">
        <button className="primary" disabled={!sel} onClick={validate}>
          Bannir {sel ? BY_ID.get(sel)!.name : '…'}
        </button>
      </div>
    </div>
  )
}

function Draft({ s, set }: { s: State; set: (s: State) => void }) {
  const [sel, setSel] = useState<string | null>(null)
  const waiting = s.players.map((p, i) => ({ p, i })).filter(({ p }) => !p.pick)

  if (waiting.length === 0) {
    return <Done s={s} set={set} />
  }

  if (s.current === null) {
    return (
      <div className="screen">
        <h2>Draft — qui est réveillé ?</h2>
        <p>{waiting.length} joueur(s) restant(s). Choisis le joueur que tu réveilles.</p>
        <div className="grid">
          {waiting.map(({ p, i }) => (
            <button
              key={i} className="role"
              onClick={() => set({ ...s, current: i, offer: draw(s, 3), mulliganed: false, seen: [] })}
            >
              {p.name}
            </button>
          ))}
        </div>
        <button className="link" onClick={() => set({ ...s, phase: 'done' })}>Terminer</button>
      </div>
    )
  }

  const offer = s.offer ?? []
  const pick = () => {
    if (!sel) return
    const players = s.players.map((p, i) => (i === s.current ? { ...p, pick: sel } : p))
    const rejected = offer.filter((id) => id !== sel)
    set({ ...s, players, banned: [...s.banned, ...rejected], current: null, offer: null, seen: [] })
    setSel(null)
  }
  const mulligan = () => {
    const seen = [...s.seen, ...offer]
    set({ ...s, offer: draw(s, 2, seen), mulliganed: true, seen })
    setSel(null)
  }
  return (
    <div className="screen">
      <h2>{s.players[s.current].name}, choisis ton rôle</h2>
      {offer.length === 0 && <p>Plus aucun rôle disponible.</p>}
      <div className="offer">
        {offer.map((id) => (
          <RoleButton key={id} id={id} big selected={sel === id} onClick={() => setSel(id)} />
        ))}
      </div>
      <p className="hint">Les rôles refusés sont bannis.</p>
      <div className="bar">
        <button className="primary" disabled={!sel} onClick={pick}>Choisir</button>
        {!s.mulliganed && (
          <button onClick={mulligan}>Mulligan (2 choix, rien n'est banni)</button>
        )}
      </div>
    </div>
  )
}

function Done({ s, set }: { s: State; set: (s: State) => void }) {
  const picks = picksOf(s)
  const q = quotaFor(s.players.length, picks)
  return (
    <div className="screen">
      <h2>Résultat</h2>
      <ul className="result">
        {s.players.map((p, i) => (
          <li key={i}>
            <b>{p.name}</b>
            {p.pick ? <RoleButton id={p.pick} /> : <em>—</em>}
          </li>
        ))}
      </ul>
      <p className="hint">
        Cible : {TYPES.map((t) => `${q[t]} ${TYPE_LABELS[t]}`).join(' / ')}
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
  if (s.phase === 'draft') return <Draft s={s} set={set} />
  return <Done s={s} set={set} />
}
