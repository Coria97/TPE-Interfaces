export default class Renderer {
  constructor(player, gameOverScreen, gameOverScoreValue, gameOverHighScoreValue) {
    this.player = player;
    this.gameOverScreen = gameOverScreen;
    this.gameOverScoreValue = gameOverScoreValue;
    this.gameOverHighScoreValue = gameOverHighScoreValue;
  }

  renderPlayer() {
    // Renderiza la posición del jugador
    if (this.player && this.player.element) {
      this.player.element.style.top = this.player.y + 'px';
    }
  }

  renderPlayerInvulnerability(isInvulnerable) {
    // Renderiza el efecto visual de invulnerabilidad
    if (!this.player || !this.player.element) return;
    
    if (isInvulnerable) {
      this.player.element.style.opacity = Math.sin(Date.now() / 100) > 0 ? '1' : '0.5';
    } else {
      this.player.element.style.opacity = '1';
    }
  }

  renderPlayerCollisionEffect() {
    // Renderiza el efecto visual de colisión
    if (!this.player || !this.player.element) return;
    
    this.player.element.style.filter = 'brightness(2) hue-rotate(90deg)';
    setTimeout(() => {
      if (this.player && this.player.element) {
        this.player.element.style.filter = 'none';
      }
    }, 200);
  }

  renderObstacles(obstacles) {
    // Renderiza todos los obstáculos (actualiza sus posiciones visuales)
    obstacles.forEach(obstacle => {
      if (obstacle && obstacle.element) {
        obstacle.element.style.left = obstacle.x + 'px';
      }
    });
  }

  renderPowerUps(powerUps) {
    // Renderiza todos los power-ups (actualiza sus posiciones visuales)
    powerUps.forEach(powerUp => {
      if (powerUp && powerUp.element && powerUp.isActive()) {
        powerUp.element.style.left = powerUp.x + 'px';
      }
    });
  }

  renderGameOver(score, highScore) {
    // Actualiza y muestra la pantalla de game over
    if (this.gameOverScoreValue) {
      this.gameOverScoreValue.textContent = score;
    }
    
    if (this.gameOverHighScoreValue) {
      this.gameOverHighScoreValue.textContent = highScore;
    }
    
    if (this.gameOverScreen) {
      this.gameOverScreen.style.display = 'block';
    }
  }

  hideGameOver() {
    // Oculta la pantalla de game over
    if (this.gameOverScreen) {
      this.gameOverScreen.style.display = 'none';
    }
  }

  renderAll(obstacles, isInvulnerable, powerUps) {
    // Renderiza todos los elementos del juego
    this.renderPlayer();
    this.renderPlayerInvulnerability(isInvulnerable);
    this.renderObstacles(obstacles);
    this.renderPowerUps(powerUps);
  }
}

