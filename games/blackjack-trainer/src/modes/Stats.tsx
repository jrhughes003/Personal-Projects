import { StatTile } from '../components/StatTile'
import { useApp } from '../store/context'
import { pct, today, type DayStats, type Tally } from '../store/stats'

const fmtPct = (t: Tally) => {
  const p = pct(t)
  return p === null ? '–' : `${p.toFixed(1)}%`
}

function lastDays(n: number): string[] {
  const out: string[] = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    out.push(today(x))
  }
  return out
}

function TrendChart({ daily }: { daily: Record<string, DayStats> }) {
  const days = lastDays(14)
  const W = 900
  const H = 220
  const pad = { l: 40, r: 28, t: 12, b: 26 }
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (days.length - 1)
  const y = (p: number) => pad.t + ((100 - p) * (H - pad.t - pad.b)) / 100

  const series = (pick: (d: DayStats) => Tally) =>
    days.map((day, i) => {
      const d = daily[day]
      const p = d ? pct(pick(d)) : null
      return p === null ? null : { x: x(i), y: y(p), p }
    })

  const path = (pts: ({ x: number; y: number } | null)[]) => {
    let dStr = ''
    let pen = false
    for (const pt of pts) {
      if (!pt) {
        pen = false
        continue
      }
      dStr += `${pen ? 'L' : 'M'}${pt.x.toFixed(1)},${pt.y.toFixed(1)} `
      pen = true
    }
    return dStr
  }

  const strat = series((d) => d.strategy)
  const count = series((d) => d.count)
  const any = strat.some(Boolean) || count.some(Boolean)

  return (
    <div className="trend">
      <div className="trend-legend">
        <span className="sw sw-a" /> Play accuracy <span className="sw sw-b" /> Count accuracy{' '}
        <span className="muted">· last 14 days</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Accuracy over the last 14 days">
        {[0, 50, 100].map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} className="grid" />
            <text x={pad.l - 6} y={y(g) + 4} textAnchor="end" className="axis">
              {g}%
            </text>
          </g>
        ))}
        {days.map((d, i) =>
          i % 3 === 0 || i === days.length - 1 ? (
            <text key={d} x={x(i)} y={H - 6} textAnchor="middle" className="axis">
              {d.slice(5)}
            </text>
          ) : null,
        )}
        <path d={path(strat)} className="line-a" />
        <path d={path(count)} className="line-b" />
        {strat.map(
          (p, i) =>
            p && (
              <circle key={`a${i}`} cx={p.x} cy={p.y} r={3.5} className="dot-a">
                <title>{`${days[i]}: ${p.p.toFixed(0)}%`}</title>
              </circle>
            ),
        )}
        {count.map(
          (p, i) =>
            p && (
              <circle key={`b${i}`} cx={p.x} cy={p.y} r={3.5} className="dot-b">
                <title>{`${days[i]}: ${p.p.toFixed(0)}%`}</title>
              </circle>
            ),
        )}
        {!any && (
          <text x={W / 2} y={H / 2} textAnchor="middle" className="axis">
            Train a little and your daily accuracy shows up here.
          </text>
        )}
      </svg>
    </div>
  )
}

export function Stats() {
  const { stats, resetStats } = useApp()
  const sideNet = stats.sideBets.returned - stats.sideBets.wagered

  const missed = Object.entries(stats.situations)
    .map(([k, v]) => ({ key: k, ...v, misses: v.attempts - v.correct }))
    .filter((s) => s.misses > 0)
    .sort((a, b) => b.misses - a.misses || a.correct / a.attempts - b.correct / b.attempts)
    .slice(0, 12)

  return (
    <div className="mode">
      <header className="mode-head">
        <div>
          <h1>Progress</h1>
          <p className="muted">Everything here is stored locally on this computer.</p>
        </div>
        <button
          className="danger"
          onClick={() => {
            if (window.confirm('Erase all training history? This cannot be undone.')) resetStats()
          }}
        >
          Reset stats
        </button>
      </header>

      <div className="tiles">
        <StatTile label="Play accuracy" value={fmtPct(stats.strategy)} sub={`${stats.strategy.attempts} decisions`} />
        <StatTile label="Count deviations" value={fmtPct(stats.deviations)} sub={`${stats.deviations.attempts} index plays`} />
        <StatTile label="Count accuracy" value={fmtPct(stats.count)} sub={`${stats.count.attempts} checks`} />
        <StatTile label="Bet ramp" value={fmtPct(stats.bets)} sub={`${stats.bets.attempts} bets`} />
        <StatTile label="Insurance calls" value={fmtPct(stats.insurance)} sub={`${stats.insurance.attempts} offers`} />
        <StatTile
          label="Side bet discipline"
          value={fmtPct(stats.sideBets.decisions)}
          sub={
            stats.sideBets.wagered
              ? `net ${sideNet < 0 ? '−' : '+'}$${Math.abs(sideNet).toLocaleString()} on $${stats.sideBets.wagered.toLocaleString()} wagered`
              : 'no side bets yet'
          }
        />
        <StatTile
          label="Table results"
          value={`${stats.net < 0 ? '−' : '+'}$${Math.abs(stats.net).toLocaleString()}`}
          sub={`${stats.hands} hands · best countdown ${stats.bestCountdownMs === null ? '–' : `${(stats.bestCountdownMs / 1000).toFixed(1)}s`}`}
        />
      </div>

      <section className="panel">
        <TrendChart daily={stats.daily} />
      </section>

      <div className="two-col">
        <section className="panel">
          <h3>Most-missed plays</h3>
          {missed.length === 0 ? (
            <p className="muted small">No mistakes recorded yet.</p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>Situation</th>
                  <th>Correct play</th>
                  <th className="num">Missed</th>
                  <th className="num">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {missed.map((m) => (
                  <tr key={m.key}>
                    <td>{m.key}</td>
                    <td>{m.expected}</td>
                    <td className="num">{m.misses}</td>
                    <td className="num">{((m.correct / m.attempts) * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <h3>Recent counting</h3>
          {stats.countLog.length === 0 ? (
            <p className="muted small">No counting drills yet.</p>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Drill</th>
                  <th>Detail</th>
                  <th className="num">Result</th>
                </tr>
              </thead>
              <tbody>
                {stats.countLog.slice(0, 15).map((c, i) => (
                  <tr key={i}>
                    <td>
                      {new Date(c.at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      {{ flash: 'Flash', countdown: 'Countdown', truecount: 'True count', table: 'Table check' }[c.mode]} ·{' '}
                      {c.system}
                    </td>
                    <td>{c.detail}</td>
                    <td className={`num ${c.correct ? 'pos' : 'neg'}`}>{c.correct ? '✓' : '✗'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
