# Changelog

All notable changes to this project are documented here.

## 1.1.0 - 2026-08-05

### Added

- Pause and resume recording across websites while preserving step order and source URLs.
- Active-tab capture handoff with stale-event protection and unsupported-page handling.
- Manual steps containing rich text, imported screenshots, or both.
- Rich-text editing with paragraphs, emphasis, safe links, lists, inline code, and undo/redo.
- Rich-text rendering in guide views and HTML, Markdown, and PDF exports.
- Explicit Improve Guide workflow with reviewable AI title and description proposals.
- Optional, consent-based multimodal analysis using up to eight representative screenshots.
- Full Mimik dashboard navigation from the side panel.

### Changed

- Branded the employee release as Mimik for Tsukaeru while retaining the `mimik` repository and package name.
- Removed AI calls from live recording and automatic title generation.
- Replaced automatic AI titles with deterministic local titles.
- Moved optional AI configuration out of first-run onboarding.
- Updated documentation for local-first storage, AI disclosure, and current fork features.

### Fixed

- Prevented duplicate input capture sessions and delayed post-click screenshots.
- Preserved recording state more reliably across service-worker restarts and tab changes.
