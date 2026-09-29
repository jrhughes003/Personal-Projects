import { describe, expect, it } from 'vitest'
import { seededRng } from './cards'
import { betUnits, countCards, trueCount } from './counting'
import { recommend, shouldTakeInsurance } from './deviations'
import { generateDrillHand } from './drill'
import { act, availability, dealerUpValue, decideInsurance, newGame, placeBet, roundNet, unseenCards } from './game'
import { DEFAULT_RULES, type Rules } from './rules'

const RULESETS: Rules[] = [
  DEFAULT_RULES,
  { ...DEFAULT_RULES, h17: true, das: false, surrender: false, decks: 8, penetration: 0.9 },
  { ...DEFAULT_RULES, decks: 4, blackjackPays: 1.2 },
]

describe('engine fuzz', () => {
  it.each(RULESETS.map((r, i) => [i, r] as const))('plays 3000 rounds cleanly (ruleset %i)', (_i, rules) => {
    const rng = seededRng(42)
    let s = newGame({ rules, system: 'hilo', bankroll: 1_000_000, rng })
    for (let round = 0; round < 3000; round++) {
      const before = s.bankroll
      const tc = trueCount(s.runningCount, unseenCards(s))
      s = placeBet(s, 10 * betUnits(tc, 'hilo'), rng)
      if (s.phase === 'insurance') {
        s = decideInsurance(s, shouldTakeInsurance(trueCount(s.runningCount, unseenCards(s)), 'hilo', true))
      }
      let guard = 0
      while (s.phase === 'player') {
        const h = s.hands[s.active]
        const tcNow = trueCount(s.runningCount, unseenCards(s))
        const rec = recommend(h.cards, dealerUpValue(s), rules, availability(s), tcNow, true)
        s = act(s, rec.action)
        if (++guard > 50) throw new Error('round never ended')
      }
      expect(s.phase).toBe('settled')
      expect(s.bankroll - before).toBeCloseTo(roundNet(s), 6)
      // The running count always equals the tags of every face-up card dealt this shoe.
      const seen = s.shoe.slice(0, s.pos)
      expect(s.runningCount).toBe(countCards(seen, 'hilo'))
    }
  })
})

describe('drill generator', () => {
  it('deviation drills always land on their index play', () => {
    const rng = seededRng(7)
    for (let i = 0; i < 500; i++) {
      const h = generateDrillHand('deviations', DEFAULT_RULES, rng)
      const d = h.deviation!
      const rec = recommend(h.cards, d.dealer, DEFAULT_RULES, h.avail, h.tc, true)
      if (h.tc! >= d.index) {
        expect(rec.action).toBe(d.atOrAbove)
      } else if (d.atOrAbove === 'surrender') {
        // Below a Fab 4 index the hand is played without surrender (maybe by an I18 index).
        expect(rec.action).not.toBe('surrender')
      } else {
        expect(rec.deviation?.id).toBe(d.id)
      }
    }
  })

  it('generates legal hands for every focus', () => {
    const rng = seededRng(3)
    for (const f of ['all', 'hard', 'soft', 'pairs'] as const) {
      for (let i = 0; i < 300; i++) {
        const h = generateDrillHand(f, DEFAULT_RULES, rng)
        expect(h.cards.length).toBeGreaterThanOrEqual(2)
        expect(h.tc).toBeNull()
      }
    }
  })
})
