# Themes

The site has two looks, taken from the homepage design: **sci-fi** (the
Software Engineer persona) and **fantasy** (the Worldbuilder). Sci-fi is the
default.

## How a theme works

A theme is a set of CSS custom properties and nothing else. The current one
is named by `data-theme` on `<html>`; components never branch on the theme in
TypeScript, and only `tokens.css` names a theme.

| File | Holds |
| --- | --- |
| `src/styles/tokens.css` | Every property that differs between themes: colour, fonts, letter case and tracking, shapes (`clip-path` polygons), card borders. Sci-fi is on `:root`; fantasy overrides the same properties under `:root[data-theme='fantasy']`. |
| `src/styles/base.css` | Page basics (body, headings, links, focus ring), from tokens only. |
| `src/styles/components.css` | Shared classes: `.site-header`, `.page`, `.card`, `.button`, `.button--quiet`, `.toggle`, `.toggle-group`, `.eyebrow`. Each rule is written once. |
| `src/styles/amplify.css` | Points Amplify UI's `--amplify-*` variables at our tokens, once, so the Authenticator follows the theme without per-theme rules. |
| `src/styles/amplify-ui.css` | Amplify UI's stylesheet in the `amplify-ui` cascade layer, loaded with the sign-in page. Our rules are unlayered, so they win regardless of load order. |
| `src/theme/themes.ts` | `THEMES`, `DEFAULT_THEME`, `THEME_LABELS` and storage. |
| `src/theme/traits.ts` | `THEME_TRAITS`: per-theme rules and wording that aren't looks (see below). |
| `src/theme/ThemeProvider.tsx` | `ThemeProvider`, `useTheme()` and `useThemeOverride()`. |

Where an Amplify part plays the same role as one of ours, it joins our
selector list rather than getting its own copy, e.g.
`.button, .amplify-button--primary` and
`.card, [data-amplify-authenticator] [data-amplify-router]`.

### Choosing and remembering the theme

- `ThemeProvider` reads `localStorage.theme`, falls back to `scifi` for
  anything missing, unknown or blocked, sets `data-theme` and stores each
  change.
- An inline script in `index.html` applies the stored value before first
  paint, so a fantasy visitor never sees a dark flash. It shares the
  `theme` key with `THEME_STORAGE_KEY`. A bad value there is harmless: sci-fi
  is the `:root` fallback and the provider rewrites it.
- Fonts are all declared up front, but browsers only download a font face
  when text uses it, so a visitor fetches only their theme's fonts.

### Pages that wear a persona's theme

`useThemeOverride(theme)` shows the page in that theme while the calling
component is mounted and restores the visitor's own theme afterwards, without
storing anything. The persona editor uses it with the draft's theme, so the
whole admin UI switches as the theme toggle is changed. `ThemeSwitcher` hides
itself while an override is active.

### Traits: differences that aren't looks

Some differences are rules or wording, not styling: fantasy panels are left
off the homepage without an image; sci-fi panels have a symbol and pick an
accent from a fixed set. These live in `THEME_TRAITS` in
`src/theme/traits.ts`, a `Record<Theme, ThemeTraits>`. Components ask
`traits.panelNeedsImage` or `traits.panelAccents.length > 0`, never
`theme === 'fantasy'`, so a new theme is a compile error until its traits
are filled in, and no component needs touching.

The order of preference is tokens, then traits, then a per-theme component
(below). CSS is preferred, but not at the cost of contorted markup or CSS.

### Adding a theme

1. Add a block to `tokens.css` that sets every property `:root` does.
2. Add its name to `THEMES` and a label to `THEME_LABELS`.
3. Add its entry to `THEME_TRAITS`.
4. Import its fonts in `src/main.tsx`.

Nothing else should change. If a component needs a new difference, add a
token for it rather than a `[data-theme]` selector in a component file.

## What CSS can't carry

Some of the design is different markup, not different styling:

- **Backdrops.** Sci-fi has a star field and a planet; fantasy has watercolour
  washes and paper grain. Plan: one `ThemeBackdrop` component in
  `src/theme/` that picks its SVG with `useTheme()`. It's the only place,
  with the panels below, that switches on the theme in TypeScript.
- **Panels.** Sci-fi draws tiles (symbol or icon); fantasy draws portraits.
  The panel data is the same (`Panel` in `amplify/data/resource.ts`); a
  `PersonaPanel` component picks the drawing. Placement, depth and motion
  stay shared, with per-theme numbers (slots) passed as data.
- **Persona accents.** The admin design lets each theme's accent be picked.
  When that lands, set `--color-accent` (and `--color-accent-hover`) as an
  inline style on `<html>` from the persona; everything downstream follows.

## The homepage and personas

On the homepage each persona has a `theme`, and choosing a persona toggle
should call `setTheme(persona.theme)`, so the persona toggles become the
homepage's theme switcher and the choice carries to other pages. The
header's `ThemeSwitcher` is there to prove the mechanism on `/signin`; drop
it from pages that have persona toggles.
