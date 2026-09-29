import { describe, expect, it } from 'vitest'
import { makeDeck } from './cards'
import { acceptableTrueCounts, betUnits, countCards, decksRemaining, SYSTEMS, trueCount, type SystemId } from './counting'

describe('counting systems', () => {
  it.each(Object.keys(SYSTEMS) as SystemId[])('%s is balanced over a full deck', (id) => {
    expect(countCards(makeDeck(), id)).toBe(0)
  })

  it('estimates decks to the nearest half', () => {
    expect(decksRemaining(156)).toBe(3)
    expect(decksRemaining(140)).toBe(2.5)
    expect(decksRemaining(5)).toBe(0.5)
  })

  it('divides running count by decks remaining', () => {
    expect(trueCount(9, 156)).toBe(3)
    expect(trueCount(-5, 130)).toBe(-2)
  })

  it('ramps bets, halving level-2 counts', () => {
    expect(betUnits(1.9, 'hilo')).toBe(1)
    expect(betUnits(2, 'hilo')).toBe(2)
    expect(betUnits(3.5, 'hilo')).toBe(4)
    expect(betUnits(9, 'hilo')).toBe(8)
    expect(betUnits(4, 'zen')).toBe(2)
    expect(betUnits(-3, 'omega2')).toBe(1)
  })

  it('accepts floor, truncation or rounding of the true count', () => {
    expect(acceptableTrueCounts(2.6).sort()).toEqual([2, 3])
    expect(acceptableTrueCounts(-1.5).sort()).toEqual([-1, -2])
  })
})

describe('bet spreads', () => {
  it('tops out at the chosen spread', () => {
    expect(betUnits(10, 'hilo', 4)).toBe(4)
    expect(betUnits(10, 'hilo', 12)).toBe(12)
    expect(betUnits(3, 'hilo', 12)).toBe(4)
    expect(betUnits(0, 'hilo', 12)).toBe(1)
  })
})
