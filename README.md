# Personal Projects

A collection of my programming projects, from high-school coursework to university design projects and personal tools. Each project lives in its own folder with a README explaining what it does and how to run it.

## Featured

### [FinanceFlow](https://github.com/jrhughes003/financeflow) — Personal Finance Tracker
**React · Vite · Electron · SQLite · Tailwind CSS · Recharts · Anthropic API**

A local-first personal finance app that runs as a desktop app (Electron + SQLite) or in the browser (localStorage) from one codebase. Transaction ledger with CSV import/export, budgets with real rollover, analytics and forecasting, savings goals, investment and debt tracking, and a long-range "Plan Ahead" projection with Canadian tax treatment and Monte Carlo simulation. Optional AI features are opt-in and limited by a per-feature allow-list to the minimum data each one needs.

→ **[Live demo](https://jrhughes003.github.io/financeflow/)** · **[Source](https://github.com/jrhughes003/financeflow)**

### [Blackjack Trainer](games/blackjack-trainer/) — Card Counting & Strategy Trainer
**Electron · React · TypeScript · Vite · Vitest · Playwright · GitHub Actions**

A desktop trainer for blackjack basic strategy, card counting (Hi-Lo, Omega II, Zen) and count-based play. It has strategy drills with charts that follow the table rules, speed-counting drills, and a full table simulation. At the table, a coach grades every bet, insurance call and play, including Illustrious 18 and Fab 4 index plays. It also supports popular casino side bets (21+3, Perfect Pairs, Lucky Ladies, Buster Blackjack), with each bet's exact EV calculated from the cards left in the shoe. Installers for Windows, macOS and Linux are built automatically from version tags.

→ **[README](games/blackjack-trainer/)** · **[Design decisions](games/blackjack-trainer/docs/DECISIONS.md)**

### [Portfolio Website](https://jrhughes003.github.io/Jonny-Hughes/)
**HTML · CSS · JavaScript**

My personal portfolio, hosted on GitHub Pages.

→ **[Visit the site](https://jrhughes003.github.io/Jonny-Hughes/)** · **[Source](https://github.com/jrhughes003/Jonny-Hughes)**

## Projects

| Project | Tech | Description |
| --- | --- | --- |
| [Recycling Robot Controller](robotics/recycling-robot/) | Python | University design project: classifies containers with inductive, photoelectric, and load-cell sensors, then drives a line-following robot to deliver them to the right bin. |
| [Musical Script Analyzer](tools/musical-script-analyzer/) | Python | Parses a musical's script (PDF, text, or `.sbx`) and reports each character's lines by scene and song. |
| [Unity Racing Game](games/unity-racing-game/) | C#, Unity | Gameplay scripts for a racing game: car selection, countdown, AI opponents, lap timing, and camera control. *(High school)* |
| [Blog Platform](web/php-blog/) | PHP, MySQL | Multi-user blog with registration, session-based login, categorized posts, and profile editing. *(High school)* |
| [Dice Game](web/php-dice-game/) | PHP | Yahtzee-style dice game with session-based state. |
| [Experiments](experiments/) | C++ | Small programs: a Monte Carlo birthday-paradox simulation and a C++ class-template demo. |

## Repository layout

```
.
├── web/
│   ├── php-blog/              # PHP + MySQL blog
│   └── php-dice-game/         # PHP dice game
├── games/
│   ├── blackjack-trainer/     # Electron + React card-counting trainer
│   └── unity-racing-game/     # Unity C# scripts
├── robotics/
│   └── recycling-robot/       # Sensor-driven sorting robot
├── tools/
│   └── musical-script-analyzer/  # Script line-count utilities
└── experiments/
    ├── birthday-paradox/      # C++ simulation
    └── cpp-templates/         # C++ template demo
```

## Languages

C++ · C# · Python · TypeScript · JavaScript · PHP · HTML/CSS · SQL
