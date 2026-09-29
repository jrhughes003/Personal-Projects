import { rankValue, type Card } from './cards'
import { handTotal, isPair } from './hand'
import type { Rules } from './rules'
import { basicStrategy, dealerLabel, lookupChart, type Action, type Availability } from './strategy'
import type { SystemId } from './counting'

export interface Deviation {
  id: string
  group: 'Illustrious 18' | 'Fab 4'
  /** 'hard' matches a hard total; 'pair' matches a splittable pair of this card value. */
  kind: 'hard' | 'pair'
  total: number
  dealer: number
  /** Act on `atOrAbove` when the true count is at least this. */
  index: number
  atOrAbove: Action
  /** Below the index; omitted means fall back to basic strategy. */
  below?: Action
  /** Only listed for this dealer rule (the index differs or basic already covers it). */
  onlyWhen?: 'S17' | 'H17'
}

/** Hi-Lo indices for 4–8 decks, S17 unless noted. */
export const DEVIATIONS: Deviation[] = [
  // Fab 4 surrenders come first: they decide whether surrender is on the table at all.
  { id: 'f14v10', group: 'Fab 4', kind: 'hard', total: 14, dealer: 10, index: 3, atOrAbove: 'surrender' },
  { id: 'f15v10', group: 'Fab 4', kind: 'hard', total: 15, dealer: 10, index: 0, atOrAbove: 'surrender' },
  { id: 'f15v9', group: 'Fab 4', kind: 'hard', total: 15, dealer: 9, index: 2, atOrAbove: 'surrender' },
  { id: 'f15vA', group: 'Fab 4', kind: 'hard', total: 15, dealer: 11, index: 1, atOrAbove: 'surrender', onlyWhen: 'S17' },
  { id: 'f15vA-h17', group: 'Fab 4', kind: 'hard', total: 15, dealer: 11, index: -1, atOrAbove: 'surrender', onlyWhen: 'H17' },

  { id: 'i16v10', group: 'Illustrious 18', kind: 'hard', total: 16, dealer: 10, index: 0, atOrAbove: 'stand', below: 'hit' },
  { id: 'i15v10', group: 'Illustrious 18', kind: 'hard', total: 15, dealer: 10, index: 4, atOrAbove: 'stand', below: 'hit' },
  { id: 'iTTv5', group: 'Illustrious 18', kind: 'pair', total: 10, dealer: 5, index: 5, atOrAbove: 'split', below: 'stand' },
  { id: 'iTTv6', group: 'Illustrious 18', kind: 'pair', total: 10, dealer: 6, index: 4, atOrAbove: 'split', below: 'stand' },
  { id: 'i10v10', group: 'Illustrious 18', kind: 'hard', total: 10, dealer: 10, index: 4, atOrAbove: 'double', below: 'hit' },
  { id: 'i12v3', group: 'Illustrious 18', kind: 'hard', total: 12, dealer: 3, index: 2, atOrAbove: 'stand', below: 'hit' },
  { id: 'i12v2', group: 'Illustrious 18', kind: 'hard', total: 12, dealer: 2, index: 3, atOrAbove: 'stand', below: 'hit' },
  {
    id: 'i11vA',
    group: 'Illustrious 18',
    kind: 'hard',
    total: 11,
    dealer: 11,
    index: 1,
    atOrAbove: 'double',
    below: 'hit',
    onlyWhen: 'S17',
  },
  { id: 'i9v2', group: 'Illustrious 18', kind: 'hard', total: 9, dealer: 2, index: 1, atOrAbove: 'double', below: 'hit' },
  {
    id: 'i10vA',
    group: 'Illustrious 18',
    kind: 'hard',
    total: 10,
    dealer: 11,
    index: 4,
    atOrAbove: 'double',
    below: 'hit',
    onlyWhen: 'S17',
  },
  {
    id: 'i10vA-h17',
    group: 'Illustrious 18',
    kind: 'hard',
    total: 10,
    dealer: 11,
    index: 3,
    atOrAbove: 'double',
    below: 'hit',
    onlyWhen: 'H17',
  },
  { id: 'i9v7', group: 'Illustrious 18', kind: 'hard', total: 9, dealer: 7, index: 3, atOrAbove: 'double', below: 'hit' },
  { id: 'i16v9', group: 'Illustrious 18', kind: 'hard', total: 16, dealer: 9, index: 5, atOrAbove: 'stand', below: 'hit' },
  { id: 'i13v2', group: 'Illustrious 18', kind: 'hard', total: 13, dealer: 2, index: -1, atOrAbove: 'stand', below: 'hit' },
  { id: 'i12v4', group: 'Illustrious 18', kind: 'hard', total: 12, dealer: 4, index: 0, atOrAbove: 'stand', below: 'hit' },
  { id: 'i12v5', group: 'Illustrious 18', kind: 'hard', total: 12, dealer: 5, index: -2, atOrAbove: 'stand', below: 'hit' },
  { id: 'i12v6', group: 'Illustrious 18', kind: 'hard', total: 12, dealer: 6, index: -1, atOrAbove: 'stand', below: 'hit' },
  { id: 'i13v3', group: 'Illustrious 18', kind: 'hard', total: 13, dealer: 3, index: -2, atOrAbove: 'stand', below: 'hit' },
]

/** Insurance (and even money) pays off at a Hi-Lo true count of +3 or more. */
export const INSURANCE_INDEX = 3

export function deviationsFor(rules: Pick<Rules, 'h17'>): Deviation[] {
  return DEVIATIONS.filter((d) => !d.onlyWhen || d.onlyWhen === (rules.h17 ? 'H17' : 'S17'))
}

export function deviationLabel(d: Deviation): string {
  const hand = d.kind === 'pair' ? `${d.total},${d.total}` : String(d.total)
  const sign = d.index > 0 ? '+' : ''
  return `${hand} vs ${dealerLabel(d.dealer)}: ${d.atOrAbove} at ${sign}${d.index} or higher`
}

function requirementMet(action: Action, avail: Availability): boolean {
  if (action === 'double') return avail.canDouble
  if (action === 'split') return avail.canSplit
  if (action === 'surrender') return avail.canSurrender
  return true
}

function matches(d: Deviation, cards: readonly Card[], dealerUp: number, avail: Availability): boolean {
  if (d.dealer !== dealerUp) return false
  if (d.kind === 'pair') return avail.canSplit && isPair(cards) && rankValue(cards[0].rank) === d.total
  const { total, soft } = handTotal(cards)
  return !soft && total === d.total
}

export interface Recommendation {
  action: Action
  /** Set when a count-based index decided (or could have decided) this hand. */
  deviation?: Deviation
  /** True when the count moved the play away from basic strategy. */
  deviated: boolean
}

export function recommend(
  cards: readonly Card[],
  dealerUp: number,
  rules: Rules,
  avail: Availability,
  tc: number | null,
  useDeviations: boolean,
): Recommendation {
  const basic = basicStrategy(cards, dealerUp, rules, avail)
  if (!useDeviations || tc === null) return { action: basic, deviated: false }

  // A pair the chart splits is played as a pair; hard-total indices don't apply to it.
  const chart = lookupChart(cards, dealerUp, rules, avail.canSplit)
  const splitting = chart.table === 'pair'
  let a = avail
  let decided: Deviation | undefined

  for (const d of deviationsFor(rules)) {
    if (d.atOrAbove !== 'surrender' || !a.canSurrender) continue
    if (splitting || !matches(d, cards, dealerUp, a)) continue
    if (tc >= d.index) return { action: 'surrender', deviation: d, deviated: basic !== 'surrender' }
    // Below the index, surrender is off the table for this hand.
    a = { ...a, canSurrender: false }
    decided = d
  }

  const fallback = basicStrategy(cards, dealerUp, rules, a)
  // A basic-strategy surrender (e.g. 16 vs 10) beats the stand indices at any realistic count.
  if (fallback === 'surrender') return { action: fallback, deviated: false }
  for (const d of deviationsFor(rules)) {
    if (d.atOrAbove === 'surrender') continue
    if (d.kind === 'hard' && splitting) continue
    if (!matches(d, cards, dealerUp, a) || !requirementMet(d.atOrAbove, a)) continue
    const action = tc >= d.index ? d.atOrAbove : (d.below ?? fallback)
    return { action, deviation: d, deviated: action !== basic }
  }

  return { action: fallback, deviation: decided, deviated: fallback !== basic }
}

export function shouldTakeInsurance(tc: number | null, system: SystemId, useDeviations: boolean): boolean {
  return useDeviations && system === 'hilo' && tc !== null && tc >= INSURANCE_INDEX
}
