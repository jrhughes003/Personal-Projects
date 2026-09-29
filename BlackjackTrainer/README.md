# Blackjack Trainer

A desktop app (Electron + React + TypeScript) that teaches blackjack basic strategy, card counting and count-based play, then checks your work at a simulated table.

## Training modes

- **Strategy drill.** You're dealt a hand against a dealer upcard and pick Hit / Stand / Double / Split / Surrender. You get instant feedback and the matching strategy-chart cell lights up. You can focus on hard totals, soft totals, pairs, or **count deviations** (the Illustrious 18 and Fab 4 at a given true count).
- **Counting drills.**
  - *Card flash:* cards flash at a speed you set (1–3 at a time), then you enter the running count and review each card's tag.
  - *Deck countdown:* one card is removed secretly. You count the other 51 against the clock, and your final count tells you what's missing.
  - *True count:* you convert a running count to a true count using a discard-tray estimate.
- **Table.** You play a full shoe with a cut card, splits, doubles, late surrender, insurance and a bankroll. A coach panel grades every bet against the 1–8 unit ramp, every insurance decision and every play, including index plays. Optional running-count checks between hands test whether you're keeping up.
- **Reference.** Shows strategy charts for your exact rules, the tags for each count system, the bet ramp and the index table.
- **Progress.** Shows lifetime accuracy for plays, deviations, counting, bets and insurance, a 14-day trend, your most-missed situations and a counting log. It's all saved locally.

## Counting systems

| System | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | T | A |
|---|---|---|---|---|---|---|---|---|---|---|
| Hi-Lo | +1 | +1 | +1 | +1 | +1 | 0 | 0 | 0 | −1 | −1 |
| Omega II | +1 | +1 | +2 | +2 | +2 | +1 | 0 | −1 | −2 | 0 |
| Zen | +1 | +1 | +2 | +2 | +2 | +1 | 0 | 0 | −2 | −1 |

The deviation indices (I18 + Fab 4, insurance at +3) are published for Hi-Lo, so the app only grades index plays when Hi-Lo is selected. Omega II and Zen play basic strategy, and their true count is halved before it's read against the bet ramp.

## Rules

You can set 4, 6 or 8 decks, H17 or S17, DAS on/off, late surrender on/off, 3:2 or 6:5 blackjacks, and penetration from 50% to 90%. The dealer peeks for blackjack, split aces get one card each, and you can split up to 4 hands. Single- and double-deck games aren't offered because their basic strategy is different from the shoe charts used here.

## Development

```bash
npm install
npm run electron:dev   # Vite dev server + Electron window with hot reload
npm run dev            # or just the browser at http://localhost:5173
npm test               # engine unit tests + 3,000-round fuzz per ruleset
npm run typecheck
npm run dist           # build an installer into release/ (NSIS / dmg / AppImage)
```

`src/engine/` is pure TypeScript with no React (cards, hand totals, strategy tables, counting, deviations, the round state machine and the drill generator), and all of it is unit-tested. `src/modes/` holds one screen per training mode, and `src/store/` holds settings and stats, which are saved to `localStorage`.
