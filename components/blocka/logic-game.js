import SubImage from './sub-image.js';

export class LogicGame {
  constructor(root) {
    this.root = root;
    
    this.difficulty = 6;
    this.cols = 2; 
    this.rows = this.calculateRows(this.difficulty);
    
    this.canvas = root.querySelector('#blockaCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasSize = this.canvas.width;
    this.pieceWidth = this.canvasSize / this.cols;
    this.pieceHeight = this.canvasSize / this.rows;

    this.currentImage = null;
    this.subImages = [];
    this.isPlaying = false;
    this.currentLevel = 0;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.levelRecords = {};
    this.helpUsed = false; // Flag to control if help was used

    this.maxTimeSeconds = null; // Maximum time for the level (null = no limit)
    this.lastResultWasWin = false; // To control the action of the next/retry button

    this.levelFilters = [null, 'grayscale', 'brightness', 'invert', 'grayscale', 'brightness'];

    this.imageBank = [
      './assets/gl-1.jpg',
      './assets/gl-2.jpg',
      './assets/gl-3.jpg',
      './assets/gl-4.jpg',
      './assets/gl-5.jpg',
      './assets/gl-6.jpg',
    ];

    this.preloadedLevelImages = [];
    this.selectedImageIndex = null;

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

    const btnHelp = this.root.querySelector('#btnHelp');
    btnHelp?.addEventListener('click', () => this.useHelp());

    const difficultySelect = this.root.querySelector('#difficultySelect');
    difficultySelect?.addEventListener('change', (e) => {
      this.setDifficulty(parseInt(e.target.value, 10));
    });

    const btnMenu = this.root.querySelector('#btnMenu');
    btnMenu?.addEventListener('click', () => this.goToMenu());
    
    const btnNext = this.root.querySelector('#btnNext');
    btnNext?.addEventListener('click', () => this.nextLevel());
  }

  calculateRows(difficulty) {
    switch (difficulty) {
      case 4: return 2;
      case 6: return 3;
      case 8: return 4;
      default: return Math.ceil(Math.sqrt(difficulty));
    }
  }

  setDifficulty(newDifficulty) {
    if (this.isPlaying) return;
    
    // set new difficulty and recalculate rows/piece sizes
    this.difficulty = newDifficulty;
    this.rows = this.calculateRows(this.difficulty);
    this.pieceWidth = this.canvasSize / this.cols;
    this.pieceHeight = this.canvasSize / this.rows;
    this.subImages = [];
  }

  useHelp() {
    if (!this.isPlaying || this.helpUsed) return;

    // Filter incorrect pieces
    const incorrectPieces = this.subImages.filter(s => !s.isFixed && !s.isCorrect());

    if (incorrectPieces.length === 0) {
      return;
    }

    // Select a random piece
    const randomIndex = Math.floor(Math.random() * incorrectPieces.length);
    const selectedPiece = incorrectPieces[randomIndex];

    // Fix the piece to its correct rotation
    selectedPiece.fixToCorrectRotation();

    // Add 5 seconds as a penalty
    this.timerSeconds += 5;
    this.updateTimerDisplay();

    // Mark help as used
    this.helpUsed = true;

    // Check if time limit is exceeded after penalty
    if (this.maxTimeSeconds !== null && this.timerSeconds >= this.maxTimeSeconds) {
      // call time up handler and exit
      this.handleTimeUp();
      return;
    }
    
    // Update button
    const btnHelp = this.root.querySelector('#btnHelp');
    if (btnHelp) {
      btnHelp.disabled = true;
      btnHelp.textContent = 'Ayuda Usada';
    }

    // Redraw canvas to reflect fixed piece
    this.draw();

    // Verificar victoria por si era la última pieza
    this.checkVictory();
  }

  startTimer() {
    this.timerSeconds = 0;
    this.updateTimerDisplay();
    // clear previous interval if any
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();

      // Check time limit
      if (this.maxTimeSeconds !== null && this.timerSeconds >= this.maxTimeSeconds) {
        // time's up - handle loss
        this.handleTimeUp();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerValue = this.root.querySelector('#timerValue');
    if (timerValue) {
      // show as MM:SS
      timerValue.textContent = this.formatTime(this.timerSeconds);
      // if there's a maxTime, also show remaining as small hint
      const timerHint = this.root.querySelector('#timerHint');
      if (timerHint) {
        if (this.maxTimeSeconds === null) {
          timerHint.textContent = '';
        } else {
          const remaining = Math.max(0, this.maxTimeSeconds - this.timerSeconds);
          timerHint.textContent = ` / ${this.formatTime(remaining)}`;
        }
      }
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  async startGame() {
    // Before starting, show selection animation
    this.selectedImageIndex = await this.showSelectionAnimationCanvas();

    // Prevent starting if already playing
    this.isPlaying = true;
    this.helpUsed = false;

    // set maxTime based on difficulty
    switch (this.difficulty) {
      case 4:
        this.maxTimeSeconds = null; // no limit
        break;
      case 6:
        this.maxTimeSeconds = 60; // 1 minute
        break;
      case 8:
        this.maxTimeSeconds = 30; // 30 seconds
        break;
      default:
        this.maxTimeSeconds = null;
    }

    this.hideResultPanel();

    const btnStart = this.root.querySelector('#btnStart');
    const btnHelp = this.root.querySelector('#btnHelp');
    const difficultySelect = this.root.querySelector('#difficultySelect');
    
    if (btnStart) btnStart.disabled = true;
    if (difficultySelect) difficultySelect.disabled = true;
    
    if (btnHelp) {
      btnHelp.disabled = false;
      btnHelp.textContent = 'Ayudita (+5s)';
    }

    const imageUrl = this.imageBank[this.selectedImageIndex];
    await this.loadImage(imageUrl);

    const levelValue = this.root.querySelector('#levelValue');
    if (levelValue) levelValue.textContent = String(this.currentLevel + 1);

    await this.createSubImages();
    this.startTimer();
    this.draw();
  }

  handleTimeUp() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopTimer();

    // reveal result as loss
    this.subImages.forEach((s) => s.removeFilter());
    this.draw();

    // mark last result
    this.lastResultWasWin = false;

    setTimeout(() => this.showResultPanel(false), 300);
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
    // Reset sub-images, use currentFilter assigned during startGame
    this.subImages = [];
    const currentFilter = (typeof this.currentFilter !== 'undefined' && this.currentFilter !== null)
      ? this.currentFilter
      : (this.levelFilters[this.currentLevel % this.levelFilters.length]);

    this.canvasSize = this.canvas.width;
    this.rows = this.rows || this.calculateRows(this.difficulty);
    const pw = this.canvasSize / this.cols;
    const ph = this.canvasSize / this.rows;

    let pieceCount = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (pieceCount >= this.difficulty) break;

        const sourceX = Math.round(col * pw);
        const sourceY = Math.round(row * ph);
        const width = Math.round(col === this.cols - 1 ? this.canvasSize - sourceX : pw);
        const height = Math.round(row === this.rows - 1 ? this.canvasSize - sourceY : ph);
        const canvasX = sourceX;
        const canvasY = sourceY;

        // Create sub-image passing integer sizes and currentFilter
        const subImage = new SubImage(
          this.currentImage,
          sourceX,
          sourceY,
          width,
          height,
          canvasX,
          canvasY,
          0,
          currentFilter
        );

        this.subImages.push(subImage);
        pieceCount++;
      }
      if (pieceCount >= this.difficulty) break;
    }

    if (this.subImages.length > 0) {
      this.pieceWidth = this.subImages[0].width;
      this.pieceHeight = this.subImages[0].height;
    } else {
      this.pieceWidth = pw;
      this.pieceHeight = ph;
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
      const piece = this.subImages[index];

      // Check if the piece is fixed
      if (piece.isFixed) {
        console.log('⚠️ Esta pieza está fija (ayuda usada)');
        return;
      }

      if (button === 'left') 
        piece.rotateLeft();
      else 
        piece.rotateRight();
      
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

    // mark last result as win
    this.lastResultWasWin = true;

    setTimeout(() => this.showResultPanel(true), 500);
  }

  showResultPanel(isWin) {
    const resultPanel = this.root.querySelector('#resultPanel');
    const finalTime = this.root.querySelector('#finalTime');
    const resultTitle = this.root.querySelector('#resultTitle');
    const btnNext = this.root.querySelector('#btnNext');

    if (!resultPanel || !finalTime || !resultTitle || !btnNext) return;

    finalTime.textContent = this.formatTime(this.timerSeconds);
    if (isWin) {
      resultTitle.textContent = '¡Nivel Completado!';
      btnNext.textContent = this.currentLevel >= this.imageBank.length - 1 ? 'Reiniciar' : 'Siguiente Nivel';
    } else {
      resultTitle.textContent = 'Tiempo Agotado';
      btnNext.textContent = 'Reintentar';
    }

    resultPanel.style.display = 'flex';
  }

  hideResultPanel() {
    const resultPanel = this.root.querySelector('#resultPanel');
    if (resultPanel) resultPanel.style.display = 'none';
  }

  goToMenu() {
    this.currentLevel = 0;
    this.helpUsed = false; // Reset help
    this.hideResultPanel();
    
    const btnStart = this.root.querySelector('#btnStart');
    const btnHelp = this.root.querySelector('#btnHelp');
    const difficultySelect = this.root.querySelector('#difficultySelect');
    
    if (btnStart) btnStart.disabled = false;
    if (difficultySelect) difficultySelect.disabled = false;

    // Disable help in menu
    if (btnHelp) {
      btnHelp.disabled = true;
      btnHelp.textContent = 'Ayudita (+5s)';
    }
    
    this.clearCanvas();
    const levelValue = this.root.querySelector('#levelValue');
    if (levelValue) levelValue.textContent = '1';
    this.timerSeconds = 0;
    this.maxTimeSeconds = null;
    this.updateTimerDisplay();
  }

  nextLevel() {
    // Si el último resultado fue victoria avanzamos al siguiente nivel,
    // si fue derrota, reintentamos el mismo nivel
    if (this.lastResultWasWin) {
      this.currentLevel++;
      if (this.currentLevel >= this.imageBank.length) 
        this.currentLevel = 0;
    }
    // startGame ya maneja la selección de imagen y reinicio
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

    const vPosSet = new Set();
    const hPosSet = new Set();
    this.subImages.forEach(s => {
      vPosSet.add(s.canvasX);
      vPosSet.add(s.canvasX + s.width);
      hPosSet.add(s.canvasY);
      hPosSet.add(s.canvasY + s.height);
    });

    const vPos = Array.from(vPosSet).sort((a,b)=>a-b);
    const hPos = Array.from(hPosSet).sort((a,b)=>a-b);

    vPos.forEach(x => {
      if (x > 0 && x < this.canvasSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + 0.5, 0);
        this.ctx.lineTo(x + 0.5, this.canvasSize);
        this.ctx.stroke();
      }
    });

    hPos.forEach(y => {
      if (y > 0 && y < this.canvasSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y + 0.5);
        this.ctx.lineTo(this.canvasSize, y + 0.5);
        this.ctx.stroke();
      }
    });
  }

  clearCanvas() {
    this.ctx.fillStyle = '#14171b';
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
  }

  async preloadLevelImages() {
    const promises = this.imageBank.map((url, idx) => {
      return new Promise((resolve) => {
        // if already loaded, return it
        if (this.preloadedLevelImages[idx]) return resolve(this.preloadedLevelImages[idx]);
        // else load it
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          this.preloadedLevelImages[idx] = img;
          resolve(img);
        };
      });
    });
    await Promise.all(promises);
  }

  drawLevelSelectorOnCanvas(highlightIndex = -1, selectedIndex = -1) {
    // Canvas dimensions
    const ctx = this.ctx;
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;

    // Thumbnail size
    const thumbSize = 100;

    // Strip layout
    const stripHeight = Math.floor(canvasH * 0.2);
    const padding = 12;
    const total = this.imageBank.length;
    const gap = 12;

    // Center the strip vertically on the canvas
    const centerCanvasY = Math.floor((canvasH - stripHeight) / 2);

    // Save context state and clear canvas
    ctx.save();
    this.clearCanvas();

    // Draw semi-transparent rounded background for the strip
    ctx.fillStyle = 'rgba(0,0,0,0.36)';
    ctx.beginPath();
    ctx.roundRect(padding, centerCanvasY, canvasW - padding * 2, stripHeight, 10);
    ctx.fill();

    // Compute horizontal positioning so thumbnails are centered inside the strip
    const totalThumbsWidth = total * thumbSize + (total - 1) * gap;
    const startX = padding + Math.floor((canvasW - padding * 2 - totalThumbsWidth) / 2);
    
    // Draw each thumbnail slot
    for (let i = 0; i < total; i++) {
      const img = this.preloadedLevelImages[i];
      
      // Thumbnail area centered vertically inside the slot
      const imgX = startX + i * (thumbSize + gap);
      const imgY = centerCanvasY + Math.floor((stripHeight - thumbSize) / 2);

      // Draw selection background (subtle) or highlight stroke
      if (i === selectedIndex) {
        ctx.fillStyle = 'rgba(80,200,120,0.18)';
        ctx.fillRect(imgX - 4, centerCanvasY, thumbSize + 8, stripHeight - 2);
      } 
      else if (i === highlightIndex) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 3;
        ctx.strokeRect(imgX - 4, centerCanvasY, thumbSize + 8, stripHeight - 2);
      }

      // Draw the image scaled to fit inside thumbnail area
      ctx.drawImage(img, 0, 0, img.width, img.height, imgX, imgY, thumbSize, thumbSize);
    }

    // Restore context to previous state
    ctx.restore();
  }

  async showSelectionAnimationCanvas() {
    // Charge level images if not done yet
    await this.preloadLevelImages();

    const total = this.imageBank.length;
    const targetIndex = Math.floor(Math.random() * total);

    // Animation roulette variables
    
    // Cycles + targetIndex steps
    const steps = 2 * total + targetIndex;
    let step = 0;
    let idx = 0;
    const baseDelay = 80;
    const accel = 6;

    return new Promise((resolve) => {
      const tick = () => {
        // Calculate highlight index
        const highlight = idx % total;

        // Draw strip with highlight
        this.drawLevelSelectorOnCanvas(highlight, -1);

        // Advance step and index
        step++;
        idx++;

        // Calculate remaining steps
        const remaining = steps - step;

        // Calculate delay with acceleration effect
        const delay = baseDelay + Math.round((Math.max(0, remaining) / steps) * accel * baseDelay);

        if (step > steps) {
          // Animation finished, resolve with selected index
          this.drawLevelSelectorOnCanvas(-1, highlight);
          
          setTimeout(() => {
            // clear strip after short delay
            const canvasW = this.canvas.width;
            const canvasH = this.canvas.height;
            const stripHeight = Math.min(96, Math.floor(canvasH * 0.14));
            const y = Math.floor((canvasH - stripHeight) / 2);
            this.clearCanvas();
            resolve(highlight);
          }, 340);
          return;
        }
        setTimeout(tick, delay);
      };

      // start the animation
      tick();
    });
  }
}

export function initBlocka(root) {
  const game = new LogicGame(root);
  return game;
}