import type { SystemId } from '../engine/counting'
import { DEFAULT_RULES, type Rules } from '../engine/rules'

export interface Settings {
  rules: Rules
  system: SystemId
  /** Use Illustrious 18 / Fab 4 indices (Hi-Lo only). */
  deviations: boolean
  tableMin: number
  startingBankroll: number
  /** Ask for the running count every N rounds in the table sim; 0 turns it off. */
  countCheckEvery: number
  showCountHud: boolean
  showBetHint: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  rules: DEFAULT_RULES,
  system: 'hilo',
  deviations: true,
  tableMin: 10,
  startingBankroll: 1000,
  countCheckEvery: 5,
  showCountHud: false,
  showBetHint: false,
}

export const SETTINGS_KEY = 'bjt:settings:v1'
