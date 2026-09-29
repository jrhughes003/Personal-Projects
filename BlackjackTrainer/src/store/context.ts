import { createContext, useContext } from 'react'
import type { Settings } from './settings'
import type { Stats } from './stats'

export interface AppState {
  settings: Settings
  setSettings: (next: Settings) => void
  stats: Stats
  updateStats: (fn: (s: Stats) => Stats) => void
  resetStats: () => void
  /** Replace settings and stats wholesale, e.g. from a backup file. */
  restore: (settings: Settings, stats: Stats) => void
}

export const AppCtx = createContext<AppState | null>(null)

export function useApp(): AppState {
  const v = useContext(AppCtx)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}
