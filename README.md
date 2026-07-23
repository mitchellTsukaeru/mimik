<div align="center"><a name="readme-top"></a>

<img src="public/mascot.svg" width="140" height="140" alt="Mimik mascot" />

# Mimik for Tsukaeru

**English** · [Español](./README.es.md) · [Português (BR)](./README.pt-BR.md) · [Français](./README.fr.md)

**Auto-capture any browser workflow into a step-by-step guide. No account, no cloud, no tracking.**

Click record, do the thing, get a polished guide with annotated screenshots. Edit, replay, or export.

This repository is Tsukaeru's fork of [Westpoint's Mimik](https://github.com/westpoint-io/mimik), kept local-first and open source while adding Japanese AI output, current model presets, custom model IDs, and workflow reliability improvements.

<!-- SHIELD GROUP -->

[![License][license-shield]][license-link]
[![Manifest V3][mv3-shield]][mv3-link]
[![100% Local][local-shield]][local-link]
[![No Account][no-account-shield]][no-account-link]
<br/>
[![Stars][star-shield]][star-link]
[![Contributors][contributors-shield]][contributors-link]
![Last Commit][last-commit-shield]
[![Issues][issues-shield]][issues-link]

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [📺 Demo](#-demo)
- [👋 Getting Started](#-getting-started)
- [✨ Features](#-features)
  - [🎬 Auto-capture](#-auto-capture)
  - [📸 Annotated screenshots](#-annotated-screenshots)
  - [🔒 Smart Blur](#-smart-blur)
  - [🧠 AI descriptions (optional)](#-ai-descriptions-optional)
  - [▶️ Guide Me replay](#️-guide-me-replay)
  - [📤 Multi-format export](#-multi-format-export)
  - [🌍 Multi-language](#-multi-language)
  - [💾 100% local storage](#-100-local-storage)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

<br/>

</details>

## 📺 Demo

<div align="center">
<img src="https://github.com/user-attachments/assets/d4c64cb8-ad26-4de1-af02-a04a64e2836e" alt="Mimik demo" width="800" />
</div>

## 👋 Getting Started

Mimik turns any repetitive browser task into a documented, shareable guide in seconds. It runs entirely in your browser with no backend, account, or telemetry. Workflow data stays on your device unless you enable optional AI, which sends only lightweight text context directly to your chosen provider.

Whether you're documenting internal tools, writing product tutorials, or onboarding a teammate, Mimik captures every click, keystroke, and navigation automatically so you can focus on the work.

| Browser | Upstream version | Install upstream release |
| ------- | ---------------- | ------------------------ |
| Chrome  | [![Chrome Version][chrome-version-shield]][chrome-link]   | [Chrome Web Store][chrome-link] |
| Firefox | [![Firefox Version][firefox-version-shield]][firefox-link] | [Firefox Add-ons][firefox-link]  |

> [!NOTE]
>
> The store listings are maintained by the upstream project and may not yet include the fork-specific features documented here. To run this repository's current version, follow the local development or build instructions in [CONTRIBUTING.md](./CONTRIBUTING.md).

> \[!IMPORTANT]
>
> **⭐️ Star the repo** if Mimik saves you time. It helps other people discover it!

<a href="https://github.com/mitchellTsukaeru/mimik">
  <img width="100%" alt="Star Mimik on GitHub" src="https://github.com/user-attachments/assets/80d304da-a765-4bde-bf49-b1bdcb4fe804" />
</a>

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## ✨ Features

### 🎬 Auto-capture

Click, type, navigate. Mimik watches it all. Every meaningful action becomes a step: clicks on buttons and links, form inputs, keyboard shortcuts, clipboard actions, drag events, and page navigations.

Smart event merging deduplicates rapid clicks on nearby elements, so your guides stay clean. Click interception fires *before* the page navigates away, so nothing gets lost during SPAs or full page loads.

Start or stop recording from anywhere with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>, or <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> on macOS.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 📸 Annotated screenshots

Every step gets a screenshot with the clicked element highlighted and zoomed in. No manual cropping, no annotation tools to learn. Mimik figures out the important part of the page and frames it for you.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🔒 Smart Blur

Mimik automatically detects and blurs sensitive data in your screenshots: emails, phone numbers, SSNs, credit cards, IP addresses, MAC addresses. Toggle each category independently.

Need to blur something custom? The manual blur picker lets you select any DOM element and mask it across every screenshot where it appears.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🧠 AI descriptions (optional)

Bring your own API key (OpenAI or Anthropic) and Mimik generates human-readable step descriptions like *"Click the **Submit** button to save changes"* instead of `Click button "Submit"`. Presets include GPT-5.6 Luna, Terra, and Sol, plus Claude Haiku 4.5, Sonnet 5, Opus 4.8, and Fable 5. You can also enter any model ID supported by your selected provider.

Descriptions and guide titles are generated from lightweight text context, not screenshots. This is substantially cheaper than sending every screenshot to a vision model. Output can be generated in English, Spanish, Brazilian Portuguese, French, or Japanese.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### ▶️ Guide Me replay

Replay any guide live on a real page. Mimik highlights the next element to click, tracks your progress step by step, and advances automatically as you interact. Perfect for onboarding teammates or walking through a process yourself.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 📤 Multi-format export

Share guides in whatever format fits your workflow:

- **HTML**: self-contained, share anywhere, base64-embedded images
- **PDF**: print-ready, A4 portrait with auto page breaks and annotated screenshots
- **Markdown**: paste into Notion, GitHub, internal docs, wikis

All exports are generated client-side. Nothing touches a server.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🌍 Multi-language

The interface is available in English, Spanish, Brazilian Portuguese, and French. AI output language is configured independently and also supports Japanese, so you can run Mimik in English while generating Japanese guides.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 💾 100% local storage

Guides, steps, and screenshots live on your device. There's no backend, no account, no telemetry. Your API key is stored locally and sent only to the AI provider you chose; Mimik has no server that receives it.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

Contributions of all kinds are welcome: bug reports, feature requests, PRs, and translations.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, project layout, and contributor guidelines.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## 📜 License

Based on Mimik, MIT © [Westpoint](https://github.com/westpoint-io), with modifications maintained by Tsukaeru. See [LICENSE](./LICENSE) for details.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-1E1B4B?style=flat-square

[license-shield]: https://img.shields.io/badge/license-MIT-4F46E5?style=flat-square&labelColor=1E1B4B
[license-link]: ./LICENSE

[mv3-shield]: https://img.shields.io/badge/manifest-v3-3730A3?style=flat-square&labelColor=1E1B4B
[mv3-link]: https://developer.chrome.com/docs/extensions/mv3/intro/

[local-shield]: https://img.shields.io/badge/storage-100%25%20local-4F46E5?style=flat-square&labelColor=1E1B4B
[local-link]: #-100-local-storage

[no-account-shield]: https://img.shields.io/badge/account-not%20required-4F46E5?style=flat-square&labelColor=1E1B4B
[no-account-link]: #-100-local-storage

[star-shield]: https://img.shields.io/github/stars/mitchellTsukaeru/mimik?style=flat-square&label=stars&color=4F46E5&labelColor=1E1B4B
[star-link]: https://github.com/mitchellTsukaeru/mimik/stargazers

[contributors-shield]: https://img.shields.io/github/contributors/mitchellTsukaeru/mimik?style=flat-square&labelColor=1E1B4B
[contributors-link]: https://github.com/mitchellTsukaeru/mimik/graphs/contributors

[last-commit-shield]: https://img.shields.io/github/last-commit/mitchellTsukaeru/mimik?style=flat-square&label=commit&labelColor=1E1B4B

[issues-shield]: https://img.shields.io/github/issues/mitchellTsukaeru/mimik?style=flat-square&labelColor=1E1B4B
[issues-link]: https://github.com/mitchellTsukaeru/mimik/issues

[chrome-version-shield]: https://img.shields.io/chrome-web-store/v/jmfohdaflahliammccpiadmkcibohgha?label=Chrome%20Version&style=flat-square&logo=googlechrome&logoColor=C7D2FE&color=4F46E5&labelColor=1E1B4B
[chrome-link]: https://chromewebstore.google.com/detail/mimik/jmfohdaflahliammccpiadmkcibohgha
[firefox-version-shield]: https://img.shields.io/amo/v/mimik?label=Firefox%20Version&style=flat-square&logo=firefoxbrowser&logoColor=C7D2FE&color=4F46E5&labelColor=1E1B4B
[firefox-link]: https://addons.mozilla.org/en-US/firefox/addon/mimik/
