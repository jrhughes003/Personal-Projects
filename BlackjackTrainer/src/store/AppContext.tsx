import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS, SETTINGS_KEY, type Settings } from './settings'
import { EMPTY_STATS, STATS_KEY, type Stats } from './stats'
import { load, save } from './storage'
import { DEFAULT_RULES } from '../engine/rules'

interface AppState {
  settings: Settings
  setSettings: (next: Settings) => void
  stats: Stats
  updateStats: (fn: (s: Stats) => Stats) => void
  resetStats: () => void
}

const Ctx = createContext<AppState | null>(null)

function loadSettings(): Settings {
  const s = load(SETTINGS_KEY, DEFAULT_SETTINGS)
  return { ...s, rules: { ...DEFAULT_RULES, ...s.rules } }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(loadSettings)
  const [stats, setStats] = useState<Stats>(() => load(STATS_KEY, EMPTY_STATS))

  useEffect(() => save(SETTINGS_KEY, settings), [settings])
  useEffect(() => save(STATS_KEY, stats), [stats])

  const updateStats = useCallback((fn: (s: Stats) => Stats) => setStats(fn), [])
  const resetStats = useCallback(() => setStats(EMPTY_STATS), [])

  return (
    <Ctx.Provider value={{ settings, setSettings: setSettingsState, stats, updateStats, resetStats }}>
      {children}
    </Ctx.Provider>
  )
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}
