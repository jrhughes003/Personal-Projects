import { describe, expect, it } from 'vitest'
import type { Card, Rank } from './cards'
import { act, availability, decideInsurance, newGame, placeBet, roundNet } from './game'
import { DEFAULT_RULES } from './rules'

// Deal order: player, dealer up, player, dealer hole, then hits in order.
const shoe = (...ranks: Rank[]): Card[] => [...ranks.map((rank) => ({ rank, suit: '♣' as const })), ...Array(200).fill({ rank: '9', suit: '♣' })]
const game = (...ranks: Rank[]) => newGame({ rules: DEFAULT_RULES, system: 'hilo', bankroll: 1000, shoe: shoe(...ranks) })

describe('game engine', () => {
  it('pays a natural 3:2', () => {
    const s = placeBet(game('A', '9', 'K', '7'), 10)
    expect(s.phase).toBe('settled')
    expect(s.hands[0].outcome).toBe('blackjack')
    expect(s.bankroll).toBe(1015)
  })

  it('stands, lets the dealer draw and settles', () => {
    let s = placeBet(game('10', '10', '8', '6', '5'), 10)
    s = act(s, 'stand')
    // Dealer 16 draws a 5 → 21.
    expect(s.dealer.length).toBe(3)
    expect(s.hands[0].outcome).toBe('lose')
    expect(s.bankroll).toBe(990)
  })

  it('doubles for one card', () => {
    let s = placeBet(game('6', '6', '5', '10', '10', '10'), 10)
    s = act(s, 'double')
    expect(s.hands[0].cards.length).toBe(3)
    expect(s.hands[0].bet).toBe(20)
    // Player 21, dealer 16 draws 10 → bust.
    expect(s.hands[0].outcome).toBe('win')
    expect(s.bankroll).toBe(1020)
  })

  it('splits and plays each hand', () => {
    let s = placeBet(game('8', '10', '8', '7', '3', '10'), 10)
    expect(availability(s).canSplit).toBe(true)
    s = act(s, 'split')
    expect(s.hands.length).toBe(2)
    expect(s.hands[0].cards.map((c) => c.rank)).toEqual(['8', '3'])
    s = act(s, 'double') // 8,3 + 10 = 21
    expect(s.hands[1].cards.length).toBe(2) // second hand got its card
    s = act(s, 'stand')
    expect(s.phase).toBe('settled')
    expect(s.hands[0].outcome).toBe('win')
  })

  it('gives split aces one card each', () => {
    let s = placeBet(game('A', '10', 'A', '7', 'K', '5'), 10)
    s = act(s, 'split')
    expect(s.phase).toBe('settled')
    expect(s.hands.map((h) => h.outcome)).toEqual(['win', 'lose'])
    expect(s.hands[0].outcome).not.toBe('blackjack')
  })

  it('offers insurance and pays it on a dealer blackjack', () => {
    let s = placeBet(game('10', 'A', '9', 'K'), 10)
    expect(s.phase).toBe('insurance')
    s = decideInsurance(s, true)
    expect(s.phase).toBe('settled')
    expect(roundNet(s)).toBe(0)
    expect(s.bankroll).toBe(1000)
  })

  it('refunds half on surrender', () => {
    let s = placeBet(game('10', '10', '6', '8'), 10)
    s = act(s, 'surrender')
    expect(s.hands[0].outcome).toBe('surrender')
    expect(s.bankroll).toBe(995)
  })

  it('counts the hole card only once revealed', () => {
    let s = placeBet(game('2', '3', '4', '10'), 10)
    expect(s.runningCount).toBe(3)
    s = act(s, 'stand')
    expect(s.runningCount).toBe(2) // hole 10 is −1; the dealer's 9s are neutral
  })

  it('reshuffles past the cut card', () => {
    let s = newGame({ rules: { ...DEFAULT_RULES, penetration: 0.5 }, system: 'hilo', bankroll: 1000 })
    s = { ...s, pos: s.cutAt, runningCount: 7 }
    s = placeBet(s, 10)
    expect(s.shuffled).toBe(true)
    expect(s.pos).toBeLessThan(10)
  })
})
