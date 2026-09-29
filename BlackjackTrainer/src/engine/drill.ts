import { cardOfValue, randomUpcardValue, type Card, type Rng } from './cards'
import { deviationsFor, type Deviation } from './deviations'
import { isPair } from './hand'
import type { Rules } from './rules'
import type { Availability } from './strategy'

export type DrillFocus = 'all' | 'hard' | 'soft' | 'pairs' | 'deviations'

export interface DrillHand {
  cards: Card[]
  dealerUp: Card
  avail: Availability
  /** Shown to the player and used for indices; null for pure basic strategy. */
  tc: number | null
  deviation?: Deviation
}

const randInt = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))

/** Two different non-ace values (2–10) that sum to `total` (5–19). */
function twoCardHard(total: number, rng: Rng): number[] {
  for (;;) {
    const a = randInt(rng, Math.max(2, total - 10), Math.min(10, total - 2))
    const b = total - a
    if (a !== b) return [a, b]
    if (total === 4 || total === 20) return [a, b]
  }
}

function threeCardHard(total: number, rng: Rng): number[] {
  const a = randInt(rng, 2, Math.min(10, total - 4))
  const rest = total - a
  const b = randInt(rng, Math.max(2, rest - 10), Math.min(10, rest - 2))
  return [a, b, rest - b]
}

function build(values: number[], upValue: number, rules: Rules, rng: Rng, tc: number | null = null, deviation?: Deviation): DrillHand {
  const cards = values.map((v) => cardOfValue(v, rng))
  const two = cards.length === 2
  return {
    cards,
    dealerUp: cardOfValue(upValue, rng),
    avail: { canDouble: two, canSplit: two && isPair(cards), canSurrender: two && rules.surrender },
    tc,
    deviation,
  }
}

function hardHand(rules: Rules, rng: Rng): DrillHand {
  // Weighted toward the totals where people actually go wrong.
  const total = [5, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 16, 17][randInt(rng, 0, 22)]
  const values = total >= 12 && total <= 16 && rng() < 0.25 ? threeCardHard(total, rng) : twoCardHard(total, rng)
  return build(values, randomUpcardValue(rng), rules, rng)
}

function softHand(rules: Rules, rng: Rng): DrillHand {
  return build([11, randInt(rng, 2, 9)], randomUpcardValue(rng), rules, rng)
}

function pairHand(rules: Rules, rng: Rng): DrillHand {
  const v = randInt(rng, 2, 11)
  return build([v, v], randomUpcardValue(rng), rules, rng)
}

function deviationHand(rules: Rules, rng: Rng): DrillHand {
  const pool = deviationsFor(rules).filter((d) => rules.surrender || d.atOrAbove !== 'surrender')
  const d = pool[randInt(rng, 0, pool.length - 1)]
  const values = d.kind === 'pair' ? [d.total, d.total] : twoCardHard(d.total, rng)
  // Straddle the index so both sides of it come up.
  const tc = d.index + randInt(rng, -3, 3)
  const hand = build(values, d.dealer, rules, rng, tc, d)
  // Surrender would pre-empt the stand/double/split indices (16 vs 10 surrenders at any count),
  // so those drills are dealt as if surrender weren't offered.
  if (d.atOrAbove !== 'surrender') hand.avail = { ...hand.avail, canSurrender: false }
  return hand
}

export function generateDrillHand(focus: DrillFocus, rules: Rules, rng: Rng = Math.random): DrillHand {
  switch (focus) {
    case 'hard':
      return hardHand(rules, rng)
    case 'soft':
      return softHand(rules, rng)
    case 'pairs':
      return pairHand(rules, rng)
    case 'deviations':
      return deviationHand(rules, rng)
    case 'all': {
      const r = rng()
      return r < 0.55 ? hardHand(rules, rng) : r < 0.78 ? softHand(rules, rng) : pairHand(rules, rng)
    }
  }
}
