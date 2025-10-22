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

    this.preloadedLevelImages = [];
    this.selectedImageIndex = null;

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
    
    // set new difficulty and recalculate rows/piece sizes
    this.difficulty = newDifficulty;
    this.rows = this.calculateRows(this.difficulty);
    this.pieceWidth = this.canvasSize / this.cols;
    this.pieceHeight = this.canvasSize / this.rows;
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
    // Before starting, show selection animation
    this.selectedImageIndex = await this.showSelectionAnimationCanvas();

    // Prevent starting if already playing
    this.isPlaying = true;

    // Hide victory panel if visible
    this.hideVictoryPanel();

    // Disable start button
    const btnStart = this.root.querySelector('#btnStart');
    if (btnStart) btnStart.disabled = true;

    const imageUrl = this.imageBank[this.selectedImageIndex];
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
    // Reset sub-images, use currentFilter assigned during startGame
    this.subImages = [];
    const currentFilter = (typeof this.currentFilter !== 'undefined' && this.currentFilter !== null)
      ? this.currentFilter
      : (this.levelFilters[this.currentLevel % this.levelFilters.length]);

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