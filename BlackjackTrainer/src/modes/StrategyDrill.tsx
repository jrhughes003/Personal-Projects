import { useCallback, useEffect, useRef, useState } from 'react'
import { ActionBar } from '../components/ActionBar'
import { describeDecision } from '../components/explain'
import { PlayingCard } from '../components/PlayingCard'
import { StrategyChart } from '../components/StrategyChart'
import { useHotkeys } from '../components/useHotkeys'
import { rankValue } from '../engine/cards'
import { formatCount } from '../engine/counting'
import { deviationLabel, recommend, type Recommendation } from '../engine/deviations'
import { generateDrillHand, type DrillFocus, type DrillHand } from '../engine/drill'
import { ACTION_LABELS, lookupChart, type Action } from '../engine/strategy'
import { useApp } from '../store/AppContext'
import { withDecision } from '../store/stats'

const FOCUSES: { id: DrillFocus; label: string }[] = [
  { id: 'all', label: 'Mixed' },
  { id: 'hard', label: 'Hard totals' },
  { id: 'soft', label: 'Soft totals' },
  { id: 'pairs', label: 'Pairs' },
  { id: 'deviations', label: 'Count deviations' },
]

interface Answer {
  chosen: Action
  rec: Recommendation
  reason: string
  correct: boolean
  ms: number
}

export function StrategyDrill() {
  const { settings, updateStats } = useApp()
  const rules = settings.rules
  const [focus, setFocus] = useState<DrillFocus>('all')
  const [hand, setHand] = useState<DrillHand>(() => generateDrillHand('all', rules))
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [score, setScore] = useState({ attempts: 0, correct: 0, streak: 0, best: 0, totalMs: 0 })
  const shownAt = useRef(performance.now())
  const advanceTimer = useRef<number | undefined>(undefined)

  const next = useCallback(
    (f: DrillFocus = focus) => {
      window.clearTimeout(advanceTimer.current)
      setHand(generateDrillHand(f, rules))
      setAnswer(null)
      shownAt.current = performance.now()
    },
    [focus, rules],
  )

  // New rules or focus → new question.
  useEffect(() => next(focus), [focus, rules])
  useEffect(() => () => window.clearTimeout(advanceTimer.current), [])

  const up = rankValue(hand.dealerUp.rank)

  const onAction = (a: Action) => {
    if (answer) return
    const rec = recommend(hand.cards, up, rules, hand.avail, hand.tc, hand.tc !== null)
    const { key, reason, deviation } = describeDecision(hand.cards, up, hand.avail.canSplit, rec, hand.tc)
    const correct = a === rec.action
    const ms = performance.now() - shownAt.current
    setAnswer({ chosen: a, rec, reason, correct, ms })
    setScore((s) => {
      const streak = correct ? s.streak + 1 : 0
      return {
        attempts: s.attempts + 1,
        correct: s.correct + (correct ? 1 : 0),
        streak,
        best: Math.max(s.best, streak),
        totalMs: s.totalMs + ms,
      }
    })
    updateStats((s) => withDecision(s, { situation: key, expected: ACTION_LABELS[rec.action], correct, deviation }))
    if (correct) advanceTimer.current = window.setTimeout(() => next(), 750)
  }

  useHotkeys({ enter: () => answer && next(), ' ': () => answer && next() }, true)

  const chart = lookupChart(hand.cards, up, rules, hand.avail.canSplit)
  const accuracy = score.attempts ? Math.round((score.correct / score.attempts) * 100) : null

  return (
    <div className="mode">
      <header className="mode-head">
        <div>
          <h1>Strategy drill</h1>
          <p className="muted">Pick the best play. Keys: H S D P R, Enter for next.</p>
        </div>
        <div className="segmented">
          {FOCUSES.map((f) => (
            <button key={f.id} className={focus === f.id ? 'on' : ''} onClick={() => setFocus(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="scorebar">
        <span>
          Score <b>{score.correct}/{score.attempts}</b>
          {accuracy !== null && <em> ({accuracy}%)</em>}
        </span>
        <span>
          Streak <b>{score.streak}</b> · best {score.best}
        </span>
        <span>Avg time {score.attempts ? (score.totalMs / score.attempts / 1000).toFixed(1) : '–'}s</span>
      </div>

      <div className="drill-layout">
        <section className="felt drill-table">
          <div className="seat">
            <div className="seat-label">Dealer</div>
            <div className="card-row">
              <PlayingCard card={hand.dealerUp} />
              <PlayingCard faceDown />
            </div>
          </div>
          {hand.tc !== null && (
            <div className="tc-badge">
              True count <b>{formatCount(hand.tc)}</b> <span className="muted">(Hi-Lo)</span>
            </div>
          )}
          <div className="seat">
            <div className="card-row">
              {hand.cards.map((c, i) => (
                <PlayingCard key={i} card={c} />
              ))}
            </div>
            <div className="seat-label">You</div>
          </div>
          <ActionBar
            avail={hand.avail}
            onAction={onAction}
            disabled={!!answer}
            correct={answer?.rec.action}
            chosen={answer && !answer.correct ? answer.chosen : undefined}
          />
          <div className={`feedback ${answer ? (answer.correct ? 'ok' : 'bad') : ''}`}>
            {answer ? (
              <>
                <b>{answer.correct ? 'Correct.' : `Not quite — ${ACTION_LABELS[answer.rec.action]}.`}</b> {answer.reason}
                {!answer.correct && (
                  <button className="link" onClick={() => next()}>
                    Next hand ↵
                  </button>
                )}
              </>
            ) : (
              <span className="muted">
                {hand.cards.length > 2 ? 'Three-card hand: doubling and surrender are off. ' : ''}
                {focus === 'deviations' ? 'Use the Illustrious 18 / Fab 4 index for this true count.' : ''}
              </span>
            )}
          </div>
        </section>

        <aside className="panel">
          <StrategyChart
            rules={rules}
            table={chart.table}
            compact
            highlight={answer ? { table: chart.table, rowKey: chart.rowKey, dealer: up } : null}
          />
          {answer?.rec.deviation && hand.tc !== null && (
            <p className="index-note">
              Count-based play: <b>{deviationLabel(answer.rec.deviation)}</b>. The chart shows the basic-strategy play it overrides.
            </p>
          )}
          <p className="muted small">The matching cell lights up after you answer. Charts follow your table rules in Settings.</p>
        </aside>
      </div>
    </div>
  )
}
