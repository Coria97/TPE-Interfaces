// power-up.js - Sistema de power-ups

export default class PowerUp {
  constructor(gameContainer, x, type = 'heart') {
    this.gameContainer = gameContainer;
    this.x = x;
    this.type = type;
    
    // Configuración según el tipo
    if (type === 'coin') {
      this.width = 48; // 16px se le hace un escalado x3 para mejor visibilidad
      this.height = 48;
    } else {
      this.width = 64; // 32px se le hace un escalado x2 para mejor visibilidad
      this.height = 64;
    }
    
    this.speed = 2;
    this.active = true;
    this.collected = false;
    
    // Posición Y aleatoria
    this.y = 150 + Math.random() * 400; // Entre 150 y 550 para evitar extremos
    
    this.createElement();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = `power-up power-up-${this.type}`;
    this.element.style.position = 'absolute';
    this.element.style.width = this.width + 'px';
    this.element.style.height = this.height + 'px';
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    this.element.style.zIndex = '15';
    this.element.style.pointerEvents = 'none';
    
    if (this.type === 'heart') {
      this.element.style.backgroundImage = 'url("../../assets/flappy-bird/lives/heart-rotate32x32.png")';
      // El sprite tiene 384px de ancho (12 frames de 32px), escalamos a 768px (12 frames de 64px)
      this.element.style.backgroundSize = '768px 64px'; // 384px * 2 = 768px
      this.element.style.backgroundRepeat = 'no-repeat';
      this.element.style.backgroundPosition = '0 0';
      this.element.style.imageRendering = 'crisp-edges';
    } else if (this.type === 'coin') {
      this.element.style.backgroundImage = 'url("../../assets/flappy-bird/coin/coin-16x16.png")';
      // El sprite tiene 128px de ancho (8 frames de 16px), escalamos a 384px (8 frames de 48px)
      this.element.style.backgroundSize = '384px 48px'; // 128px * 3 = 384px
      this.element.style.backgroundRepeat = 'no-repeat';
      this.element.style.backgroundPosition = '0 0';
      this.element.style.imageRendering = 'crisp-edges';
    }
    
    this.gameContainer.appendChild(this.element);
  }

  update() {
    if (!this.active || this.collected) return;
    
    // Mover hacia la izquierda
    this.x -= this.speed;
  }

  getBounds() {
    // Hitbox para detección de colisiones
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  collect() {
    // Marcar como recolectado y mostrar animación
    if (this.collected) return;
    
    this.collected = true;
    this.active = false;
    
    // Animación de recolección
    if (this.element) {
      this.element.style.transition = 'all 0.3s ease-out';
      this.element.style.transform = 'scale(1.5) translateY(-50px)';
      this.element.style.opacity = '0';
      
      setTimeout(() => {
        this.destroy();
      }, 300);
    }
  }

  isOffScreen() {
    // Verificar si salió de la pantalla
    return this.x < -this.width;
  }

  isActive() {
    return this.active && !this.collected;
  }

  destroy() {
    this.active = false;
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

