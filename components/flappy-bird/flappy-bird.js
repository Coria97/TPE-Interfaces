import Obstacle from './obstacle.js';
import LivesManager from './lives-manager.js';
import Player from './player.js';
import CollisionManager from './collision-manager.js';
import ScoreManager from './score-manager.js';

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

      // Referencias a elementos
      const submarineElement = this.shadowRoot.querySelector('#submarine');
      this.gameContainer = this.shadowRoot.querySelector('.game-container');
      this.gameContent = this.shadowRoot.querySelector('.game-content');
      
      // Inicializar jugador
      this.player = new Player(submarineElement);
      
      // Estado del juego
      this.isGameRunning = false;
      
      // Obstáculos
      this.obstacles = [];
      this.obstacleSpacing = 300; // Distancia entre obstáculos
      this.obstacleTimer = 0;
      this.obstacleInterval = 90; // Frames entre obstáculos
      
      // Sistema de vidas
      this.livesManager = null;
      
      // Sistema de colisiones
      this.collisionManager = new CollisionManager();
      
      // Sistema de puntuación
      this.scoreManager = null;

      console.log('Inicializando componentes del juego...');
      
      this.setupControls();
      this.initObstacles();
      this.initLives();
      this.initScore();
      this.startGame();
      
      // Activar el jugador
      this.player.activate();
      
      console.log('Juego iniciado correctamente');
      
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

  initObstacles() {
    // Crear 3 obstáculos iniciales más alejados
    for (let i = 0; i < 3; i++) {
      const obstacle = new Obstacle(this.gameContent, 900 + (i * this.obstacleSpacing));
      this.obstacles.push(obstacle);
    }
  }

  initLives() {
    // Inicializar sistema de vidas
    this.livesManager = new LivesManager(this.gameContent, 3);
  }

  initScore() {
    // Inicializar sistema de puntuación
    this.scoreManager = new ScoreManager(this.gameContent);
  }

  jump() {
    if (!this.isGameRunning) return;
    this.player.jump();
  }

  startGame() {
    this.isGameRunning = true;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.isGameRunning) return;
    
    // Actualizar física del jugador
    this.player.update();
    
    // Verificar colisiones con límites
    const boundaryCollisions = this.collisionManager.checkBoundaryCollisions(this.player);
    if (boundaryCollisions.bottom && !this.livesManager.isInvulnerable()) {
      // Perder vida por tocar el suelo
      this.handleCollision();
    }
    
    // Renderizar posición del jugador
    this.player.render();
    
    // Efecto visual de invulnerabilidad
    this.player.applyInvulnerabilityEffect(this.livesManager.isInvulnerable());
    
    // Actualizar obstáculos
    this.updateObstacles();
    
    // Continuar el loop
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  updateObstacles() {
    const playerBounds = this.player.getBounds();
    
    // Actualizar cada obstáculo
    this.obstacles.forEach(obstacle => {
      obstacle.update();
      
      // Verificar colisión solo si no está invulnerable
      if (!this.livesManager.isInvulnerable()) {
        if (this.collisionManager.checkObstacleCollision(this.player, obstacle)) {
          this.handleCollision();
        }
      }
      
      // Verificar si pasó el obstáculo (sumar punto)
      if (obstacle.checkPassed(playerBounds.x)) {
        this.scoreManager.increment();
      }
      
      // Reciclar obstáculo si salió de pantalla
      if (obstacle.isOffScreen()) {
        // Encontrar el obstáculo más a la derecha
        const maxX = Math.max(...this.obstacles.map(o => o.x));
        obstacle.reset(maxX + this.obstacleSpacing);
      }
    });
  }

  handleCollision() {
    // Manejar colisión con obstáculo
    const isDead = this.livesManager.loseLife();
    
    // Efecto visual de colisión
    this.player.applyCollisionEffect();
    
    // Si murió completamente, game over
    if (isDead) {
      this.gameOver();
    } else {
      // Si aún tiene vidas, reposicionar el jugador
      this.player.reset();
    }
  }

  gameOver() {
    if (!this.isGameRunning) return;
    
    this.isGameRunning = false;
    console.log('Game Over! Score:', this.scoreManager.getScore());
    
    // Mostrar mensaje de game over
    this.showGameOver();
  }

  showGameOver() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over-screen';
    gameOverDiv.style.position = 'absolute';
    gameOverDiv.style.top = '50%';
    gameOverDiv.style.left = '50%';
    gameOverDiv.style.transform = 'translate(-50%, -50%)';
    gameOverDiv.style.textAlign = 'center';
    gameOverDiv.style.zIndex = '30';
    gameOverDiv.style.background = 'rgba(14, 15, 16, 0.95)';
    gameOverDiv.style.padding = '40px';
    gameOverDiv.style.borderRadius = '12px';
    gameOverDiv.style.border = '3px solid var(--rushgames-primary)';
    gameOverDiv.style.pointerEvents = 'auto';
    
    gameOverDiv.innerHTML = `
      <div style="font-size: 48px; color: var(--rushgames-primary); font-weight: bold; margin-bottom: 20px; font-family: var(--text-title);">
        GAME OVER
      </div>
      <div style="font-size: 32px; color: var(--text-primary); margin-bottom: 30px;">
        Score: ${this.scoreManager.getScore()}
      </div>
      <button class="restart-button" style="
        background: var(--rushgames-primary);
        color: var(--neutral-black);
        border: none;
        padding: 15px 40px;
        font-size: 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-family: var(--text-title);
        pointer-events: auto;
      ">
        REINTENTAR
      </button>
    `;
    
    this.gameContent.appendChild(gameOverDiv);
    
    // Agregar evento al botón de manera más directa
    const restartBtn = gameOverDiv.querySelector('.restart-button');
    restartBtn.onclick = () => {
      gameOverDiv.remove();
      this.restart();
    };
  }

  restart() {
    // Limpiar todos los elementos de game over
    const gameOverScreen = this.gameContent.querySelector('.game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.remove();
    }
    
    // Resetear estado
    this.player.reset();
    this.scoreManager.reset();
    
    // Resetear vidas
    this.livesManager.reset();
    
    // Resetear obstáculos más alejados
    this.obstacles.forEach((obstacle, index) => {
      obstacle.reset(900 + (index * this.obstacleSpacing));
    });
    
    // Reiniciar juego
    this.isGameRunning = true;
    this.player.activate();
    this.gameLoop();
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
    
    // Destruir jugador
    if (this.player) {
      this.player.destroy();
    }
    
    // Destruir obstáculos
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];
    
    // Destruir sistema de vidas
    if (this.livesManager) {
      this.livesManager.destroy();
    }
    
    // Destruir sistema de puntuación
    if (this.scoreManager) {
      this.scoreManager.destroy();
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