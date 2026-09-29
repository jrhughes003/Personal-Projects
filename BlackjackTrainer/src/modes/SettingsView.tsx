import type { ReactNode } from 'react'
import { SYSTEMS, type SystemId } from '../engine/counting'
import type { Rules } from '../engine/rules'
import { useApp } from '../store/AppContext'
import { DEFAULT_SETTINGS, type Settings } from '../store/settings'

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="muted small">{hint}</span>}
    </label>
  )
}

export function SettingsView() {
  const { settings, setSettings } = useApp()
  const set = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch })
  const setRules = (patch: Partial<Rules>) => set({ rules: { ...settings.rules, ...patch } })
  const r = settings.rules

  return (
    <div className="mode">
      <header className="mode-head">
        <div>
          <h1>Settings</h1>
          <p className="muted small">Changing rules or the count system starts a fresh shoe at the table.</p>
        </div>
        <button onClick={() => setSettings(DEFAULT_SETTINGS)}>Restore defaults</button>
      </header>

      <div className="two-col">
        <section className="panel form">
          <h3>Table rules</h3>
          <Field label="Decks">
            <select value={r.decks} onChange={(e) => setRules({ decks: Number(e.target.value) as Rules['decks'] })}>
              {[4, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Dealer on soft 17">
            <select value={r.h17 ? 'h17' : 's17'} onChange={(e) => setRules({ h17: e.target.value === 'h17' })}>
              <option value="s17">Stands (S17)</option>
              <option value="h17">Hits (H17)</option>
            </select>
          </Field>
          <Field label="Blackjack pays">
            <select value={r.blackjackPays} onChange={(e) => setRules({ blackjackPays: Number(e.target.value) as Rules['blackjackPays'] })}>
              <option value={1.5}>3:2</option>
              <option value={1.2}>6:5</option>
            </select>
          </Field>
          <Field label={`Penetration: ${Math.round(r.penetration * 100)}%`} hint="How deep the cut card sits. Deeper is better for counters.">
            <input
              type="range"
              min={50}
              max={90}
              step={5}
              value={Math.round(r.penetration * 100)}
              onChange={(e) => setRules({ penetration: Number(e.target.value) / 100 })}
            />
          </Field>
          <label className="toggle">
            <input type="checkbox" checked={r.das} onChange={(e) => setRules({ das: e.target.checked })} /> Double after split
          </label>
          <label className="toggle">
            <input type="checkbox" checked={r.surrender} onChange={(e) => setRules({ surrender: e.target.checked })} /> Late surrender
          </label>
        </section>

        <section className="panel form">
          <h3>Counting</h3>
          <Field label="Count system">
            <select value={settings.system} onChange={(e) => set({ system: e.target.value as SystemId })}>
              {(Object.keys(SYSTEMS) as SystemId[]).map((id) => (
                <option key={id} value={id}>
                  {SYSTEMS[id].name} (level {SYSTEMS[id].level})
                </option>
              ))}
            </select>
          </Field>
          <p className="muted small">{SYSTEMS[settings.system].summary}</p>
          <label className="toggle">
            <input type="checkbox" checked={settings.deviations} onChange={(e) => set({ deviations: e.target.checked })} /> Grade with
            Illustrious 18 + Fab 4 indices {settings.system !== 'hilo' && <em className="muted">(Hi-Lo only)</em>}
          </label>

          <h3>Table sim</h3>
          <Field label="Table minimum (1 unit)">
            <input type="number" min={1} value={settings.tableMin} onChange={(e) => set({ tableMin: Math.max(1, Number(e.target.value) || 1) })} />
          </Field>
          <Field label="Starting bankroll">
            <input
              type="number"
              min={10}
              step={100}
              value={settings.startingBankroll}
              onChange={(e) => set({ startingBankroll: Math.max(10, Number(e.target.value) || 10) })}
            />
          </Field>
          <Field label="Running-count check" hint="Quizzes you on the count between hands.">
            <select value={settings.countCheckEvery} onChange={(e) => set({ countCheckEvery: Number(e.target.value) })}>
              <option value={0}>Off</option>
              {[1, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  Every {n} hand{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </Field>
          <label className="toggle">
            <input type="checkbox" checked={settings.showCountHud} onChange={(e) => set({ showCountHud: e.target.checked })} /> Show the count at
            the table by default
          </label>
          <label className="toggle">
            <input type="checkbox" checked={settings.showBetHint} onChange={(e) => set({ showBetHint: e.target.checked })} /> Show the
            recommended bet before dealing
          </label>
        </section>
      </div>
    </div>
  )
}
