# Conventions

## Code style

- **No one-line `if`s.** Always use braces and put the body on its own lines. Ternaries are fine.

  ```ts
  // Not allowed
  if (this) that = 1

  // Allowed
  if (this) {
    that = 1
  }
  const that = this ? 1 : 2
  ```

  `npm run lint` enforces this (Oxlint's `curly` rule, set in `.oxlintrc.json`).

- **Leave a blank line above blocks and returns.** An `if`, `for`, `while`, `try` or `switch` block, a `throw` and a `return` each get a blank line before them. The exceptions are when it's the first statement in its block, or when it's the only statement of a one-line function (`const double = (n: number) => n * 2`). Oxlint has no rule for this yet, so it isn't linted; follow it by hand and in review.

## Checks

Before pushing, run `npm run lint`, `npm test` and `npm run build`.

`npm test` runs two Vitest projects: `jsdom` for `*.test.ts(x)`, and `browser` for `*.browser.test.ts`, which runs in headless Chromium through Playwright. Use a browser test only for what jsdom can't do (canvas encoding, `createImageBitmap`). Playwright needs a Chromium: run `npx playwright install chromium` once, or point `CHROMIUM_EXECUTABLE_PATH` at an existing build (in Claude's cloud sessions, `/opt/pw-browsers/chromium`).

## Themes

The aim is as little per-theme repetition as possible. Push every difference as far down this list as it will go, and only move up when the layer below genuinely can't express it. CSS is the preferred home, but don't contort markup or CSS to keep something out of TypeScript. Full detail in [docs/Themes.md](docs/Themes.md).

1. **Tokens (`src/styles/tokens.css`).** Colour, fonts, case, tracking, shapes (`clip-path`), borders. Only this file names a theme. Component CSS is written once against tokens; if a component needs a new difference, add a token, never a `[data-theme]` selector elsewhere.
2. **Traits (`src/theme/traits.ts`).** Differences in rules, wording or numbers rather than looks, e.g. "fantasy panels are drawn from an image", "sci-fi panels have a symbol and accent", each theme's homepage panel slots. Components read `THEME_TRAITS[theme].someTrait`, never `theme === 'fantasy'`. It's a `Record<Theme, ThemeTraits>`, so a new theme doesn't compile until its traits are filled in.
3. **Per-theme components.** Only where the markup itself differs: `BACKDROPS`, `PANEL_DRAWINGS`, `DIVIDERS`, `MONOGRAMS`. Pick from a `Record<Theme, Component>` in one place, with shared props, so callers never branch. Even these take their colours from tokens through CSS classes.

Never write `theme === 'fantasy'`, and never put a `[data-theme]` selector outside `tokens.css`. If something can't be said with the layers above, say why in review before adding a new mechanism.

The page's theme is `data-theme` on `<html>`, set by `ThemeProvider`. A page showing a specific persona calls `useThemeOverride(persona.theme)` to wear that persona's theme without changing the visitor's stored choice. An element can also carry its own `data-theme` (e.g. persona cards on the list) to show a theme inside a page of another.

## Images

Panel images are rendered in the browser, uploaded under immutable keys and cleaned up only after the record stops pointing at them. Keys, access rules, renditions, cleanup and accepted orphans are in [docs/Images.md](docs/Images.md).
