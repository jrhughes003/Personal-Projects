import { describe, expect, it } from 'vitest'
import { makeDeck, type Card, type Rank, type Suit } from './cards'
import {
  classify21Plus3,
  classifyBuster,
  classifyLuckyLadies,
  classifyPerfectPairs,
  composition,
  fullShoeComposition,
  outcomeProbs21Plus3,
  outcomeProbsPerfectPairs,
  paytableFor,
  sideBetEv,
} from './sidebets'

const c = (rank: Rank, suit: Suit = '♠'): Card => ({ rank, suit })

describe('side bet hands', () => {
  it('scores 21+3', () => {
    expect(classify21Plus3([c('7'), c('7'), c('7')])).toBe('suitedTrips')
    expect(classify21Plus3([c('7'), c('7', '♥'), c('7')])).toBe('trips')
    expect(classify21Plus3([c('Q'), c('K'), c('A')])).toBe('straightFlush')
    expect(classify21Plus3([c('A', '♥'), c('2'), c('3')])).toBe('straight')
    expect(classify21Plus3([c('K', '♥'), c('A'), c('2')])).toBeNull()
    expect(classify21Plus3([c('2'), c('9'), c('K')])).toBe('flush')
    // Ten-value cards are not a pair in poker terms.
    expect(classify21Plus3([c('10'), c('J', '♥'), c('K', '♦')])).toBeNull()
  })

  it('scores Perfect Pairs', () => {
    expect(classifyPerfectPairs([c('8'), c('8')])).toBe('perfect')
    expect(classifyPerfectPairs([c('8', '♥'), c('8', '♦')])).toBe('colored')
    expect(classifyPerfectPairs([c('8', '♥'), c('8', '♣')])).toBe('mixed')
    expect(classifyPerfectPairs([c('J'), c('Q')])).toBeNull()
  })

  it('scores Lucky Ladies', () => {
    expect(classifyLuckyLadies([c('Q', '♥'), c('Q', '♥')], true)).toBe('qhPairDealerBj')
    expect(classifyLuckyLadies([c('Q', '♥'), c('Q', '♥')], false)).toBe('qhPair')
    expect(classifyLuckyLadies([c('K'), c('K')], false)).toBe('matched')
    expect(classifyLuckyLadies([c('K'), c('10')], false)).toBe('suited')
    expect(classifyLuckyLadies([c('A', '♥'), c('9')], false)).toBe('any20')
    expect(classifyLuckyLadies([c('A'), c('8')], false)).toBeNull()
  })

  it('scores Buster by cards in the busted hand', () => {
    expect(classifyBuster([c('10'), c('6'), c('K')])).toBe('3')
    expect(classifyBuster([c('2'), c('2'), c('2'), c('2'), c('2'), c('2'), c('A'), c('4'), c('K')])).toBe('8')
    expect(classifyBuster([c('10'), c('7')])).toBeNull()
  })
})

describe('side bet expected value', () => {
  it('matches brute-force enumeration of a single deck', () => {
    const deck = makeDeck()
    const brute: Record<string, number> = {}
    let n = 0
    for (let i = 0; i < 52; i++)
      for (let j = 0; j < 52; j++)
        for (let k = 0; k < 52; k++) {
          if (i === j || i === k || j === k) continue
          n++
          const key = classify21Plus3([deck[i], deck[j], deck[k]])
          if (key) brute[key] = (brute[key] ?? 0) + 1
        }
    const probs = outcomeProbs21Plus3(composition(deck))
    for (const key of Object.keys(brute)) expect(probs[key]).toBeCloseTo(brute[key] / n, 12)
  })

  it('reproduces published house edges', () => {
    // Classic 9:1 21+3 over six decks: 3.24%. Perfect Pairs 25/12/6 over eight decks: 4.10%.
    expect(sideBetEv('twentyOneThree', fullShoeComposition(6), paytableFor('twentyOneThree', '9-all'), false)).toBeCloseTo(
      -0.0324,
      3,
    )
    expect(sideBetEv('perfectPairs', fullShoeComposition(8), paytableFor('perfectPairs', '25-12-6'), false)).toBeCloseTo(
      -0.041,
      3,
    )
  })

  it('pair probabilities sum correctly for a six-deck shoe', () => {
    const p = outcomeProbsPerfectPairs(fullShoeComposition(6))
    // P(same rank) = 23/311 for six decks.
    expect(p.perfect + p.colored + p.mixed).toBeCloseTo(23 / 311, 10)
  })

  it('keeps every side bet negative off the top of a shoe', () => {
    const shoe = fullShoeComposition(6)
    for (const id of ['luckyLadies', 'buster'] as const) {
      const ev = sideBetEv(id, shoe, paytableFor(id), false)
      expect(ev).toBeLessThan(0)
      expect(ev).toBeGreaterThan(-0.3)
    }
  })

  it('makes Lucky Ladies better as tens pile up', () => {
    const rich = fullShoeComposition(1)
    // Remove all small cards from a one-deck remainder: a very high count.
    for (let r = 1; r <= 5; r++) for (let s = 0; s < 4; s++) rich[r * 4 + s] = 0
    const pay = paytableFor('luckyLadies')
    expect(sideBetEv('luckyLadies', rich, pay, false)).toBeGreaterThan(
      sideBetEv('luckyLadies', fullShoeComposition(1), pay, false),
    )
  })
})
