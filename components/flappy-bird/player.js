export default class Player {
  constructor(submarineElement) {
    this.element = submarineElement;
    
    // Configuración física
    this.initialY = 350;
    this.x = 150;
    this.size = 38;
    this.gravity = 0.6;
    this.jumpForce = -12;
    this.minY = 0;
    this.maxY = 650;
    
    // Estado físico
    this.y = this.initialY;
    this.velocity = 0;
    
    // Estado del juego
    this.isActive = false;
  }

  jump() {
    // Movimiento vertical 
    if (!this.isActive) return;
    
    this.velocity = this.jumpForce;
    
    // Animación de impulso
    this.element.classList.add('flapping');
    setTimeout(() => {
      this.element.classList.remove('flapping');
    }, 300);
  }

  update() {
    // Actualiza la física del jugador (gravedad y posición)
    if (!this.isActive) return;
    
    // Aplicar gravedad
    this.velocity += this.gravity;
    this.y += this.velocity;
    
    // Verificar límites
    this.checkBounds();
  }

  checkBounds() {
    // Verifica y corrige los límites del jugador
    const collisions = {
      top: false,
      bottom: false
    };
    
    // Verificar límite superior
    if (this.y < this.minY) {
      this.y = this.minY;
      this.velocity = 0;
      collisions.top = true;
    }
    
    // Verificar límite inferior
    if (this.y > this.maxY) {
      this.y = this.maxY;
      this.velocity = 0;
      collisions.bottom = true;
    }
    
    return collisions;
  }

  render() {
    // Actualiza la posición visual del jugador en el DOM
    if (this.element) {
      this.element.style.top = this.y + 'px';
    }
  }

  applyInvulnerabilityEffect(isInvulnerable) {
    // Aplica efecto visual de invulnerabilidad
    if (!this.element) return;
    
    if (isInvulnerable) {
      this.element.style.opacity = Math.sin(Date.now() / 100) > 0 ? '1' : '0.5';
    } else {
      this.element.style.opacity = '1';
    }
  }

  applyCollisionEffect() {
    // Aplica efecto visual de colisión
    if (!this.element) return;
    
    this.element.style.filter = 'brightness(2) hue-rotate(90deg)';
    setTimeout(() => {
      this.element.style.filter = 'none';
    }, 200);
  }

  getX() {
    // Obtiene la posición X del jugador
    return this.x;
  }

  getY() {
    // Obtiene la posición Y del jugador
    return this.y;
  }

  getSize() {
    // Obtiene el tamaño del jugador
    return this.size;
  }

  getBounds() {
    // Obtiene la posición y tamaño del jugador para detección de colisiones
    return {
      x: this.x,
      y: this.y,
      size: this.size
    };
  }

  reset() {
    // Resetea la posición y velocidad del jugador
    this.y = this.initialY;
    this.velocity = 0;
    this.render();
  }

  activate() {
    // Activa el jugador (permite movimiento)
    this.isActive = true;
  }

  deactivate() {
    // Desactiva el jugador (detiene movimiento)
    this.isActive = false;
  }

  
  destroy() {
    // Destruye el jugador (detiene movimiento)
    this.deactivate();
    this.element = null;
  }
}

