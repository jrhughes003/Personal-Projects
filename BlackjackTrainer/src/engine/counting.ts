import { rankValue, type Card } from './cards'

export type SystemId = 'hilo' | 'omega2' | 'zen'

export interface CountSystem {
  id: SystemId
  name: string
  level: number
  /** Tag per blackjack value, 2–11 (11 = ace). */
  tags: Record<number, number>
  summary: string
  /** Deviation indices in this app are published for Hi-Lo only. */
  hasDeviations: boolean
}

export const SYSTEMS: Record<SystemId, CountSystem> = {
  hilo: {
    id: 'hilo',
    name: 'Hi-Lo',
    level: 1,
    tags: { 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0, 10: -1, 11: -1 },
    summary:
      'The standard balanced level-1 count. Low cards (2–6) are +1, neutral cards (7–9) are 0, tens and aces are −1. Illustrious 18 and Fab 4 indices are built on it.',
    hasDeviations: true,
  },
  omega2: {
    id: 'omega2',
    name: 'Omega II',
    level: 2,
    tags: { 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 1, 8: 0, 9: -1, 10: -2, 11: 0 },
    summary:
      'A balanced level-2 count. More accurate for playing decisions than Hi-Lo, harder to keep. Aces count 0 (experts keep a separate ace side count, not trained here).',
    hasDeviations: false,
  },
  zen: {
    id: 'zen',
    name: 'Zen',
    level: 2,
    tags: { 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 1, 8: 0, 9: 0, 10: -2, 11: -1 },
    summary:
      'A balanced level-2 count that keeps the ace in the main count, so betting accuracy is close to Omega II without a side count.',
    hasDeviations: false,
  },
}

export function tagOf(card: Card, system: SystemId): number {
  return SYSTEMS[system].tags[rankValue(card.rank)]
}

export function countCards(cards: readonly Card[], system: SystemId): number {
  return cards.reduce((rc, c) => rc + tagOf(c, system), 0)
}

/** Decks left, estimated to the nearest half deck the way a player reads a discard tray. */
export function decksRemaining(cardsLeft: number): number {
  return Math.max(0.5, Math.round((cardsLeft / 52) * 2) / 2)
}

export function trueCount(runningCount: number, cardsLeft: number): number {
  return runningCount / decksRemaining(cardsLeft)
}

/** The whole-number true count a player acts on (floored, so +2.9 plays as +2). */
export function flooredTrueCount(tc: number): number {
  return Math.floor(tc + 1e-9)
}

export function formatCount(n: number): string {
  if (n > 0) return `+${n}`
  return String(n)
}

export type Spread = 4 | 8 | 12

/**
 * Bet ramps keyed by top spread. Level-2 counts run about twice as large as
 * Hi-Lo for the same advantage, so their true count is halved before the ramp.
 */
export const BET_RAMPS: Record<Spread, { minTc: number; units: number }[]> = {
  4: [
    { minTc: -Infinity, units: 1 },
    { minTc: 2, units: 2 },
    { minTc: 3, units: 3 },
    { minTc: 4, units: 4 },
  ],
  8: [
    { minTc: -Infinity, units: 1 },
    { minTc: 2, units: 2 },
    { minTc: 3, units: 4 },
    { minTc: 4, units: 6 },
    { minTc: 5, units: 8 },
  ],
  12: [
    { minTc: -Infinity, units: 1 },
    { minTc: 2, units: 2 },
    { minTc: 3, units: 4 },
    { minTc: 4, units: 8 },
    { minTc: 5, units: 12 },
  ],
}

/** Kept for callers that assume the default 1–8 spread. */
export const BET_RAMP = BET_RAMPS[8]

export function betUnits(tc: number, system: SystemId, spread: Spread = 8): number {
  const adjusted = flooredTrueCount(tc / SYSTEMS[system].level)
  let units = 1
  for (const step of BET_RAMPS[spread]) if (adjusted >= step.minTc) units = step.units
  return units
}

/** Accepts the floored, truncated or rounded true count as correct. */
export function acceptableTrueCounts(tc: number): number[] {
  return [...new Set([Math.floor(tc), Math.trunc(tc), Math.round(tc)].map((n) => (Object.is(n, -0) ? 0 : n)))]
}
