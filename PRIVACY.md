# Privacy Policy

_Last updated: 2026-04-21_

Mimik is a browser extension that lets you record browser workflows and generate step-by-step guides. This policy explains what happens to your data when you use it.

## Summary

**Mimik does not collect, transmit, or store any of your data on servers we control.** There is no backend, no account system, no analytics, and no telemetry. Everything you record stays on your device.

## What Mimik Stores Locally

While you use Mimik, the following is stored inside your browser via IndexedDB:

- Guides you create (titles, step descriptions, metadata)
- Screenshots captured during recording
- DOM replay data for the "Guide Me" feature
- Your extension settings (language preference, AI configuration, blur preferences)
- Your AI API key, if you configure one (see below)

This data never leaves your device. You can delete any guide, clear all data by uninstalling the extension, or clear browser storage manually at any time.

## Optional AI Features

Mimik offers an optional AI feature to generate human-readable step descriptions and guide titles. Using it requires you to provide your own API key from OpenAI or Anthropic.

When you enable this feature:

- Your API key is stored locally in your browser. Mimik never reads, transmits, or relays it to us.
- Mimik sends a small amount of DOM context (~50–100 tokens of page structure — no screenshots) directly from your browser to the AI provider you selected (OpenAI or Anthropic), using your API key.
- The AI provider's own privacy policy governs how they handle those requests. See:
  - OpenAI: https://openai.com/policies/privacy-policy
  - Anthropic: https://www.anthropic.com/legal/privacy

If you do not enable AI features, no network requests are made beyond what the browser itself does.

## What Mimik Does Not Do

- Mimik does not have a backend server. There is no account to create, no login, no cloud sync.
- Mimik does not collect analytics, telemetry, crash reports, usage statistics, or any other identifying data.
- Mimik does not sell, rent, or share your data with third parties.
- Mimik does not use your data for advertising or profiling.
- Mimik does not read or transmit data from pages you visit unless you have explicitly started a recording session.

## Permissions Explained

Mimik requests the following browser permissions:

- `storage`, `unlimitedStorage`: store guides and screenshots locally in IndexedDB.
- `activeTab`, `tabs`: capture screenshots of the tab you are currently recording and follow tab switches during a session.
- `scripting`: inject the recording content script into the active tab when you start recording.
- `webNavigation`: detect single-page app route changes so guides capture navigations correctly.
- `sidePanel`: display the Mimik user interface in Chrome's side panel.
- `<all_urls>` host permission: recording can run on whatever website you are documenting. This permission is only exercised while a recording session is active.

## Open Source

Mimik is open source under the MIT license. You can inspect the full source code, including every network request and storage operation, at:

https://github.com/westpoint-io/mimik

## Changes to This Policy

If this policy ever changes, the updated version will appear in this file with a new "Last updated" date. Because Mimik has no way to reach you (no account, no email list), you are encouraged to review the policy at install time and after major updates.

## Contact

Questions about this policy or the extension? Open an issue at:

https://github.com/westpoint-io/mimik/issues
