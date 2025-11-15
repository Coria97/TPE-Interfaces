class RushGameInstructions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.instructionsData = {
      title: 'Instrucciones',
      instructions: [],
    };

    this.init();
  }

  async init() {
    try {
      const [html, css] = await Promise.all([
        fetch('./components/game-instructions/game-instructions.html').then((res) => res.text()),
        fetch('./components/game-instructions/game-instructions.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
        <style>${css}</style>
        ${html
          .replace('<template id="game-instructions-template">', '')
          .replace('</template>', '')
          .replace(/<style>.*?<\/style>/s, '')}
      `;

      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      this.setupElements();
      this.updateDisplay();
    } catch (error) {
      console.error('Error loading RushGameInstructions component:', error);
    }
  }

  setupElements() {
    this.instructionsTitle = this.shadowRoot.querySelector('#instructionsTitle');
    this.instructionsList = this.shadowRoot.querySelector('.instructions-list');
  }

  updateDisplay() {
    if (!this.instructionsList) return;

    if (this.instructionsTitle) {
      this.instructionsTitle.textContent = this.instructionsData.title;
    }

    this.instructionsList.innerHTML = '';

    this.instructionsData.instructions.forEach((instruction) => {
      const instructionItem = document.createElement('div');
      instructionItem.className = 'instruction-item';

      instructionItem.innerHTML = `
        <div class="instruction-icon">
          ${this.renderIcon(instruction.type, instruction.iconData)}
        </div>
        <p class="instruction-text">${instruction.text}</p>
      `;

      this.instructionsList.appendChild(instructionItem);
    });
  }

  renderIcon(type, iconData = {}) {
    switch (type) {
      case 'mouse':
        return `
          <svg width="48" height="70" viewBox="0 0 48 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="10" width="40" height="56" rx="20" fill="var(--neutral-surface-variant)" stroke="var(--rushgames-primary)" stroke-width="4"/>
            <rect x="20" y="10" width="8" height="20" rx="4" fill="var(--rushgames-primary)" />
            <circle cx="24" cy="45" r="5" fill="var(--rushgames-primary)" />
          </svg>
        `;

      case 'mouse-left':
        return `
          <div class="icon-mouse">
            <svg width="48" height="70" viewBox="0 0 48 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="10" width="40" height="56" rx="20" fill="var(--neutral-surface-variant)" stroke="var(--rushgames-primary)" stroke-width="4"/>
              <rect x="10" y="20" width="12" height="15" rx="3" fill="var(--rushgames-primary)" />
              <circle cx="24" cy="50" r="4" fill="var(--neutral-border)" />
            </svg>
          </div>
        `;

      case 'mouse-right':
        return `
          <div class="icon-mouse">
            <svg width="48" height="70" viewBox="0 0 48 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="10" width="40" height="56" rx="20" fill="var(--neutral-surface-variant)" stroke="var(--rushgames-secondary)" stroke-width="4"/>
              <rect x="26" y="20" width="12" height="15" rx="3" fill="var(--rushgames-secondary)" />
              <circle cx="24" cy="50" r="4" fill="var(--neutral-border)" />
            </svg>
          </div>
        `;

      case 'spacebar':
        return `
          <div class="icon-spacebar">
            <svg width="70" height="48" viewBox="0 0 70 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="10" width="60" height="28" rx="6" fill="var(--neutral-surface-variant)" stroke="var(--rushgames-primary)" stroke-width="3"/>
              <text x="35" y="30" text-anchor="middle" fill="var(--rushgames-primary)" font-size="12" font-weight="bold">SPACE</text>
            </svg>
          </div>
        `;

      case 'fly':
        return `
          <div class="icon-fly">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="25" fill="var(--neutral-surface)" stroke="var(--rushgames-primary)" stroke-width="3"/>
              <path d="M30 20 L30 40 M25 25 L30 20 L35 25" stroke="var(--rushgames-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        `;

      case 'obstacle':
        return `
          <div class="icon-obstacle">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="5" width="15" height="50" rx="3" fill="var(--rushgames-secondary)" opacity="0.8"/>
              <rect x="35" y="5" width="15" height="50" rx="3" fill="var(--rushgames-secondary)" opacity="0.8"/>
              <circle cx="30" cy="30" r="8" fill="var(--rushgames-primary)"/>
            </svg>
          </div>
        `;

    

      case 'score':
        return `
          <div class="icon-score">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="25" fill="var(--neutral-surface)" stroke="var(--rushgames-accent)" stroke-width="3"/>
              <text x="30" y="38" text-anchor="middle" fill="var(--rushgames-accent)" font-size="24" font-weight="bold">+1</text>
            </svg>
          </div>
        `;

      case 'rotate':
        return `
          <div class="icon-rotate">
            <div class="rotate-square"></div>
          </div>
        `;

      case 'timer':
        return `
          <div class="icon-timer">
            <div class="timer-circle">
              <div class="timer-hand"></div>
            </div>
          </div>
        `;

      case 'puzzle':
        return `
          <div class="icon-puzzle">
            <div class="puzzle-piece"></div>
            <div class="puzzle-piece"></div>
            <div class="puzzle-piece"></div>
            <div class="puzzle-piece"></div>
          </div>
        `;

      case 'filter':
        return `
          <div class="icon-filter">
            <div class="filter-layers">
              <div class="filter-layer"></div>
              <div class="filter-layer"></div>
            </div>
          </div>
        `;

      case 'target':
        return `
          <div class="icon-target">
            <div class="target-circles">
              <div class="target-circle"></div>
              <div class="target-circle"></div>
              <div class="target-circle"></div>
            </div>
          </div>
        `;

      case 'click':
        return `
          <div class="icon-chart">
            <div class="chart-segment segment-green" style="--angle: ${iconData.angle || 90}deg"></div>
            <div class="chart-center"></div>
          </div>
        `;

      case 'move':
        return `
          <div class="icon-circles">
            <div class="circle circle-green"></div>
            <div class="circle circle-green"></div>
            <div class="circle circle-gray"></div>
          </div>
        `;

      case 'jump':
        return `
          <div class="icon-circles">
            <div class="circle circle-gray"></div>
            <div class="circle circle-gray"></div>
            <div class="circle circle-green"></div>
          </div>
        `;

      case 'objective':
        return `
          <div class="icon-target">
            <div class="circle circle-green large"></div>
          </div>
        `;

      case 'coins':
        return `
          <div class="icon-coin">
            <div class="coin">
              <span class="coin-text">R</span>
            </div>
          </div>
        `;

      default:
        return `<div class="circle circle-green"></div>`;
    }
  }

  setInstructions(instructions) {
    this.instructionsData.instructions = instructions;
    this.updateDisplay();
  }

  setTitle(title) {
    this.instructionsData.title = title;
    if (this.instructionsTitle) {
      this.instructionsTitle.textContent = title;
    }
  }

  static get observedAttributes() {
    return ['title', 'instructions', 'game-type'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'title':
        this.instructionsData.title = newValue || 'Instrucciones';
        if (this.instructionsTitle) {
          this.instructionsTitle.textContent = this.instructionsData.title;
        }
        break;
      case 'instructions':
        try {
          this.instructionsData.instructions = JSON.parse(newValue) || [];
          this.updateDisplay();
        } catch (e) {
          console.error('Error parsing instructions:', e);
        }
        break;
      case 'game-type':
        this.loadGameSpecificInstructions(newValue);
        break;
    }
  }

  loadGameSpecificInstructions(gameType) {
    const instructionsMap = {
      'peg-solitaire': [
        { type: 'mouse-left', text: 'Haz clic izquierdo para seleccionar o interactuar.' },
        { type: 'move', text: 'Selecciona una ficha y movela a un espacio vacio' },
        { type: 'jump', text: 'Salta sobre una ficha para eliminarla.' },
        { type: 'objective', text: 'El objetivo del juego es dejar una sola ficha en el tablero.' },
        { type: 'coins', text: 'Podes usar tus RushCoins para deshacer una jugada.' },
      ],
      blocka: [
        { type: 'mouse-left', text: 'Click izquierdo para rotar una pieza hacia la izquierda.' },
        { type: 'mouse-right', text: 'Click derecho para rotar una pieza hacia la derecha.' },
        { type: 'puzzle', text: 'Rota las 4 piezas hasta formar la imagen completa.' },
        { type: 'filter', text: 'Las piezas tienen filtros que desaparecen al completar.' },
        { type: 'timer', text: 'El cronómetro mide tu tiempo en cada nivel.' },
        { type: 'target', text: 'Completa todos los niveles lo más rápido posible.' },
      ],
      'flappy-bird': [
        { type: 'mouse-left', text: 'Haz clic o presiona ESPACIO para dar impulso hacia arriba.' },
        { type: 'fly', text: 'La nave cae constantemente por gravedad. Mantén el vuelo controlado.' },
        { type: 'obstacle', text: 'Esquiva los obstáculos espaciales que aparecen en tu camino.' },
        { type: 'score', text: 'Gana puntos por cada obstáculo que logres superar.' },
        { type: 'target', text: 'Sobrevive el mayor tiempo posible sin chocar.' },
      ],
    };

    if (instructionsMap[gameType]) {
      this.setTitle('¿Cómo jugar?');
      this.setInstructions(instructionsMap[gameType]);
    }
  }

  connectedCallback() {
    console.log('RushGameInstructions connected to DOM');
  }

  disconnectedCallback() {
    console.log('RushGameInstructions disconnected from DOM');
  }
}

customElements.define('rush-game-instructions', RushGameInstructions);