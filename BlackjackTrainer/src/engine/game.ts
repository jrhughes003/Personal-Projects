import { makeShoe, rankValue, type Card, type Rng } from './cards'
import { tagOf, type SystemId } from './counting'
import { handTotal, isBlackjack, isPair } from './hand'
import type { Rules } from './rules'
import type { Action, Availability } from './strategy'

export type Outcome = 'blackjack' | 'win' | 'push' | 'lose' | 'bust' | 'surrender'
export type Phase = 'betting' | 'insurance' | 'player' | 'settled'

export interface PlayerHand {
  cards: Card[]
  bet: number
  doubled: boolean
  fromSplit: boolean
  splitAces: boolean
  done: boolean
  outcome?: Outcome
  /** Amount returned to the bankroll at settlement, stake included. */
  payout?: number
}

export interface GameState {
  rules: Rules
  system: SystemId
  shoe: Card[]
  /** Index of the next card to deal. */
  pos: number
  /** Reshuffle before a round once this many cards have been dealt. */
  cutAt: number
  runningCount: number
  bankroll: number
  phase: Phase
  hands: PlayerHand[]
  active: number
  dealer: Card[]
  holeRevealed: boolean
  insurance: number
  insuranceTaken: boolean | null
  /** Set on the round that followed a reshuffle, so the UI can announce it. */
  shuffled: boolean
  rounds: number
}

export interface NewGameOptions {
  rules: Rules
  system: SystemId
  bankroll: number
  rng?: Rng
  /** A prearranged shoe (dealt from index 0), for tests. */
  shoe?: Card[]
}

export function newGame(opts: NewGameOptions): GameState {
  const shoe = opts.shoe ?? makeShoe(opts.rules.decks, opts.rng)
  return {
    rules: opts.rules,
    system: opts.system,
    shoe,
    pos: 0,
    cutAt: Math.floor(shoe.length * opts.rules.penetration),
    runningCount: 0,
    bankroll: opts.bankroll,
    phase: 'betting',
    hands: [],
    active: 0,
    dealer: [],
    holeRevealed: false,
    insurance: 0,
    insuranceTaken: null,
    shuffled: false,
    rounds: 0,
  }
}

/** Cards the player hasn't seen: the undealt shoe plus a face-down hole card. */
export function unseenCards(s: GameState): number {
  const hole = s.dealer.length >= 2 && !s.holeRevealed ? 1 : 0
  return s.shoe.length - s.pos + hole
}

export function dealerUpValue(s: GameState): number {
  return rankValue(s.dealer[0].rank)
}

export function needsShuffle(s: GameState): boolean {
  return s.pos >= s.cutAt
}

// ---- internal helpers (mutate the draft copy made by each action) ----

function clone(s: GameState): GameState {
  return {
    ...s,
    hands: s.hands.map((h) => ({ ...h, cards: h.cards.slice() })),
    dealer: s.dealer.slice(),
  }
}

function draw(s: GameState, faceUp = true): Card {
  if (s.pos >= s.shoe.length) {
    // Only reachable with a tiny test shoe or 90%+ penetration and a long round.
    s.shoe = makeShoe(s.rules.decks)
    s.pos = 0
    s.runningCount = 0
  }
  const card = s.shoe[s.pos++]
  if (faceUp) s.runningCount += tagOf(card, s.system)
  return card
}

function revealHole(s: GameState): void {
  if (s.holeRevealed) return
  s.holeRevealed = true
  s.runningCount += tagOf(s.dealer[1], s.system)
}

// ---- round flow ----

export function placeBet(state: GameState, amount: number, rng?: Rng): GameState {
  if (state.phase !== 'betting' && state.phase !== 'settled') throw new Error('not taking bets now')
  if (amount <= 0 || amount > state.bankroll) throw new Error('invalid bet')
  const s = clone(state)
  s.shuffled = false
  if (needsShuffle(s)) {
    s.shoe = makeShoe(s.rules.decks, rng)
    s.pos = 0
    s.cutAt = Math.floor(s.shoe.length * s.rules.penetration)
    s.runningCount = 0
    s.shuffled = true
  }
  s.bankroll -= amount
  s.rounds += 1
  s.insurance = 0
  s.insuranceTaken = null
  s.holeRevealed = false
  const hand: PlayerHand = { cards: [], bet: amount, doubled: false, fromSplit: false, splitAces: false, done: false }
  s.hands = [hand]
  s.active = 0
  s.dealer = []
  hand.cards.push(draw(s))
  s.dealer.push(draw(s))
  hand.cards.push(draw(s))
  s.dealer.push(draw(s, false))

  if (rankValue(s.dealer[0].rank) === 11) {
    s.phase = 'insurance'
    return s
  }
  return afterPeek(s)
}

export function canAffordInsurance(s: GameState): boolean {
  return s.bankroll >= s.hands[0].bet / 2
}

export function decideInsurance(state: GameState, take: boolean): GameState {
  if (state.phase !== 'insurance') throw new Error('no insurance offered')
  const s = clone(state)
  s.insuranceTaken = take && canAffordInsurance(s)
  if (s.insuranceTaken) {
    s.insurance = s.hands[0].bet / 2
    s.bankroll -= s.insurance
  }
  return afterPeek(s)
}

function dealerHasBlackjack(s: GameState): boolean {
  return isBlackjack(s.dealer)
}

/** Dealer checks for blackjack under an ace or ten; then naturals are paid. */
function afterPeek(s: GameState): GameState {
  const up = rankValue(s.dealer[0].rank)
  if ((up === 11 || up === 10) && dealerHasBlackjack(s)) {
    revealHole(s)
    s.hands[0].done = true
    return settle(s)
  }
  if (isBlackjack(s.hands[0].cards)) {
    revealHole(s)
    s.hands[0].done = true
    return settle(s)
  }
  s.phase = 'player'
  return s
}

export function availability(s: GameState): Availability {
  if (s.phase !== 'player') return { canDouble: false, canSplit: false, canSurrender: false }
  const h = s.hands[s.active]
  const twoCards = h.cards.length === 2
  const affordable = s.bankroll >= h.bet
  return {
    canDouble: twoCards && affordable && !h.splitAces && (!h.fromSplit || s.rules.das),
    canSplit:
      twoCards && affordable && isPair(h.cards) && s.hands.length < s.rules.maxHands && !h.splitAces,
    canSurrender: twoCards && s.rules.surrender && !h.fromSplit && s.hands.length === 1,
  }
}

export function act(state: GameState, action: Action): GameState {
  if (state.phase !== 'player') throw new Error('not the player turn')
  const avail = availability(state)
  if (action === 'double' && !avail.canDouble) throw new Error('cannot double')
  if (action === 'split' && !avail.canSplit) throw new Error('cannot split')
  if (action === 'surrender' && !avail.canSurrender) throw new Error('cannot surrender')

  const s = clone(state)
  const h = s.hands[s.active]

  switch (action) {
    case 'hit': {
      h.cards.push(draw(s))
      const t = handTotal(h.cards).total
      if (t > 21) {
        h.done = true
        h.outcome = 'bust'
      } else if (t === 21) {
        h.done = true
      }
      break
    }
    case 'stand':
      h.done = true
      break
    case 'double':
      s.bankroll -= h.bet
      h.bet *= 2
      h.doubled = true
      h.cards.push(draw(s))
      h.done = true
      if (handTotal(h.cards).total > 21) h.outcome = 'bust'
      break
    case 'surrender':
      h.done = true
      h.outcome = 'surrender'
      break
    case 'split': {
      const aces = rankValue(h.cards[0].rank) === 11
      s.bankroll -= h.bet
      const second: PlayerHand = {
        cards: [h.cards[1]],
        bet: h.bet,
        doubled: false,
        fromSplit: true,
        splitAces: aces,
        done: false,
      }
      h.cards = [h.cards[0]]
      h.fromSplit = true
      h.splitAces = aces
      s.hands.splice(s.active + 1, 0, second)
      if (aces) {
        // Split aces get one card each and no further play.
        h.cards.push(draw(s))
        second.cards.push(draw(s))
        h.done = true
        second.done = true
      } else {
        h.cards.push(draw(s))
        if (handTotal(h.cards).total === 21) h.done = true
      }
      break
    }
  }
  return advance(s)
}

/** Move to the next unfinished hand, dealing the second card to split hands; else play the dealer. */
function advance(s: GameState): GameState {
  while (s.active < s.hands.length) {
    const h = s.hands[s.active]
    if (h.cards.length === 1) {
      h.cards.push(draw(s))
      if (handTotal(h.cards).total === 21) h.done = true
    }
    if (!h.done) {
      s.phase = 'player'
      return s
    }
    s.active++
  }
  s.active = s.hands.length - 1
  return playDealer(s)
}

export function dealerShouldHit(cards: readonly Card[], h17: boolean): boolean {
  const { total, soft } = handTotal(cards)
  return total < 17 || (total === 17 && soft && h17)
}

function playDealer(s: GameState): GameState {
  revealHole(s)
  const live = s.hands.some((h) => h.outcome !== 'bust' && h.outcome !== 'surrender')
  if (live) {
    while (dealerShouldHit(s.dealer, s.rules.h17)) s.dealer.push(draw(s))
  }
  return settle(s)
}

function settle(s: GameState): GameState {
  const dealerTotal = handTotal(s.dealer).total
  const dealerBj = dealerHasBlackjack(s)

  if (s.insurance > 0 && dealerBj) s.bankroll += s.insurance * 3

  for (const h of s.hands) {
    const total = handTotal(h.cards).total
    const playerBj = isBlackjack(h.cards, h.fromSplit)
    let outcome: Outcome
    let payout: number
    if (h.outcome === 'surrender') {
      outcome = 'surrender'
      payout = h.bet / 2
    } else if (total > 21) {
      outcome = 'bust'
      payout = 0
    } else if (playerBj && dealerBj) {
      outcome = 'push'
      payout = h.bet
    } else if (playerBj) {
      outcome = 'blackjack'
      payout = h.bet + h.bet * s.rules.blackjackPays
    } else if (dealerBj) {
      outcome = 'lose'
      payout = 0
    } else if (dealerTotal > 21 || total > dealerTotal) {
      outcome = 'win'
      payout = h.bet * 2
    } else if (total === dealerTotal) {
      outcome = 'push'
      payout = h.bet
    } else {
      outcome = 'lose'
      payout = 0
    }
    h.outcome = outcome
    h.payout = payout
    h.done = true
    s.bankroll += payout
  }
  s.phase = 'settled'
  return s
}

/** Net result of the settled round, insurance included. */
export function roundNet(s: GameState): number {
  const staked = s.hands.reduce((sum, h) => sum + h.bet, 0) + s.insurance
  const returned =
    s.hands.reduce((sum, h) => sum + (h.payout ?? 0), 0) + (s.insurance > 0 && dealerHasBlackjack(s) ? s.insurance * 3 : 0)
  return returned - staked
}
