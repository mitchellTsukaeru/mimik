# Mimik Privacy Policy

Effective date: 5 August 2026

Mimik is a local-first browser extension for recording browser workflows and creating step-by-step guides. It does not require an account and does not operate a Mimik backend service.

## Data Mimik handles

When you record or edit a guide, Mimik may process:

- page URLs and hostnames;
- page and target-element context, including labels and selected DOM metadata;
- screenshots captured during the workflow;
- typed values used to construct local step descriptions;
- guide titles, step descriptions, manual rich text, imported screenshots, and blur edits;
- extension settings, including an optional AI provider, model, compatible endpoint URL, and API key.

This information may include personal, confidential, or sensitive information visible in the pages you choose to record. You are responsible for confirming that you are permitted to capture and retain that information.

## Local storage

Guides, steps, screenshots, and rich-text content are stored in the extension's IndexedDB database in your browser profile. Settings and optional AI credentials are stored in the extension's browser-local storage.

Mimik does not send this locally stored data to Mimik, Tsukaeru, or an analytics service. Mimik contains no telemetry, advertising SDK, or user-tracking service.

Local extension storage is not a managed backup. Removing the extension, deleting its browser data, or losing the browser profile may permanently remove your guides. Export important guides to a separately managed location.

## Optional Improve Guide requests

Mimik contacts an external service only when you explicitly run **Improve guide** after configuring an AI provider or compatible endpoint.

A text-only request may include step order, stable step identifiers, action types, current plain-text descriptions, safe target labels, and source hostnames. Mimik attempts to exclude typed input values, API credentials, full rich-text JSON, and unrelated DOM content from the prompt.

If you separately enable screenshot analysis for that request, Mimik may send up to eight representative screenshots. The extension uses the currently saved screenshots, including applied blur, and locally downscales them before transmission. Screenshot transmission is off by default and is disclosed again before each request.

The configured API key is sent to the selected provider or compatible endpoint as authentication. AI request data is handled under that provider's policies and your agreement with that provider. If you configure a custom compatible endpoint, its operator receives the request instead. Mimik does not silently route requests to another provider.

## Browser permissions

Mimik requests browser permissions for these purposes:

- website access, tabs, scripting, and navigation events: capture the active workflow, follow supported tab and website transitions, create screenshots, and replay guides;
- storage and unlimited storage: retain guides and screenshots locally without a small extension-storage quota;
- side panel: provide recording controls and the guide library in Chrome.

Mimik does not use these permissions to sell data, create advertising profiles, or monitor browsing when recording and Guide Me are inactive.

## Retention and deletion

Guide data remains in the browser profile until you delete it or browser/extension data is removed. Moving a guide to Trash is reversible. Permanently deleting a guide removes its guide record, steps, and saved screenshots from Mimik's local database.

Data already sent to an AI provider is governed by that provider's retention and deletion terms. Deleting a local guide does not delete a provider's copy of a prior request.

## Data sharing and sale

Mimik does not sell user data. Mimik does not share guide data except through the user-initiated AI request described above or an export the user intentionally creates and distributes.

## Security

Mimik relies on the browser profile's extension-storage protections. API keys are stored locally but are not protected by a separate Mimik password or encryption layer. Use a dedicated, least-privilege API key and avoid storing credentials on shared or unmanaged devices.

## Changes and contact

Material changes to this policy will be published with a new extension release. Questions or privacy concerns may be submitted through the project's issue tracker:

https://github.com/mitchellTsukaeru/mimik/issues
