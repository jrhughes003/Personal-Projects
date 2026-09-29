import { useEffect, useRef, useState } from 'react'
import { PlayingCard } from '../components/PlayingCard'
import { useHotkeys } from '../components/useHotkeys'
import { makeDeck, makeShoe, shuffle, type Card } from '../engine/cards'
import { acceptableTrueCounts, countCards, formatCount, SYSTEMS, tagOf, trueCount } from '../engine/counting'
import { useApp } from '../store/AppContext'
import { withCount } from '../store/stats'

type Tab = 'flash' | 'countdown' | 'truecount'

export function CountingDrill() {
  const { settings } = useApp()
  const [tab, setTab] = useState<Tab>('flash')
  const sys = SYSTEMS[settings.system]
  return (
    <div className="mode">
      <header className="mode-head">
        <div>
          <h1>Counting drills</h1>
          <p className="muted">
            Counting with <b>{sys.name}</b>:{' '}
            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((v) => `${v === 11 ? 'A' : v === 10 ? 'T' : v} ${formatCount(sys.tags[v])}`).join(' · ')}
          </p>
        </div>
        <div className="segmented">
          <button className={tab === 'flash' ? 'on' : ''} onClick={() => setTab('flash')}>
            Card flash
          </button>
          <button className={tab === 'countdown' ? 'on' : ''} onClick={() => setTab('countdown')}>
            Deck countdown
          </button>
          <button className={tab === 'truecount' ? 'on' : ''} onClick={() => setTab('truecount')}>
            True count
          </button>
        </div>
      </header>
      {tab === 'flash' && <FlashDrill />}
      {tab === 'countdown' && <CountdownDrill />}
      {tab === 'truecount' && <TrueCountDrill />}
    </div>
  )
}

function parseCount(s: string): number | null {
  const t = s.trim().replace('−', '-').replace(/^\+/, '')
  if (!/^-?\d+$/.test(t)) return null
  return Number(t)
}

function CountAnswer({ label, onSubmit }: { label: string; onSubmit: (n: number) => void }) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.focus(), [])
  const n = parseCount(value)
  return (
    <form
      className="count-answer"
      onSubmit={(e) => {
        e.preventDefault()
        if (n !== null) onSubmit(n)
      }}
    >
      <label>
        {label}
        <input ref={ref} value={value} onChange={(e) => setValue(e.target.value)} inputMode="numeric" placeholder="e.g. -3" />
      </label>
      <button type="submit" className="primary" disabled={n === null}>
        Check
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------

type FlashPhase = 'setup' | 'running' | 'answer' | 'result'

function FlashDrill() {
  const { settings, updateStats } = useApp()
  const system = settings.system
  const [count, setCount] = useState(20)
  const [speed, setSpeed] = useState(900)
  const [perFlash, setPerFlash] = useState(1)
  const [phase, setPhase] = useState<FlashPhase>('setup')
  const [cards, setCards] = useState<Card[]>([])
  const [idx, setIdx] = useState(0)
  const [result, setResult] = useState<{ guess: number; actual: number } | null>(null)

  useEffect(() => {
    if (phase !== 'running') return
    if (idx >= cards.length) {
      setPhase('answer')
      return
    }
    const t = window.setTimeout(() => setIdx((i) => i + perFlash), speed)
    return () => window.clearTimeout(t)
  }, [phase, idx, cards.length, perFlash, speed])

  const start = () => {
    setCards(makeShoe(2).slice(0, count))
    setIdx(0)
    setResult(null)
    setPhase('running')
  }

  const submit = (guess: number) => {
    const actual = countCards(cards, system)
    setResult({ guess, actual })
    setPhase('result')
    updateStats((s) =>
      withCount(s, {
        mode: 'flash',
        system: SYSTEMS[system].name,
        correct: guess === actual,
        detail: `${cards.length} cards @ ${speed}ms × ${perFlash}`,
      }),
    )
  }

  useHotkeys({ enter: () => (phase === 'setup' || phase === 'result') && start() }, phase !== 'answer')

  const showing = cards.slice(idx, idx + perFlash)

  return (
    <div className="drill-layout single">
      <section className="felt count-stage">
        {phase === 'setup' && (
          <div className="setup">
            <label>
              Cards
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[10, 20, 30, 52, 104].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cards per flash
              <select value={perFlash} onChange={(e) => setPerFlash(Number(e.target.value))}>
                {[1, 2, 3].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="grow">
              Speed: {(speed / 1000).toFixed(2)}s per flash
              <input type="range" min={200} max={2000} step={50} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
            </label>
            <button className="primary" onClick={start}>
              Start ↵
            </button>
          </div>
        )}

        {phase === 'running' && (
          <>
            <div className="card-row big">
              {showing.map((c, i) => (
                <PlayingCard key={`${idx}-${i}`} card={c} />
              ))}
            </div>
            <div className="progress">
              <div style={{ width: `${(Math.min(idx, cards.length) / cards.length) * 100}%` }} />
            </div>
            <button className="link" onClick={() => setPhase('setup')}>
              Stop
            </button>
          </>
        )}

        {phase === 'answer' && <CountAnswer label="Running count?" onSubmit={submit} />}

        {phase === 'result' && result && (
          <div className="result">
            <div className={`verdict ${result.guess === result.actual ? 'ok' : 'bad'}`}>
              {result.guess === result.actual
                ? `Correct — ${formatCount(result.actual)}`
                : `You said ${formatCount(result.guess)}, the count was ${formatCount(result.actual)}`}
            </div>
            <p className="muted small">Review (tag under each card, running count on the right):</p>
            <ReviewStrip cards={cards} />
            <button className="primary" onClick={start}>
              Again ↵
            </button>{' '}
            <button onClick={() => setPhase('setup')}>Change settings</button>
          </div>
        )}
      </section>
    </div>
  )
}

function ReviewStrip({ cards }: { cards: Card[] }) {
  const { settings } = useApp()
  let rc = 0
  return (
    <div className="review">
      {cards.map((c, i) => {
        const tag = tagOf(c, settings.system)
        rc += tag
        return (
          <div key={i} className="review-item">
            <PlayingCard card={c} small tag={tag} />
            <span className="rc">{formatCount(rc)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------

type CountdownPhase = 'ready' | 'running' | 'answer' | 'result'

function CountdownDrill() {
  const { settings, stats, updateStats } = useApp()
  const system = settings.system
  const [phase, setPhase] = useState<CountdownPhase>('ready')
  const [deck, setDeck] = useState<Card[]>([])
  const [missing, setMissing] = useState<Card | null>(null)
  const [idx, setIdx] = useState(0)
  const [startedAt, setStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ guess: number; actual: number } | null>(null)

  const begin = () => {
    const d = shuffle(makeDeck())
    setMissing(d[51])
    setDeck(d.slice(0, 51))
    setIdx(0)
    setResult(null)
    setStartedAt(performance.now())
    setPhase('running')
  }

  const advance = () => {
    if (phase !== 'running') return
    if (idx + 1 >= deck.length) {
      setElapsed(performance.now() - startedAt)
      setPhase('answer')
    } else {
      setIdx(idx + 1)
    }
  }

  const submit = (guess: number) => {
    const actual = countCards(deck, system)
    setResult({ guess, actual })
    setPhase('result')
    updateStats((s) =>
      withCount(
        s,
        { mode: 'countdown', system: SYSTEMS[system].name, correct: guess === actual, detail: `51 cards in ${(elapsed / 1000).toFixed(1)}s` },
        elapsed,
      ),
    )
  }

  useHotkeys(
    {
      ' ': () => (phase === 'running' ? advance() : phase !== 'answer' && begin()),
      arrowright: advance,
      enter: () => phase !== 'running' && phase !== 'answer' && begin(),
    },
    phase !== 'answer',
  )

  return (
    <div className="drill-layout single">
      <section className="felt count-stage">
        {phase === 'ready' && (
          <div className="result">
            <p>
              One card is secretly removed. Count down the other 51 as fast as you can (Space or → for the next card). A balanced count
              ends at the negative of the missing card's tag, so your final count tells you what's missing.
            </p>
            {stats.bestCountdownMs !== null && <p className="muted">Personal best: {(stats.bestCountdownMs / 1000).toFixed(1)}s</p>}
            <button className="primary" onClick={begin}>
              Start (Space)
            </button>
          </div>
        )}
        {phase === 'running' && (
          <>
            <div className="card-row big clickable" onClick={advance}>
              <PlayingCard card={deck[idx]} />
            </div>
            <div className="muted">
              Card {idx + 1} / {deck.length}
            </div>
            <div className="progress">
              <div style={{ width: `${((idx + 1) / deck.length) * 100}%` }} />
            </div>
          </>
        )}
        {phase === 'answer' && (
          <>
            <div className="muted">Time: {(elapsed / 1000).toFixed(1)}s</div>
            <CountAnswer label="Final running count?" onSubmit={submit} />
          </>
        )}
        {phase === 'result' && result && missing && (
          <div className="result">
            <div className={`verdict ${result.guess === result.actual ? 'ok' : 'bad'}`}>
              {result.guess === result.actual
                ? `Correct — ${formatCount(result.actual)} in ${(elapsed / 1000).toFixed(1)}s`
                : `You said ${formatCount(result.guess)}, the count was ${formatCount(result.actual)}`}
            </div>
            <div className="missing">
              <span>Missing card:</span> <PlayingCard card={missing} small tag={tagOf(missing, system)} />
            </div>
            <button className="primary" onClick={begin}>
              Again (Space)
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------

function newTrueCountQuestion(decks: number, level: number) {
  const totalCards = decks * 52
  // Somewhere between half a deck dealt and half a deck left, on half-deck marks.
  const halves = 1 + Math.floor(Math.random() * (decks * 2 - 1))
  const cardsLeft = halves * 26
  const span = 8 * level
  const rc = Math.floor(Math.random() * (span * 2 + 1)) - Math.floor(span * 0.6)
  return { rc, cardsLeft, dealtFraction: 1 - cardsLeft / totalCards }
}

function TrueCountDrill() {
  const { settings, updateStats } = useApp()
  const system = settings.system
  const decks = settings.rules.decks
  const level = SYSTEMS[system].level
  const [q, setQ] = useState(() => newTrueCountQuestion(decks, level))
  const [result, setResult] = useState<{ guess: number; exact: number; ok: boolean } | null>(null)
  const [score, setScore] = useState({ attempts: 0, correct: 0 })
  const [key, setKey] = useState(0)

  const next = () => {
    setQ(newTrueCountQuestion(decks, level))
    setResult(null)
    setKey((k) => k + 1)
  }

  const submit = (guess: number) => {
    const exact = trueCount(q.rc, q.cardsLeft)
    const ok = acceptableTrueCounts(exact).includes(guess)
    setResult({ guess, exact, ok })
    setScore((s) => ({ attempts: s.attempts + 1, correct: s.correct + (ok ? 1 : 0) }))
    updateStats((s) =>
      withCount(s, {
        mode: 'truecount',
        system: SYSTEMS[system].name,
        correct: ok,
        detail: `RC ${formatCount(q.rc)} with ${q.cardsLeft / 52} decks left`,
      }),
    )
  }

  useHotkeys({ enter: () => result && next() }, !!result)

  return (
    <div className="drill-layout single">
      <section className="felt count-stage">
        <div className="scorebar inline">
          Score <b>{score.correct}/{score.attempts}</b>
        </div>
        <div className="tc-question">
          <div>
            <div className="muted">Running count</div>
            <div className="big-number">{formatCount(q.rc)}</div>
          </div>
          <div>
            <div className="muted">Discard tray ({decks}-deck shoe)</div>
            <div className="tray">
              <div className="tray-fill" style={{ height: `${q.dealtFraction * 100}%` }} />
            </div>
            <div className="muted small">{q.cardsLeft / 52} decks remaining</div>
          </div>
        </div>
        {!result && <CountAnswer key={key} label="True count (whole number)?" onSubmit={submit} />}
        {result && (
          <div className="result">
            <div className={`verdict ${result.ok ? 'ok' : 'bad'}`}>
              {result.ok ? 'Correct' : `Not quite (you said ${formatCount(result.guess)})`} — {formatCount(q.rc)} ÷ {q.cardsLeft / 52} ={' '}
              {result.exact.toFixed(2)}
            </div>
            <p className="muted small">Flooring, truncating or rounding are all accepted; the table sim floors (so +2.9 plays as +2).</p>
            <button className="primary" onClick={next}>
              Next ↵
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
