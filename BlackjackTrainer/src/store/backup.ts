import { normalizeSettings, type Settings } from './settings'
import { normalizeStats, type Stats } from './stats'

export const BACKUP_APP = 'blackjack-trainer'

export interface Backup {
  app: typeof BACKUP_APP
  exportedAt: string
  settings: Settings
  stats: Stats
}

export function makeBackup(settings: Settings, stats: Stats): Backup {
  return { app: BACKUP_APP, exportedAt: new Date().toISOString(), settings, stats }
}

/** Parse and validate a backup file; throws with a readable message when it isn't one. */
export function parseBackup(text: string): Backup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (!data || typeof data !== 'object' || (data as Backup).app !== BACKUP_APP) {
    throw new Error('That file is not a Blackjack Trainer backup.')
  }
  const b = data as Backup
  if (typeof b.stats !== 'object' || typeof b.settings !== 'object')
    throw new Error('The backup is missing its settings or stats.')
  return { ...b, settings: normalizeSettings(b.settings), stats: normalizeStats(b.stats) }
}
