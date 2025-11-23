import Obstacle from './obstacle.js';
import LivesManager from './lives-manager.js';
import Player from './player.js';
import CollisionManager from './collision-manager.js';

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
      this.player = new Player(submarineElement, {
        initialY: 350,
        x: 150,
        size: 38,
        gravity: 0.6,
        jumpForce: -12,
        minY: 0,
        maxY: 650
      });
      
      // Estado del juego
      this.isGameRunning = false;
      this.score = 0;
      
      // Obstáculos
      this.obstacles = [];
      this.obstacleSpacing = 300; // Distancia entre obstáculos
      this.obstacleTimer = 0;
      this.obstacleInterval = 90; // Frames entre obstáculos
      
      // Sistema de vidas
      this.livesManager = null;
      
      // Sistema de colisiones
      this.collisionManager = new CollisionManager();

      console.log('Inicializando componentes del juego...');
      
      this.setupControls();
      this.initObstacles();
      this.initLives();
      this.createScoreDisplay();
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
    // Crear 3 obstáculos iniciales más alejados (se reciclarán)
    // Primer obstáculo empieza fuera de pantalla a la derecha
    for (let i = 0; i < 3; i++) {
      const obstacle = new Obstacle(this.gameContent, 900 + (i * this.obstacleSpacing));
      this.obstacles.push(obstacle);
    }
  }

  initLives() {
    // Inicializar sistema de vidas
    this.livesManager = new LivesManager(this.gameContent, 3);
  }

  createScoreDisplay() {
    // Crear display de puntaje
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.style.position = 'absolute';
    this.scoreDisplay.style.top = '20px';
    this.scoreDisplay.style.left = '50%';
    this.scoreDisplay.style.transform = 'translateX(-50%)';
    this.scoreDisplay.style.fontSize = '48px';
    this.scoreDisplay.style.fontWeight = 'bold';
    this.scoreDisplay.style.color = 'var(--rushgames-primary)';
    this.scoreDisplay.style.textShadow = '0 0 10px rgba(126, 211, 33, 0.5)';
    this.scoreDisplay.style.zIndex = '20';
    this.scoreDisplay.style.fontFamily = 'var(--text-title)';
    this.scoreDisplay.textContent = '0';
    this.gameContent.appendChild(this.scoreDisplay);
  }

  updateScore() {
    this.scoreDisplay.textContent = this.score;
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
        this.score++;
        this.updateScore();
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
    console.log('Game Over! Score:', this.score);
    
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
        Score: ${this.score}
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
    this.score = 0;
    this.updateScore();
    
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