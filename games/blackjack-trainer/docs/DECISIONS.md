# Design decisions

This log records every decision made while building Blackjack Trainer, and why. It's meant to be walked through in a review session. Each entry gives the decision, the reasoning, the alternatives considered and what reversing it would involve. Items marked **⚑ Review** are ones where your input could change the outcome. The list of open questions at the end collects them.

## Product scope

### D1. Tech stack: Electron + React + TypeScript + Vite

- **Decision:** Build a desktop app with Electron and a React/TypeScript front end built by Vite. This is the stack you chose at kickoff.
- **Why:** It's the same stack as FinanceFlow, so the tooling and patterns carry over. One codebase also runs in a browser, which makes the optional web deploy (D19) free.
- **Alternatives:** Tauri (smaller installers but needs a Rust toolchain), Python/Qt.
- **Cost of change:** High. This is the foundation.

### D2. Location: `Personal-Projects/games/blackjack-trainer/`

- **Decision:** The app lives in the Personal-Projects repo under `games/`, following the repo's layout of project type, then a kebab-case project folder with its own README. Its GitHub workflows live at the repo root and are filtered to `games/blackjack-trainer/**`, and its release tags are prefixed `blackjack-trainer-v*` so they won't clash with other projects.
- **Why:** You chose this repo. The path filters mean CI never runs for unrelated projects. The app started at `BlackjackTrainer/` and moved here when PR #2 reorganized the repo.
- **Build folder:** the repo-wide `.gitignore` ignores `build/`, so the app's own `.gitignore` re-includes `build/`, where the installer icon lives.
- **⚑ Review:** FinanceFlow and the portfolio were each moved into their own repository. If Blackjack Trainer gets the same treatment, move the folder and drop the path filters and tag prefix. No code changes are needed.

### D3. Shoe games only (4, 6 or 8 decks)

- **Decision:** Single- and double-deck games aren't offered.
- **Why:** The strategy tables are the standard 4–8 deck charts. Hand-held games have a different basic strategy (for example 11 vs A, soft 18 vs A and several pairs) and different index numbers. Offering them with shoe charts would teach wrong plays.
- **Cost of change:** Medium. It needs 1D and 2D tables and index sets, plus tests. The engine is table-driven, so it's additive.

### D4. US dealer-peek rules only

- **Decision:** No European no-hole-card (ENHC) rules and no early surrender.
- **Why:** These rules change the strategy (for example, don't split 8s or double 11 against a dealer ten or ace), and they're rare at the tables most US and Canadian counters play.
- **⚑ Review:** Add ENHC if you train for European casinos.

### D5. Four side bets: 21+3, Perfect Pairs, Lucky Ladies, Buster Blackjack

- **Decision:** These are the most widely spread blackjack side bets in North American casinos. Each covers a different mechanic: poker hands with the dealer's upcard, pairs, a total of 20 with a dealer-blackjack jackpot, and dealer busts.
- **Not included:** Royal Match, Match the Dealer, Bust It, Hot 3, progressive jackpots. They're simple to add as `SideBetDef` entries if you want them.

## Strategy and counting

### D6. How the strategy tables handle rule variants

- **Decision:** Each variant is handled in one place:
  - H17 changes are applied as overrides: 11 vs A doubles; 15 vs A and 17 vs A surrender; soft 18 vs 2 and soft 19 vs 6 double; 8,8 vs A surrenders.
  - DAS switches between two pair tables.
  - Doubling restrictions (9–11 or 10–11 only) use the chart's fallback play: D means double or else hit, and Ds means double or else stand.
- **Why:** For doubling restrictions, the fallback printed on the standard card is the conventional play when a double isn't allowed, and it's what restricted-double charts are built from. A composition-exact strategy for these rules could differ in rare spots; that's not modelled.
- **Cost of change:** Low. Each variant is a few lines in `strategy.ts`, with tests.

### D7. Index plays for Hi-Lo only

- **Decision:** The Illustrious 18, the Fab 4 surrenders and insurance at +3 are graded only when Hi-Lo is selected. Omega II and Zen are graded on basic strategy only.
- **Why:** The published index sets are for Hi-Lo. Converting them for other systems (for example by doubling) would be invented numbers, so the Settings toggle states that indices are Hi-Lo only.
- **H17 adjustments:**
  - 11 vs A isn't a deviation under H17, because basic strategy already doubles.
  - 10 vs A moves from +4 to +3.
  - 15 vs A surrender moves from +1 to −1.
- **⚑ Review:** If you want Zen or Omega II index plays, supply a published index set and it can be added as data.

### D8. Surrender beats stand indices

- **Decision:** When late surrender is offered, a basic-strategy surrender (16 vs 9/10/A) takes priority over the stand indices (16 vs 10 at 0, 16 vs 9 at +5). Below a Fab 4 index, surrender is taken off the table and the I18 index or basic strategy decides.
- **Why:** At any realistic count, surrendering 16 vs 10 is worth more than standing on it. The fuzz test caught that without this rule the drill's "16 vs 10: stand at 0" question could never come up when surrender was allowed. So **index drills for stand, double and split plays deal those hands as if surrender weren't offered.**

### D9. True count method

- **Decision:** Divide the running count by the decks remaining, **estimated to the nearest half deck** (minimum 0.5). Play and bet decisions use the **floored** true count, so +2.9 counts as +2.
- **Why:** Players read decks remaining from the discard tray in half-deck steps, and flooring is the usual convention for indices. The true-count drill accepts floored, truncated or rounded answers, because all three are legitimate methods.
- **⚑ Review:** If you were taught truncation or rounding, the table can grade that way instead. It's a one-line change in `counting.ts`.

### D10. Bet ramps

- **Decision:** Three ramps are available: 1–4, 1–8 (the default) and 1–12. Each steps up at true counts of +2, +3, +4 and +5. Level-2 systems halve their true count before reading the ramp.
- **Why:** A true count of +1 is roughly break-even for Hi-Lo, and each point after that adds about 0.5% edge. Level-2 counts run about twice as large, so halving is a reasonable approximation.
- **Grading:** The bet is graded as exactly right or wrong against the ramp.
- **⚑ Review:** A custom ramp editor would be a natural next step if you use a different spread.

### D11. Insurance and even money

- **Decision:** Insurance is graded correct at a Hi-Lo true count of +3 or higher (only when the indices setting is on), and never otherwise. Even money on a blackjack is graded the same way, because it's the same bet.

## Side bets

### D12. Exact EV from the cards left in the shoe

- **Decision:**
  - For 21+3, Perfect Pairs and Lucky Ladies, the EV comes from **exact enumeration** of the remaining cards by rank and suit, removing each card as it's drawn.
  - For Buster, the dealer's draws use the shoe's value mix **without removing cards as the dealer draws**.
- **Why:** The exact enumeration is proven two ways: it matches a brute-force count of every ordered three-card draw from a deck, and it reproduces published figures (classic 9:1 21+3 over six decks = 3.24%; Perfect Pairs 25/12/6 over eight decks = 4.10%). An exact Buster calculation would have to enumerate every dealer drawing sequence, which is too slow to run live. The approximation moves the answer by only a few hundredths of a percent.
- **Side effect:** Buster's edge off the top shows the same value for 6 and 8 decks, because the proportions of each card value are identical.

### D13. Paytables, including a custom one

- **Decision:** Each side bet ships with its common paytables, plus a **Custom** option that takes the odds for every outcome.
- **Why:** Paytables vary from casino to casino, and a trainer is only accurate if it uses the table you'll actually sit at.
- **⚑ Review:** The built-in **Buster** table (250/100/50/9/2/1) is one plausible version. Real Buster tables vary widely and often add a player-blackjack bonus, which isn't modelled. Please check it against a felt you play, and replace it or use Custom.

### D14. How side-bet decisions are graded

- **Decision:**
  - Placing a side bet at negative EV counts as a mistake.
  - Passing up a positive-EV spot counts as a mistake.
  - Placing a side bet at positive EV counts as correct.
  - Skipping a negative-EV bet is correct, but it's **not counted**.
- **Why:** Counting every skipped bet would inflate the score to near 100% and hide the rare decisions that matter.
- **Settlement timing:** Side bets settle when they would at a real table. A Buster bet forces the dealer to play out even when every player hand has busted or has blackjack, as real Buster tables require.
- **Opt-out:** Grading can be turned off in Settings for people who just want to play the side bets.

## Engineering

### D15. Unsigned installers

- **Decision:** Release builds aren't code-signed or notarized.
- **Why:** Signing needs a paid Apple Developer ID and a Windows code-signing certificate. The cost is that Windows SmartScreen and macOS Gatekeeper warn on first launch. The README gives the steps to get past the warning.
- **To add signing later:** Put `CSC_LINK`/`CSC_KEY_PASSWORD` (Windows and macOS) and `APPLE_ID`/`APPLE_APP_SPECIFIC_PASSWORD`/`APPLE_TEAM_ID` (notarization) into repository secrets, then remove `CSC_IDENTITY_AUTO_DISCOVERY: 'false'` from the release workflow.
- **⚑ Review:** Worth doing if you plan to share the app beyond yourself.

### D16. Storage: `localStorage` with versioned schemas

- **Decision:** Settings and stats are stored as JSON in `localStorage`, not SQLite. Each load passes through `normalizeSettings` and `normalizeStats`, which fill in missing fields from defaults. That lets old saves and hand-edited backups load safely. Stats carry a `version` field, currently 2.
- **Why:** The data is small (well under 1 MB). It also means no native modules, so cross-platform builds stay simple, and the same code works in the browser build.
- **Backups:** JSON files, validated on import.

### D17. Security posture

- **Decision:**
  - The renderer has `contextIsolation`, `sandbox` and no `nodeIntegration`. There's no preload script, because the app needs no system access.
  - The production CSP (written into the built HTML) sets `connect-src 'none'` and `script-src 'self'`.
  - Navigation away from the app is blocked, and external links open in the system browser.
  - Only one copy of the app can run at a time.
- **Why:** The app has no reason to touch the network or the file system (backups use the browser's download and file-picker features), so it gets the smallest possible set of permissions.

### D18. Screens that keep their state

- **Decision:** The Table and Strategy drill screens stay mounted but hidden when you switch screens. Keyboard shortcuts are limited to the visible screen through a context. Changing rules resets these screens via a React `key`.
- **Why:** This fixes a bug found during this round: switching to Reference mid-shoe used to reset your shoe and bankroll. The `key` approach also replaces reset effects that were error-prone.

### D19. Deployment channels

- **Decision:** There are two ways to ship:
  1. **Installers** (primary): pushing a version tag builds Windows, macOS and Linux installers in GitHub Actions and attaches them to a GitHub Release.
  2. **Web build** (optional): a manually triggered GitHub Pages workflow.
- **Why the web deploy is manual:** A Pages deploy publishes this repository's Pages site. The portfolio now has its own repository (and its own Pages site), so this wouldn't replace it, but publishing stays a deliberate step.
- **Resolved:** The portfolio moved to its own repository, so this repository's Pages site is free for the trainer.

### D20. Dependency choices

- **TypeScript is pinned to 5.9**, not 7. typescript-eslint doesn't support TypeScript 7 yet (its peer range is below 6.1).
- **React and React DOM are dev dependencies.** Vite bundles them into `dist/`, so leaving them as runtime dependencies made electron-builder ship a second, unused copy. The app archive shrank from 9 MB to 0.6 MB.
- **No UI or charting library.** The styling is hand-written CSS and the one chart is inline SVG, which keeps the bundle around 90 KB gzipped.
- **Dependabot** runs monthly, with minor and patch updates grouped into one PR.

### D21. Testing strategy

- **Decision:**
  - Engine logic is covered by fast unit tests, including a fuzz test that checks the engine's bookkeeping (money and count) rather than specific hands.
  - The UI is covered by Playwright tests against the **production build**, the same bundle Electron loads.
  - No component-level React tests. Screens are thin wrappers over the engine, so end-to-end tests give better coverage per test.
- **Cost of change:** Low. Vitest can host React Testing Library if component tests become worthwhile.

## Open questions for review

1. **D2:** Keep the app in Personal-Projects, or give it its own repository like FinanceFlow?
2. **D4:** Do you need European no-hole-card or early-surrender rules?
3. **D7:** Do you want index plays for Zen or Omega II? If so, which published set?
4. **D9:** Should the table grade using floor, truncation or rounding?
5. **D10:** Should the bet ramp be user-editable?
6. **D13:** Does the Buster paytable match the casinos you play? Are there other side bets you see often?
7. **D15:** Should the installers be code-signed?

## Environment notes (not design decisions)

- Pushing from the build session was refused (HTTP 403, "Claude doesn't have GitHub access to jrhughes003/Personal-Projects"). The commits were kept locally and bundled so nothing was lost. See the session summary.
