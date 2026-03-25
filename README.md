<p align="center">
  <img src="public/mascot.svg" width="120" height="120" alt="Mimik mascot" />
</p>

<h1 align="center">Mimik</h1>

<p align="center">
  <strong>Auto-capture browser workflows into step-by-step guides — no account needed.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F59E0B?style=flat-square" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/chrome-extension-451a03?style=flat-square&logo=googlechrome&logoColor=FDE68A" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/manifest-v3-D97706?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/storage-100%25%20local-78350F?style=flat-square" alt="100% Local" />
  <img src="https://img.shields.io/badge/sign%20up-not%20required-92400E?style=flat-square" alt="No Account Required" />
</p>

---

## Features

- **Auto-capture** — Records clicks, inputs, keyboard shortcuts, clipboard actions, and drag events as you browse
- **Annotated screenshots** — Every step gets a zoomed, highlighted screenshot focused on the element you interacted with
- **Smart event merging** — Deduplicates rapid clicks on nearby elements so your guides stay clean
- **Click interception** — Captures the step before the page navigates away, so nothing gets lost
- **Side panel** — Quick-access capture controls and guide review without leaving your current tab
- **Full dashboard** — Manage all your guides in a dedicated full-page view with search, star, and trash
- **Export** — Copy or download guides for sharing
- **100% local** — Everything stored in IndexedDB on your device. Zero cloud. Zero sign-up. Zero tracking.

## Screenshots

> Coming soon — side panel and full dashboard screenshots

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | [WXT](https://wxt.dev) (Web Extension Tools) |
| UI | React 19 + Tailwind CSS |
| Storage | [Dexie.js](https://dexie.org) (IndexedDB wrapper) |
| State | [XState](https://xstate.js.org) (capture lifecycle) |
| Language | TypeScript |
| Extension | Chrome Manifest V3 |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/westpoint-io/mimik.git
cd mimik

# Install dependencies
npm install

# Build the extension
npx wxt build

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the .output/chrome-mv3 folder
```

## Project Structure

```
mimik/
├── entrypoints/
│   ├── background.ts          # Service worker: message routing, capture queue
│   ├── content.ts             # Content script: event listeners, highlight overlay
│   ├── sidepanel/             # Side panel entrypoint
│   ├── fullview/              # Full dashboard entrypoint
│   └── options/               # Options page entrypoint
├── src/
│   ├── background/
│   │   ├── machine.ts         # XState capture state machine
│   │   ├── screenshot.ts      # Tab screenshot capture
│   │   └── step-description.ts # Auto-generate step descriptions
│   ├── content/
│   │   ├── events.ts          # Click, input, keyboard, clipboard, drag capture
│   │   ├── element-meta.ts    # Extract element metadata (selector, aria, rect)
│   │   └── spa-nav.ts         # SPA navigation detection
│   ├── sidepanel/
│   │   ├── App.tsx            # Home screen with Sunflower Bright design
│   │   ├── RecordingView.tsx  # Live recording step feed
│   │   ├── GuideEditor.tsx    # Guide review and editing
│   │   ├── StepCard.tsx       # Step display with screenshot
│   │   └── ZoomScreenshot.tsx # Cropped screenshot with highlight
│   ├── fullview/
│   │   ├── App.tsx            # Dashboard shell with full-bleed header
│   │   ├── TopNav.tsx         # Amber gradient navigation bar
│   │   ├── LibraryContent.tsx # Guide list/grid with search and filters
│   │   ├── GuideContent.tsx   # Guide viewer with step cards
│   │   └── GuideOutline.tsx   # Step outline sidebar panel
│   └── shared/
│       ├── db-schema.ts       # Dexie database schema and migrations
│       ├── guide-service.ts   # CRUD operations for guides, steps, screenshots
│       └── types.ts           # TypeScript interfaces
└── public/
    └── mascot.svg             # Mimik chest mascot
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
