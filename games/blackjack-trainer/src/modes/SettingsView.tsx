import { useRef, useState, type ReactNode } from 'react'
import { SYSTEMS, type Spread, type SystemId } from '../engine/counting'
import type { Rules } from '../engine/rules'
import { SIDE_BET_IDS, SIDE_BETS, type SideBetId } from '../engine/sidebets'
import { useApp, type AppState } from '../store/context'
import { makeBackup, parseBackup } from '../store/backup'
import { DEFAULT_SETTINGS, type Settings, type SideBetSettings } from '../store/settings'

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
  const { settings, setSettings, stats, restore } = useApp()
  const set = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch })
  const setRules = (patch: Partial<Rules>) => set({ rules: { ...settings.rules, ...patch } })
  const setSides = (patch: Partial<SideBetSettings>) => set({ sideBets: { ...settings.sideBets, ...patch } })
  const r = settings.rules
  const sb = settings.sideBets

  return (
    <div className="mode">
      <header className="mode-head">
        <div>
          <h1>Settings</h1>
          <p className="muted small">
            Match these to the table you'll play. Changing rules or the count system starts a fresh shoe.
          </p>
        </div>
        <button onClick={() => setSettings(DEFAULT_SETTINGS)}>Restore defaults</button>
      </header>

      <div className="two-col">
        <section className="panel form">
          <h3>Table rules</h3>
          <div className="field-grid">
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
              <select
                value={r.blackjackPays}
                onChange={(e) => setRules({ blackjackPays: Number(e.target.value) as Rules['blackjackPays'] })}
              >
                <option value={1.5}>3:2</option>
                <option value={1.2}>6:5</option>
              </select>
            </Field>
            <Field label="Double down on">
              <select value={r.doubleOn} onChange={(e) => setRules({ doubleOn: e.target.value as Rules['doubleOn'] })}>
                <option value="any">Any first two cards</option>
                <option value="9-11">Hard 9–11 only</option>
                <option value="10-11">Hard 10–11 only</option>
              </select>
            </Field>
            <Field label="Split up to">
              <select value={r.maxHands} onChange={(e) => setRules({ maxHands: Number(e.target.value) as Rules['maxHands'] })}>
                {[2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} hands
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label={`Penetration: ${Math.round(r.penetration * 100)}%`}
            hint="How deep the cut card sits. Deeper is better for counters."
          >
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
            <input type="checkbox" checked={r.surrender} onChange={(e) => setRules({ surrender: e.target.checked })} /> Late
            surrender
          </label>
          <label className="toggle">
            <input type="checkbox" checked={r.resplitAces} onChange={(e) => setRules({ resplitAces: e.target.checked })} />{' '}
            Resplit aces (RSA)
          </label>
        </section>

        <section className="panel form">
          <h3>Counting & betting</h3>
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
            <input type="checkbox" checked={settings.deviations} onChange={(e) => set({ deviations: e.target.checked })} /> Grade
            with Illustrious 18 + Fab 4 indices {settings.system !== 'hilo' && <em className="muted">(Hi-Lo only)</em>}
          </label>
          <div className="field-grid">
            <Field label="Table minimum (1 unit)">
              <input
                type="number"
                min={1}
                value={settings.tableMin}
                onChange={(e) => set({ tableMin: Math.max(1, Number(e.target.value) || 1) })}
              />
            </Field>
            <Field label="Bet spread">
              <select value={settings.spread} onChange={(e) => set({ spread: Number(e.target.value) as Spread })}>
                <option value={4}>1–4 units</option>
                <option value={8}>1–8 units</option>
                <option value={12}>1–12 units</option>
              </select>
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
            <Field label="Running-count check">
              <select value={settings.countCheckEvery} onChange={(e) => set({ countCheckEvery: Number(e.target.value) })}>
                <option value={0}>Off</option>
                {[1, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    Every {n} hand{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={settings.showCountHud} onChange={(e) => set({ showCountHud: e.target.checked })} />{' '}
            Show the count and side-bet EV at the table by default
          </label>
          <label className="toggle">
            <input type="checkbox" checked={settings.showBetHint} onChange={(e) => set({ showBetHint: e.target.checked })} /> Show
            the recommended bet before dealing
          </label>
        </section>
      </div>

      <section className="panel form">
        <h3>Side bets</h3>
        <p className="muted small">
          Turn on the side bets your casino spreads and pick the paytable printed on its felt, or enter your own. The coach
          computes each bet's exact expected value from the cards left in the shoe.
        </p>
        <div className="side-settings">
          {SIDE_BET_IDS.map((id) => (
            <SideBetRow key={id} id={id} sb={sb} setSides={setSides} />
          ))}
        </div>
        <div className="field-grid">
          <Field label="Side bet amount">
            <input
              type="number"
              min={1}
              value={sb.amount}
              onChange={(e) => setSides({ amount: Math.max(1, Number(e.target.value) || 1) })}
            />
          </Field>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={sb.gradeEv} onChange={(e) => setSides({ gradeEv: e.target.checked })} /> Grade side
          bets: flag bets placed at negative EV and missed positive-EV spots
        </label>
      </section>

      <DataPanel onRestore={restore} settings={settings} stats={stats} />
    </div>
  )
}

function SideBetRow({
  id,
  sb,
  setSides,
}: {
  id: SideBetId
  sb: SideBetSettings
  setSides: (p: Partial<SideBetSettings>) => void
}) {
  const def = SIDE_BETS[id]
  const custom = sb.paytable[id] === 'custom'
  return (
    <div className={`side-setting ${sb.enabled[id] ? 'on' : ''}`}>
      <label className="toggle">
        <input
          type="checkbox"
          checked={sb.enabled[id]}
          onChange={(e) => setSides({ enabled: { ...sb.enabled, [id]: e.target.checked } })}
        />
        <b>{def.name}</b>
      </label>
      <p className="muted small">{def.description}</p>
      <select
        aria-label={`${def.name} paytable`}
        value={sb.paytable[id]}
        disabled={!sb.enabled[id]}
        onChange={(e) => setSides({ paytable: { ...sb.paytable, [id]: e.target.value } })}
      >
        {def.paytables.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
        <option value="custom">Custom…</option>
      </select>
      {custom && sb.enabled[id] && (
        <div className="custom-pays">
          {def.outcomes.map((o) => (
            <label key={o.key}>
              <span>{o.label}</span>
              <span className="pays-input">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={sb.custom[id][o.key] ?? 0}
                  onChange={(e) =>
                    setSides({
                      custom: { ...sb.custom, [id]: { ...sb.custom[id], [o.key]: Math.max(0, Number(e.target.value) || 0) } },
                    })
                  }
                />
                : 1
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function DataPanel({
  settings,
  stats,
  onRestore,
}: {
  settings: Settings
  stats: AppState['stats']
  onRestore: AppState['restore']
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(makeBackup(settings, stats), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blackjack-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ ok: true, text: 'Backup saved.' })
  }

  const importBackup = async (file: File) => {
    try {
      const backup = parseBackup(await file.text())
      if (
        !window.confirm(
          `Replace your current settings and progress with the backup from ${new Date(backup.exportedAt).toLocaleString()}?`,
        )
      )
        return
      onRestore(backup.settings, backup.stats)
      setMessage({ ok: true, text: 'Backup restored.' })
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message })
    }
  }

  return (
    <section className="panel form">
      <h3>Your data</h3>
      <p className="muted small">
        Settings and progress live only on this computer. Export a backup to move them to another machine or keep them safe.
      </p>
      <div className="row">
        <button onClick={exportBackup}>Export backup</button>
        <button onClick={() => fileRef.current?.click()}>Import backup…</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void importBackup(f)
            e.target.value = ''
          }}
        />
        {message && <span className={message.ok ? 'pos' : 'neg'}>{message.text}</span>}
      </div>
    </section>
  )
}
