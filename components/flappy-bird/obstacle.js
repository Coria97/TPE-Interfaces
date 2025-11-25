export default class Obstacle {
  constructor(gameContainer, initialX = 800) {
    this.gameContainer = gameContainer;
    this.x = initialX;
    this.width = 120; // Ancho del obstáculo
    this.gap = 190; // Espacio entre tuberías superior e inferior
    this.speed = 3; // Velocidad de movimiento
    this.passed = false; // Si el submarino ya pasó este obstáculo
    
    // Obtener la ruta base correcta
    this.basePath = this.getBasePath();
    
    // Altura aleatoria para el gap
    this.gapY = Math.random() * (450 - 200) + 200; // Entre 200 y 650
    
    // Seleccionar imagen de roca aleatoria (1-4)
    this.rockType = Math.floor(Math.random() * 4) + 1;
    this.rockImage = `${this.basePath}/assets/flappy-bird/obstacles/rocks-${this.rockType}.png`;
    
    // Hitbox más pequeña que la imagen visible para facilitar el paso
    this.hitboxPadding = 60; // 60px de margen a cada lado
    
    this.createElement();
  }

  getBasePath() {
    // Obtener la ruta base del proyecto
    const path = window.location.pathname;
    const base = path.substring(0, path.lastIndexOf('/'));
    return base || '.';
  }

  createElement() {
    // Crear contenedor del obstáculo
    this.element = document.createElement('div');
    this.element.className = 'obstacle';
    this.element.style.position = 'absolute';
    this.element.style.left = this.x + 'px';
    this.element.style.width = this.width + 'px';
    this.element.style.height = '100%';
    this.element.style.zIndex = '9';
    this.element.style.pointerEvents = 'none';
    
    // Crear roca superior
    this.topPipe = document.createElement('div');
    this.topPipe.className = 'pipe pipe-top';
    this.topPipe.style.position = 'absolute';
    this.topPipe.style.top = '0';
    this.topPipe.style.width = '100%';
    this.topPipe.style.height = this.gapY + 'px';
    this.topPipe.style.backgroundImage = `url("${this.rockImage}")`;
    this.topPipe.style.backgroundSize = '100% 100%';
    this.topPipe.style.backgroundRepeat = 'no-repeat';
    this.topPipe.style.backgroundPosition = 'center';
    this.topPipe.style.transform = 'scaleY(-1)'; // Invertir verticalmente
    this.topPipe.style.filter = 'brightness(0.85)';
    
    // Crear roca inferior
    this.bottomPipe = document.createElement('div');
    this.bottomPipe.className = 'pipe pipe-bottom';
    this.bottomPipe.style.position = 'absolute';
    this.bottomPipe.style.bottom = '0';
    this.bottomPipe.style.width = '100%';
    this.bottomPipe.style.height = (700 - this.gapY - this.gap) + 'px';
    this.bottomPipe.style.backgroundImage = `url("${this.rockImage}")`;
    this.bottomPipe.style.backgroundSize = '100% 100%'; // Estirar completamente la imagen
    this.bottomPipe.style.backgroundRepeat = 'no-repeat';
    this.bottomPipe.style.backgroundPosition = 'center';
    this.bottomPipe.style.filter = 'brightness(0.85)';
    
    // Agregar tuberías al contenedor
    this.element.appendChild(this.topPipe);
    this.element.appendChild(this.bottomPipe);
    
    // Agregar al DOM
    this.gameContainer.appendChild(this.element);
  }

  update() {
    // Actualizar la posición física del obstáculo
    this.x -= this.speed;
  }

  isOffScreen() {
    // Verificar si el obstáculo salió completamente de la pantalla
    return this.x + this.width < 0;
  }

  reset(newX = 900) {
    // Resetear el obstáculo para reutilizarlo
    this.x = newX;
    this.passed = false;
    this.gapY = Math.random() * (450 - 200) + 200;
    
    // Cambiar a una roca aleatoria diferente
    this.rockType = Math.floor(Math.random() * 4) + 1;
    this.rockImage = `${this.basePath}/assets/flappy-bird/obstacles/rocks-${this.rockType}.png`;
    
    // Actualizar imágenes y alturas
    this.topPipe.style.backgroundImage = `url("${this.rockImage}")`;
    this.bottomPipe.style.backgroundImage = `url("${this.rockImage}")`;
    this.topPipe.style.height = this.gapY + 'px';
    this.bottomPipe.style.height = (700 - this.gapY - this.gap) + 'px';
  }

  checkPassed(submarineX) {
    // Verificar si el submarino pasó el obstáculo
    if (!this.passed && submarineX > this.x + this.width) {
      this.passed = true;
      return true;
    }
    return false;
  }

  destroy() {
    // Remover el elemento del DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}