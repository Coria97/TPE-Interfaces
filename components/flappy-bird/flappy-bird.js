import Obstacle from './obstacle.js';
import LivesManager from './lives-manager.js';
import Player from './player.js';
import CollisionManager from './collision-manager.js';
import ScoreManager from './score-manager.js';
import Renderer from './renderer.js';
import PowerUp from './power-up.js';
import AudioManager from './audio-manager.js';

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
      this.gameOverScreen = this.shadowRoot.querySelector('#game-over-screen');
      this.gameOverScoreValue = this.shadowRoot.querySelector('#game-over-score-value');
      this.gameOverHighScoreValue = this.shadowRoot.querySelector('#game-over-high-score-value');
      this.restartButton = this.shadowRoot.querySelector('#restart-button');
      
      // Inicializar jugador
      this.player = new Player(submarineElement);
      
      // Estado del juego
      this.isGameRunning = false;
      this.hasWon = false; // Nuevo: flag para saber si ganó
      this.winScore = 35; // Puntuación para ganar
      
      // Obstáculos
      this.obstacles = [];
      this.obstacleSpacing = 300;
      
      // Power-ups
      this.powerUps = [];
      this.powerUpSpawnChance = 0.20;
      this.powerUpMinDistance = 500;
      this.lastPowerUpX = 0;
      this.powerUpTypes = ['heart', 'coin'];
      
      // Sistema de vidas
      this.livesManager = null;
      
      // Sistema de colisiones
      this.collisionManager = new CollisionManager();
      
      // Sistema de puntuación
      this.scoreManager = null;
      
      // Sistema de renderizado
      this.renderer = null;
      
      // Sistema de audio
      this.audioManager = null;

      console.log('Inicializando componentes del juego...');
      
      this.setupControls();
      this.initObstacles();
      this.initLives();
      this.initScore();
      this.initRenderer();
      this.initAudio();
      this.setupGameOver();
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
    const scoreDisplayElement = this.shadowRoot.querySelector('#score-display');
    this.scoreManager = new ScoreManager(scoreDisplayElement);
  }

  initRenderer() {
    // Inicializar sistema de renderizado
    this.renderer = new Renderer(
      this.player,
      this.gameOverScreen,
      this.gameOverScoreValue,
      this.gameOverHighScoreValue
    );
  }

  initAudio() {
    // Inicializar sistema de audio
    this.audioManager = new AudioManager();
  }

  setupGameOver() {
    // Configurar evento del botón de reinicio
    if (this.restartButton) {
      this.restartButton.addEventListener('click', () => {
        this.hideGameOver();
        this.restart();
      });
    }
  }

  jump() {
    if (!this.isGameRunning) return;
    this.player.jump();
  }

  startGame() {
    this.isGameRunning = true;
    
    // Reproducir música de inicio
    if (this.audioManager) {
      this.audioManager.playGameStart();
    }
    
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
    
    // Actualizar obstáculos
    this.updateObstacles();
    
    // Actualizar power-ups
    this.updatePowerUps();
    
    // Renderizar todos los elementos
    this.renderer.renderAll(
      this.obstacles,
      this.livesManager.isInvulnerable(),
      this.powerUps
    );
    
    // Continuar el loop
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  updateObstacles() {
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
      if (obstacle.checkPassed(this.player.x)) {
        this.scoreManager.increment();
        
        // Verificar si ganó
        if (this.scoreManager.getScore() >= this.winScore && !this.hasWon) {
          this.winGame();
        }
      }
      
      // Reciclar obstáculo si salió de pantalla
      if (obstacle.isOffScreen()) {
        // Encontrar el obstáculo más a la derecha
        const maxX = Math.max(...this.obstacles.map(o => o.x));
        const newX = maxX + this.obstacleSpacing;
        obstacle.reset(newX);
        
        // Posibilidad de spawn de power-up
        this.trySpawnPowerUp(newX);
      }
    });
  }

  trySpawnPowerUp(obstacleX) {
    // Verificar si se puede spawnear un power-up
    const distanceFromLast = obstacleX - this.lastPowerUpX;
    
    if (distanceFromLast >= this.powerUpMinDistance && Math.random() < this.powerUpSpawnChance) {
      // Seleccionar tipo de power-up aleatoriamente
      const randomType = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
      const powerUp = new PowerUp(this.gameContent, obstacleX + 150, randomType);
      this.powerUps.push(powerUp);
      this.lastPowerUpX = obstacleX;
    }
  }

  updatePowerUps() {
    // Actualizar cada power-up
    this.powerUps.forEach((powerUp, index) => {
      powerUp.update();
      
      // Verificar colisión con el jugador
      if (this.collisionManager.checkPowerUpCollision(this.player, powerUp)) {
        this.handlePowerUpCollection(powerUp);
      }
      
      // Eliminar si salió de pantalla
      if (powerUp.isOffScreen()) {
        powerUp.destroy();
        this.powerUps.splice(index, 1);
      }
    });
  }

  handlePowerUpCollection(powerUp) {
    // Manejar la recolección de un power-up
    if (powerUp.type === 'heart') {
      const lifeGained = this.livesManager.gainLife();
      if (lifeGained) {
        powerUp.collect();
        
        // Reproducir sonido de ganar vida
        if (this.audioManager) {
          this.audioManager.playLifeUpSound();
        }
        
        console.log('¡Vida ganada! Vidas actuales:', this.livesManager.currentLives);
      } else {
        // Si ya tiene todas las vidas, el power-up pasa sin ser recolectado
        console.log('Vidas al máximo, power-up no recolectado');
      }
    } else if (powerUp.type === 'coin') {
      // Siempre se puede recolectar monedas
      powerUp.collect();
      this.scoreManager.increment(5); // Suma 5 puntos
      console.log('¡Moneda recolectada! +5 puntos. Score:', this.scoreManager.getScore());
    }
  }

  handleCollision() {
    // Manejar colisión con obstáculo
    const isDead = this.livesManager.loseLife();
    
    // Reproducir sonido de daño
    if (this.audioManager) {
      this.audioManager.playDamageSound();
    }
    
    // Efecto visual de colisión
    this.renderer.renderPlayerCollisionEffect();
    
    // Si murió completamente, game over
    if (isDead) {
      this.gameOver();
    } else {
      // Si aún tiene vidas, reposicionar el jugador
      this.player.reset();
      this.renderer.renderPlayer();
    }
  }

  gameOver() {
    if (!this.isGameRunning) return;
    
    this.isGameRunning = false;
    console.log('Game Over! Score:', this.scoreManager.getScore());
    
    // Reproducir música de game over
    if (this.audioManager) {
      this.audioManager.playGameEnd();
    }
    
    // Mostrar mensaje de game over
    this.showGameOver(false); // false = no ganó
  }

  winGame() {
    // El jugador ganó al llegar a 35 puntos
    if (!this.isGameRunning) return;
    
    this.isGameRunning = false;
    this.hasWon = true;
    console.log('¡Ganaste! Score:', this.scoreManager.getScore());
    
    // Reproducir música de game over (o puedes usar otra música si tienes)
    if (this.audioManager) {
      this.audioManager.playGameEnd();
    }
    
    // Mostrar mensaje de victoria
    this.showGameOver(true); // true = ganó
  }

  showGameOver(won = false) {
    // Mostrar la pantalla de game over con scores
    this.renderer.renderGameOver(
      this.scoreManager.getScore(),
      this.scoreManager.getHighScore(),
      won
    );
  }

  hideGameOver() {
    // Ocultar la pantalla de game over
    this.renderer.hideGameOver();
  }

  restart() {
    // Resetear estado
    this.player.reset();
    this.renderer.renderPlayer();
    this.scoreManager.reset();
    this.hasWon = false; // Resetear flag de victoria
    
    // Resetear vidas
    this.livesManager.reset();
    
    // Resetear obstáculos más alejados
    this.obstacles.forEach((obstacle, index) => {
      obstacle.reset(900 + (index * this.obstacleSpacing));
    });
    
    // Limpiar power-ups existentes
    this.powerUps.forEach(powerUp => powerUp.destroy());
    this.powerUps = [];
    this.lastPowerUpX = 0;
    
    // Reiniciar música
    if (this.audioManager) {
      this.audioManager.playGameStart();
    }
    
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
    
    // Destruir power-ups
    this.powerUps.forEach(powerUp => powerUp.destroy());
    this.powerUps = [];
    
    // Destruir sistema de vidas
    if (this.livesManager) {
      this.livesManager.destroy();
    }
    
    // Destruir sistema de puntuación
    if (this.scoreManager) {
      this.scoreManager.destroy();
    }
    
    // Destruir sistema de audio
    if (this.audioManager) {
      this.audioManager.destroy();
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
