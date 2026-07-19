---
title: HeaderPilot Privacy Policy
---

# HeaderPilot Privacy Policy

**Last updated: July 20, 2026**

HeaderPilot is a browser extension for adding, removing, and modifying HTTP
request and response headers. This policy explains what data the extension
does — and does not — access.

## Summary

HeaderPilot does not collect, transmit, sell, or share any user data. All
extension activity happens locally in your browser.

## Data collection

HeaderPilot does **not** collect any of the following:

- Personally identifiable information (name, email, address, etc.)
- Health information
- Financial or payment information
- Authentication credentials (passwords, tokens, PINs)
- Personal communications (emails, chat messages)
- Location data
- Web browsing history
- User activity (clicks, keystrokes, mouse movement)
- Website content

The extension has no analytics, telemetry, or tracking code of any kind, and
it makes no network requests to any server operated by the developer or any
third party.

## What HeaderPilot stores

HeaderPilot stores only the configuration you create yourself — your header
rules (name, value, target URL scope) and profiles — using the browser's
built-in `chrome.storage.local` API. This data:

- Stays entirely on your device.
- Is never transmitted anywhere, synced to a remote server, or shared with
  any third party, including the developer.
- Is only used to apply the header rules you've defined, via Chrome's
  `declarativeNetRequest` API.
- Is removed if you uninstall the extension.

## Permissions

- **`declarativeNetRequest`** — used to add, modify, and remove headers on
  network requests according to the rules you configure. This is the
  extension's core function.
- **Host permission (`<all_urls>`)** — required because you can scope header
  rules to any site you choose; the extension has no way to know in advance
  which domains you'll want to target. It is not used to read or collect
  page content.
- **`storage`** — used to persist your rules and profiles locally, as
  described above.

## Remote code

HeaderPilot does not execute remote code. All logic ships inside the
extension package; there are no remotely fetched or dynamically evaluated
scripts.

## Changes to this policy

If this policy changes, the "Last updated" date above will be revised and
the new version will be published at this same URL.

## Contact

Questions about this policy can be raised via the project's GitHub
repository: [github.com/arch10/header-pilot](https://github.com/arch10/header-pilot).
