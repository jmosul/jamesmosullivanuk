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
| `src/styles/components.css` | Shared classes: `.site-header`, `.page`, `.card`, `.button`, `.button--quiet`, `.button--plate`, `.toggle`, `.toggle-group`, `.eyebrow`, the monogram. Each rule is written once. |
| `src/styles/home.css` | The homepage: layers, backdrops' motion, panels, hero, caption, and its narrow layout. |
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

Some differences are rules, wording or numbers, not styling: fantasy panels
are drawn from an image (a placeholder until they have one); sci-fi panels
have a symbol and pick an accent from a fixed set; each theme stands its
homepage panels in its own depth slots. These live in `THEME_TRAITS` in
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

Some of the design is different markup, not different styling. Each case is a
`Record<Theme, …>` in one place, every entry taking the same props, so callers
index it by theme and never branch:

| Record | File | Sci-fi | Fantasy |
| --- | --- | --- | --- |
| `BACKDROPS` | `src/home/backdrops.tsx` | Glow, two drifting star fields, a planet's rim | Two watercolour washes, paper grain |
| `PANEL_DRAWINGS` | `src/home/drawings.tsx` | A chamfered tile: number, subtitle, symbol or logo, title | A portrait, or a placeholder figure until it has an image |
| `DIVIDERS` | `src/components/ornaments.tsx` | Squares and a rule | Tapered gold lines and a lozenge |
| `MONOGRAMS` | `src/components/ornaments.tsx` | A hexagon | A wax seal |

Even these keep their colours in CSS: the drawings use classes
(`.monogram-fill`, `.divider-accent`, `.tile`...) styled from tokens, so a
persona accent or palette change never touches them. Only illustrative
colours inside a drawing (star tints, wash pigments) are written in place.

`PANEL_DRAWINGS` also gives each theme's panel size (`box`): tiles are a
fixed 330×440 scaled with the window's height; portraits stand the full
height at the image's proportions (2:3 for a placeholder).

### Persona accents

The admin design lets each theme's accent be picked. When that lands, set
`--color-accent` (and `--color-accent-hover`) as an inline style on `<html>`
from the persona; everything downstream follows.

## The homepage

`/` is `HomePage` (`src/home/`), fed by a `HomePersonaSource`: published
personas from the API as a guest, or `SAMPLE_PERSONAS` (the design's
content) when there's no `amplify_outputs.json`.

```
HomePage                 --progress on .home; wheel, swipe
├─ PersonaLayer ×n       data-theme = persona.theme, cross-faded by data-active
│  └─ BACKDROPS[theme]   panels passed in as children
│     └─ .stage-panel ×n placement shared; PANEL_DRAWINGS[theme].Drawing inside
├─ .hero                 ToggleGroup of personas, name, byline, DIVIDERS[theme], lede, links
└─ PanelCaption          previous / next, and the front panel's name (role=status)
```

- **One layer per persona.** Each carries its own `data-theme`, so its tokens
  are right while it fades out under a page that has already switched.
- **Choosing a persona** sets the theme with `setTheme`, so the toggles are the
  homepage's theme switcher and the choice carries to other pages. The page
  opens on the first persona in the visitor's remembered theme. The header's
  `ThemeSwitcher` is hidden on `/`.
- **The stage** (`stage.ts`, `useStage.ts`) is a long strip of panel indexes,
  shuffled or in order per the persona's `rotation`; `progress` eases along
  it. Placement is shared: each theme only supplies its six depth slots
  (`traits.panelSlots`, wide and narrow) and its drawing.
- **Motion in CSS where it's cheap.** Backdrops are static markup; their drift
  is `sin()`, `cos()` and `mod()` of `--progress` in `home.css`, so they don't
  re-render as the stage turns. Panel placement interpolates between slots,
  which would be contorted in CSS, so it's computed in TypeScript.
- **Panel images.** Fantasy panels without an image show a placeholder figure
  (`traits.panelNeedsImage`); the editor flags them with "Needs image" but
  doesn't block publishing. Image addresses are signed with `getUrl` for an
  hour, and Amplify Storage is only loaded once a panel has an image.
- **Narrow layout.** Phones and portrait windows (`viewportOf` in `stage.ts`,
  mirrored by the media query in `home.css`) use the narrow slots, a two-up
  toggle bar, and a caption bar with the arrows either side.
