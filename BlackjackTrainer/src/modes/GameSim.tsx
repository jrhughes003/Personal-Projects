import { useMemo, useRef, useState } from 'react'
import { ActionBar } from '../components/ActionBar'
import { describeDecision } from '../components/explain'
import { PlayingCard } from '../components/PlayingCard'
import { useHotkeys } from '../components/useHotkeys'
import { rankValue } from '../engine/cards'
import { BET_RAMPS, betUnits, decksRemaining, flooredTrueCount, formatCount, SYSTEMS, trueCount } from '../engine/counting'
import { INSURANCE_INDEX, recommend, shouldTakeInsurance } from '../engine/deviations'
import {
  act,
  availability,
  canAffordInsurance,
  decideInsurance,
  needsShuffle,
  newGame,
  placeBet,
  roundNet,
  sideNet,
  unseenCards,
  type GameState,
  type Outcome,
} from '../engine/game'
import { handTotal } from '../engine/hand'
import { describeRules } from '../engine/rules'
import { ACTION_LABELS, type Action } from '../engine/strategy'
import {
  composition,
  fullShoeComposition,
  outcomeLabel,
  SIDE_BET_IDS,
  SIDE_BETS,
  sideBetEv,
  type SideBetId,
} from '../engine/sidebets'
import { useApp } from '../store/context'
import { resolvePaytable } from '../store/settings'
import { withCount, withDecision, withHand, withSideBets, withTally } from '../store/stats'

interface Note {
  id: number
  ok: boolean
  text: string
}

const OUTCOME_LABEL: Record<Outcome, string> = {
  blackjack: 'Blackjack!',
  win: 'Win',
  push: 'Push',
  lose: 'Lose',
  bust: 'Bust',
  surrender: 'Surrendered',
}

const pctEv = (ev: number) => `${ev >= 0 ? '+' : '−'}${Math.abs(ev * 100).toFixed(2)}%`

const money = (n: number) => `${n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export function GameSim() {
  const { settings, updateStats } = useApp()
  const { rules, system, tableMin, spread, sideBets: sideCfg } = settings
  const useIndices = settings.deviations && SYSTEMS[system].hasDeviations

  const fresh = () => newGame({ rules, system, bankroll: settings.startingBankroll })
  const [game, setGame] = useState<GameState>(fresh)
  const [units, setUnits] = useState(1)
  const [activeSides, setActiveSides] = useState<SideBetId[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [session, setSession] = useState({ decisions: 0, correct: 0, hands: 0 })
  const [hud, setHud] = useState(settings.showCountHud)
  const [buyIn, setBuyIn] = useState(settings.startingBankroll)
  const [countCheck, setCountCheck] = useState<null | { answer: string; result?: { ok: boolean; actual: number } }>(null)
  const noteId = useRef(0)

  const unseen = unseenCards(game)
  const tc = trueCount(game.runningCount, unseen)
  const shufflePending = (game.phase === 'betting' || game.phase === 'settled') && needsShuffle(game)
  // The bet is judged on the count before the deal; a pending shuffle means a fresh shoe at 0.
  const betTc = shufflePending ? 0 : tc
  const recUnits = betUnits(betTc, system, spread)
  const chipUnits = BET_RAMPS[spread].map((step) => step.units)
  const enabledSides = SIDE_BET_IDS.filter((id) => sideCfg.enabled[id])

  const betweenHands = game.phase === 'betting' || game.phase === 'settled'
  // Exact EV of each enabled side bet for the next hand, from the unseen cards.
  const sideEvs = useMemo(() => {
    // Only needed between hands; skip the work while cards are being played.
    const ids = betweenHands ? SIDE_BET_IDS.filter((id) => sideCfg.enabled[id]) : []
    if (ids.length === 0) return {} as Partial<Record<SideBetId, number>>
    const comp = shufflePending ? fullShoeComposition(rules.decks) : composition(game.shoe.slice(game.pos))
    return Object.fromEntries(ids.map((id) => [id, sideBetEv(id, comp, resolvePaytable(sideCfg, id), rules.h17)])) as Partial<
      Record<SideBetId, number>
    >
  }, [game.shoe, game.pos, shufflePending, betweenHands, rules.decks, rules.h17, sideCfg])

  const note = (ok: boolean, text: string) => {
    noteId.current += 1
    const n = { id: noteId.current, ok, text }
    setNotes((prev) => [n, ...prev].slice(0, 40))
  }

  /** Apply a new state; book-keep the round once it settles. */
  const commit = (next: GameState) => {
    if (next.phase === 'settled' && game.phase !== 'settled') {
      const net = roundNet(next)
      const wagered = next.sideResults.reduce((sum, r) => sum + r.amount, 0)
      const returned = next.sideResults.reduce((sum, r) => sum + r.payout, 0)
      updateStats((s) => withSideBets(withHand(s, net), wagered, returned, []))
      setSession((s) => ({ ...s, hands: s.hands + 1 }))
      if (settings.countCheckEvery > 0 && next.rounds % settings.countCheckEvery === 0) setCountCheck({ answer: '' })
    }
    setGame(next)
  }

  const deal = () => {
    if (countCheck && !countCheck.result) return
    setCountCheck(null)
    if (game.bankroll < tableMin) return
    const bet = Math.min(units * tableMin, game.bankroll)
    const sides = activeSides
      .filter((id) => sideCfg.enabled[id])
      .map((id) => ({ id, amount: sideCfg.amount, paytable: resolvePaytable(sideCfg, id) }))
    const sidesAffordable = bet + sides.length * sideCfg.amount <= game.bankroll
    const betOk = units === recUnits
    note(
      betOk,
      betOk
        ? `Bet ${units}u at TC ${formatCount(flooredTrueCount(betTc))} ✓`
        : `Bet ${units}u — the ramp says ${recUnits}u at TC ${formatCount(flooredTrueCount(betTc))}`,
    )
    updateStats((s) => withTally(s, 'bets', betOk))
    if (sideCfg.gradeEv) {
      const graded: boolean[] = []
      for (const id of enabledSides) {
        const ev = sideEvs[id]
        if (ev === undefined) continue
        const placed = activeSides.includes(id) && sidesAffordable
        const name = SIDE_BETS[id].name
        if (placed && ev < 0) note(false, `${name} is ${pctEv(ev)} here — a losing bet at this count.`)
        else if (placed) note(true, `${name} at ${pctEv(ev)} ✓ — the shoe makes it a good bet.`)
        else if (ev > 0) note(false, `Missed spot: ${name} was ${pctEv(ev)} for this hand.`)
        if (placed || ev > 0) graded.push(placed === ev > 0)
      }
      if (graded.length) updateStats((s) => withSideBets(s, 0, 0, graded))
    }
    commit(placeBet(game, bet, undefined, sidesAffordable ? sides : []))
  }

  const insure = (take: boolean) => {
    if (game.phase !== 'insurance') return
    const should = shouldTakeInsurance(tc, system, useIndices) && canAffordInsurance(game)
    const ok = take === should
    const why = useIndices
      ? `insure at TC ${formatCount(INSURANCE_INDEX)}+, now ${formatCount(flooredTrueCount(tc))}`
      : 'without a Hi-Lo index, never insure'
    note(ok, `${take ? 'Took' : 'Declined'} insurance — ${ok ? 'correct' : 'wrong'} (${why})`)
    updateStats((s) => withTally(s, 'insurance', ok))
    commit(decideInsurance(game, take))
  }

  const onAction = (a: Action) => {
    if (game.phase !== 'player') return
    const hand = game.hands[game.active]
    const up = rankValue(game.dealer[0].rank)
    const avail = availability(game)
    const rec = recommend(hand.cards, up, rules, avail, tc, useIndices)
    const { key, reason, deviation } = describeDecision(hand.cards, up, avail.canSplit, rec, useIndices ? tc : null)
    const ok = a === rec.action
    note(
      ok,
      ok
        ? `${ACTION_LABELS[a]} ✓ ${reason}`
        : `${ACTION_LABELS[a]} ✗ — should ${ACTION_LABELS[rec.action].toLowerCase()}. ${reason}`,
    )
    setSession((s) => ({ ...s, decisions: s.decisions + 1, correct: s.correct + (ok ? 1 : 0) }))
    updateStats((s) => withDecision(s, { situation: key, expected: ACTION_LABELS[rec.action], correct: ok, deviation }))
    commit(act(game, a))
  }

  const submitCountCheck = () => {
    if (!countCheck) return
    const n = Number(countCheck.answer.replace('−', '-').replace(/^\+/, ''))
    if (!Number.isInteger(n) || countCheck.answer.trim() === '') return
    const ok = n === game.runningCount
    setCountCheck({ ...countCheck, result: { ok, actual: game.runningCount } })
    updateStats((s) =>
      withCount(s, { mode: 'table', system: SYSTEMS[system].name, correct: ok, detail: `after round ${game.rounds}` }),
    )
  }

  const betting = game.phase === 'betting' || game.phase === 'settled'
  const broke = betting && game.bankroll < tableMin

  useHotkeys(
    {
      enter: () => (betting && !broke ? deal() : undefined),
      ' ': () => (betting && !broke ? deal() : undefined),
      i: () => insure(true),
      n: () => insure(false),
      ...Object.fromEntries(chipUnits.map((u, i) => [String(i + 1), () => betting && setUnits(u)])),
    },
    !(countCheck && !countCheck.result),
  )

  const dealerTotal = useMemo(
    () => (game.dealer.length ? handTotal(game.holeRevealed ? game.dealer : game.dealer.slice(0, 1)) : null),
    [game.dealer, game.holeRevealed],
  )
  const shoeUsed = (game.pos / game.shoe.length) * 100
  const cutPct = (game.cutAt / game.shoe.length) * 100
  const accuracy = session.decisions ? Math.round((session.correct / session.decisions) * 100) : null

  return (
    <div className="mode">
      <header className="mode-head">
        <div>
          <h1>Table</h1>
          <p className="muted small">
            {describeRules(rules)} · {SYSTEMS[system].name}
            {useIndices ? ' with I18/Fab 4' : ''}
          </p>
        </div>
        <div className="hud-controls">
          <label className="toggle">
            <input type="checkbox" checked={hud} onChange={(e) => setHud(e.target.checked)} /> Show count
          </label>
          <button
            onClick={() => {
              setGame(fresh())
              setBuyIn(settings.startingBankroll)
              setNotes([])
              setSession({ decisions: 0, correct: 0, hands: 0 })
            }}
          >
            New shoe
          </button>
        </div>
      </header>

      <div className="scorebar">
        <span>
          Bankroll <b>{money(game.bankroll)}</b>
        </span>
        <span>
          Session net <b className={game.bankroll - buyIn >= 0 ? 'pos' : 'neg'}>{money(game.bankroll - buyIn)}</b>
        </span>
        <span>
          Play accuracy <b>{accuracy === null ? '–' : `${accuracy}%`}</b> ({session.correct}/{session.decisions})
        </span>
        <span>Hands {session.hands}</span>
        {hud && (
          <span className="hud">
            RC <b>{formatCount(game.runningCount)}</b> · TC <b>{formatCount(Number(tc.toFixed(1)))}</b> · {decksRemaining(unseen)}{' '}
            decks left
          </span>
        )}
      </div>

      <div className="drill-layout">
        <section className="felt table">
          <div className="shoe-meter" title="Shoe dealt; the line marks the cut card">
            <div className="shoe-used" style={{ width: `${shoeUsed}%` }} />
            <div className="shoe-cut" style={{ left: `${cutPct}%` }} />
          </div>

          <div className="seat">
            <div className="seat-label">
              Dealer{' '}
              {dealerTotal && game.dealer.length > 0 && (
                <span className="total">{game.holeRevealed ? dealerTotal.total : `${dealerTotal.total} showing`}</span>
              )}
            </div>
            <div className="card-row">
              {game.dealer.length === 0 ? (
                <>
                  <PlayingCard faceDown />
                  <PlayingCard faceDown />
                </>
              ) : (
                game.dealer.map((c, i) => <PlayingCard key={i} card={c} faceDown={i === 1 && !game.holeRevealed} />)
              )}
            </div>
          </div>

          <div className="hands">
            {game.hands.map((h, i) => {
              const t = handTotal(h.cards)
              const active = game.phase === 'player' && i === game.active
              return (
                <div key={i} className={`seat hand ${active ? 'active' : ''}`}>
                  <div className="card-row">
                    {h.cards.map((c, j) => (
                      <PlayingCard key={j} card={c} />
                    ))}
                  </div>
                  <div className="seat-label">
                    <span className="total">{t.soft && t.total < 21 ? `soft ${t.total}` : t.total}</span> · {money(h.bet)}
                    {h.doubled && ' (doubled)'}
                    {game.phase === 'settled' && h.outcome && (
                      <span className={`outcome o-${h.outcome}`}>
                        {OUTCOME_LABEL[h.outcome]} {h.payout !== undefined && `${money(h.payout - h.bet)}`}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {game.hands.length === 0 && <div className="seat-label muted">Place a bet to deal.</div>}
          </div>

          {game.sideResults.length > 0 && (
            <div className="side-results" aria-label="Side bet results">
              {game.sideResults.map((r) => (
                <span key={r.id} className={r.payout > 0 ? 'win' : 'lose'}>
                  {SIDE_BETS[r.id].name}:{' '}
                  {r.outcome ? `${outcomeLabel(r.id, r.outcome)} +${money(r.payout - r.amount)}` : `lost ${money(r.amount)}`}
                </span>
              ))}
              {game.phase === 'settled' && <b className={sideNet(game) >= 0 ? 'pos' : 'neg'}>Side bets {money(sideNet(game))}</b>}
            </div>
          )}

          <div className="controls">
            {game.phase === 'insurance' && (
              <div className="insurance">
                <span>Dealer shows an ace. Insurance{handTotal(game.hands[0].cards).total === 21 ? ' (even money)' : ''}?</span>
                <button onClick={() => insure(true)} disabled={!canAffordInsurance(game)}>
                  Take <kbd>I</kbd>
                </button>
                <button onClick={() => insure(false)}>
                  Decline <kbd>N</kbd>
                </button>
              </div>
            )}

            {game.phase === 'player' && <ActionBar avail={availability(game)} onAction={onAction} />}

            {betting && countCheck && (
              <div className="count-check">
                {!countCheck.result ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      submitCountCheck()
                    }}
                  >
                    <label>
                      Count check — what's the running count?
                      <input
                        autoFocus
                        value={countCheck.answer}
                        onChange={(e) => setCountCheck({ answer: e.target.value })}
                        placeholder="e.g. +4"
                      />
                    </label>
                    <button className="primary" type="submit">
                      Check
                    </button>
                  </form>
                ) : (
                  <div className={`verdict ${countCheck.result.ok ? 'ok' : 'bad'}`}>
                    {countCheck.result.ok ? 'Right on' : 'Off'} — the running count is {formatCount(countCheck.result.actual)} (TC{' '}
                    {formatCount(Number(tc.toFixed(1)))})
                  </div>
                )}
              </div>
            )}

            {betting && !(countCheck && !countCheck.result) && (
              <div className="betting">
                {shufflePending && (
                  <div className="notice">Cut card reached — the next hand comes from a fresh shoe (count resets to 0).</div>
                )}
                {game.shuffled && game.phase === 'settled' && (
                  <div className="notice">This hand was dealt from a fresh shoe.</div>
                )}
                {broke ? (
                  <button
                    className="primary"
                    onClick={() => {
                      setGame({ ...game, bankroll: game.bankroll + settings.startingBankroll })
                      setBuyIn(buyIn + settings.startingBankroll)
                    }}
                  >
                    Rebuy {money(settings.startingBankroll)}
                  </button>
                ) : (
                  <>
                    <div className="chips">
                      {chipUnits.map((u) => (
                        <button key={u} className={`chip ${units === u ? 'on' : ''}`} onClick={() => setUnits(u)}>
                          {money(u * tableMin)}
                        </button>
                      ))}
                    </div>
                    {enabledSides.length > 0 && (
                      <div className="side-spots">
                        {enabledSides.map((id) => {
                          const on = activeSides.includes(id)
                          const ev = sideEvs[id]
                          return (
                            <button
                              key={id}
                              className={`side-spot ${on ? 'on' : ''}`}
                              aria-pressed={on}
                              title={`${SIDE_BETS[id].name}: ${money(sideCfg.amount)}, pays ${SIDE_BETS[id].resolves}`}
                              onClick={() => setActiveSides(on ? activeSides.filter((x) => x !== id) : [...activeSides, id])}
                            >
                              <span>{SIDE_BETS[id].name}</span>
                              <small>{on ? money(sideCfg.amount) : 'off'}</small>
                              {hud && ev !== undefined && <small className={ev >= 0 ? 'pos' : 'neg'}>EV {pctEv(ev)}</small>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {settings.showBetHint && (
                      <span className="muted small">
                        Ramp: {recUnits}u at TC {formatCount(flooredTrueCount(betTc))}
                      </span>
                    )}
                    <button className="primary deal" onClick={deal}>
                      Deal{' '}
                      {money(
                        Math.min(units * tableMin, game.bankroll) +
                          activeSides.filter((id) => sideCfg.enabled[id]).length * sideCfg.amount,
                      )}{' '}
                      ↵
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="panel log">
          <h3>Coach</h3>
          {notes.length === 0 && (
            <p className="muted small">
              Every bet, insurance call, side bet and play is checked here. Keys 1–{chipUnits.length} pick a chip.
            </p>
          )}
          <ul>
            {notes.map((n) => (
              <li key={n.id} className={n.ok ? 'ok' : 'bad'}>
                {n.text}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
