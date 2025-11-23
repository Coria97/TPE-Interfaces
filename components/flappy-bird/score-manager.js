export default class ScoreManager {
  constructor(scoreDisplayElement) {
    this.scoreDisplay = scoreDisplayElement;
    this.score = 0;
    this.highScore = this.loadHighScore();
    
    this.updateDisplay();
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
    // El display se maneja en el HTML, no necesita limpieza
    this.scoreDisplay = null;
  }
}

