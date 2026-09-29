import { describe, expect, it } from 'vitest'
import type { Card, Rank } from './cards'
import { DEFAULT_RULES, type Rules } from './rules'
import { ALL_AVAILABLE, basicStrategy, lookupChart, situationLabel } from './strategy'

const c = (rank: Rank): Card => ({ rank, suit: '♠' })
const hand = (...ranks: Rank[]) => ranks.map(c)
const S17: Rules = { ...DEFAULT_RULES, h17: false, das: true, surrender: true }
const H17: Rules = { ...S17, h17: true }
const noSurrender = { ...ALL_AVAILABLE, canSurrender: false }

describe('basic strategy (4–8 decks)', () => {
  it.each([
    [hand('10', '6'), 10, 'surrender'],
    [hand('10', '6'), 7, 'hit'],
    [hand('10', '2'), 4, 'stand'],
    [hand('10', '2'), 3, 'hit'],
    [hand('6', '5'), 11, 'hit'],
    [hand('6', '5'), 10, 'double'],
    [hand('5', '4'), 2, 'hit'],
    [hand('5', '4'), 3, 'double'],
    [hand('A', '7'), 2, 'stand'],
    [hand('A', '7'), 6, 'double'],
    [hand('A', '7'), 9, 'hit'],
    [hand('A', '2'), 4, 'hit'],
    [hand('A', '4'), 4, 'double'],
    [hand('8', '8'), 11, 'split'],
    [hand('9', '9'), 7, 'stand'],
    [hand('9', '9'), 8, 'split'],
    [hand('5', '5'), 9, 'double'],
    [hand('K', 'Q'), 6, 'stand'],
    [hand('A', 'A'), 11, 'split'],
    [hand('2', '2'), 2, 'split'],
    [hand('4', '4'), 5, 'split'],
  ] as const)('S17 %j vs %i → %s', (cards, up, want) => {
    expect(basicStrategy(cards, up, S17, ALL_AVAILABLE)).toBe(want)
  })

  it('applies H17 changes', () => {
    expect(basicStrategy(hand('6', '5'), 11, H17, ALL_AVAILABLE)).toBe('double')
    expect(basicStrategy(hand('10', '5'), 11, H17, ALL_AVAILABLE)).toBe('surrender')
    expect(basicStrategy(hand('10', '7'), 11, H17, ALL_AVAILABLE)).toBe('surrender')
    expect(basicStrategy(hand('A', '7'), 2, H17, ALL_AVAILABLE)).toBe('double')
    expect(basicStrategy(hand('A', '8'), 6, H17, ALL_AVAILABLE)).toBe('double')
    expect(basicStrategy(hand('8', '8'), 11, H17, ALL_AVAILABLE)).toBe('surrender')
    expect(basicStrategy(hand('8', '8'), 11, H17, noSurrender)).toBe('split')
  })

  it('applies no-DAS pair changes', () => {
    const noDas = { ...S17, das: false }
    expect(basicStrategy(hand('2', '2'), 2, noDas, ALL_AVAILABLE)).toBe('hit')
    expect(basicStrategy(hand('4', '4'), 5, noDas, ALL_AVAILABLE)).toBe('hit')
    expect(basicStrategy(hand('6', '6'), 2, noDas, ALL_AVAILABLE)).toBe('hit')
  })

  it('falls back when a move is unavailable', () => {
    const three = hand('2', '3', '6')
    expect(basicStrategy(three, 6, S17, { canHit: true, canDouble: false, canSplit: false, canSurrender: false })).toBe('hit')
    expect(
      basicStrategy(hand('A', '3', '4'), 5, S17, { canHit: true, canDouble: false, canSplit: false, canSurrender: false }),
    ).toBe('stand')
    expect(basicStrategy(hand('10', '6'), 10, S17, noSurrender)).toBe('hit')
    expect(basicStrategy(hand('8', '8'), 10, S17, { ...noSurrender, canSplit: false })).toBe('hit')
  })

  it('reads non-split pairs from the hard table', () => {
    expect(lookupChart(hand('5', '5'), 6, S17, true).table).toBe('hard')
    expect(lookupChart(hand('10', 'J'), 6, S17, true).table).toBe('hard')
    expect(situationLabel(hand('8', '8'), 10, true)).toBe('Pair 8s vs 10')
    expect(situationLabel(hand('A', '6'), 11, true)).toBe('Soft 17 vs A')
  })
})
