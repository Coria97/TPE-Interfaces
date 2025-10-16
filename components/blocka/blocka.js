// ============================================
// BLOCKA GAME - PARTE 1: ESTRUCTURA BÁSICA
// ============================================

// ============================================
// CLASE PARA APLICAR FILTROS A IMÁGENES
// ============================================
class ImageFilter {
  // Aplicar escala de grises
  static grayscale(imageData) {
    const data = imageData.data;

    // Recorrer cada píxel (cada píxel = 4 valores: R, G, B, A)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]; // Red
      const g = data[i + 1]; // Green
      const b = data[i + 2]; // Blue
      // data[i + 3] es Alpha (transparencia) - no lo tocamos

      // Calcular promedio para convertir a gris
      const gray = (r + g + b) / 3;

      // Asignar el mismo valor a R, G y B
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    return imageData;
  }

  // Aplicar brillo (brightness)
  // factor > 1 = más brillante, factor < 1 = más oscuro
  static brightness(imageData, factor = 1.3) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Multiplicar cada canal por el factor
      data[i] = Math.min(255, data[i] * factor); // Red
      data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
      data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
      // Math.min asegura que no pasemos de 255
    }

    return imageData;
  }

  // Aplicar negativo (invertir colores)
  static invert(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Invertir cada canal: 255 - valor actual
      data[i] = 255 - data[i]; // Red
      data[i + 1] = 255 - data[i + 1]; // Green
      data[i + 2] = 255 - data[i + 2]; // Blue
    }

    return imageData;
  }

  // Método auxiliar para aplicar un filtro a una imagen
  static applyFilter(image, filterType) {
    // Crear un canvas temporal
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Dibujar la imagen en el canvas temporal
    tempCtx.drawImage(image, 0, 0);

    // Obtener los datos de píxeles
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Aplicar el filtro correspondiente
    switch (filterType) {
      case 'grayscale':
        ImageFilter.grayscale(imageData);
        break;
      case 'brightness':
        ImageFilter.brightness(imageData, 1.3); // 30% más brillante
        break;
      case 'invert':
        ImageFilter.invert(imageData);
        break;
      default:
        console.warn(`Filtro desconocido: ${filterType}`);
    }

    // Poner los datos modificados de vuelta en el canvas
    tempCtx.putImageData(imageData, 0, 0);

    // Crear una nueva imagen con el filtro aplicado
    const filteredImage = new Image();
    filteredImage.src = tempCanvas.toDataURL();

    return new Promise((resolve) => {
      filteredImage.onload = () => resolve(filteredImage);
    });
  }
}

// ============================================
// Clase que representa cada sub-imagen (cada cuarto de la imagen)
// ============================================
class SubImage {
  constructor(
    image,
    sourceX,
    sourceY,
    width,
    height,
    canvasX,
    canvasY,
    correctRotation,
    filterType = null
  ) {
    this.image = image; // Imagen completa
    this.originalImage = image; // Guardamos la imagen original (sin filtro)
    this.sourceX = sourceX; // Posición X en la imagen fuente
    this.sourceY = sourceY; // Posición Y en la imagen fuente
    this.width = width; // Ancho de la pieza
    this.height = height; // Alto de la pieza
    this.canvasX = canvasX; // Posición X en el canvas
    this.canvasY = canvasY; // Posición Y en el canvas
    this.correctRotation = correctRotation; // Rotación correcta (0, 90, 180, 270)
    this.currentRotation = 0; // Rotación actual (empieza en 0)
    this.filterType = filterType; // Tipo de filtro ('grayscale', 'brightness', 'invert', null)
    this.hasFilter = false; // Si tiene filtro aplicado

    // Rotación inicial aleatoria (para hacer el juego difícil)
    this.randomizeRotation();
  }

  // Establece una rotación aleatoria diferente a la correcta
  randomizeRotation() {
    const possibleRotations = [0, 90, 180, 270];
    // Filtrar la rotación correcta para que no aparezca al inicio
    const wrongRotations = possibleRotations.filter((r) => r !== this.correctRotation);
    // Elegir una rotación aleatoria de las incorrectas
    const randomIndex = Math.floor(Math.random() * wrongRotations.length);
    this.currentRotation = wrongRotations[randomIndex];
    console.log(`🔄 Pieza inicializada con rotación: ${this.currentRotation}°`);
  }

  // Rotar la imagen hacia la izquierda (-90 grados)
  rotateLeft() {
    this.currentRotation = (this.currentRotation - 90 + 360) % 360;
    console.log(`Rotación actual: ${this.currentRotation}°`);
  }

  // Rotar la imagen hacia la derecha (+90 grados)
  rotateRight() {
    this.currentRotation = (this.currentRotation + 90) % 360;
    console.log(`Rotación actual: ${this.currentRotation}°`);
  }

  // Verificar si la rotación es correcta
  isCorrect() {
    return this.currentRotation === this.correctRotation;
  }

  // Aplicar filtro a esta sub-imagen
  async applyFilter() {
    if (this.filterType && !this.hasFilter) {
      console.log(`🎨 Aplicando filtro "${this.filterType}" a pieza`);
      this.image = await ImageFilter.applyFilter(this.originalImage, this.filterType);
      this.hasFilter = true;
    }
  }

  // Remover filtro (mostrar imagen original)
  removeFilter() {
    if (this.hasFilter) {
      console.log(`🧹 Removiendo filtro de pieza`);
      this.image = this.originalImage;
      this.hasFilter = false;
    }
  }

  // Dibujar la sub-imagen en el canvas con su rotación actual
  draw(ctx) {
    ctx.save(); // Guardar el estado del canvas

    // Mover el origen al centro de donde queremos dibujar
    const centerX = this.canvasX + this.width / 2;
    const centerY = this.canvasY + this.height / 2;
    ctx.translate(centerX, centerY);

    // Rotar el canvas
    ctx.rotate((this.currentRotation * Math.PI) / 180);

    // Dibujar la imagen centrada en el nuevo origen
    ctx.drawImage(
      this.image,
      this.sourceX, // X en la imagen fuente
      this.sourceY, // Y en la imagen fuente
      this.width, // Ancho del recorte
      this.height, // Alto del recorte
      -this.width / 2, // X en el canvas (centrado)
      -this.height / 2, // Y en el canvas (centrado)
      this.width, // Ancho en el canvas
      this.height // Alto en el canvas
    );

    ctx.restore(); // Restaurar el estado del canvas
  }
}

// ============================================
// Clase principal del juego
// ============================================
class BlockaGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvasSize = this.canvas.width;

    // Variables separadas para divisiones verticales y horizontales
    this.difficulty = 6; // Default difficulty
    this.rows = this.calculateRows(this.difficulty); // Divisiones verticales
    this.cols = this.calculateCols(this.difficulty); // Divisiones horizontales
    this.pieceWidth = this.canvasSize / this.cols; // Ancho de cada pieza
    this.pieceHeight = this.canvasSize / this.rows; // Alto de cada pieza

    this.currentImage = null;
    this.subImages = [];
    this.isPlaying = false;
    this.currentLevel = 0; // Nivel actual (empezamos en 0)

    // Sistema de timer
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.levelRecords = {}; // Récords por nivel

    // Configuración de filtros por nivel
    // Nivel 0: sin filtro, Nivel 1: grayscale, Nivel 2: brightness, Nivel 3+: invert
    this.levelFilters = [
      null, // Nivel 1: Sin filtro (para practicar)
      'grayscale', // Nivel 2: Escala de grises
      'brightness', // Nivel 3: Brillo
      'invert', // Nivel 4: Negativo
      'grayscale', // Nivel 5: Repite grayscale
      'brightness', // Nivel 6: Repite brightness
    ];

    // Banco de imágenes placeholder (luego lo reemplazarás con tus imágenes)
    this.imageBank = [
      './assets/gl-1.jpg',
      './assets/gl-2.jpg',
      './assets/gl-3.jpg',
      './assets/gl-4.jpg',
      './assets/gl-5.jpg',
      './assets/gl-6.jpg',
    ];

    this.setupEventListeners();
  }

  // Configurar los event listeners
  setupEventListeners() {
    // Click izquierdo y derecho en el canvas
    this.canvas.addEventListener('click', (e) => this.handleClick(e, 'left'));
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // Prevenir menú contextual
      this.handleClick(e, 'right');
    });

    // Botón de comenzar
    const btnStart = document.getElementById('btnStart');
    if (btnStart) {
      btnStart.addEventListener('click', () => this.startGame());
    }

    // Selector de dificultad
    const difficultySelect = document.getElementById('difficultySelect');
    if (difficultySelect) {
      difficultySelect.addEventListener('change', (e) => {
        this.setDifficulty(parseInt(e.target.value));
      });
    }

    // Botones de victoria (se configuran cuando se muestran)
    const btnMenu = document.getElementById('btnMenu');
    const btnNext = document.getElementById('btnNext');

    if (btnMenu) {
      btnMenu.addEventListener('click', () => this.goToMenu());
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => this.nextLevel());
    }
  }

  // ============================================
  // MÉTODOS DE DIFICULTAD
  // ============================================

  calculateRows(difficulty) {
    // Calcular filas de manera más cuadrada para evitar piezas muy rectangulares
    switch (difficulty) {
      case 4:
        return 2; // 2x2 (perfecto cuadrado)
      case 6:
        return 3; // 3x2 (más cuadrado que 2x3)
      case 8:
        return 3; // 3x3 (casi cuadrado, usando 8 de 9)
      default:
        return Math.ceil(Math.sqrt(difficulty));
    }
  }

  calculateCols(difficulty) {
    // Calcular columnas de manera más cuadrada para evitar piezas muy rectangulares
    switch (difficulty) {
      case 4:
        return 2; // 2x2 (perfecto cuadrado)
      case 6:
        return 2; // 3x2 (más cuadrado que 2x3)
      case 8:
        return 3; // 3x3 (casi cuadrado, usando 8 de 9)
      default:
        return Math.ceil(difficulty / this.calculateRows(difficulty));
    }
  }

  setDifficulty(newDifficulty) {
    if (this.isPlaying) {
      console.log('No se puede cambiar la dificultad durante el juego');
      return;
    }

    this.difficulty = newDifficulty;
    this.rows = this.calculateRows(this.difficulty);
    this.cols = this.calculateCols(this.difficulty);
    this.pieceWidth = this.canvasSize / this.cols;
    this.pieceHeight = this.canvasSize / this.rows;

    console.log(
      `🎯 Dificultad cambiada a ${this.difficulty} divisiones (${this.rows}x${this.cols})`
    );
    console.log(`📏 Tamaño de piezas: ${this.pieceWidth}x${this.pieceHeight}`);

    // Limpiar el canvas y reinicializar sub-imágenes
    this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    this.subImages = [];
  }

  // ============================================
  // MÉTODOS DEL TIMER
  // ============================================

  startTimer() {
    this.timerSeconds = 0;
    this.updateTimerDisplay();

    // Iniciar intervalo que incrementa cada segundo
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);

    console.log('⏱️ Timer iniciado');
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      console.log(`⏱️ Timer detenido: ${this.formatTime(this.timerSeconds)}`);
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateTimerDisplay() {
    const timerValue = document.getElementById('timerValue');
    if (timerValue) {
      timerValue.textContent = this.formatTime(this.timerSeconds);
    }
  }

  // Iniciar el juego
  async startGame() {
    console.log('🎮 Iniciando nivel ' + (this.currentLevel + 1) + '...');
    this.isPlaying = true;

    // Ocultar panel de victoria si está visible
    this.hideVictoryPanel();

    // Deshabilitar botón de start
    const btnStart = document.getElementById('btnStart');
    if (btnStart) btnStart.disabled = true;

    // Seleccionar imagen según el nivel actual
    const imageIndex = this.currentLevel % this.imageBank.length;
    const imageUrl = this.imageBank[imageIndex];

    console.log(`📷 Cargando imagen ${imageIndex + 1}/${this.imageBank.length}: ${imageUrl}`);

    // Cargar la imagen
    await this.loadImage(imageUrl);

    // Actualizar display del nivel
    const levelValue = document.getElementById('levelValue');
    if (levelValue) levelValue.textContent = this.currentLevel + 1;

    // Crear las 4 sub-imágenes (con filtros)
    await this.createSubImages();

    // Iniciar el timer
    this.startTimer();

    // Dibujar el juego
    this.draw();
  }

  // Cargar una imagen y redimensionarla al tamaño del canvas
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Para poder manipular píxeles
      img.onload = () => {
        console.log(`✅ Imagen cargada: ${img.width}x${img.height}`);

        // Crear una imagen cuadrada del tamaño del canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasSize;
        tempCanvas.height = this.canvasSize;
        const tempCtx = tempCanvas.getContext('2d');

        // Calcular cómo hacer que la imagen encaje (cover mode)
        const scale = Math.max(this.canvasSize / img.width, this.canvasSize / img.height);

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (this.canvasSize - scaledWidth) / 2;
        const y = (this.canvasSize - scaledHeight) / 2;

        // Dibujar la imagen escalada y centrada
        tempCtx.fillStyle = '#000000';
        tempCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        tempCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Crear una nueva imagen desde el canvas temporal
        const processedImg = new Image();
        processedImg.onload = () => {
          this.currentImage = processedImg;
          console.log(`✅ Imagen procesada a ${this.canvasSize}x${this.canvasSize}`);
          resolve();
        };
        processedImg.src = tempCanvas.toDataURL();
      };
      img.onerror = () => {
        console.error('❌ Error cargando imagen');
        reject();
      };
      img.src = url;
    });
  }

  // Crear las sub-imágenes dividiendo la imagen principal dinámicamente
  async createSubImages() {
    this.subImages = [];

    console.log(`🔨 Creando ${this.difficulty} sub-imágenes (${this.rows}x${this.cols})...`);

    // Obtener el filtro para este nivel
    const currentFilter = this.levelFilters[this.currentLevel % this.levelFilters.length];
    console.log(`🎨 Filtro del nivel: ${currentFilter || 'ninguno'}`);

    // Crear sub-imágenes dinámicamente basado en rows y cols
    let pieceCount = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        // Para 8 divisiones (3x3), omitir la pieza central (1,1)
        if (this.difficulty === 8 && row === 1 && col === 1) {
          continue;
        }

        const sourceX = col * this.pieceWidth;
        const sourceY = row * this.pieceHeight;
        const canvasX = col * this.pieceWidth;
        const canvasY = row * this.pieceHeight;

        this.subImages.push(
          new SubImage(
            this.currentImage,
            sourceX,
            sourceY, // Posición en imagen fuente
            this.pieceWidth, // Ancho de la pieza
            this.pieceHeight, // Alto de la pieza
            canvasX,
            canvasY, // Posición en canvas
            0, // Rotación correcta
            currentFilter // Filtro
          )
        );

        pieceCount++;
        if (pieceCount >= this.difficulty) break;
      }
      if (pieceCount >= this.difficulty) break;
    }

    // Aplicar filtros a todas las sub-imágenes
    console.log('🎨 Aplicando filtros...');
    await Promise.all(this.subImages.map((subImg) => subImg.applyFilter()));

    console.log(`✅ ${this.difficulty} sub-imágenes creadas`);

    // Debug: mostrar estado de rotaciones
    console.log('📊 Estado de rotaciones:');
    this.subImages.forEach((subImg, i) => {
      console.log(
        `  Pieza ${i}: ${subImg.currentRotation}° (correcta: ${subImg.correctRotation}°) - Filtro: ${subImg.filterType || 'ninguno'}`
      );
    });
  }

  // Manejar clicks en el canvas
  handleClick(event, button) {
    if (!this.isPlaying) return;

    // Obtener coordenadas del click relativas al canvas
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determinar en qué cuadrante se hizo click
    const col = Math.floor(x / this.pieceWidth);
    const row = Math.floor(y / this.pieceHeight);
    const index = row * this.cols + col; // Índice de la pieza dinámico

    console.log(`🖱️ Click ${button} en pieza ${index} (fila: ${row}, col: ${col})`);

    // Rotar la pieza correspondiente
    if (index >= 0 && index < this.subImages.length) {
      if (button === 'left') {
        this.subImages[index].rotateLeft();
      } else {
        this.subImages[index].rotateRight();
      }

      // Redibujar
      this.draw();

      // Verificar si ganó
      this.checkVictory();
    }
  }

  // Verificar si todas las piezas están en la posición correcta
  checkVictory() {
    const allCorrect = this.subImages.every((subImg) => subImg.isCorrect());

    if (allCorrect) {
      console.log('🎉 ¡NIVEL COMPLETADO!');
      this.isPlaying = false;

      // Detener el timer
      this.stopTimer();

      // Guardar récord del nivel
      const levelKey = `level_${this.currentLevel}`;
      if (!this.levelRecords[levelKey] || this.timerSeconds < this.levelRecords[levelKey]) {
        this.levelRecords[levelKey] = this.timerSeconds;
        console.log(`🏆 ¡Nuevo récord para nivel ${this.currentLevel + 1}!`);
      }

      // Remover filtros para mostrar la imagen original
      console.log('🧹 Removiendo filtros...');
      this.subImages.forEach((subImg) => subImg.removeFilter());
      this.draw(); // Redibujar sin filtros

      // Mostrar panel de victoria
      setTimeout(() => {
        this.showVictoryPanel();
      }, 500); // Esperar medio segundo para que vean la imagen sin filtros
    }
  }

  // Mostrar panel de victoria
  showVictoryPanel() {
    const victoryPanel = document.getElementById('victoryControls');
    const finalTime = document.getElementById('finalTime');

    if (victoryPanel && finalTime) {
      finalTime.textContent = this.formatTime(this.timerSeconds);
      victoryPanel.style.display = 'flex';

      // Actualizar texto del botón "siguiente" si no hay más niveles
      const btnNext = document.getElementById('btnNext');
      if (btnNext) {
        if (this.currentLevel >= this.imageBank.length - 1) {
          btnNext.textContent = 'Reiniciar';
        } else {
          btnNext.textContent = 'Siguiente Nivel';
        }
      }
    }
  }

  // Ocultar panel de victoria
  hideVictoryPanel() {
    const victoryPanel = document.getElementById('victoryControls');
    if (victoryPanel) {
      victoryPanel.style.display = 'none';
    }
  }

  // Ir al menú principal (reiniciar)
  goToMenu() {
    this.currentLevel = 0;
    this.hideVictoryPanel();

    const btnStart = document.getElementById('btnStart');
    if (btnStart) btnStart.disabled = false;

    // Limpiar canvas
    this.ctx.fillStyle = '#14171b';
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Resetear timer display
    const levelValue = document.getElementById('levelValue');
    if (levelValue) levelValue.textContent = '1';

    this.timerSeconds = 0;
    this.updateTimerDisplay();

    console.log('🏠 Volviendo al menú principal');
  }

  // Pasar al siguiente nivel
  nextLevel() {
    this.currentLevel++;

    // Si llegamos al final, reiniciar
    if (this.currentLevel >= this.imageBank.length) {
      this.currentLevel = 0;
      console.log('🎊 ¡Completaste todos los niveles! Reiniciando...');
    }

    this.startGame();
  }

  // Dibujar todo el juego
  draw() {
    // Limpiar canvas
    this.ctx.fillStyle = '#14171b'; // Color de fondo
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Dibujar las 4 sub-imágenes
    this.subImages.forEach((subImg) => {
      subImg.draw(this.ctx);
    });

    // Dibujar líneas de separación entre piezas
    this.drawGrid();
  }

  // Dibujar grid visual para separar las piezas dinámicamente
  drawGrid() {
    this.ctx.strokeStyle = '#2b323a';
    this.ctx.lineWidth = 2;

    // Líneas verticales
    for (let i = 1; i < this.cols; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.pieceWidth, 0);
      this.ctx.lineTo(i * this.pieceWidth, this.canvasSize);
      this.ctx.stroke();
    }

    // Líneas horizontales
    for (let i = 1; i < this.rows; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.pieceHeight);
      this.ctx.lineTo(this.canvasSize, i * this.pieceHeight);
      this.ctx.stroke();
    }
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================
let game;

window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando Blocka Game...');
  game = new BlockaGame('blockaCanvas');
  console.log('✅ Juego listo. Presiona "Comenzar" para jugar.');
});
