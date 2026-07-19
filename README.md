<img src="public/icons/icon-128.png" alt="HeaderPilot logo" width="64" height="64" />

# HeaderPilot

A ModHeader-style Chrome extension (Manifest V3) for adding, removing, and
modifying request and response headers, with a global on/off switch,
per-header enable checkboxes, URL scoping (all URLs or regex patterns), and
switchable profiles.

## Development

```sh
npm install
npm run dev
```

`npm run dev` builds into `dist/` with HMR for the popup. Load `dist/` as an
unpacked extension in `chrome://extensions` (enable Developer mode first).

## Build

```sh
npm run build
```

Outputs a production build to `dist/`, ready to load unpacked or zip for the
Chrome Web Store.

## Architecture

- **State**: `chrome.storage.local` (single `appState` key) is the source of
  truth. See `src/types.ts` and `src/storage.ts`.
- **Header engine**: `src/background/syncRules.ts` translates enabled rules
  in the active profile into `chrome.declarativeNetRequest` dynamic rules
  whenever storage changes (`src/background/index.ts`).
- **UI**: `src/popup/` — a React popup that reads/writes `chrome.storage.local`
  directly; it never calls the DNR API except for regex validation.

## Testing

See the manual test checklist in the implementation plan for phases 3–5:
request/response header set/append/remove, per-rule and global toggles,
regex scoping, profile CRUD, and persistence across restarts.
