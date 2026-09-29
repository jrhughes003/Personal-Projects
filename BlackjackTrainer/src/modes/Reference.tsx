import { ChartLegend, StrategyChart } from '../components/StrategyChart'
import { useMemo } from 'react'
import { BET_RAMPS, formatCount, SYSTEMS, type SystemId } from '../engine/counting'
import { deviationsFor, INSURANCE_INDEX } from '../engine/deviations'
import { describeRules } from '../engine/rules'
import { ACTION_LABELS, dealerLabel } from '../engine/strategy'
import { fullShoeComposition, SIDE_BET_IDS, SIDE_BETS, sideBetEv } from '../engine/sidebets'
import { useApp } from '../store/context'
import { resolvePaytable } from '../store/settings'

const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export function Reference() {
  const { settings } = useApp()
  const { rules } = settings
  const ramp = BET_RAMPS[settings.spread]
  const sideEdges = useMemo(() => {
    const shoe = fullShoeComposition(rules.decks)
    return SIDE_BET_IDS.map((id) => {
      const paytable = resolvePaytable(settings.sideBets, id)
      return { id, paytable, ev: sideBetEv(id, shoe, paytable, rules.h17) }
    })
  }, [rules.decks, rules.h17, settings.sideBets])
  const devs = deviationsFor(rules).filter((d) => rules.surrender || d.atOrAbove !== 'surrender')

  return (
    <div className="mode">
      <header className="mode-head">
        <div>
          <h1>Reference</h1>
          <p className="muted small">Charts for your current rules: {describeRules(rules)}</p>
        </div>
      </header>

      <section className="panel">
        <h3>Basic strategy</h3>
        <ChartLegend />
        <div className="charts">
          <StrategyChart rules={rules} table="hard" />
          <StrategyChart rules={rules} table="soft" />
          <StrategyChart rules={rules} table="pair" />
        </div>
        <p className="muted small">
          Pairs marked “–” aren't split: play them from the hard table (5,5 is a hard 10, T,T a hard 20). Never take insurance
          without a count.
        </p>
      </section>

      <div className="two-col">
        <section className="panel">
          <h3>Count systems</h3>
          <table className="data">
            <thead>
              <tr>
                <th>System</th>
                {VALUES.map((v) => (
                  <th key={v} className="num">
                    {dealerLabel(v)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(SYSTEMS) as SystemId[]).map((id) => (
                <tr key={id} className={settings.system === id ? 'hl-row' : ''}>
                  <td>{SYSTEMS[id].name}</td>
                  {VALUES.map((v) => (
                    <td key={v} className="num">
                      {formatCount(SYSTEMS[id].tags[v])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {(Object.keys(SYSTEMS) as SystemId[]).map((id) => (
            <p key={id} className="small">
              <b>{SYSTEMS[id].name}.</b> {SYSTEMS[id].summary}
            </p>
          ))}
          <h4>Running count → true count</h4>
          <p className="small">
            Divide the running count by the decks left in the shoe (estimate from the discard tray to the nearest half deck). A
            running count of +9 with 3 decks left is a true count of +3. Bets and index plays key off the true count.
          </p>
          <h4>Bet ramp (1–{settings.spread} units)</h4>
          <table className="data narrow">
            <thead>
              <tr>
                <th>Hi-Lo true count</th>
                <th className="num">Units</th>
              </tr>
            </thead>
            <tbody>
              {ramp.map((s, i) => {
                const nextMin = ramp[i + 1]?.minTc
                const range =
                  s.minTc === -Infinity
                    ? `+${nextMin! - 1} or less`
                    : nextMin === undefined
                      ? `+${s.minTc} or more`
                      : `+${s.minTc}`
                return (
                  <tr key={i}>
                    <td>{range}</td>
                    <td className="num">{s.units}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="muted small">Level-2 systems (Omega II, Zen) halve their true count before reading this ramp.</p>
        </section>

        <section className="panel">
          <h3>Hi-Lo index plays</h3>
          <p className="small">
            Insurance: take it at true count <b>{formatCount(INSURANCE_INDEX)}</b> or higher. Otherwise play the deviation at or
            above the index, and the listed play below it.
          </p>
          <table className="data">
            <thead>
              <tr>
                <th>Hand</th>
                <th className="num">Index</th>
                <th>At or above</th>
                <th>Below</th>
                <th>Set</th>
              </tr>
            </thead>
            <tbody>
              {devs.map((d) => (
                <tr key={d.id}>
                  <td>
                    {d.kind === 'pair' ? 'T,T' : d.total} vs {dealerLabel(d.dealer)}
                  </td>
                  <td className="num">{formatCount(d.index)}</td>
                  <td>{ACTION_LABELS[d.atOrAbove]}</td>
                  <td>{d.below ? ACTION_LABELS[d.below] : 'Basic'}</td>
                  <td className="muted">{d.group}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">
            Indices are for 4–8 decks{rules.h17 ? ', adjusted for H17' : ', S17'}. The Fab 4 rows only apply where late surrender
            is offered.
          </p>
        </section>
      </div>

      <section className="panel">
        <h3>Side bets</h3>
        <p className="small">
          House edge off the top of a fresh {rules.decks}-deck shoe with the paytables chosen in Settings. Side bets carry far
          bigger edges than the main game; a few become worth betting deep in a shoe with the right cards left, which is what the
          table coach watches for.
        </p>
        <table className="data">
          <thead>
            <tr>
              <th>Side bet</th>
              <th>Paytable (to 1)</th>
              <th>Pays</th>
              <th className="num">House edge</th>
            </tr>
          </thead>
          <tbody>
            {sideEdges.map(({ id, paytable, ev }) => (
              <tr key={id}>
                <td>
                  <b>{SIDE_BETS[id].name}</b>
                  <div className="muted small">{SIDE_BETS[id].description}</div>
                </td>
                <td className="small">
                  {SIDE_BETS[id].outcomes.map((o) => (
                    <div key={o.key}>
                      {o.label}: {paytable.pays[o.key] ?? 0}
                    </div>
                  ))}
                </td>
                <td className="small">{SIDE_BETS[id].resolves}</td>
                <td className="num">{(-ev * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted small">
          Buster Blackjack's figure draws the dealer's cards from the shoe's overall mix (no card removal as the dealer draws),
          which is accurate to within a few hundredths of a percent.
        </p>
      </section>
    </div>
  )
}
