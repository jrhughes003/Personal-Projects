export type Suit = '♠' | '♥' | '♦' | '♣'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  rank: Rank
  suit: Suit
}

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export type Rng = () => number

/** Blackjack value of a rank, counting an ace as 11 and every face card as 10. */
export function rankValue(rank: Rank): number {
  if (rank === 'A') return 11
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10
  return Number(rank)
}

export function isRed(card: Card): boolean {
  return card.suit === '♥' || card.suit === '♦'
}

export function makeDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit })
  return deck
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function makeShoe(decks: number, rng: Rng = Math.random): Card[] {
  const cards: Card[] = []
  for (let d = 0; d < decks; d++) cards.push(...makeDeck())
  return shuffle(cards, rng)
}

export function randomSuit(rng: Rng = Math.random): Suit {
  return SUITS[Math.floor(rng() * SUITS.length)]
}

/** A card with the given blackjack value (10 picks a random ten-value rank). */
export function cardOfValue(value: number, rng: Rng = Math.random): Card {
  let rank: Rank
  if (value === 11 || value === 1) rank = 'A'
  else if (value === 10) rank = (['10', 'J', 'Q', 'K'] as Rank[])[Math.floor(rng() * 4)]
  else rank = String(value) as Rank
  return { rank, suit: randomSuit(rng) }
}

/** Dealer upcard value drawn with real-shoe frequencies (a ten is 4/13). */
export function randomUpcardValue(rng: Rng = Math.random): number {
  const rank = RANKS[Math.floor(rng() * RANKS.length)]
  return rankValue(rank)
}

/** Deterministic PRNG (mulberry32), for tests and reproducible drills. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
