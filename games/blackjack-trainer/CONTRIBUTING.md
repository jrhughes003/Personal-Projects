# Contributing

## Workflow

1. Create a branch off `main`.
2. Run `npm install`, then `npm run electron:dev` (or `npm run dev` for the browser).
3. Make your change. Run `npm run check` (typecheck, lint, format check, unit tests), plus `npm run test:e2e` if you touched the UI.
4. Open a pull request. CI runs the same checks and the Playwright suite.

## Where things go

- **Game logic** goes in `src/engine/` as plain TypeScript with no React or DOM. Put a test next to the file (`foo.ts` → `foo.test.ts`). Anything that changes a strategy cell, an index or a payout needs a test that names the expected value.
- **Screens** go in `src/modes/`. Keep them thin: compute with the engine and render the result.
- **Persistence** goes in `src/store/`. If you add a field to `Settings` or `Stats`, give it a default in `DEFAULT_SETTINGS` or `EMPTY_STATS`; `normalizeSettings` and `normalizeStats` fill it in for older saves. Bump `STATS_VERSION` if the meaning of existing data changes.
- **Decisions:** anything with a trade-off gets an entry in `docs/DECISIONS.md`.

## Style

- Prettier formats everything (`npm run format`). ESLint must pass with no warnings.
- Comments explain _why_, not _what_.
- Blackjack terms follow the usual shorthand: `tc` is true count, `rc` is running count, `up` is the dealer's upcard value (2–11, where 11 is an ace).

## Releasing

Follow the steps in the README under **Building and releasing**: bump the version, update the changelog, then push a `blackjack-trainer-vX.Y.Z` tag.
