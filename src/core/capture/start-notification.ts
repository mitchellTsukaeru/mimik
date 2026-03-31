const ANIMATION_DURATION_MS = 3000;

const STYLES = `
  :host {
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    pointer-events: none;
  }

  .wrap {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: show ${ANIMATION_DURATION_MS}ms ease forwards;
  }

  @keyframes show {
    0% { opacity: 0; }
    8% { opacity: 1; }
    75% { opacity: 1; }
    100% { opacity: 0; }
  }

  .txt {
    font-family: 'Bebas Neue', 'Arial Narrow', Impact, sans-serif;
    font-size: clamp(40px, 10vw, 90px);
    letter-spacing: clamp(2px, 0.8vw, 6px);
    -webkit-text-stroke: 2px #F59E0B;
    color: transparent;
    position: relative;
    text-transform: uppercase;
    opacity: 0;
    animation: txtIn 0.01s ease forwards;
  }

  @keyframes txtIn {
    to { opacity: 1; }
  }

  .fill {
    position: absolute;
    inset: 0;
    color: #FBBF24;
    -webkit-text-stroke: 0;
    clip-path: inset(0 100% 0 0);
    animation: fillRight 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards,
               fadeOut 0.4s ease 2.4s forwards;
  }

  @keyframes fillRight {
    to { clip-path: inset(0 0 0 0); }
  }

  @keyframes fadeOut {
    to { opacity: 0; }
  }

  .txt {
    animation: txtIn 0.01s ease forwards,
               fadeOut 0.4s ease 2.4s forwards;
  }
`;

export function showStartNotification(): Promise<void> {
  return new Promise((resolve) => {
    const host = document.createElement('mimik-notification');
    host.setAttribute('data-mimik-ignore', '');
    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = STYLES;
    shadow.appendChild(style);

    const wrap = document.createElement('div');
    wrap.className = 'wrap';

    const txt = document.createElement('div');
    txt.className = 'txt';
    txt.textContent = 'RECORDING';

    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.textContent = 'RECORDING';
    txt.appendChild(fill);

    wrap.appendChild(txt);
    shadow.appendChild(wrap);
    document.documentElement.appendChild(host);

    wrap.addEventListener('animationend', (e) => {
      if (e.target !== wrap) return;
      host.remove();
      resolve();
    });
  });
}
