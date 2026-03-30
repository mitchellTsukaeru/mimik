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
    animation: show ${ANIMATION_DURATION_MS}ms ease forwards;
  }

  @keyframes show {
    0% { opacity: 1; }
    85% { opacity: 1; }
    100% { opacity: 0; }
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #FBBF24;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
  }

  .particle:nth-child(1) { animation: p1 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
  .particle:nth-child(2) { animation: p2 1.2s cubic-bezier(0.16,1,0.3,1) 0.05s forwards; }
  .particle:nth-child(3) { animation: p3 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; }
  .particle:nth-child(4) { animation: p4 1.2s cubic-bezier(0.16,1,0.3,1) 0.03s forwards; }
  .particle:nth-child(5) { animation: p5 1.2s cubic-bezier(0.16,1,0.3,1) 0.08s forwards; }
  .particle:nth-child(6) { animation: p6 1.2s cubic-bezier(0.16,1,0.3,1) 0.12s forwards; }
  .particle:nth-child(7) { animation: p7 1.2s cubic-bezier(0.16,1,0.3,1) 0.02s forwards; }
  .particle:nth-child(8) { animation: p8 1.2s cubic-bezier(0.16,1,0.3,1) 0.07s forwards; }
  .particle:nth-child(9) { animation: p9 1.2s cubic-bezier(0.16,1,0.3,1) 0.06s forwards; }
  .particle:nth-child(10) { animation: p10 1.2s cubic-bezier(0.16,1,0.3,1) 0.09s forwards; }

  @keyframes p1 { 30% { transform: translate(80px, -60px) scale(1.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p2 { 30% { transform: translate(-70px, -80px) scale(1.2); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p3 { 30% { transform: translate(100px, 40px) scale(1.8); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p4 { 30% { transform: translate(-90px, 50px) scale(1.3); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p5 { 30% { transform: translate(50px, -90px) scale(1.6); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p6 { 30% { transform: translate(-40px, 80px) scale(1.1); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p7 { 30% { transform: translate(70px, 70px) scale(1.4); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p8 { 30% { transform: translate(-60px, -30px) scale(1.7); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p9 { 30% { transform: translate(-100px, -10px) scale(1.2); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }
  @keyframes p10 { 30% { transform: translate(30px, 90px) scale(1.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }

  .text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: #FBBF24;
    white-space: nowrap;
    opacity: 0;
    text-shadow: 0 2px 12px rgba(245, 158, 11, 0.4);
    animation: textIn 0.4s cubic-bezier(0.16,1,0.3,1) 0.5s forwards,
               textOut 0.3s ease 2.3s forwards;
  }

  @keyframes textIn { to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
  @keyframes textOut { to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); } }
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

    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      wrap.appendChild(particle);
    }

    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = 'Recording started';
    wrap.appendChild(text);

    shadow.appendChild(wrap);
    document.documentElement.appendChild(host);

    wrap.addEventListener('animationend', (e) => {
      if (e.target !== wrap) return;
      host.remove();
      resolve();
    });
  });
}
