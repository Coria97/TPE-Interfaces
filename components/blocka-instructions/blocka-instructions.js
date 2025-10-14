class RushBlockaInstructions extends HTMLElement {
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
        fetch('./components/blocka-instructions/blocka-instructions.html').then((res) => res.text()),
        fetch('./components/blocka-instructions/blocka-instructions.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
        <style>${css}</style>
        ${html
          .replace('<template id="blocka-instructions-template">', '')
          .replace('</template>', '')
          .replace(/<style>.*?<\/style>/s, '')}
      `;

      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      this.setupElements();
      this.updateDisplay();
    } catch (error) {
      console.error('Error loading RushBlockaInstructions component:', error);
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

      default:
        return `<div class="rotate-square"></div>`;
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
    return ['title', 'instructions'];
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
    }
  }

  connectedCallback() {
    console.log('RushBlockaInstructions connected to DOM');
  }

  disconnectedCallback() {
    console.log('RushBlockaInstructions disconnected from DOM');
  }
}

// Configurar las instrucciones específicas de Blocka
setTimeout(() => {
  const instructions = [
    { 
      type: 'mouse-left', 
      text: 'Click izquierdo para rotar una pieza hacia la izquierda.' 
    },
    { 
      type: 'mouse-right', 
      text: 'Click derecho para rotar una pieza hacia la derecha.' 
    },
    { 
      type: 'puzzle', 
      text: 'Rota las 4 piezas hasta formar la imagen completa.' 
    },
    { 
      type: 'filter', 
      text: 'Las piezas tienen filtros que desaparecen al completar.' 
    },
    { 
      type: 'timer', 
      text: 'El cronómetro mide tu tiempo en cada nivel.' 
    },
    { 
      type: 'target', 
      text: 'Completa todos los niveles lo más rápido posible.' 
    },
  ];

  const blockaInstructions = document.querySelector('rush-blocka-instructions');
  if (blockaInstructions) {
    blockaInstructions.setTitle('¿Cómo jugar?');
    blockaInstructions.setInstructions(instructions);
  }
}, 100);

customElements.define('rush-blocka-instructions', RushBlockaInstructions);
