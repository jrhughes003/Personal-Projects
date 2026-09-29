import type { Rules } from '../engine/rules'
import { DEALER_COLUMNS, dealerLabel, displayCode, strategyTables, type ChartCode, type TableKind } from '../engine/strategy'

export interface ChartHighlight {
  table: TableKind
  rowKey: number
  dealer: number
}

const CODE_CLASS: Record<ChartCode, string> = {
  H: 'c-hit',
  S: 'c-stand',
  D: 'c-double',
  Ds: 'c-double',
  P: 'c-split',
  Rh: 'c-sur',
  Rs: 'c-sur',
  Rp: 'c-sur',
}

const ROWS: Record<TableKind, number[]> = {
  hard: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  soft: [13, 14, 15, 16, 17, 18, 19, 20],
  pair: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
}

function rowLabel(table: TableKind, key: number): string {
  if (table === 'hard') return key === 8 ? '≤8' : key === 18 ? '18+' : String(key)
  if (table === 'soft') return `A,${key - 11}`
  const c = key === 11 ? 'A' : key === 10 ? 'T' : String(key)
  return `${c},${c}`
}

interface Props {
  rules: Rules
  table: TableKind
  highlight?: ChartHighlight | null
  compact?: boolean
}

export function StrategyChart({ rules, table, highlight, compact }: Props) {
  const tables = strategyTables(rules)
  const codeFor = (key: number, col: number): ChartCode => {
    if (table === 'pair') {
      const r = tables.pair[key]
      return r && (r[col] === 'P' || r[col] === 'Rp') ? r[col] : 'H'
    }
    return tables[table][key][col]
  }
  // Pairs the chart never splits show "–"; their play comes from the hard table.
  const pairNoSplit = (key: number, col: number) => {
    const r = tables.pair[key]
    return !r || (r[col] !== 'P' && r[col] !== 'Rp')
  }

  // Hard rows collapse at both ends (≤8, 18+), so clamp the highlighted row onto them.
  const hlKey = highlight?.table === 'hard' ? Math.min(18, Math.max(8, highlight.rowKey)) : highlight?.rowKey

  return (
    <table className={`chart ${compact ? 'compact' : ''}`}>
      <thead>
        <tr>
          <th className="chart-title">{table === 'hard' ? 'Hard' : table === 'soft' ? 'Soft' : 'Pairs'}</th>
          {DEALER_COLUMNS.map((d) => (
            <th key={d} className={highlight?.table === table && highlight.dealer === d ? 'hl-col' : ''}>
              {dealerLabel(d)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS[table].map((key) => {
          const rowHl = highlight?.table === table && hlKey === key
          return (
            <tr key={key} className={rowHl ? 'hl-row' : ''}>
              <th>{rowLabel(table, key)}</th>
              {DEALER_COLUMNS.map((d, col) => {
                const cellHl = rowHl && highlight?.dealer === d
                if (table === 'pair' && pairNoSplit(key, col)) {
                  return (
                    <td key={d} className={`c-none ${cellHl ? 'hl-cell' : ''}`}>
                      –
                    </td>
                  )
                }
                const code = displayCode(codeFor(key, col), rules)
                return (
                  <td key={d} className={`${CODE_CLASS[code]} ${cellHl ? 'hl-cell' : ''}`}>
                    {code}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function ChartLegend() {
  return (
    <div className="legend">
      <span className="c-hit">H hit</span>
      <span className="c-stand">S stand</span>
      <span className="c-double">D double, else hit · Ds double, else stand</span>
      <span className="c-split">P split</span>
      <span className="c-sur">Rh / Rs / Rp surrender, else hit / stand / split</span>
    </div>
  )
}
