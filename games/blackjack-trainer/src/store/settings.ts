import type { Spread, SystemId } from '../engine/counting'
import { DEFAULT_RULES, type Rules } from '../engine/rules'
import { paytableFor, SIDE_BET_IDS, SIDE_BETS, type Paytable, type SideBetId } from '../engine/sidebets'

export interface SideBetSettings {
  enabled: Record<SideBetId, boolean>
  /** A preset paytable id, or 'custom'. */
  paytable: Record<SideBetId, string>
  /** Odds per outcome for the 'custom' paytable. */
  custom: Record<SideBetId, Record<string, number>>
  /** Stake per side bet, in dollars. */
  amount: number
  /** Grade side bets on expected value: flag −EV bets and missed +EV spots. */
  gradeEv: boolean
}

export interface Settings {
  rules: Rules
  system: SystemId
  /** Use Illustrious 18 / Fab 4 indices (Hi-Lo only). */
  deviations: boolean
  tableMin: number
  spread: Spread
  startingBankroll: number
  /** Ask for the running count every N rounds in the table sim; 0 turns it off. */
  countCheckEvery: number
  showCountHud: boolean
  showBetHint: boolean
  sideBets: SideBetSettings
}

const byBet = <T>(fn: (id: SideBetId) => T) => Object.fromEntries(SIDE_BET_IDS.map((id) => [id, fn(id)])) as Record<SideBetId, T>

export const DEFAULT_SIDE_BETS: SideBetSettings = {
  enabled: byBet(() => false),
  paytable: byBet((id) => SIDE_BETS[id].paytables[0].id),
  custom: byBet((id) => ({ ...SIDE_BETS[id].paytables[0].pays })),
  amount: 5,
  gradeEv: true,
}

export const DEFAULT_SETTINGS: Settings = {
  rules: DEFAULT_RULES,
  system: 'hilo',
  deviations: true,
  tableMin: 10,
  spread: 8,
  startingBankroll: 1000,
  countCheckEvery: 5,
  showCountHud: false,
  showBetHint: false,
  sideBets: DEFAULT_SIDE_BETS,
}

export const SETTINGS_KEY = 'bjt:settings:v1'

/** Fill in anything missing from older saves or hand-edited backups. */
export function normalizeSettings(raw: Partial<Settings> | null | undefined): Settings {
  const s = { ...DEFAULT_SETTINGS, ...(raw ?? {}) }
  const sb: Partial<SideBetSettings> = raw?.sideBets ?? {}
  return {
    ...s,
    rules: { ...DEFAULT_RULES, ...(raw?.rules ?? {}) },
    sideBets: {
      ...DEFAULT_SIDE_BETS,
      ...sb,
      enabled: { ...DEFAULT_SIDE_BETS.enabled, ...(sb.enabled ?? {}) },
      paytable: { ...DEFAULT_SIDE_BETS.paytable, ...(sb.paytable ?? {}) },
      custom: byBet((id) => ({ ...DEFAULT_SIDE_BETS.custom[id], ...(sb.custom?.[id] ?? {}) })),
    },
  }
}

export function resolvePaytable(sb: SideBetSettings, id: SideBetId): Paytable {
  if (sb.paytable[id] === 'custom') return { id: 'custom', name: 'Custom', pays: sb.custom[id] }
  return paytableFor(id, sb.paytable[id])
}
