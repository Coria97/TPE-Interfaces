// Reexportar el inicializador desde logic-game.js (lógica movida a archivos separados)
export { initBlocka } from './logic-game.js';

const TEMPLATE_URL = new URL('./blocka.html', import.meta.url).href;

class RushgameBlocka extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      const res = await fetch(TEMPLATE_URL);
      const text = await res.text();
      const tmp = document.createElement('template');
      tmp.innerHTML = text;

      const tplNode = tmp.content.querySelector('#blocka-template') || tmp.content;
      const contentToInsert = tplNode.nodeName === 'TEMPLATE'
        ? tplNode.content.cloneNode(true)
        : tplNode.cloneNode(true);

      this.shadow.appendChild(contentToInsert);
      await Promise.resolve();

      // Inicializar la lógica del juego desde logic-game.js
      const gameModule = await import('./logic-game.js');
      this.game = gameModule.initBlocka(this.shadow);

      const updateCanvasOffset = () => {
        const canvas = this.shadow.querySelector('#blockaCanvas');
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();
        const hostRect = this.getBoundingClientRect();
        const offset = Math.max(0, canvasRect.top - hostRect.top);
        const parentForVar = this.parentElement || document.documentElement;
        parentForVar.style.setProperty('--canvas-offset-top', `${offset}px`);
        parentForVar.style.setProperty('--canvas-height', `${canvasRect.height}px`);
      };

      updateCanvasOffset();
      window.addEventListener('resize', updateCanvasOffset);
      this._updateCanvasOffset = updateCanvasOffset;

    } catch (err) {
      console.error('Error cargando template blocka:', err);
    }
  }

  disconnectedCallback() {
    if (this._updateCanvasOffset) {
      window.removeEventListener('resize', this._updateCanvasOffset);
      this._updateCanvasOffset = null;
    }
    if (this.game && typeof this.game.destroy === 'function') {
      try { this.game.destroy(); } catch (e) { /* ignore */ }
    }
  }
}

if (!customElements.get('rushgame-blocka')) {
  customElements.define('rushgame-blocka', RushgameBlocka);
}