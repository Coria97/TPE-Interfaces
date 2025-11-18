class RushGameFlappyBird extends HTMLElement {
  constructor() {
    console.log("Initializing Flappy Bird component");
    super();
    this.attachShadow({ mode: 'open' });
    this.init();
  }

  async init() {
    try {
      const [html, css] = await Promise.all([
        fetch('./components/flappy-bird/flappy-bird.html').then((res) => res.text()),
        fetch('./components/flappy-bird/flappy-bird.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
        <style>${css}</style>
        ${html
          .replace('<template id="flappy-bird-template">', '')
          .replace('</template>', '')
          .replace(/<style>.*?<\/style>/s, '')}
      `;
      
      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      // Referencias a elementos - CORREGIDO: usar #submarine
      this.submarine = this.shadowRoot.querySelector('#submarine');
      this.gameContainer = this.shadowRoot.querySelector('.game-container');
      
      // Estado del juego
      this.submarineY = 350; // Posición vertical del submarino
      this.submarineVelocity = 0; // Velocidad vertical
      this.gravity = 0.6; // Gravedad
      this.jumpForce = -12; // Fuerza del salto
      this.isGameRunning = false;

      this.setupControls();
      this.startGame();
      
    } catch(err) {
      console.error('Error initializing Flappy Bird:', err);
    }
  }

  setupControls() {
    // Click o Espacio para saltar
    this.gameContainer.style.pointerEvents = 'all';
    
    this.handleClick = () => {
      this.jump();
    };
    
    this.handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.jump();
      }
    };
    
    this.gameContainer.addEventListener('click', this.handleClick);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  jump() {
    if (!this.isGameRunning) return;
    
    this.submarineVelocity = this.jumpForce;
    
    // Animación de impulso
    this.submarine.classList.add('flapping');
    setTimeout(() => {
      this.submarine.classList.remove('flapping');
    }, 300);
  }

  startGame() {
    this.isGameRunning = true;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.isGameRunning) return;
    
    // Actualizar física del submarino
    this.submarineVelocity += this.gravity;
    this.submarineY += this.submarineVelocity;
    
    // Limitar el submarino dentro del contenedor
    if (this.submarineY < 0) {
      this.submarineY = 0;
      this.submarineVelocity = 0;
    }
    if (this.submarineY > 650) {
      this.submarineY = 650;
      this.submarineVelocity = 0;
    }
    
    // Actualizar posición del submarino
    if (this.submarine) {
      this.submarine.style.top = this.submarineY + 'px';
    }
    
    // Continuar el loop
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  disconnectedCallback() {
    // Cleanup cuando el componente se destruye
    this.destroy();
  }

  destroy() {
    console.log('Flappy Bird destroyed');
    this.isGameRunning = false;
    
    // Cancelar animación
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remover event listeners
    if (this.gameContainer && this.handleClick) {
      this.gameContainer.removeEventListener('click', this.handleClick);
    }
    if (this.handleKeyDown) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  }
}

// Solo definir si no está ya definido
if (!customElements.get('rushgame-flappy-bird')) {
  customElements.define('rushgame-flappy-bird', RushGameFlappyBird);
}