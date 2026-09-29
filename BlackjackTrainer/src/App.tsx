import { useState } from 'react'
import { CountingDrill } from './modes/CountingDrill'
import { GameSim } from './modes/GameSim'
import { Reference } from './modes/Reference'
import { SettingsView } from './modes/SettingsView'
import { Stats } from './modes/Stats'
import { StrategyDrill } from './modes/StrategyDrill'
import { SYSTEMS } from './engine/counting'
import { useApp } from './store/AppContext'
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

export function App() {
  const [view, setView] = useState<View>('strategy')
  const { settings, stats } = useApp()
  const acc = pct(stats.strategy)

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="brand">
          <span className="brand-mark">21</span>
          <div>
            <div className="brand-name">Blackjack Trainer</div>
            <div className="muted small">{SYSTEMS[settings.system].name} counter</div>
          </div>
        </div>
        {NAV.map((n) => (
          <button key={n.id} className={`nav ${view === n.id ? 'on' : ''}`} onClick={() => setView(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            <span>
              {n.label}
              <span className="nav-hint">{n.hint}</span>
            </span>
          </button>
        ))}
        <div className="sidebar-foot muted small">
          {acc === null ? 'Start with the strategy drill.' : `Lifetime play accuracy ${acc.toFixed(1)}%`}
        </div>
      </nav>
      <main className="content">
        {view === 'strategy' && <StrategyDrill />}
        {view === 'counting' && <CountingDrill />}
        {view === 'table' && <GameSim />}
        {view === 'reference' && <Reference />}
        {view === 'stats' && <Stats />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}
