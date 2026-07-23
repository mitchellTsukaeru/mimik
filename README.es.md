<div align="center"><a name="readme-top"></a>

<img src="public/mascot.svg" width="140" height="140" alt="Mascota de Mimik" />

# Mimik for Tsukaeru

[English](./README.md) · **Español** · [Português (BR)](./README.pt-BR.md) · [Français](./README.fr.md)

**Captura cualquier flujo del navegador y conviértelo en una guía paso a paso. Sin cuenta, sin nube, sin rastreo.**

Le das a grabar, haces lo tuyo, y obtienes una guía pulida con capturas anotadas. Edítala, reprodúcela o expórtala.

Este repositorio es el fork de Tsukaeru de [Mimik de Westpoint](https://github.com/westpoint-io/mimik). Mantiene el enfoque local y de código abierto, y añade salida de IA en japonés, modelos actuales, IDs de modelo personalizados y mejoras de fiabilidad.

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
<summary><kbd>Tabla de contenidos</kbd></summary>

#### TOC

- [📺 Demo](#-demo)
- [👋 Empezar](#-empezar)
- [✨ Funciones](#-funciones)
  - [🎬 Captura automática](#-captura-automática)
  - [📸 Capturas anotadas](#-capturas-anotadas)
  - [🔒 Smart Blur](#-smart-blur)
  - [🧠 Descripciones con IA (opcional)](#-descripciones-con-ia-opcional)
  - [▶️ Reproducción Guide Me](#️-reproducción-guide-me)
  - [📤 Exportación multi-formato](#-exportación-multi-formato)
  - [🌍 Multi-idioma](#-multi-idioma)
  - [💾 Almacenamiento 100% local](#-almacenamiento-100-local)
- [🤝 Contribuir](#-contribuir)
- [📜 Licencia](#-licencia)

<br/>

</details>

## 📺 Demo

<div align="center">
<img src="https://github.com/user-attachments/assets/d4c64cb8-ad26-4de1-af02-a04a64e2836e" alt="Demo de Mimik" width="800" />
</div>

## 👋 Empezar

Mimik convierte cualquier tarea repetitiva del navegador en una guía documentada y compartible en segundos. Corre por completo en tu navegador, sin backend, cuenta ni telemetría. Los datos del flujo permanecen en tu dispositivo salvo que actives la IA opcional, que envía solo contexto de texto ligero directamente al proveedor elegido.

Ya sea que estés documentando herramientas internas, escribiendo tutoriales de producto, o formando a un compañero, Mimik captura cada clic, tecla y navegación automáticamente para que te concentres en lo importante.

| Navegador | Versión upstream | Instalación upstream |
| --------- | ---------------- | --------------------- |
| Chrome    | [![Chrome Version][chrome-version-shield]][chrome-link]   | [Chrome Web Store][chrome-link] |
| Firefox   | [![Firefox Version][firefox-version-shield]][firefox-link] | [Firefox Add-ons][firefox-link]  |

> [!NOTE]
>
> Las publicaciones de las tiendas pertenecen al proyecto upstream y puede que aún no incluyan las funciones específicas de este fork. Para ejecutar la versión actual de este repositorio, sigue las instrucciones de desarrollo o compilación en [CONTRIBUTING.md](./CONTRIBUTING.md).

> \[!IMPORTANT]
>
> **⭐️ Dale una estrella al repo** si Mimik te ahorra tiempo. Ayuda a que otras personas lo descubran.

<a href="https://github.com/mitchellTsukaeru/mimik">
  <img width="100%" alt="Dale una estrella a Mimik en GitHub" src="https://github.com/user-attachments/assets/80d304da-a765-4bde-bf49-b1bdcb4fe804" />
</a>

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## ✨ Funciones

### 🎬 Captura automática

Haces clic, escribes, navegas. Mimik lo ve todo. Cada acción relevante se convierte en un paso: clics en botones y enlaces, entradas de formulario, atajos de teclado, portapapeles, arrastrar y soltar, y navegaciones.

La fusión inteligente de eventos descarta los clics rápidos en elementos cercanos, para que tus guías queden limpias. La interceptación del clic ocurre *antes* de que la página cambie, así no se pierde nada en SPAs o recargas completas.

Inicia o detén la grabación desde cualquier lugar con <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>, o <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> en macOS.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 📸 Capturas anotadas

Cada paso recibe una captura con el elemento resaltado y un zoom al área importante. Sin recortar a mano, sin aprender herramientas de anotación. Mimik descubre qué parte de la página importa y te la enmarca.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🔒 Smart Blur

Mimik detecta y difumina datos sensibles automáticamente en tus capturas: correos, teléfonos, números de identificación, tarjetas de crédito, IPs, direcciones MAC. Activa o desactiva cada categoría de forma independiente.

¿Necesitas ocultar algo personalizado? El selector manual te deja elegir cualquier elemento del DOM y enmascararlo en todas las capturas donde aparezca.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🧠 Descripciones con IA (opcional)

Trae tu propia API key (OpenAI o Anthropic) y Mimik genera descripciones naturales como *"Haz clic en el botón **Enviar** para guardar los cambios"* en lugar de `Click button "Submit"`. Los modelos incluidos son GPT-5.6 Luna, Terra y Sol, además de Claude Haiku 4.5, Sonnet 5, Opus 4.8 y Fable 5. También puedes introducir cualquier ID de modelo compatible con el proveedor seleccionado.

Las descripciones y los títulos se generan a partir de contexto de texto ligero, no de capturas. Esto cuesta mucho menos que enviar cada captura a un modelo con visión. La salida puede generarse en inglés, español, portugués brasileño, francés o japonés.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### ▶️ Reproducción Guide Me

Reproduce cualquier guía en vivo sobre una página real. Mimik resalta el siguiente elemento, marca tu progreso paso a paso, y avanza solo conforme vas interactuando. Ideal para formar a un compañero o para guiarte a ti mismo.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 📤 Exportación multi-formato

Comparte tus guías en el formato que mejor encaje con tu flujo:

- **HTML**: autónomo, comparte donde sea, imágenes embebidas en base64
- **PDF**: listo para imprimir, A4 vertical con saltos automáticos y capturas anotadas
- **Markdown**: pega en Notion, GitHub, documentación interna, wikis

Todas las exportaciones se generan del lado del cliente. Nada pasa por un servidor.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 🌍 Multi-idioma

La interfaz está disponible en inglés, español, portugués brasileño y francés. El idioma de salida de la IA se configura por separado y también admite japonés, así que puedes usar Mimik en inglés y generar guías en japonés.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

### 💾 Almacenamiento 100% local

Tus guías, pasos y capturas viven en tu dispositivo. No hay backend, cuenta ni telemetría. Tu API key se guarda localmente y solo se envía al proveedor de IA que elegiste; Mimik no tiene un servidor que la reciba.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## 🤝 Contribuir

Se agradece todo tipo de contribución: reportes de bugs, ideas nuevas, PRs y traducciones.

Mira [CONTRIBUTING.md](./CONTRIBUTING.md) para el setup de desarrollo, la estructura del proyecto, y las pautas para contribuidores.

<div align="right">

[![Back to top][back-to-top]](#readme-top)

</div>

## 📜 Licencia

Basado en Mimik, MIT © [Westpoint](https://github.com/westpoint-io), con modificaciones mantenidas por Tsukaeru. Mira [LICENSE](./LICENSE) para los detalles.

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
[local-link]: #-almacenamiento-100-local

[no-account-shield]: https://img.shields.io/badge/account-not%20required-4F46E5?style=flat-square&labelColor=1E1B4B
[no-account-link]: #-almacenamiento-100-local

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
