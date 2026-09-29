export interface Tally {
  attempts: number
  correct: number
}

export interface DayStats {
  strategy: Tally
  count: Tally
  hands: number
  net: number
}

export interface CountSession {
  at: number
  mode: 'flash' | 'countdown' | 'truecount' | 'table'
  system: string
  correct: boolean
  detail: string
}

export interface SideBetStats {
  wagered: number
  returned: number
  /** Graded side-bet choices: betting a −EV spot or skipping a +EV one is wrong. */
  decisions: Tally
}

export const STATS_VERSION = 2

export interface Stats {
  version: number
  /** Keyed by situation label, e.g. "Hard 16 vs 10" or "I18: 16 vs 10". */
  situations: Record<string, Tally & { expected: string }>
  strategy: Tally
  deviations: Tally
  insurance: Tally
  bets: Tally
  count: Tally
  hands: number
  net: number
  daily: Record<string, DayStats>
  countLog: CountSession[]
  bestCountdownMs: number | null
  sideBets: SideBetStats
}

export const EMPTY_STATS: Stats = {
  version: STATS_VERSION,
  situations: {},
  strategy: { attempts: 0, correct: 0 },
  deviations: { attempts: 0, correct: 0 },
  insurance: { attempts: 0, correct: 0 },
  bets: { attempts: 0, correct: 0 },
  count: { attempts: 0, correct: 0 },
  hands: 0,
  net: 0,
  daily: {},
  countLog: [],
  bestCountdownMs: null,
  sideBets: { wagered: 0, returned: 0, decisions: { attempts: 0, correct: 0 } },
}

/** Upgrade older saves: v1 had no version field and no side-bet stats. */
export function normalizeStats(raw: Partial<Stats> | null | undefined): Stats {
  const s = { ...EMPTY_STATS, ...(raw ?? {}) }
  return {
    ...s,
    version: STATS_VERSION,
    sideBets: { ...EMPTY_STATS.sideBets, ...(raw?.sideBets ?? {}) },
  }
}

export const STATS_KEY = 'bjt:stats:v1'

export function today(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function bump(t: Tally, correct: boolean): Tally {
  return { attempts: t.attempts + 1, correct: t.correct + (correct ? 1 : 0) }
}

function day(s: Stats): DayStats {
  return s.daily[today()] ?? { strategy: { attempts: 0, correct: 0 }, count: { attempts: 0, correct: 0 }, hands: 0, net: 0 }
}

export interface DecisionRecord {
  situation: string
  expected: string
  correct: boolean
  deviation: boolean
}

export function withDecision(s: Stats, d: DecisionRecord): Stats {
  const prev = s.situations[d.situation] ?? { attempts: 0, correct: 0, expected: d.expected }
  const dayStats = day(s)
  return {
    ...s,
    situations: { ...s.situations, [d.situation]: { ...bump(prev, d.correct), expected: d.expected } },
    strategy: bump(s.strategy, d.correct),
    deviations: d.deviation ? bump(s.deviations, d.correct) : s.deviations,
    daily: { ...s.daily, [today()]: { ...dayStats, strategy: bump(dayStats.strategy, d.correct) } },
  }
}

export function withCount(s: Stats, entry: Omit<CountSession, 'at'>, elapsedMs?: number): Stats {
  const dayStats = day(s)
  const best =
    entry.mode === 'countdown' && entry.correct && elapsedMs !== undefined
      ? Math.min(elapsedMs, s.bestCountdownMs ?? Infinity)
      : s.bestCountdownMs
  return {
    ...s,
    count: bump(s.count, entry.correct),
    countLog: [{ ...entry, at: Date.now() }, ...s.countLog].slice(0, 200),
    bestCountdownMs: best,
    daily: { ...s.daily, [today()]: { ...dayStats, count: bump(dayStats.count, entry.correct) } },
  }
}

export function withHand(s: Stats, net: number): Stats {
  const dayStats = day(s)
  return {
    ...s,
    hands: s.hands + 1,
    net: s.net + net,
    daily: { ...s.daily, [today()]: { ...dayStats, hands: dayStats.hands + 1, net: dayStats.net + net } },
  }
}

export function withTally(s: Stats, key: 'insurance' | 'bets', correct: boolean): Stats {
  return { ...s, [key]: bump(s[key], correct) }
}

export function pct(t: Tally): number | null {
  return t.attempts === 0 ? null : (t.correct / t.attempts) * 100
}

export function withSideBets(s: Stats, wagered: number, returned: number, graded: boolean[]): Stats {
  let decisions = s.sideBets.decisions
  for (const ok of graded) decisions = bump(decisions, ok)
  return {
    ...s,
    sideBets: { wagered: s.sideBets.wagered + wagered, returned: s.sideBets.returned + returned, decisions },
  }
}
