# Changelog

All notable changes to Blackjack Trainer. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-09-29

### Added

- **Strategy drill:**
  - rule-aware basic-strategy charts;
  - hard, soft, pairs and mixed focus modes;
  - a count-deviation mode for the Illustrious 18 and Fab 4.
- **Counting drills** for Hi-Lo, Omega II and Zen: card flash with review, timed deck countdown with a hidden card, and true-count conversion.
- **Table simulation:**
  - cut card and penetration;
  - splits, resplitting aces, doubling rules, late surrender, insurance and even money;
  - a coach that grades bets, insurance, plays and side bets;
  - periodic running-count checks.
- **Side bets:** 21+3, Perfect Pairs, Lucky Ladies and Buster Blackjack, with built-in and custom paytables. Each bet's exact EV is calculated from the cards left in the shoe.
- **Casino rule options:** 4/6/8 decks, H17/S17, 3:2 or 6:5, doubling on any two, 9–11 or 10–11, DAS, late surrender, resplitting aces, maximum hands and penetration.
- **Bet spreads:** 1–4, 1–8 and 1–12 units.
- **Reference screen:** charts, count-system tags, bet ramp, index table and side-bet house edges.
- **Progress screen:** accuracy tiles, a 14-day trend, most-missed situations and a counting log.
- **Backup and restore** of settings and progress as a JSON file.
- **Packaging:** Windows (NSIS), macOS (DMG, x64 and arm64) and Linux (AppImage, .deb) installers, with an app icon.
- **CI:** typecheck, lint, format check, unit and end-to-end tests, installers built automatically on version tags, and an optional GitHub Pages deploy.

### Security

- Sandboxed renderer with no Node access, a strict Content Security Policy with no network access, blocked navigation and a single-instance lock.
