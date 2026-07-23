<div align="center"><a name="readme-top"></a>

<img src="public/mascot.svg" width="140" height="140" alt="Mascote do Mimik" />

# Mimik for Tsukaeru

[English](./README.md) · [Español](./README.es.md) · **Português (BR)** · [Français](./README.fr.md)

**Captura qualquer fluxo no navegador e transforma num guia passo a passo. Sem conta, sem nuvem, sem rastreio.**

Clica em gravar, faz o que precisa, e recebe um guia caprichado com capturas de tela anotadas. Edita, reproduz ou exporta.

Este repositório é o fork da Tsukaeru do [Mimik da Westpoint](https://github.com/westpoint-io/mimik). Ele mantém a abordagem local e de código aberto, com saída de IA em japonês, modelos atuais, IDs de modelo personalizados e melhorias de confiabilidade.

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
<summary><kbd>Sumário</kbd></summary>

#### TOC

- [📺 Demo](#-demo)
- [👋 Começando](#-começando)
- [✨ Funcionalidades](#-funcionalidades)
  - [🎬 Captura automática](#-captura-automática)
  - [📸 Capturas anotadas](#-capturas-anotadas)
  - [🔒 Smart Blur](#-smart-blur)
  - [🧠 Descrições por IA (opcional)](#-descrições-por-ia-opcional)
  - [▶️ Reprodução Guide Me](#️-reprodução-guide-me)
  - [📤 Exportação multi-formato](#-exportação-multi-formato)
  - [🌍 Multi-idioma](#-multi-idioma)
  - [💾 Armazenamento 100% local](#-armazenamento-100-local)
- [🤝 Contribuir](#-contribuir)
- [📜 Licença](#-licença)

<br/>

</details>

## 📺 Demo

<div align="center">
<img src="https://github.com/user-attachments/assets/d4c64cb8-ad26-4de1-af02-a04a64e2836e" alt="Demo do Mimik" width="800" />
</div>

## 👋 Começando

O Mimik transforma qualquer tarefa repetitiva do navegador num guia documentado e compartilhável em segundos. Roda inteiro dentro do teu navegador, sem backend, conta ou telemetria. Os dados do fluxo ficam no teu dispositivo, exceto se tu ativar a IA opcional, que envia somente contexto de texto leve direto ao provedor escolhido.

Seja documentando ferramentas internas, escrevendo tutoriais do produto, ou integrando um colega novo, o Mimik captura cada clique, tecla e navegação automaticamente pra tu focar no que importa.

| Navegador | Versão upstream | Instalação upstream |
| --------- | --------------- | -------------------- |
| Chrome    | [![Chrome Version][chrome-version-shield]][chrome-link]   | [Chrome Web Store][chrome-link] |
| Firefox   | [![Firefox Version][firefox-version-shield]][firefox-link] | [Firefox Add-ons][firefox-link]  |

> [!NOTE]
>
> As versões nas lojas são mantidas pelo projeto upstream e podem ainda não incluir os recursos específicos deste fork. Para executar a versão atual deste repositório, segue as instruções de desenvolvimento ou compilação em [CONTRIBUTING.md](./CONTRIBUTING.md).

> \[!IMPORTANT]
>
> **⭐️ Dá uma estrela no repo** se o Mimik te economiza tempo. Ajuda outras pessoas a descobrirem ele.

<a href="https://github.com/mitchellTsukaeru/mimik">
  <img width="100%" alt="Dê uma estrela ao Mimik no GitHub" src="https://github.com/user-attachments/assets/80d304da-a765-4bde-bf49-b1bdcb4fe804" />
</a>

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## ✨ Funcionalidades

### 🎬 Captura automática

Clica, digita, navega. O Mimik vê tudo. Cada ação relevante vira um passo: cliques em botões e links, campos de formulário, atalhos de teclado, área de transferência, arrastar e soltar, e navegações.

A fusão inteligente de eventos descarta os cliques rápidos em elementos próximos, pra teus guias ficarem limpos. A interceptação do clique acontece *antes* da página mudar, então nada se perde em SPAs nem em recarregamentos completos.

Inicia ou para a gravação de qualquer lugar com <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>, ou <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> no macOS.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 📸 Capturas anotadas

Cada passo ganha uma captura com o elemento clicado destacado e um zoom na área importante. Sem recortar na mão, sem aprender ferramentas de anotação. O Mimik descobre qual parte da página importa e enquadra ela pra ti.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🔒 Smart Blur

O Mimik detecta e desfoca dados sensíveis automaticamente nas tuas capturas: e-mails, telefones, CPFs, cartões de crédito, IPs, endereços MAC. Liga ou desliga cada categoria do jeito que tu quiser.

Precisa esconder algo específico? O seletor manual deixa tu escolher qualquer elemento do DOM e mascarar ele em todas as capturas onde aparecer.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🧠 Descrições por IA (opcional)

Traz a tua API key (OpenAI ou Anthropic) e o Mimik gera descrições naturais tipo *"Clique no botão **Enviar** pra salvar as alterações"* ao invés de `Click button "Submit"`. Os modelos incluídos são GPT-5.6 Luna, Terra e Sol, além de Claude Haiku 4.5, Sonnet 5, Opus 4.8 e Fable 5. Também dá para informar qualquer ID de modelo aceito pelo provedor selecionado.

As descrições e os títulos são gerados a partir de contexto de texto leve, não das capturas. Isso custa bem menos que enviar cada captura para um modelo com visão. A saída pode ser gerada em inglês, espanhol, português brasileiro, francês ou japonês.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### ▶️ Reprodução Guide Me

Reproduz qualquer guia ao vivo numa página real. O Mimik destaca o próximo elemento, marca teu progresso passo a passo, e avança sozinho conforme tu vai interagindo. Perfeito pra integrar colegas ou pra se guiar num processo tu mesmo.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 📤 Exportação multi-formato

Compartilha os guias no formato que melhor cabe no teu fluxo:

- **HTML**: autônomo, compartilha em qualquer lugar, imagens embutidas em base64
- **PDF**: pronto pra imprimir, A4 retrato com quebras de página automáticas e capturas anotadas
- **Markdown**: cola no Notion, GitHub, docs internas, wikis

Todas as exportações são geradas no cliente. Nada passa por servidor.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🌍 Multi-idioma

A interface está disponível em inglês, espanhol, português brasileiro e francês. O idioma de saída da IA é configurado separadamente e também aceita japonês, então tu pode usar o Mimik em inglês e gerar guias em japonês.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 💾 Armazenamento 100% local

Teus guias, passos e capturas ficam no teu dispositivo. Sem backend, conta ou telemetria. Tua API key fica salva localmente e só é enviada ao provedor de IA que tu escolheu; o Mimik não tem servidor que a receba.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## 🤝 Contribuir

Todo tipo de contribuição é bem-vinda: relatos de bug, ideias novas, PRs e traduções.

Olha o [CONTRIBUTING.md](./CONTRIBUTING.md) pro setup de dev, a estrutura do projeto, e as diretrizes pra contribuidores.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## 📜 Licença

Baseado no Mimik, MIT © [Westpoint](https://github.com/westpoint-io), com modificações mantidas pela Tsukaeru. Olha o [LICENSE](./LICENSE) pros detalhes.

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
[local-link]: #-armazenamento-100-local

[no-account-shield]: https://img.shields.io/badge/account-not%20required-4F46E5?style=flat-square&labelColor=1E1B4B
[no-account-link]: #-armazenamento-100-local

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
