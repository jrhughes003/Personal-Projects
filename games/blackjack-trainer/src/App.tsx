import { useState, type ReactNode } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ViewActiveContext } from './components/viewActive'
import { SYSTEMS } from './engine/counting'
import { CountingDrill } from './modes/CountingDrill'
import { GameSim } from './modes/GameSim'
import { Reference } from './modes/Reference'
import { SettingsView } from './modes/SettingsView'
import { Stats } from './modes/Stats'
import { StrategyDrill } from './modes/StrategyDrill'
import { useApp } from './store/context'
import { pct } from './store/stats'

type View = 'table' | 'strategy' | 'counting' | 'reference' | 'stats' | 'settings'

const NAV: { id: View; label: string; icon: string; hint: string }[] = [
  { id: 'strategy', label: 'Strategy drill', icon: '♠', hint: 'Learn the chart' },
  { id: 'counting', label: 'Counting drills', icon: '♦', hint: 'Speed & accuracy' },
  { id: 'table', label: 'Table', icon: '♣', hint: 'Put it together' },
  { id: 'reference', label: 'Reference', icon: '♥', hint: 'Charts & indices' },
  { id: 'stats', label: 'Progress', icon: '↗', hint: 'Your history' },
  { id: 'settings', label: 'Settings', icon: '⚙', hint: 'Rules & system' },
]

/**
 * A screen that stays mounted while hidden, so an in-progress shoe or drill
 * survives visiting other screens. Its shortcuts only fire while it's shown.
 */
function Persistent({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div hidden={!active}>
      <ViewActiveContext.Provider value={active}>{children}</ViewActiveContext.Provider>
    </div>
  )
}

export function App() {
  const [view, setView] = useState<View>('strategy')
  const { settings, stats } = useApp()
  const acc = pct(stats.strategy)
  // A rules or count-system change deals a fresh shoe (and fresh drill hands).
  const tableKey = JSON.stringify([settings.rules, settings.system, settings.startingBankroll])
  const drillKey = JSON.stringify(settings.rules)

  return (
    <div className="app">
      <nav className="sidebar" aria-label="Screens">
        <div className="brand">
          <span className="brand-mark">21</span>
          <div>
            <div className="brand-name">Blackjack Trainer</div>
            <div className="muted small">{SYSTEMS[settings.system].name} counter</div>
          </div>
        </div>
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav ${view === n.id ? 'on' : ''}`}
            aria-current={view === n.id ? 'page' : undefined}
            onClick={() => setView(n.id)}
          >
            <span className="nav-icon" aria-hidden>
              {n.icon}
            </span>
            <span>
              {n.label}
              <span className="nav-hint">{n.hint}</span>
            </span>
          </button>
        ))}
        <div className="sidebar-foot muted small">
          {acc === null ? 'Start with the strategy drill.' : `Lifetime play accuracy ${acc.toFixed(1)}%`}
          <div className="version">v{__APP_VERSION__}</div>
        </div>
      </nav>
      <main className="content">
        <Persistent active={view === 'strategy'}>
          <ErrorBoundary>
            <StrategyDrill key={drillKey} />
          </ErrorBoundary>
        </Persistent>
        <Persistent active={view === 'table'}>
          <ErrorBoundary>
            <GameSim key={tableKey} />
          </ErrorBoundary>
        </Persistent>
        <ErrorBoundary resetKey={view}>
          {view === 'counting' && <CountingDrill />}
          {view === 'reference' && <Reference />}
          {view === 'stats' && <Stats />}
          {view === 'settings' && <SettingsView />}
        </ErrorBoundary>
      </main>
    </div>
  )
}
