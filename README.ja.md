<div align="center"><a name="readme-top"></a>

<img src="public/mascot.svg" width="140" height="140" alt="Mimik マスコット" />

# Mimik for Tsukaeru

[English](./README.md) · [Español](./README.es.md) · [Português (BR)](./README.pt-BR.md) · [Français](./README.fr.md) · **日本語**

**ブラウザ上のあらゆる操作を自動で記録し、ステップ形式のガイドに変換します。アカウント、クラウド、トラッキングは不要です。**

記録を開始して、いつもの操作を行うだけ。注釈付きスクリーンショットを含む分かりやすいガイドを自動生成し、編集、再生、エクスポートできます。

このリポジトリは [Westpoint の Mimik](https://github.com/westpoint-io/mimik) をベースとした Tsukaeru のフォークです。ローカルファーストかつオープンソースという特長を維持しながら、日本語の AI 出力、最新のモデルプリセット、カスタムモデル ID、ワークフロー記録の信頼性向上を追加しています。

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
<summary><kbd>目次</kbd></summary>

#### TOC

- [📺 デモ](#-デモ)
- [👋 はじめに](#-はじめに)
- [✨ 機能](#-機能)
  - [🎬 自動キャプチャ](#-自動キャプチャ)
  - [📸 注釈付きスクリーンショット](#-注釈付きスクリーンショット)
  - [🔒 スマートぼかし](#-スマートぼかし)
  - [🧠 AI による説明文（オプション）](#-ai-による説明文オプション)
  - [▶️ Guide Me リプレイ](#️-guide-me-リプレイ)
  - [📤 複数形式でのエクスポート](#-複数形式でのエクスポート)
  - [🌍 多言語対応](#-多言語対応)
  - [💾 100% ローカルストレージ](#-100-ローカルストレージ)
- [🤝 コントリビューション](#-コントリビューション)
- [📜 ライセンス](#-ライセンス)

<br/>

</details>

## 📺 デモ

<div align="center">
<img src="https://github.com/user-attachments/assets/d4c64cb8-ad26-4de1-af02-a04a64e2836e" alt="Mimik デモ" width="800" />
</div>

## 👋 はじめに

Mimik は、ブラウザ上の繰り返し作業を、わずか数秒で共有可能な手順書に変換します。バックエンド、アカウント、テレメトリはなく、すべてブラウザ内で動作します。オプションの AI 機能を有効にしない限り、ワークフローデータが端末外に送信されることはありません。AI を有効にした場合も、軽量なテキストコンテキストのみが選択したプロバイダーへ直接送信されます。

社内ツールの操作手順、製品チュートリアル、新メンバー向けのオンボーディング資料など、用途を問わず、クリック、キー入力、画面遷移を Mimik が自動で記録します。そのため、ドキュメント作成ではなく、本来の作業に集中できます。

| ブラウザ | アップストリーム版 | アップストリーム版をインストール |
| -------- | ------------------ | -------------------------------- |
| Chrome   | [![Chrome Version][chrome-version-shield]][chrome-link]   | [Chrome ウェブストア][chrome-link] |
| Firefox  | [![Firefox Version][firefox-version-shield]][firefox-link] | [Firefox Add-ons][firefox-link]    |

> [!NOTE]
>
> ストア掲載版はアップストリームプロジェクトによって管理されているため、このリポジトリで説明しているフォーク固有の機能がまだ含まれていない場合があります。このリポジトリの最新版を実行するには、[CONTRIBUTING.md](./CONTRIBUTING.md) のローカル開発またはビルド手順を参照してください。

> \[!IMPORTANT]
>
> Mimik が役に立ったら、ぜひ **⭐️ リポジトリに Star** をお願いします。より多くの方に知ってもらう助けになります。

<a href="https://github.com/mitchellTsukaeru/mimik">
  <img width="100%" alt="GitHub で Mimik に Star を付ける" src="https://github.com/user-attachments/assets/80d304da-a765-4bde-bf49-b1bdcb4fe804" />
</a>

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## ✨ 機能

### 🎬 自動キャプチャ

クリック、入力、画面遷移を Mimik が自動で記録します。ボタンやリンクのクリック、フォーム入力、キーボードショートカット、クリップボード操作、ドラッグ操作、ページ遷移など、意味のある操作がそれぞれ手順として追加されます。

スマートなイベント統合により、近接する要素への連続クリックを重複としてまとめ、ガイドを読みやすく保ちます。クリックイベントはページ遷移の前に取得されるため、SPA や通常のページ読み込みでも操作を取りこぼしません。

どの画面からでも <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>、macOS では <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> を押して記録を開始または停止できます。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 📸 注釈付きスクリーンショット

各手順には、クリックした要素を強調して拡大表示したスクリーンショットが追加されます。手動で切り抜いたり、注釈ツールを操作したりする必要はありません。Mimik が重要な箇所を判定し、見やすく表示します。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🔒 スマートぼかし

Mimik は、メールアドレス、電話番号、米国社会保障番号（SSN）、クレジットカード番号、IP アドレス、MAC アドレスなどの機密情報をスクリーンショットから自動検出し、ぼかします。各カテゴリーは個別に有効または無効にできます。

任意の箇所を隠したい場合は、手動ぼかしピッカーで DOM 要素を選択できます。その要素が表示されるすべてのスクリーンショットで同じ箇所がマスクされます。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🧠 AI による説明文（オプション）

OpenAI または Anthropic の API キーを設定すると、`Click button "Submit"` のような機械的な表現ではなく、「変更内容を保存するには **送信** ボタンをクリックします」のような自然な手順説明を生成できます。プリセットには GPT-5.6 Luna、Terra、Sol、および Claude Haiku 4.5、Sonnet 5、Opus 4.8、Fable 5 が含まれます。選択したプロバイダーが対応する任意のモデル ID も指定できます。

より低価格なゲートウェイ、ホスティングサービス、ローカル推論を利用する場合は、互換 API のベース URL と、そのエンドポイントが公開している正確なモデル ID を指定できます。OpenAI 互換エンドポイントでは Chat Completions、Anthropic 互換エンドポイントでは Messages API を使用します。公式プロバイダーを使用する場合は URL を空欄にしてください。

説明文とガイドタイトルは、スクリーンショットではなく軽量なテキストコンテキストから生成されます。そのため、すべてのスクリーンショットを画像認識モデルへ送る場合と比べて大幅にコストを抑えられます。出力言語は、英語、スペイン語、ブラジルポルトガル語、フランス語、日本語から選択できます。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### ▶️ Guide Me リプレイ

作成済みのガイドを実際のページ上で再生できます。Mimik が次にクリックする要素を強調し、進行状況を手順ごとに追跡します。操作を行うと自動で次の手順へ進むため、チームメンバーのオンボーディングや、自分で手順を確認する際に便利です。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 📤 複数形式でのエクスポート

用途に合わせて、ガイドを複数の形式で共有できます。

- **HTML**：画像を base64 で埋め込んだ自己完結型ファイルとして、どこでも共有可能
- **PDF**：注釈付きスクリーンショットと自動改ページを含む、印刷可能な A4 縦向き形式
- **Markdown**：Notion、GitHub、社内ドキュメント、Wiki へ貼り付け可能

すべてのエクスポートはクライアント側で生成され、サーバーには送信されません。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🌍 多言語対応

インターフェースは英語、スペイン語、ブラジルポルトガル語、フランス語に対応しています。AI の出力言語はインターフェースとは別に設定でき、日本語にも対応しています。そのため、英語版の Mimik を使用しながら日本語のガイドを生成できます。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 💾 100% ローカルストレージ

ガイド、手順、スクリーンショット、API キー、互換 API URL はすべて端末内に保存されます。バックエンド、アカウント、テレメトリはありません。AI を有効にした場合、API キーと軽量なテキストコンテキストは、設定した公式プロバイダーまたは互換エンドポイントにのみ送信されます。これらを受信する Mimik のサーバーはありません。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## 🤝 コントリビューション

バグ報告、機能リクエスト、プルリクエスト、翻訳など、あらゆるコントリビューションを歓迎します。

開発環境のセットアップ、プロジェクト構成、コントリビューションのガイドラインについては、[CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## 📜 ライセンス

Mimik をベースとし、MIT © [Westpoint](https://github.com/westpoint-io) のライセンスの下で、Tsukaeru が変更部分を保守しています。詳細は [LICENSE](./LICENSE) を参照してください。

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
[local-link]: #-100-ローカルストレージ

[no-account-shield]: https://img.shields.io/badge/account-not%20required-4F46E5?style=flat-square&labelColor=1E1B4B
[no-account-link]: #-100-ローカルストレージ

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
