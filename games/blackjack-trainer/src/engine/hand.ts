import { rankValue, type Card } from './cards'

export interface HandTotal {
  total: number
  /** True when an ace is currently counted as 11. */
  soft: boolean
}

export function handTotal(cards: readonly Card[]): HandTotal {
  let total = 0
  let aces = 0
  for (const c of cards) {
    const v = rankValue(c.rank)
    if (v === 11) {
      aces++
      total += 1
    } else {
      total += v
    }
  }
  const soft = aces > 0 && total + 10 <= 21
  return { total: soft ? total + 10 : total, soft }
}

export function isBust(cards: readonly Card[]): boolean {
  return handTotal(cards).total > 21
}

/** A natural: two cards totalling 21 that did not come from a split. */
export function isBlackjack(cards: readonly Card[], fromSplit = false): boolean {
  return !fromSplit && cards.length === 2 && handTotal(cards).total === 21
}

/** Two cards of the same blackjack value (any two ten-value cards count). */
export function isPair(cards: readonly Card[]): boolean {
  return cards.length === 2 && rankValue(cards[0].rank) === rankValue(cards[1].rank)
}

export function describeHand(cards: readonly Card[]): string {
  const { total, soft } = handTotal(cards)
  return `${soft ? 'Soft' : 'Hard'} ${total}`
}
