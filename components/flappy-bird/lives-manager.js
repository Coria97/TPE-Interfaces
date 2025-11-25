// lives-manager.js - Manejo del sistema de vidas

export default class LivesManager {
  constructor(gameContainer, maxLives = 3) {
    this.gameContainer = gameContainer;
    this.maxLives = maxLives;
    this.currentLives = maxLives;
    this.hearts = [];
    this.invulnerable = false; // Flag de invulnerabilidad
    this.invulnerableTime = 3000; // 3 segundos de invulnerabilidad después de perder una vida
    
    this.createHeartsDisplay();
  }

  createHeartsDisplay() {
    // Contenedor de corazones
    this.heartsContainer = document.createElement('div');
    this.heartsContainer.style.position = 'absolute';
    this.heartsContainer.style.top = '20px';
    this.heartsContainer.style.right = '20px';
    this.heartsContainer.style.display = 'flex';
    this.heartsContainer.style.gap = '10px';
    this.heartsContainer.style.zIndex = '20';
    
    // Crear corazones individuales
    for (let i = 0; i < this.maxLives; i++) {
      const heart = this.createHeart();
      this.hearts.push(heart);
      this.heartsContainer.appendChild(heart);
    }
    
    this.gameContainer.appendChild(this.heartsContainer);
  }

  createHeart() {
    const heart = document.createElement('div');
    heart.style.width = '40px';
    heart.style.height = '40px';
    heart.style.backgroundImage = 'url("../../assets/flappy-bird/lives/heart.png")';
    heart.style.backgroundSize = 'contain';
    heart.style.backgroundRepeat = 'no-repeat';
    heart.style.backgroundPosition = 'center';
    heart.style.transition = 'all 0.3s ease';
    heart.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
    heart.style.imageRendering = 'crisp-edges';
    heart.dataset.state = 'full'; // full, empty
    
    return heart;
  }

  loseLife() {
    //Si está invulnerable o no tiene vidas, no pierde vida
    if (this.invulnerable || this.currentLives <= 0) {
      return false;
    }

    this.currentLives--;
    
    // Actualizar visual del corazón perdido
    const lostHeartIndex = this.currentLives; // El índice del corazón que se pierde
    const heart = this.hearts[lostHeartIndex];
    
    // Animación de pérdida
    this.animateHeartLoss(heart);
    
    // Cambiar a corazón vacío
    setTimeout(() => {
      heart.style.backgroundImage = 'url("../../assets/flappy-bird/lives/heart-empty.png")';
      heart.dataset.state = 'empty';
    }, 300);
    
    // Activar invulnerabilidad temporal
    this.setInvulnerable(true);
    setTimeout(() => {
      this.setInvulnerable(false);
    }, this.invulnerableTime);
    
    // Retornar si murió completamente
    return this.currentLives <= 0;
  }

  animateHeartLoss(heart) {
    // Animación de corazón al perderse
    heart.style.transform = 'scale(1.5) rotate(20deg)';
    heart.style.opacity = '0.5';
    
    setTimeout(() => {
      heart.style.transform = 'scale(1) rotate(0deg)';
      heart.style.opacity = '1';
    }, 300);
  }

  setInvulnerable(state) {
    this.invulnerable = state;
    
    // Efecto visual de invulnerabilidad (parpadeo de corazones)
    if (state) {
      this.heartsContainer.style.animation = 'blink 0.3s infinite';
    } else {
      this.heartsContainer.style.animation = 'none';
    }
  }

  isInvulnerable() {
    return this.invulnerable;
  }

  gainLife() {
    // Ganar una vida (si no está al máximo)
    if (this.currentLives >= this.maxLives) {
      return false; // Ya tiene todas las vidas
    }

    const gainedHeartIndex = this.currentLives;
    const heart = this.hearts[gainedHeartIndex];
    
    // Cambiar a corazón lleno
    heart.style.backgroundImage = 'url("../../assets/flappy-bird/lives/heart.png")';
    heart.dataset.state = 'full';
    
    // Animación de ganancia
    this.animateHeartGain(heart);
    
    this.currentLives++;
    
    return true;
  }

  animateHeartGain(heart) {
    // Animación de corazón al ganarse
    heart.style.transform = 'scale(0)';
    heart.style.opacity = '0';
    
    setTimeout(() => {
      heart.style.transform = 'scale(1.5)';
      heart.style.opacity = '1';
    }, 50);
    
    setTimeout(() => {
      heart.style.transform = 'scale(1)';
    }, 300);
  }

  reset() {
    // Resetear todas las vidas
    this.currentLives = this.maxLives;
    this.invulnerable = false;
    
    this.hearts.forEach(heart => {
      heart.style.backgroundImage = 'url("../../assets/flappy-bird/lives/heart.png")';
      heart.dataset.state = 'full';
      heart.style.transform = 'scale(1)';
      heart.style.opacity = '1';
    });
    
    this.heartsContainer.style.animation = 'none';
  }

  destroy() {
    // Limpiar el display
    if (this.heartsContainer && this.heartsContainer.parentNode) {
      this.heartsContainer.parentNode.removeChild(this.heartsContainer);
    }
  }
}
