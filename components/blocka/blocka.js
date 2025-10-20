export { initBlocka } from './logic-game.js';

class RushgameBlocka extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      // Get template content and insert into shadow DOM
      const response = await fetch('./components/blocka/blocka.html');
      const responseText = await response.text();
      
      const template = document.createElement('template');
      template.innerHTML = responseText;

      const content = template.content.querySelector('#blocka-template').content.cloneNode(true);

      this.shadow.appendChild(content);
      await Promise.resolve();

      // Initialize the game logic
      const gameModule = await import('./logic-game.js');
      this.game = gameModule.initBlocka(this.shadow);

      // Setup canvas offset updates on resize
      this.updateCanvasOffset();
      window.addEventListener('resize', this.updateCanvasOffset);
      this._updateCanvasOffset = this.updateCanvasOffset;

    } catch (err) {
      console.error('Error cargando template blocka:', err);
    }
  }

  updateCanvasOffset = () => {
    // Update CSS variables for canvas offset and height
    const canvas = this.shadow.querySelector('#blockaCanvas');
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const hostRect = this.getBoundingClientRect();
    const offset = Math.max(0, canvasRect.top - hostRect.top);
    const parentForVar = this.parentElement || document.documentElement;
    parentForVar.style.setProperty('--canvas-offset-top', `${offset}px`);
    parentForVar.style.setProperty('--canvas-height', `${canvasRect.height}px`);
  };

  disconnectedCallback() {
    // Clean up event listeners and game instance
    if (this._updateCanvasOffset) {
      window.removeEventListener('resize', this._updateCanvasOffset);
      this._updateCanvasOffset = null;
    }
    if (this.game && typeof this.game.destroy === 'function') {
      try { this.game.destroy(); } catch (e) { /* ignore */ }
    }
  }
}

customElements.define('rushgame-blocka', RushgameBlocka);