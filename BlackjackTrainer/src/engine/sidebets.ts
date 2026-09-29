import { RANKS, rankValue, SUITS, type Card, type Rank, type Suit } from './cards'
import { handTotal } from './hand'

export type SideBetId = 'twentyOneThree' | 'perfectPairs' | 'luckyLadies' | 'buster'

export interface Paytable {
  id: string
  name: string
  /** Outcome key → odds paid "to 1". */
  pays: Record<string, number>
}

export interface SideBetDef {
  id: SideBetId
  name: string
  /** When the bet is decided, in player terms. */
  resolves: string
  description: string
  outcomes: { key: string; label: string }[]
  paytables: Paytable[]
}

export const SIDE_BETS: Record<SideBetId, SideBetDef> = {
  twentyOneThree: {
    id: 'twentyOneThree',
    name: '21+3',
    resolves: 'on the deal',
    description: 'Your first two cards plus the dealer upcard, scored as a three-card poker hand.',
    outcomes: [
      { key: 'suitedTrips', label: 'Suited trips' },
      { key: 'straightFlush', label: 'Straight flush' },
      { key: 'trips', label: 'Three of a kind' },
      { key: 'straight', label: 'Straight' },
      { key: 'flush', label: 'Flush' },
    ],
    paytables: [
      {
        id: '100-40-30-10-5',
        name: '100 / 40 / 30 / 10 / 5',
        pays: { suitedTrips: 100, straightFlush: 40, trips: 30, straight: 10, flush: 5 },
      },
      {
        id: '9-all',
        name: 'Classic 9:1 on any hand',
        pays: { suitedTrips: 9, straightFlush: 9, trips: 9, straight: 9, flush: 9 },
      },
    ],
  },
  perfectPairs: {
    id: 'perfectPairs',
    name: 'Perfect Pairs',
    resolves: 'on the deal',
    description: 'Pays when your first two cards are a pair of the same rank.',
    outcomes: [
      { key: 'perfect', label: 'Perfect pair (same suit)' },
      { key: 'colored', label: 'Colored pair (same color)' },
      { key: 'mixed', label: 'Mixed pair' },
    ],
    paytables: [
      { id: '25-12-6', name: '25 / 12 / 6', pays: { perfect: 25, colored: 12, mixed: 6 } },
      { id: '30-10-5', name: '30 / 10 / 5', pays: { perfect: 30, colored: 10, mixed: 5 } },
    ],
  },
  luckyLadies: {
    id: 'luckyLadies',
    name: 'Lucky Ladies',
    resolves: 'after the dealer checks for blackjack',
    description:
      'Pays when your first two cards total 20. Two queens of hearts pay the most, the jackpot if the dealer also has blackjack.',
    outcomes: [
      { key: 'qhPairDealerBj', label: 'Q♥ pair + dealer blackjack' },
      { key: 'qhPair', label: 'Q♥ pair' },
      { key: 'matched', label: 'Matched 20 (same rank & suit)' },
      { key: 'suited', label: 'Suited 20' },
      { key: 'any20', label: 'Any 20' },
    ],
    paytables: [
      {
        id: '1000-200-25-10-4',
        name: '1000 / 200 / 25 / 10 / 4',
        pays: { qhPairDealerBj: 1000, qhPair: 200, matched: 25, suited: 10, any20: 4 },
      },
      {
        id: '1000-125-19-9-4',
        name: '1000 / 125 / 19 / 9 / 4',
        pays: { qhPairDealerBj: 1000, qhPair: 125, matched: 19, suited: 9, any20: 4 },
      },
    ],
  },
  buster: {
    id: 'buster',
    name: 'Buster Blackjack',
    resolves: 'when the dealer finishes (the dealer always plays out while it is in action)',
    description: 'Pays when the dealer busts, more for the more cards in the busted hand. Loses to a dealer blackjack.',
    outcomes: [
      { key: '8', label: 'Dealer busts with 8+ cards' },
      { key: '7', label: '7 cards' },
      { key: '6', label: '6 cards' },
      { key: '5', label: '5 cards' },
      { key: '4', label: '4 cards' },
      { key: '3', label: '3 cards' },
    ],
    paytables: [
      {
        id: '250-100-50-9-2-1',
        name: '250 / 100 / 50 / 9 / 2 / 1',
        pays: { '8': 250, '7': 100, '6': 50, '5': 9, '4': 2, '3': 1 },
      },
    ],
  },
}

export const SIDE_BET_IDS = Object.keys(SIDE_BETS) as SideBetId[]

export function paytableFor(id: SideBetId, paytableId?: string): Paytable {
  const def = SIDE_BETS[id]
  return def.paytables.find((p) => p.id === paytableId) ?? def.paytables[0]
}

export function outcomeLabel(id: SideBetId, key: string): string {
  return SIDE_BETS[id].outcomes.find((o) => o.key === key)?.label ?? key
}

// ---- hand classification ----

const POKER_RANK: Record<Rank, number> = {
  A: 14,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
}

function isStraight(ranks: Rank[]): boolean {
  const hi = ranks.map((r) => POKER_RANK[r]).sort((a, b) => a - b)
  const consecutive = (v: number[]) => v[1] === v[0] + 1 && v[2] === v[1] + 1
  if (consecutive(hi)) return true
  // Ace plays low too: A-2-3.
  const lo = hi.map((v) => (v === 14 ? 1 : v)).sort((a, b) => a - b)
  return consecutive(lo)
}

export function classify21Plus3(cards: readonly Card[]): string | null {
  const [a, b, c] = cards
  const flush = a.suit === b.suit && b.suit === c.suit
  const trips = a.rank === b.rank && b.rank === c.rank
  if (trips) return flush ? 'suitedTrips' : 'trips'
  const straight = isStraight([a.rank, b.rank, c.rank])
  if (straight && flush) return 'straightFlush'
  if (straight) return 'straight'
  if (flush) return 'flush'
  return null
}

const isRedSuit = (s: Suit) => s === '♥' || s === '♦'

export function classifyPerfectPairs(cards: readonly Card[]): string | null {
  const [a, b] = cards
  if (a.rank !== b.rank) return null
  if (a.suit === b.suit) return 'perfect'
  if (isRedSuit(a.suit) === isRedSuit(b.suit)) return 'colored'
  return 'mixed'
}

const isQh = (c: Card) => c.rank === 'Q' && c.suit === '♥'

export function classifyLuckyLadies(cards: readonly Card[], dealerBlackjack: boolean): string | null {
  const [a, b] = cards
  if (handTotal([a, b]).total !== 20) return null
  if (isQh(a) && isQh(b)) return dealerBlackjack ? 'qhPairDealerBj' : 'qhPair'
  if (a.rank === b.rank && a.suit === b.suit) return 'matched'
  if (a.suit === b.suit) return 'suited'
  return 'any20'
}

/** Buster key for a finished dealer hand, or null when the dealer didn't bust. */
export function classifyBuster(dealer: readonly Card[]): string | null {
  if (handTotal(dealer).total <= 21) return null
  return String(Math.min(8, dealer.length))
}

// ---- expected value from shoe composition ----

/** Unseen cards as counts per card type (13 ranks × 4 suits, index rank*4+suit). */
export type Composition = number[]

export function composition(cards: readonly Card[]): Composition {
  const counts = new Array(52).fill(0)
  for (const c of cards) counts[RANKS.indexOf(c.rank) * 4 + SUITS.indexOf(c.suit)]++
  return counts
}

const TYPES: Card[] = RANKS.flatMap((rank) => SUITS.map((suit) => ({ rank, suit })))

function total(comp: Composition): number {
  return comp.reduce((a, b) => a + b, 0)
}

/** Expected net return per unit bet (e.g. −0.032 is a 3.2% house edge). */
function evFromOutcomes(probs: Record<string, number>, pays: Record<string, number>): number {
  let win = 0
  let pWin = 0
  for (const [k, p] of Object.entries(probs)) {
    win += p * (pays[k] ?? 0)
    pWin += p
  }
  return win - (1 - pWin)
}

export function outcomeProbs21Plus3(comp: Composition): Record<string, number> {
  const n = total(comp)
  const probs: Record<string, number> = {}
  const denom = n * (n - 1) * (n - 2)
  // Unordered triples of card types, weighted by how many ways each can be drawn.
  for (let i = 0; i < 52; i++) {
    if (!comp[i]) continue
    for (let j = i; j < 52; j++) {
      const nj = comp[j] - (j === i ? 1 : 0)
      if (nj <= 0) continue
      for (let k = j; k < 52; k++) {
        const nk = comp[k] - (k === i ? 1 : 0) - (k === j ? 1 : 0)
        if (nk <= 0) continue
        const key = classify21Plus3([TYPES[i], TYPES[j], TYPES[k]])
        if (!key) continue
        // comp[i]*nj*nk counts one ordering of this multiset; multiply by its distinct orderings.
        const orderings = i === j && j === k ? 1 : i === j || j === k ? 3 : 6
        probs[key] = (probs[key] ?? 0) + (comp[i] * nj * nk * orderings) / denom
      }
    }
  }
  return probs
}

export function outcomeProbsPerfectPairs(comp: Composition): Record<string, number> {
  const n = total(comp)
  const probs: Record<string, number> = {}
  for (let i = 0; i < 52; i++) {
    if (!comp[i]) continue
    for (let j = 0; j < 52; j++) {
      const nj = comp[j] - (j === i ? 1 : 0)
      if (nj <= 0) continue
      const key = classifyPerfectPairs([TYPES[i], TYPES[j]])
      if (key) probs[key] = (probs[key] ?? 0) + (comp[i] * nj) / (n * (n - 1))
    }
  }
  return probs
}

export function outcomeProbsLuckyLadies(comp: Composition): Record<string, number> {
  const n = total(comp)
  const probs: Record<string, number> = {}
  const aceIdx = [0, 1, 2, 3]
  const tenIdx = TYPES.map((c, i) => (rankValue(c.rank) === 10 ? i : -1)).filter((i) => i >= 0)
  const qh = RANKS.indexOf('Q') * 4 + SUITS.indexOf('♥')
  for (let i = 0; i < 52; i++) {
    if (!comp[i]) continue
    for (let j = 0; j < 52; j++) {
      const nj = comp[j] - (j === i ? 1 : 0)
      if (nj <= 0) continue
      const p = (comp[i] * nj) / (n * (n - 1))
      const a = TYPES[i]
      const b = TYPES[j]
      if (handTotal([a, b]).total !== 20) continue
      if (i === qh && j === qh) {
        // Dealer blackjack from what's left after the two queens.
        const aces = aceIdx.reduce((s, x) => s + comp[x], 0)
        const tens = tenIdx.reduce((s, x) => s + comp[x], 0) - 2
        const m = n - 2
        const pBj = (2 * aces * tens) / (m * (m - 1))
        probs.qhPairDealerBj = (probs.qhPairDealerBj ?? 0) + p * pBj
        probs.qhPair = (probs.qhPair ?? 0) + p * (1 - pBj)
      } else {
        const key = classifyLuckyLadies([a, b], false)!
        probs[key] = (probs[key] ?? 0) + p
      }
    }
  }
  return probs
}

/**
 * Buster outcome odds. The dealer's draws use the current shoe's value mix
 * without removing each drawn card (a small approximation; exact enumeration
 * of every dealer sequence is far slower and moves the answer by a few hundredths
 * of a percent).
 */
export function outcomeProbsBuster(comp: Composition, h17: boolean): Record<string, number> {
  const n = total(comp)
  const pv = new Array(12).fill(0)
  TYPES.forEach((c, i) => (pv[rankValue(c.rank)] += comp[i] / n))
  const probs: Record<string, number> = {}

  const walk = (hard: number, aces: number, cards: number, p: number) => {
    const soft = aces > 0 && hard + 10 <= 21
    const t = soft ? hard + 10 : hard
    if (t > 21) {
      const key = String(Math.min(8, cards))
      probs[key] = (probs[key] ?? 0) + p
      return
    }
    if (t > 17 || (t === 17 && !(soft && h17))) return
    for (let v = 2; v <= 11; v++) {
      if (!pv[v]) continue
      walk(hard + (v === 11 ? 1 : v), aces + (v === 11 ? 1 : 0), cards + 1, p * pv[v])
    }
  }

  for (let up = 2; up <= 11; up++) {
    for (let hole = 2; hole <= 11; hole++) {
      const p = pv[up] * pv[hole]
      if (!p) continue
      // A dealer blackjack is checked first and beats the bet.
      if ((up === 11 && hole === 10) || (up === 10 && hole === 11)) continue
      const aces = (up === 11 ? 1 : 0) + (hole === 11 ? 1 : 0)
      walk((up === 11 ? 1 : up) + (hole === 11 ? 1 : hole), aces, 2, p)
    }
  }
  return probs
}

export function sideBetEv(id: SideBetId, comp: Composition, paytable: Paytable, h17: boolean): number {
  switch (id) {
    case 'twentyOneThree':
      return evFromOutcomes(outcomeProbs21Plus3(comp), paytable.pays)
    case 'perfectPairs':
      return evFromOutcomes(outcomeProbsPerfectPairs(comp), paytable.pays)
    case 'luckyLadies':
      return evFromOutcomes(outcomeProbsLuckyLadies(comp), paytable.pays)
    case 'buster':
      return evFromOutcomes(outcomeProbsBuster(comp, h17), paytable.pays)
  }
}

export function fullShoeComposition(decks: number): Composition {
  return new Array(52).fill(decks)
}
