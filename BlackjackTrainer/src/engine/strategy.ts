import { rankValue, type Card } from './cards'
import { handTotal, isPair } from './hand'
import type { Rules } from './rules'

export type Action = 'hit' | 'stand' | 'double' | 'split' | 'surrender'

/**
 * Chart codes, as printed on a standard strategy card:
 * H hit · S stand · D double (else hit) · Ds double (else stand) · P split ·
 * Rh surrender (else hit) · Rs surrender (else stand) · Rp surrender (else split).
 */
export type ChartCode = 'H' | 'S' | 'D' | 'Ds' | 'P' | 'Rh' | 'Rs' | 'Rp'

export type TableKind = 'hard' | 'soft' | 'pair'

export interface Availability {
  canDouble: boolean
  canSplit: boolean
  canSurrender: boolean
}

export const ALL_AVAILABLE: Availability = { canDouble: true, canSplit: true, canSurrender: true }

/** Dealer upcards in chart column order: 2–10, then ace (11). */
export const DEALER_COLUMNS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

type Row = ChartCode[]

function row(spec: string): Row {
  const codes = spec.trim().split(/\s+/) as ChartCode[]
  if (codes.length !== 10) throw new Error(`strategy row needs 10 columns: ${spec}`)
  return codes
}

function set(r: Row, dealer: number, code: ChartCode): void {
  r[dealer - 2] = code
}

export interface StrategyTables {
  hard: Record<number, Row>
  soft: Record<number, Row>
  /** Keyed by the value of one card of the pair (2–11). Missing keys never split. */
  pair: Record<number, Row>
}

/** Basic strategy for 4–8 decks, dealer peeks, adjusted for H17 and DAS. */
export function strategyTables(rules: Pick<Rules, 'h17' | 'das'>): StrategyTables {
  //                2  3  4  5  6  7  8  9  10 A
  const hard: Record<number, Row> = {
    4: row('       H  H  H  H  H  H  H  H  H  H'),
    5: row('       H  H  H  H  H  H  H  H  H  H'),
    6: row('       H  H  H  H  H  H  H  H  H  H'),
    7: row('       H  H  H  H  H  H  H  H  H  H'),
    8: row('       H  H  H  H  H  H  H  H  H  H'),
    9: row('       H  D  D  D  D  H  H  H  H  H'),
    10: row('      D  D  D  D  D  D  D  D  H  H'),
    11: row('      D  D  D  D  D  D  D  D  D  H'),
    12: row('      H  H  S  S  S  H  H  H  H  H'),
    13: row('      S  S  S  S  S  H  H  H  H  H'),
    14: row('      S  S  S  S  S  H  H  H  H  H'),
    15: row('      S  S  S  S  S  H  H  H  Rh H'),
    16: row('      S  S  S  S  S  H  H  Rh Rh Rh'),
    17: row('      S  S  S  S  S  S  S  S  S  S'),
  }
  for (let t = 18; t <= 21; t++) hard[t] = row('S S S S S S S S S S')

  const soft: Record<number, Row> = {
    12: row('      H  H  H  H  H  H  H  H  H  H'),
    13: row('      H  H  H  D  D  H  H  H  H  H'),
    14: row('      H  H  H  D  D  H  H  H  H  H'),
    15: row('      H  H  D  D  D  H  H  H  H  H'),
    16: row('      H  H  D  D  D  H  H  H  H  H'),
    17: row('      H  D  D  D  D  H  H  H  H  H'),
    18: row('      S  Ds Ds Ds Ds S  S  H  H  H'),
    19: row('      S  S  S  S  S  S  S  S  S  S'),
    20: row('      S  S  S  S  S  S  S  S  S  S'),
    21: row('      S  S  S  S  S  S  S  S  S  S'),
  }

  const pair: Record<number, Row> = rules.das
    ? {
        2: row('   P  P  P  P  P  P  H  H  H  H'),
        3: row('   P  P  P  P  P  P  H  H  H  H'),
        4: row('   H  H  H  P  P  H  H  H  H  H'),
        6: row('   P  P  P  P  P  H  H  H  H  H'),
        7: row('   P  P  P  P  P  P  H  H  H  H'),
        8: row('   P  P  P  P  P  P  P  P  P  P'),
        9: row('   P  P  P  P  P  S  P  P  S  S'),
        11: row('  P  P  P  P  P  P  P  P  P  P'),
      }
    : {
        2: row('   H  H  P  P  P  P  H  H  H  H'),
        3: row('   H  H  P  P  P  P  H  H  H  H'),
        6: row('   H  P  P  P  P  H  H  H  H  H'),
        7: row('   P  P  P  P  P  P  H  H  H  H'),
        8: row('   P  P  P  P  P  P  P  P  P  P'),
        9: row('   P  P  P  P  P  S  P  P  S  S'),
        11: row('  P  P  P  P  P  P  P  P  P  P'),
      }

  if (rules.h17) {
    set(hard[11], 11, 'D')
    set(hard[15], 11, 'Rh')
    set(hard[17], 11, 'Rs')
    set(soft[18], 2, 'Ds')
    set(soft[19], 6, 'Ds')
    set(pair[8], 11, 'Rp')
  }

  return { hard, soft, pair }
}

const tableCache = new Map<string, StrategyTables>()

function tablesFor(rules: Pick<Rules, 'h17' | 'das'>): StrategyTables {
  const key = `${rules.h17}-${rules.das}`
  let t = tableCache.get(key)
  if (!t) {
    t = strategyTables(rules)
    tableCache.set(key, t)
  }
  return t
}

export interface ChartLookup {
  table: TableKind
  /** Hand total, or for a pair the value of one card. */
  rowKey: number
  code: ChartCode
}

/** Which chart cell governs this hand. Pairs use the pair table only when a split is possible. */
export function lookupChart(
  cards: readonly Card[],
  dealerUp: number,
  rules: Pick<Rules, 'h17' | 'das'>,
  canSplit: boolean,
): ChartLookup {
  const tables = tablesFor(rules)
  const col = dealerUp - 2
  if (canSplit && isPair(cards)) {
    const v = rankValue(cards[0].rank)
    const pairRow = tables.pair[v]
    if (pairRow && (pairRow[col] === 'P' || pairRow[col] === 'Rp')) {
      return { table: 'pair', rowKey: v, code: pairRow[col] }
    }
  }
  const { total, soft } = handTotal(cards)
  if (soft) return { table: 'soft', rowKey: total, code: tables.soft[total][col] }
  const key = Math.max(4, Math.min(21, total))
  return { table: 'hard', rowKey: key, code: tables.hard[key][col] }
}

/** Turn a chart code into the move actually available right now. */
export function resolveCode(code: ChartCode, avail: Availability): Action {
  switch (code) {
    case 'H':
      return 'hit'
    case 'S':
      return 'stand'
    case 'D':
      return avail.canDouble ? 'double' : 'hit'
    case 'Ds':
      return avail.canDouble ? 'double' : 'stand'
    case 'P':
      return 'split'
    case 'Rh':
      return avail.canSurrender ? 'surrender' : 'hit'
    case 'Rs':
      return avail.canSurrender ? 'surrender' : 'stand'
    case 'Rp':
      return avail.canSurrender ? 'surrender' : 'split'
  }
}

export function basicStrategy(
  cards: readonly Card[],
  dealerUp: number,
  rules: Pick<Rules, 'h17' | 'das'>,
  avail: Availability,
): Action {
  return resolveCode(lookupChart(cards, dealerUp, rules, avail.canSplit).code, avail)
}

/** What a chart printed for these rules shows in a cell (surrender codes collapse when surrender is off). */
export function displayCode(code: ChartCode, rules: Pick<Rules, 'surrender'>): ChartCode {
  if (rules.surrender) return code
  if (code === 'Rh') return 'H'
  if (code === 'Rs') return 'S'
  if (code === 'Rp') return 'P'
  return code
}

export const ACTION_LABELS: Record<Action, string> = {
  hit: 'Hit',
  stand: 'Stand',
  double: 'Double',
  split: 'Split',
  surrender: 'Surrender',
}

export function dealerLabel(v: number): string {
  return v === 11 ? 'A' : String(v)
}

export function situationLabel(cards: readonly Card[], dealerUp: number, canSplit: boolean): string {
  if (canSplit && isPair(cards)) {
    const v = rankValue(cards[0].rank)
    const name = v === 11 ? 'A' : String(v)
    return `Pair ${name}s vs ${dealerLabel(dealerUp)}`
  }
  const { total, soft } = handTotal(cards)
  return `${soft ? 'Soft' : 'Hard'} ${total} vs ${dealerLabel(dealerUp)}`
}
