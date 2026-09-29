import { describe, expect, it } from 'vitest'
import { makeBackup, parseBackup } from './backup'
import { DEFAULT_SETTINGS, normalizeSettings, resolvePaytable } from './settings'
import { EMPTY_STATS, normalizeStats, withDecision, withSideBets } from './stats'

describe('settings', () => {
  it('fills gaps in an old save', () => {
    const old = { system: 'zen', rules: { decks: 8 } } as never
    const s = normalizeSettings(old)
    expect(s.system).toBe('zen')
    expect(s.rules.decks).toBe(8)
    expect(s.rules.doubleOn).toBe('any')
    expect(s.sideBets.enabled.buster).toBe(false)
    expect(s.spread).toBe(8)
  })

  it('resolves a custom paytable', () => {
    const s = normalizeSettings({
      sideBets: { ...DEFAULT_SETTINGS.sideBets, paytable: { ...DEFAULT_SETTINGS.sideBets.paytable, perfectPairs: 'custom' } },
    })
    s.sideBets.custom.perfectPairs.perfect = 40
    expect(resolvePaytable(s.sideBets, 'perfectPairs').pays.perfect).toBe(40)
    expect(resolvePaytable(s.sideBets, 'twentyOneThree').id).toBe('100-40-30-10-5')
  })
})

describe('stats', () => {
  it('upgrades a v1 save', () => {
    const v1 = { hands: 12, strategy: { attempts: 3, correct: 2 } } as never
    const s = normalizeStats(v1)
    expect(s.version).toBe(2)
    expect(s.hands).toBe(12)
    expect(s.sideBets.wagered).toBe(0)
  })

  it('tracks decisions and side bets', () => {
    let s = withDecision(EMPTY_STATS, { situation: 'Hard 16 vs 10', expected: 'Surrender', correct: false, deviation: false })
    s = withSideBets(s, 10, 30, [true, false])
    expect(s.situations['Hard 16 vs 10']).toMatchObject({ attempts: 1, correct: 0 })
    expect(s.sideBets).toEqual({ wagered: 10, returned: 30, decisions: { attempts: 2, correct: 1 } })
  })
})

describe('backups', () => {
  it('round-trips', () => {
    const text = JSON.stringify(makeBackup(DEFAULT_SETTINGS, { ...EMPTY_STATS, hands: 5 }))
    expect(parseBackup(text).stats.hands).toBe(5)
  })

  it('rejects other files', () => {
    expect(() => parseBackup('nope')).toThrow(/valid JSON/)
    expect(() => parseBackup('{"hello":1}')).toThrow(/not a Blackjack Trainer backup/)
  })
})
