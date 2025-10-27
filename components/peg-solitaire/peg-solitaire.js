/**
 * RushgamePegSolitaire - Web Component para el juego Peg Solitaire
 * Implementa Shadow DOM y encapsula toda la funcionalidad del juego
 */

export { initPegSolitaire } from './logic-game.js';

class RushgamePegSolitaire extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  /**
   * Se ejecuta cuando el componente se conecta al DOM
   */
  async connectedCallback() {
    try {
      // Cargar el template HTML
      const response = await fetch('./components/peg-solitaire/peg-solitaire.html');
      const responseText = await response.text();
      
      const template = document.createElement('template');
      template.innerHTML = responseText;

      const content = template.content.querySelector('#peg-solitaire-template').content.cloneNode(true);

      this.shadow.appendChild(content);
      await Promise.resolve();

      // Inicializar la lógica del juego
      const gameModule = await import('./logic-game.js');
      this.game = gameModule.initPegSolitaire(this.shadow);

      // Setup canvas offset updates on resize (similar a Blocka)
      this.updateCanvasOffset();
      window.addEventListener('resize', this.updateCanvasOffset);
      this._updateCanvasOffset = this.updateCanvasOffset;

      // Agregar event listener al botón retry
      const btnRetry = this.shadow.querySelector('#btnRetry');
      if (btnRetry) {
        btnRetry.addEventListener('click', () => {
          if (this.game) {
            this.game.resetGame();
          }
        });
      }

    } catch (err) {
      console.error('Error cargando template peg-solitaire:', err);
    }
  }

  /**
   * Actualiza el offset del canvas para alinear las instrucciones
   * (Mismo patrón que Blocka)
   */
  updateCanvasOffset = () => {
    const canvas = this.shadow.querySelector('#pegCanvas');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const hostRect = this.getBoundingClientRect();
    const offset = Math.max(0, canvasRect.top - hostRect.top);
    
    const parentForVar = this.parentElement || document.documentElement;
    parentForVar.style.setProperty('--canvas-offset-top', `${offset}px`);
    parentForVar.style.setProperty('--canvas-height', `${canvasRect.height}px`);
  };

  /**
   * Se ejecuta cuando el componente se desconecta del DOM
   */
  disconnectedCallback() {
    // Limpiar event listeners
    if (this._updateCanvasOffset) {
      window.removeEventListener('resize', this._updateCanvasOffset);
      this._updateCanvasOffset = null;
    }
    
    // Destruir instancia del juego
    if (this.game && typeof this.game.destroy === 'function') {
      try {
        this.game.destroy();
      } catch (e) {
        console.error('Error al destruir el juego:', e);
      }
    }
  }
}

// Definir el custom element
customElements.define('rushgame-peg-solitaire', RushgamePegSolitaire);
