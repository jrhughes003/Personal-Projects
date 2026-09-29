import { describe, expect, it } from 'vitest'
import type { Card, Rank } from './cards'
import { recommend, shouldTakeInsurance } from './deviations'
import { DEFAULT_RULES } from './rules'
import { ALL_AVAILABLE } from './strategy'

const hand = (...ranks: Rank[]): Card[] => ranks.map((rank) => ({ rank, suit: '♥' }))
const rules = { ...DEFAULT_RULES, surrender: false }
const withSurrender = { ...DEFAULT_RULES, surrender: true }
const noSur = { ...ALL_AVAILABLE, canSurrender: false }

describe('Hi-Lo deviations', () => {
  it('stands 16 vs 10 at TC 0 and above', () => {
    expect(recommend(hand('10', '6'), 10, rules, noSur, -1, true).action).toBe('hit')
    const r = recommend(hand('10', '6'), 10, rules, noSur, 0, true)
    expect(r.action).toBe('stand')
    expect(r.deviated).toBe(true)
  })

  it('still surrenders 16 vs 10 when surrender is offered', () => {
    expect(recommend(hand('10', '6'), 10, withSurrender, ALL_AVAILABLE, 3, true).action).toBe('surrender')
  })

  it('handles the Fab 4 15 vs 10 surrender index', () => {
    expect(recommend(hand('10', '5'), 10, withSurrender, ALL_AVAILABLE, 0, true).action).toBe('surrender')
    expect(recommend(hand('10', '5'), 10, withSurrender, ALL_AVAILABLE, -1, true).action).toBe('hit')
    expect(recommend(hand('10', '4'), 10, withSurrender, ALL_AVAILABLE, 3, true).action).toBe('surrender')
    expect(recommend(hand('10', '4'), 10, withSurrender, ALL_AVAILABLE, 2, true).action).toBe('hit')
  })

  it('splits tens vs 6 at +4 but never by basic strategy', () => {
    expect(recommend(hand('K', 'Q'), 6, rules, noSur, 4, true).action).toBe('split')
    expect(recommend(hand('K', 'Q'), 6, rules, noSur, 3, true).action).toBe('stand')
    expect(recommend(hand('K', 'Q'), 6, rules, noSur, 10, false).action).toBe('stand')
  })

  it('hits 12 vs 4 below zero', () => {
    expect(recommend(hand('10', '2'), 4, rules, noSur, -1, true).action).toBe('hit')
    expect(recommend(hand('10', '2'), 4, rules, noSur, 0, true).action).toBe('stand')
  })

  it('keeps splitting 6,6 vs 4 instead of using the hard 12 index', () => {
    expect(recommend(hand('6', '6'), 4, rules, noSur, -3, true).action).toBe('split')
  })

  it('ignores a double index when doubling is not allowed', () => {
    const r = recommend(
      hand('4', '3', '3'),
      10,
      rules,
      { canHit: true, canDouble: false, canSplit: false, canSurrender: false },
      6,
      true,
    )
    expect(r.action).toBe('hit')
  })

  it('insures at +3 with Hi-Lo only', () => {
    expect(shouldTakeInsurance(3, 'hilo', true)).toBe(true)
    expect(shouldTakeInsurance(2.9, 'hilo', true)).toBe(false)
    expect(shouldTakeInsurance(5, 'zen', true)).toBe(false)
    expect(shouldTakeInsurance(5, 'hilo', false)).toBe(false)
  })
})
