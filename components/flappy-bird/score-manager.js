export default class ScoreManager {
  constructor(gameContainer) {
    this.gameContainer = gameContainer;
    this.score = 0;
    this.highScore = this.loadHighScore();
    
    this.createScoreDisplay();
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
    this.gameContainer.appendChild(this.scoreDisplay);
  }

  increment() {
    // Incrementa el score en 1
    this.score++;
    this.updateDisplay();
    
    // Verificar si es un nuevo récord
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  incrementBy(amount) {
    // Incrementa el score por una cantidad específica
    this.score += amount;
    this.updateDisplay();
    
    // Verificar si es un nuevo récord
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  reset() {
    // Resetea el score a 0
    this.score = 0;
    this.updateDisplay();
  }

  getScore() {
    // Obtiene el score actual
    return this.score;
  }

  getHighScore() {
    // Obtiene el high score
    return this.highScore;
  }

  updateDisplay() {
    // Actualiza el display visual del score
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = this.score;
    }
  }

  loadHighScore() {
    // Carga el high score desde localStorage
    try {
      const saved = localStorage.getItem('flappy-bird-high-score');
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      console.warn('No se pudo cargar el high score:', error);
      return 0;
    }
  }

  saveHighScore() {
    // Guarda el high score en localStorage
    try {
      localStorage.setItem('flappy-bird-high-score', this.highScore.toString());
    } catch (error) {
      console.warn('No se pudo guardar el high score:', error);
    }
  }

  destroy() {
    // Limpia el display
    if (this.scoreDisplay && this.scoreDisplay.parentNode) {
      this.scoreDisplay.parentNode.removeChild(this.scoreDisplay);
    }
  }
}

