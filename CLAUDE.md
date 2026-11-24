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
