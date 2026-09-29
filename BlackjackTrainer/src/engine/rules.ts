export interface Rules {
  /** The strategy tables are the 4–8 deck charts, so only shoe games are offered. */
  decks: 4 | 6 | 8
  /** Dealer hits soft 17. */
  h17: boolean
  /** Double after split allowed. */
  das: boolean
  /** Late surrender (after the dealer checks for blackjack). */
  surrender: boolean
  /** Payout for a natural: 1.5 for 3:2, 1.2 for 6:5. */
  blackjackPays: 1.5 | 1.2
  /** Fraction of the shoe dealt before the cut card, 0.5–0.9. */
  penetration: number
  /** Most hands a player can split into. */
  maxHands: number
}

export const DEFAULT_RULES: Rules = {
  decks: 6,
  h17: false,
  das: true,
  surrender: true,
  blackjackPays: 1.5,
  penetration: 0.75,
  maxHands: 4,
}

export function describeRules(r: Rules): string {
  return [
    `${r.decks} decks`,
    r.h17 ? 'H17' : 'S17',
    r.das ? 'DAS' : 'no DAS',
    r.surrender ? 'late surrender' : 'no surrender',
    `BJ pays ${r.blackjackPays === 1.5 ? '3:2' : '6:5'}`,
    `${Math.round(r.penetration * 100)}% penetration`,
  ].join(' · ')
}
