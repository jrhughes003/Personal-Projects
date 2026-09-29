import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AppCtx } from './context'
import { normalizeSettings, SETTINGS_KEY, type Settings } from './settings'
import { EMPTY_STATS, normalizeStats, STATS_KEY, type Stats } from './stats'
import { load, save } from './storage'

const loadSettings = (): Settings => normalizeSettings(load<Partial<Settings> | null>(SETTINGS_KEY, null))
const loadStats = (): Stats => normalizeStats(load<Partial<Stats> | null>(STATS_KEY, null))

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(loadSettings)
  const [stats, setStats] = useState<Stats>(loadStats)

  useEffect(() => save(SETTINGS_KEY, settings), [settings])
  useEffect(() => save(STATS_KEY, stats), [stats])

  const updateStats = useCallback((fn: (s: Stats) => Stats) => setStats(fn), [])
  const resetStats = useCallback(() => setStats(EMPTY_STATS), [])
  const restore = useCallback((next: Settings, nextStats: Stats) => {
    setSettingsState(normalizeSettings(next))
    setStats(normalizeStats(nextStats))
  }, [])

  return (
    <AppCtx.Provider value={{ settings, setSettings: setSettingsState, stats, updateStats, resetStats, restore }}>
      {children}
    </AppCtx.Provider>
  )
}
