# AGENTS.md

Guidance for AI coding agents working in this repo.

## What this is

HeaderPilot is a ModHeader-style Chrome extension (Manifest V3, Vite +
`@crxjs/vite-plugin` + React/TypeScript) that adds, removes, and modifies
request/response headers via `chrome.declarativeNetRequest`. Global on/off
switch, per-rule enable checkboxes, URL scoping (all URLs or RE2 regex),
and switchable profiles.

## Commands

```sh
npm install         # install deps
npm run dev          # vite dev build into dist/, with HMR for the popup
npm run build         # tsc -b && vite build -> dist/
npm run lint          # biome lint .
npm run format         # biome format --write .
npm run check          # biome check --write . (lint + format + import sort)
```

Always run `npm run build` and `npm run lint` (or `npm run check`) before
considering a change done. There is no automated test suite — verification
is manual/functional (see below).

Load `dist/` as an unpacked extension via `chrome://extensions` (Developer
mode) to actually exercise a change.

## Architecture

- **State**: `chrome.storage.local`, single `appState` key, is the *only*
  source of truth. Shape is defined in `src/types.ts`; `src/storage.ts`
  provides `getState`/`setState`/`replaceState`/`subscribe`. Never keep
  state in module-level variables in the background service worker — MV3
  service workers are ephemeral and get killed/restarted between events, so
  every handler must re-read storage fresh.
- **Header engine** (`src/background/syncRules.ts` + `index.ts`): computes
  the effective enabled rules from the active profile and does a full
  remove-and-readd of `declarativeNetRequest` dynamic rules on every
  storage change. This is intentional (not a diff) — simplicity over
  micro-optimizing rule churn. `dnrRuleMap`/`nextDnrRuleId` in `AppState`
  track which DNR rule IDs belong to which app-level rule, persisted so
  cleanup survives worker restarts.
  - The background's `storage.onChanged` listener compares an old/new
    "rules signature" (globalEnabled + activeProfileId + profiles) to
    avoid re-syncing when only `dnrRuleMap`/`nextDnrRuleId`/`lastSyncError`
    changed (i.e. its own write echoing back). Don't remove this guard
    without understanding it — removing it reintroduces an infinite
    resync loop.
  - Patterns/rules with an empty value are filtered out before building
    DNR rules rather than synced and left to error, so half-filled-in UI
    state doesn't surface a scary error banner.
- **Popup** (`src/popup/`): React UI that reads/writes `chrome.storage.local`
  directly through `useAppState()` (`src/popup/hooks/useAppState.ts`) and
  pure state-transform helpers in `src/popup/stateOps.ts`. The popup never
  calls the DNR API directly, except `chrome.declarativeNetRequest.isRegexSupported`
  for inline regex validation before save. Only the *active* profile's
  rules are ever applied — editing an inactive profile must have zero
  network effect.
- **Styling**: single `src/popup/popup.css`, CSS custom properties for
  theming (light via `:root`, dark via `@media (prefers-color-scheme: dark)`).
  Solid blue accent (no gradients). Entrance animations
  (`@keyframes fade-slide-in`, `pulse`) are gated behind
  `@media (prefers-reduced-motion: no-preference)`; small button/toggle
  press-scale feedback is not gated (considered non-disorienting).

## Conventions

- Formatting/linting is Biome (`biome.json`), not ESLint/Prettier/oxlint.
  2-space indent, single quotes, semicolons, organize-imports on save.
- No comments explaining *what* code does; only for non-obvious *why*
  (see existing files for the level of terseness expected).
- Icons: `react-icons` (mainly `react-icons/fi`; the logo uses
  `react-icons/fa`'s `FaRocket`). Don't introduce a second icon library.
- Don't add a testing framework, ESLint, Prettier, or state-management
  library unless explicitly asked — this project deliberately has none.

## Verifying changes

Since there's no automated test suite, verify UI/behavior changes by
actually driving the built extension:

1. `npm run build`
2. Load `dist/` unpacked in a Chromium-based browser (or via Playwright
   with `chromium.launchPersistentContext(userDataDir, { args: [
   '--disable-extensions-except=<dist>', '--load-extension=<dist>',
   '--headless=new' ] })` — the pre-installed browser at
   `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` works for this
   in sandboxed/headless environments).
2. For header-injection changes, hit a real HTTP request (a small local
   `http.createServer` works well when outbound internet isn't available)
   and confirm the header actually appears/disappears — checking
   `chrome.declarativeNetRequest.getDynamicRules()` in the service worker
   alone is not sufficient proof it reaches real requests.
3. Check both the popup page and the service worker for console errors.
4. Check both light and dark color schemes for UI changes
   (`colorScheme: 'light' | 'dark'` in Playwright, or the OS setting).

Clean up any scratch scripts/screenshots/`dist/` before committing.
