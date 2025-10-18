// ============================================
// BLOCKA GAME - LÓGICA (ahora exportada como initBlocka(root))
// ============================================

class ImageFilter {
  static grayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const gray = (r + g + b) / 3;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    return imageData;
  }

  static brightness(imageData, factor = 1.3) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);
      data[i + 1] = Math.min(255, data[i + 1] * factor);
      data[i + 2] = Math.min(255, data[i + 2] * factor);
    }
    return imageData;
  }

  static invert(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    return imageData;
  }

  static applyFilter(image, filterType) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(image, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    switch (filterType) {
      case 'grayscale':
        ImageFilter.grayscale(imageData);
        break;
      case 'brightness':
        ImageFilter.brightness(imageData, 1.3);
        break;
      case 'invert':
        ImageFilter.invert(imageData);
        break;
      default:
        break;
    }

    tempCtx.putImageData(imageData, 0, 0);
    const filteredImage = new Image();
    filteredImage.src = tempCanvas.toDataURL();
    return new Promise((resolve) => {
      filteredImage.onload = () => resolve(filteredImage);
    });
  }
}

class SubImage {
  constructor(image, sourceX, sourceY, width, height, canvasX, canvasY, correctRotation, filterType = null) {
    this.image = image;
    this.originalImage = image;
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.width = width;
    this.height = height;
    this.canvasX = canvasX;
    this.canvasY = canvasY;
    this.correctRotation = correctRotation;
    this.currentRotation = 0;
    this.filterType = filterType;
    this.hasFilter = false;
    this.randomizeRotation();
  }

  randomizeRotation() {
    const possibleRotations = [0, 90, 180, 270];
    const wrongRotations = possibleRotations.filter((r) => r !== this.correctRotation);
    const randomIndex = Math.floor(Math.random() * wrongRotations.length);
    this.currentRotation = wrongRotations[randomIndex];
  }

  rotateLeft() {
    this.currentRotation = (this.currentRotation - 90 + 360) % 360;
  }

  rotateRight() {
    this.currentRotation = (this.currentRotation + 90) % 360;
  }

  isCorrect() {
    return this.currentRotation === this.correctRotation;
  }

  async applyFilter() {
    if (this.filterType && !this.hasFilter) {
      this.image = await ImageFilter.applyFilter(this.originalImage, this.filterType);
      this.hasFilter = true;
    }
  }

  removeFilter() {
    if (this.hasFilter) {
      this.image = this.originalImage;
      this.hasFilter = false;
    }
  }

  draw(ctx) {
    ctx.save();
    const centerX = this.canvasX + this.width / 2;
    const centerY = this.canvasY + this.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((this.currentRotation * Math.PI) / 180);
    ctx.drawImage(
      this.image,
      this.sourceX,
      this.sourceY,
      this.width,
      this.height,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
}

class BlockaGame {
  constructor(root) {
    this.root = root; // shadowRoot
    this.canvas = root.querySelector('#blockaCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasSize = this.canvas.width;

    this.difficulty = 6;
    this.rows = this.calculateRows(this.difficulty);
    this.cols = this.calculateCols(this.difficulty);
    this.pieceWidth = this.canvasSize / this.cols;
    this.pieceHeight = this.canvasSize / this.rows;

    this.currentImage = null;
    this.subImages = [];
    this.isPlaying = false;
    this.currentLevel = 0;

    this.timerSeconds = 0;
    this.timerInterval = null;
    this.levelRecords = {};

    this.levelFilters = [null, 'grayscale', 'brightness', 'invert', 'grayscale', 'brightness'];

    this.imageBank = [
      './assets/gl-1.jpg',
      './assets/gl-2.jpg',
      './assets/gl-3.jpg',
      './assets/gl-4.jpg',
      './assets/gl-5.jpg',
      './assets/gl-6.jpg',
    ];

    this.setupEventListeners();
    this.clearCanvas();
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e, 'left'));
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleClick(e, 'right');
    });

    const btnStart = this.root.querySelector('#btnStart');
    btnStart?.addEventListener('click', () => this.startGame());

    const difficultySelect = this.root.querySelector('#difficultySelect');
    difficultySelect?.addEventListener('change', (e) => {
      this.setDifficulty(parseInt(e.target.value, 10));
    });

    const btnMenu = this.root.querySelector('#btnMenu');
    const btnNext = this.root.querySelector('#btnNext');
    btnMenu?.addEventListener('click', () => this.goToMenu());
    btnNext?.addEventListener('click', () => this.nextLevel());
  }

  calculateRows(difficulty) {
    switch (difficulty) {
      case 4: return 2;
      case 6: return 3;
      case 8: return 3;
      default: return Math.ceil(Math.sqrt(difficulty));
    }
  }

  calculateCols(difficulty) {
    switch (difficulty) {
      case 4: return 2;
      case 6: return 2;
      case 8: return 3;
      default: return Math.ceil(difficulty / this.calculateRows(difficulty));
    }
  }

  setDifficulty(newDifficulty) {
    if (this.isPlaying) return;
    this.difficulty = newDifficulty;
    this.rows = this.calculateRows(this.difficulty);
    this.cols = this.calculateCols(this.difficulty);
    this.pieceWidth = this.canvasSize / this.cols;
    this.pieceHeight = this.canvasSize / this.rows;
    this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    this.subImages = [];
  }

  startTimer() {
    this.timerSeconds = 0;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateTimerDisplay() {
    const timerValue = this.root.querySelector('#timerValue');
    if (timerValue) timerValue.textContent = this.formatTime(this.timerSeconds);
  }

  async startGame() {
    this.isPlaying = true;
    this.hideVictoryPanel();
    const btnStart = this.root.querySelector('#btnStart');
    if (btnStart) btnStart.disabled = true;

    const imageIndex = this.currentLevel % this.imageBank.length;
    const imageUrl = this.imageBank[imageIndex];
    await this.loadImage(imageUrl);

    const levelValue = this.root.querySelector('#levelValue');
    if (levelValue) levelValue.textContent = String(this.currentLevel + 1);

    await this.createSubImages();
    this.startTimer();
    this.draw();
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasSize;
        tempCanvas.height = this.canvasSize;
        const tempCtx = tempCanvas.getContext('2d');
        const scale = Math.max(this.canvasSize / img.width, this.canvasSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (this.canvasSize - scaledWidth) / 2;
        const y = (this.canvasSize - scaledHeight) / 2;
        tempCtx.fillStyle = '#000000';
        tempCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        tempCtx.drawImage(img, x, y, scaledWidth, scaledHeight);
        const processedImg = new Image();
        processedImg.onload = () => {
          this.currentImage = processedImg;
          resolve();
        };
        processedImg.src = tempCanvas.toDataURL();
      };
      img.onerror = () => reject(new Error('Error loading image'));
      img.src = url;
    });
  }

  async createSubImages() {
    this.subImages = [];
    const currentFilter = this.levelFilters[this.currentLevel % this.levelFilters.length];
    let pieceCount = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.difficulty === 8 && row === 1 && col === 1) continue;
        const sourceX = col * this.pieceWidth;
        const sourceY = row * this.pieceHeight;
        const canvasX = col * this.pieceWidth;
        const canvasY = row * this.pieceHeight;
        this.subImages.push(
          new SubImage(
            this.currentImage,
            sourceX,
            sourceY,
            this.pieceWidth,
            this.pieceHeight,
            canvasX,
            canvasY,
            0,
            currentFilter
          )
        );
        pieceCount++;
        if (pieceCount >= this.difficulty) break;
      }
      if (pieceCount >= this.difficulty) break;
    }
    await Promise.all(this.subImages.map((s) => s.applyFilter()));
  }

  handleClick(event, button) {
    if (!this.isPlaying) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / this.pieceWidth);
    const row = Math.floor(y / this.pieceHeight);
    const index = row * this.cols + col;
    if (index >= 0 && index < this.subImages.length) {
      if (button === 'left') this.subImages[index].rotateLeft();
      else this.subImages[index].rotateRight();
      this.draw();
      this.checkVictory();
    }
  }

  checkVictory() {
    const allCorrect = this.subImages.every((s) => s.isCorrect());
    if (!allCorrect) return;
    this.isPlaying = false;
    this.stopTimer();
    const levelKey = `level_${this.currentLevel}`;
    if (!this.levelRecords[levelKey] || this.timerSeconds < this.levelRecords[levelKey]) {
      this.levelRecords[levelKey] = this.timerSeconds;
    }
    this.subImages.forEach((s) => s.removeFilter());
    this.draw();
    setTimeout(() => this.showVictoryPanel(), 500);
  }

  showVictoryPanel() {
    const victoryPanel = this.root.querySelector('#victoryControls');
    const finalTime = this.root.querySelector('#finalTime');
    if (victoryPanel && finalTime) {
      finalTime.textContent = this.formatTime(this.timerSeconds);
      victoryPanel.style.display = 'flex';
      const btnNext = this.root.querySelector('#btnNext');
      if (btnNext) {
        btnNext.textContent = this.currentLevel >= this.imageBank.length - 1 ? 'Reiniciar' : 'Siguiente Nivel';
      }
    }
  }

  hideVictoryPanel() {
    const victoryPanel = this.root.querySelector('#victoryControls');
    if (victoryPanel) victoryPanel.style.display = 'none';
  }

  goToMenu() {
    this.currentLevel = 0;
    this.hideVictoryPanel();
    const btnStart = this.root.querySelector('#btnStart');
    if (btnStart) btnStart.disabled = false;
    this.clearCanvas();
    const levelValue = this.root.querySelector('#levelValue');
    if (levelValue) levelValue.textContent = '1';
    this.timerSeconds = 0;
    this.updateTimerDisplay();
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= this.imageBank.length) this.currentLevel = 0;
    this.startGame();
  }

  draw() {
    this.ctx.fillStyle = '#14171b';
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    this.subImages.forEach((s) => s.draw(this.ctx));
    this.drawGrid();
  }

  drawGrid() {
    this.ctx.strokeStyle = '#2b323a';
    this.ctx.lineWidth = 2;
    for (let i = 1; i < this.cols; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.pieceWidth, 0);
      this.ctx.lineTo(i * this.pieceWidth, this.canvasSize);
      this.ctx.stroke();
    }
    for (let i = 1; i < this.rows; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.pieceHeight);
      this.ctx.lineTo(this.canvasSize, i * this.pieceHeight);
      this.ctx.stroke();
    }
  }

  clearCanvas() {
    this.ctx.fillStyle = '#14171b';
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
  }
}

// Exported initializer for the component
export function initBlocka(root) {
  const canvas = root.querySelector('#blockaCanvas');
  if (!canvas) {
    console.warn('Blocka: canvas no encontrado en root');
    return null;
  }
  const game = new BlockaGame(root);
  return game;
}

// ============================================
// CUSTOM ELEMENT: inyecta template y llama initBlocka
// ============================================
const TEMPLATE_URL = new URL('./blocka.html', import.meta.url).href;

class RushgameBlocka extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      const res = await fetch(TEMPLATE_URL);
      const text = await res.text();
      const tmp = document.createElement('template');
      tmp.innerHTML = text;

      // Obtener el <template id="blocka-template"> dentro del HTML o el contenido si no existe
      const tplNode = tmp.content.querySelector('#blocka-template') || tmp.content;

      // Si tplNode es un <template>, debemos insertar su .content; si no, clonamos el nodo
      const contentToInsert = tplNode.nodeName === 'TEMPLATE'
        ? tplNode.content.cloneNode(true)
        : tplNode.cloneNode(true);

      this.shadow.appendChild(contentToInsert);

      // Esperar microtarea para asegurar que el DOM del shadow esté listo
      await Promise.resolve();

      // Inicializar lógica del juego dentro del shadowRoot
      const gameInstance = initBlocka(this.shadow);
      this.game = gameInstance;
    } catch (err) {
      console.error('Error cargando template blocka:', err);
    }
  }
}

customElements.define('rushgame-blocka', RushgameBlocka);
