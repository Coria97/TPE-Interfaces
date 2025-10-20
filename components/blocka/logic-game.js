import SubImage from './sub-image.js';

export class LogicGame {
  constructor(root) {
    this.root = root; // shadowRoot
    
    // Game settings
    this.difficulty = 6;
    this.cols = 2; 
    this.rows = this.calculateRows(this.difficulty);
    
    // Canvas and context
    this.canvas = root.querySelector('#blockaCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasSize = this.canvas.width;
    this.pieceWidth = this.canvasSize / this.cols;
    this.pieceHeight = this.canvasSize / this.rows;

    // Game state
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
    // Handle left and right clicks on canvas
    this.canvas.addEventListener('click', (e) => this.handleClick(e, 'left'));
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleClick(e, 'right');
    });

    // UI buttons
    const btnStart = this.root.querySelector('#btnStart');
    btnStart?.addEventListener('click', () => this.startGame());

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
    this.difficulty = newDifficulty;
    this.rows = this.calculateRows(this.difficulty);
    this.pieceWidth = this.canvasSize / this.cols;
    this.pieceHeight = this.canvasSize / this.rows;
    this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    this.subImages = [];
  }

  startTimer() {
    // Initialize and start the game timer
    this.timerSeconds = 0;
    this.updateTimerDisplay();
    // Start the timer interval, when 1000 ms pass, increment seconds and update display
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay() {
    // Update timer display in UI
    const timerValue = this.root.querySelector('#timerValue');
    if (timerValue) timerValue.textContent = this.formatTime(this.timerSeconds);
  }

  formatTime(seconds) {
    // Format seconds as MM:SS
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  stopTimer() {
    // Stop the game timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  async startGame() {
    // Prevent starting if already playing
    this.isPlaying = true;

    // Hide victory panel if visible
    this.hideVictoryPanel();

    // Disable start button
    const btnStart = this.root.querySelector('#btnStart');
    if (btnStart) btnStart.disabled = true;

    // Load current level image
    const imageIndex = this.currentLevel % this.imageBank.length;
    const imageUrl = this.imageBank[imageIndex];
    await this.loadImage(imageUrl);

    // Update level display
    const levelValue = this.root.querySelector('#levelValue');
    if (levelValue) levelValue.textContent = String(this.currentLevel + 1);

    // Create sub-images and start timer
    await this.createSubImages();
    this.startTimer();
    this.draw();
  }

  loadImage(url) {
    // Load image from URL
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw image to temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasSize;
        tempCanvas.height = this.canvasSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Scale and center image
        const scale = Math.max(this.canvasSize / img.width, this.canvasSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (this.canvasSize - scaledWidth) / 2;
        const y = (this.canvasSize - scaledHeight) / 2;

        // Fill background and draw image
        tempCtx.fillStyle = '#000000';
        tempCtx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        tempCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Save processed image
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
    // Reset sub-images, select filter for current level
    this.subImages = [];
    const currentFilter = this.levelFilters[this.currentLevel % this.levelFilters.length];

    // Recalculate sizes using exact canvasSize
    this.canvasSize = this.canvas.width; // internal pixel size
    this.rows = this.rows || this.calculateRows(this.difficulty);
    // pw is piece width, ph is piece height
    const pw = this.canvasSize / this.cols;
    const ph = this.canvasSize / this.rows;

    // Generate pieces row by row with integer coordinates/sizes
    let pieceCount = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        // Stop when we reached the intended number of pieces
        if (pieceCount >= this.difficulty) break;

        // Source position (rounded)
        const sourceX = Math.round(col * pw);
        const sourceY = Math.round(row * ph);

        // Source size: ensure last column/row consumes remaining pixels
        const width = Math.round(col === this.cols - 1 ? this.canvasSize - sourceX : pw);
        const height = Math.round(row === this.rows - 1 ? this.canvasSize - sourceY : ph);

        // Canvas position: align with source (rounded)
        const canvasX = sourceX;
        const canvasY = sourceY;

        // Create sub-image passing integer sizes
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

    // Ensure pieceWidth/pieceHeight reflect the actual generated pieces (avoids small gaps)
    if (this.subImages.length > 0) {
      // Use average/first piece as reference; drawGrid will use exact positions of pieces
      this.pieceWidth = this.subImages[0].width;
      this.pieceHeight = this.subImages[0].height;
    } else {
      this.pieceWidth = pw;
      this.pieceHeight = ph;
    }

    // Apply filter to all sub-images
    await Promise.all(this.subImages.map((s) => s.applyFilter()));
  }

  handleClick(event, button) {
    // Ignore clicks if not playing
    if (!this.isPlaying) return;
    
    // Calculate which piece was clicked
    const rect = this.canvas.getBoundingClientRect(); // Get canvas position
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / this.pieceWidth);
    const row = Math.floor(y / this.pieceHeight);
    const index = row * this.cols + col;
    
    // Rotate the clicked piece, redraw, and check for victory
    if (index >= 0 && index < this.subImages.length) {
      if (button === 'left') 
        this.subImages[index].rotateLeft();
      else 
        this.subImages[index].rotateRight();
      this.draw();
      this.checkVictory();
    }
  }

  checkVictory() {
    // Check if all pieces are correctly oriented
    const allCorrect = this.subImages.every((s) => s.isCorrect());    
    
    // If not all correct, continue with the game
    if (!allCorrect) return;
    
    // Else, handle victory 
    this.isPlaying = false;
    this.stopTimer();
    
    // Update level record if it's a new best time
    const levelKey = `level_${this.currentLevel}`;
    if (!this.levelRecords[levelKey] || this.timerSeconds < this.levelRecords[levelKey]) {
      this.levelRecords[levelKey] = this.timerSeconds;
    }
    
    // Remove filters from all pieces and redraw
    this.subImages.forEach((s) => s.removeFilter());
    this.draw();
    setTimeout(() => this.showVictoryPanel(), 500);
  }

  showVictoryPanel() {
    // Show victory panel with final time
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
    // Hide victory panel
    const victoryPanel = this.root.querySelector('#victoryControls');
    if (victoryPanel) victoryPanel.style.display = 'none';
  }

  goToMenu() {
    // Return to menu and reset game state
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
    // Advance to next level or restart
    this.currentLevel++;
    if (this.currentLevel >= this.imageBank.length) 
      this.currentLevel = 0;
    this.startGame();
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#14171b';
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    
    // Draw all sub-images and grid
    this.subImages.forEach((s) => s.draw(this.ctx));
    this.drawGrid();
  }

  drawGrid() {
    // Draw grid lines aligned to actual piece bounds (avoids gaps due to rounding)
    this.ctx.strokeStyle = '#2b323a';
    this.ctx.lineWidth = 2;

    // Collect unique vertical positions (x)
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

    // Draw vertical lines (exclude 0 and canvasSize boundaries if present)
    vPos.forEach(x => {
      if (x > 0 && x < this.canvasSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + 0.5, 0); // +0.5 to make 1px crisp line
        this.ctx.lineTo(x + 0.5, this.canvasSize);
        this.ctx.stroke();
      }
    });

    // Draw horizontal lines
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
    // Fill canvas with background color
    this.ctx.fillStyle = '#14171b';
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
  }
}

export function initBlocka(root) {
  const game = new LogicGame(root);
  return game;
}