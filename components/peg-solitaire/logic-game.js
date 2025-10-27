import Board from './board.js';
import Piece from './piece.js';

/**
 * LogicGame - Controla el flujo principal del juego Peg Solitaire
 * Maneja eventos, movimientos, timer y condiciones de victoria/derrota
 */
export class LogicGame {
  constructor(root) {
    this.root = root;
    
    // Elementos del DOM
    this.canvas = root.querySelector('#pegCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Instancias del juego
    this.board = new Board(this.canvas);
    this.pieces = [];
    this.pieceImage = null;
    
    // Estado del juego
    this.isPlaying = false;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.maxTimeSeconds = 300; // 5 minutos
    
    // Drag & Drop
    this.selectedPiece = null;
    this.draggedPiece = null;
    this.mousePos = { x: 0, y: 0 };
    
    // Hints (movimientos válidos de la pieza seleccionada)
    this.validMoves = [];
    this.hintAnimationProgress = 0;
    
    // Estadísticas
    this.movesCount = 0;
    
    // Bind de métodos para event listeners
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    
    // Setup
    this.setupEventListeners();
    this.loadPieceImage();
    
    // Animación principal
    this.animationFrameId = null;
    this.startAnimationLoop();
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Eventos del canvas
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    
    // Botones de control
    const btnStart = this.root.querySelector('#btnStart');
    btnStart?.addEventListener('click', () => this.startGame());
    
    const btnReset = this.root.querySelector('#btnReset');
    btnReset?.addEventListener('click', () => this.resetGame());
    
    const btnMenu = this.root.querySelector('#btnMenu');
    btnMenu?.addEventListener('click', () => this.goToMenu());
  }

  /**
   * Carga la imagen del logo Green Lantern
   */
  async loadPieceImage() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.pieceImage = img;
        resolve();
      };
      img.onerror = () => {
        console.error('Error cargando imagen de ficha');
        reject();
      };
      // La imagen que subiste
      img.src = './assets/green-lantern-logo.png';
    });
  }

  /**
   * Inicia un nuevo juego
   */
  async startGame() {
    // Esperar a que cargue la imagen si aún no lo hizo
    if (!this.pieceImage) {
      await this.loadPieceImage();
    }
    
    this.isPlaying = true;
    this.movesCount = 0;
    this.timerSeconds = 0;
    
    // Ocultar panel de resultados
    this.hideResultPanel();
    
    // Deshabilitar botón de inicio
    const btnStart = this.root.querySelector('#btnStart');
    if (btnStart) btnStart.disabled = true;
    
    const btnReset = this.root.querySelector('#btnReset');
    if (btnReset) btnReset.disabled = false;
    
    // Inicializar tablero y fichas
    this.initializeBoard();
    
    // Iniciar timer
    this.startTimer();
    
    // Primera renderización
    this.draw();
  }

  /**
   * Inicializa el tablero con las fichas
   * Tablero inglés: todas las posiciones ocupadas excepto el centro
   */
  initializeBoard() {
    this.pieces = [];
    this.board.state = this.board.createEmptyState();
    
    const centerRow = 3;
    const centerCol = 3;
    
    for (let row = 0; row < this.board.gridSize; row++) {
      for (let col = 0; col < this.board.gridSize; col++) {
        // Saltar el centro y posiciones inválidas
        if (this.board.isValidPosition(row, col) && 
            !(row === centerRow && col === centerCol)) {
          
          const piece = new Piece(row, col, this.pieceImage, this.board);
          this.pieces.push(piece);
          this.board.setPiece(row, col, piece);
        }
      }
    }
  }

  /**
   * Reinicia el juego actual
   */
  resetGame() {
    if (!this.isPlaying) return;
    
    this.stopTimer();
    this.isPlaying = false;
    this.selectedPiece = null;
    this.draggedPiece = null;
    this.validMoves = [];
    
    this.startGame();
  }

  /**
   * Vuelve al menú principal
   */
  goToMenu() {
    this.stopTimer();
    this.isPlaying = false;
    this.selectedPiece = null;
    this.draggedPiece = null;
    this.validMoves = [];
    this.pieces = [];
    this.movesCount = 0;
    
    const btnStart = this.root.querySelector('#btnStart');
    if (btnStart) btnStart.disabled = false;
    
    const btnReset = this.root.querySelector('#btnReset');
    if (btnReset) btnReset.disabled = true;
    
    this.hideResultPanel();
    
    // Limpiar canvas
    this.board.draw();
    
    // Resetear timer display
    this.updateTimerDisplay();
    this.updateMovesDisplay();
  }

  /**
   * Maneja el evento mousedown
   */
  handleMouseDown(event) {
    if (!this.isPlaying) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Buscar si se clickeó una ficha
    for (const piece of this.pieces) {
      if (piece.isMouseOver(mouseX, mouseY)) {
        this.selectedPiece = piece;
        this.draggedPiece = piece;
        piece.startDrag(mouseX, mouseY);
        
        // Calcular movimientos válidos y mostrar hints
        this.validMoves = this.board.getValidMovesFrom(piece.row, piece.col);
        
        this.canvas.style.cursor = 'grabbing';
        return;
      }
    }
  }

  /**
   * Maneja el evento mousemove
   */
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    this.mousePos = { x: mouseX, y: mouseY };
    
    // Si hay una ficha siendo arrastrada
    if (this.draggedPiece) {
      this.draggedPiece.updateDrag(mouseX, mouseY);
      return;
    }
    
    // Hover sobre fichas
    let isOverPiece = false;
    for (const piece of this.pieces) {
      const wasHovered = piece.isHovered;
      const isHovered = piece.isMouseOver(mouseX, mouseY);
      piece.updateHover(isHovered);
      
      if (isHovered) {
        isOverPiece = true;
      }
    }
    
    this.canvas.style.cursor = isOverPiece ? 'grab' : 'default';
  }

  /**
   * Maneja el evento mouseup
   */
  handleMouseUp(event) {
    if (!this.isPlaying || !this.draggedPiece) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const dropPosition = this.draggedPiece.endDrag(mouseX, mouseY);
    
    if (dropPosition) {
      // Verificar si el movimiento es válido
      const moveCheck = this.board.isValidMove(
        this.draggedPiece.originalRow,
        this.draggedPiece.originalCol,
        dropPosition.row,
        dropPosition.col
      );
      
      if (moveCheck.valid) {
        // Movimiento válido: ejecutar
        this.executeMove(
          this.draggedPiece,
          dropPosition.row,
          dropPosition.col,
          moveCheck.jumpedRow,
          moveCheck.jumpedCol
        );
      } else {
        // Movimiento inválido: volver al origen
        this.draggedPiece.cancelDrag();
      }
    } else {
      // No se soltó en una posición válida
      this.draggedPiece.cancelDrag();
    }
    
    // Limpiar estado de drag
    this.draggedPiece = null;
    this.selectedPiece = null;
    this.validMoves = [];
    this.canvas.style.cursor = 'default';
  }

  /**
   * Ejecuta un movimiento válido
   */
  executeMove(piece, toRow, toCol, jumpedRow, jumpedCol) {
    // Remover ficha del origen
    this.board.removePiece(piece.originalRow, piece.originalCol);
    
    // Remover ficha saltada
    const jumpedPiece = this.board.removePiece(jumpedRow, jumpedCol);
    if (jumpedPiece) {
      const index = this.pieces.indexOf(jumpedPiece);
      if (index > -1) {
        this.pieces.splice(index, 1);
      }
    }
    
    // Colocar ficha en destino
    piece.setPosition(toRow, toCol);
    this.board.setPiece(toRow, toCol, piece);
    
    // Incrementar contador de movimientos
    this.movesCount++;
    this.updateMovesDisplay();
    
    // Verificar condiciones de fin de juego
    setTimeout(() => this.checkGameEnd(), 300);
  }

  /**
   * Verifica si el juego terminó
   */
  checkGameEnd() {
    if (!this.isPlaying) return;
    
    const hasMoves = this.board.hasValidMoves();
    const piecesRemaining = this.board.countPieces();
    
    if (!hasMoves) {
      // Juego terminado
      this.isPlaying = false;
      this.stopTimer();
      
      // Victoria perfecta: solo 1 ficha en el centro
      const isVictory = piecesRemaining === 1 && 
                        this.board.isOccupied(3, 3);
      
      setTimeout(() => this.showResultPanel(isVictory, piecesRemaining), 500);
    }
  }

  /**
   * Inicia el timer
   */
  startTimer() {
    this.timerSeconds = 0;
    this.updateTimerDisplay();
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this.updateTimerDisplay();
      
      // Verificar límite de tiempo
      if (this.timerSeconds >= this.maxTimeSeconds) {
        this.handleTimeUp();
      }
    }, 1000);
  }

  /**
   * Detiene el timer
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Maneja el fin del tiempo
   */
  handleTimeUp() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.stopTimer();
    
    const piecesRemaining = this.board.countPieces();
    setTimeout(() => this.showResultPanel(false, piecesRemaining), 300);
  }

  /**
   * Actualiza el display del timer
   */
  updateTimerDisplay() {
    const timerValue = this.root.querySelector('#timerValue');
    if (timerValue) {
      timerValue.textContent = this.formatTime(this.timerSeconds);
    }
    
    const timerHint = this.root.querySelector('#timerHint');
    if (timerHint) {
      const remaining = Math.max(0, this.maxTimeSeconds - this.timerSeconds);
      timerHint.textContent = ` / ${this.formatTime(remaining)}`;
    }
  }

  /**
   * Actualiza el display de movimientos
   */
  updateMovesDisplay() {
    const movesValue = this.root.querySelector('#movesValue');
    if (movesValue) {
      movesValue.textContent = this.movesCount;
    }
  }

  /**
   * Formatea segundos a MM:SS
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Muestra el panel de resultados
   */
  showResultPanel(isVictory, piecesRemaining) {
    const resultPanel = this.root.querySelector('#resultPanel');
    const resultTitle = this.root.querySelector('#resultTitle');
    const resultMessage = this.root.querySelector('#resultMessage');
    const finalTime = this.root.querySelector('#finalTime');
    const finalMoves = this.root.querySelector('#finalMoves');
    const finalPieces = this.root.querySelector('#finalPieces');
    
    if (!resultPanel) return;
    
    if (isVictory) {
      resultTitle.textContent = '¡Victoria Perfecta!';
      resultMessage.textContent = '¡Has completado el desafío del Solitario Esmeralda!';
    } else if (this.timerSeconds >= this.maxTimeSeconds) {
      resultTitle.textContent = 'Tiempo Agotado';
      resultMessage.textContent = 'El tiempo se ha agotado. ¡Intenta de nuevo!';
    } else {
      resultTitle.textContent = 'Juego Terminado';
      resultMessage.textContent = 'No hay más movimientos posibles.';
    }
    
    if (finalTime) finalTime.textContent = this.formatTime(this.timerSeconds);
    if (finalMoves) finalMoves.textContent = this.movesCount;
    if (finalPieces) finalPieces.textContent = piecesRemaining;
    
    resultPanel.style.display = 'flex';
  }

  /**
   * Oculta el panel de resultados
   */
  hideResultPanel() {
    const resultPanel = this.root.querySelector('#resultPanel');
    if (resultPanel) {
      resultPanel.style.display = 'none';
    }
  }

  /**
   * Loop de animación principal
   */
  startAnimationLoop() {
    const animate = () => {
      this.hintAnimationProgress = (this.hintAnimationProgress + 0.02) % 1;
      this.draw();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Dibuja todo el juego
   */
  draw() {
    // Dibujar tablero
    this.board.draw();
    
    // Dibujar hints animados (si hay una pieza seleccionada)
    if (this.selectedPiece && this.validMoves.length > 0) {
      for (const move of this.validMoves) {
        this.board.drawHint(move.toRow, move.toCol, this.hintAnimationProgress);
      }
    }
    
    // Dibujar todas las fichas (excepto la que está siendo arrastrada)
    for (const piece of this.pieces) {
      if (piece !== this.draggedPiece) {
        piece.draw(this.ctx);
      }
    }
    
    // Dibujar preview fantasma si hay drag
    if (this.draggedPiece) {
      const dropPos = this.board.getPositionFromCoordinates(
        this.mousePos.x,
        this.mousePos.y
      );
      
      if (dropPos) {
        const moveCheck = this.board.isValidMove(
          this.draggedPiece.originalRow,
          this.draggedPiece.originalCol,
          dropPos.row,
          dropPos.col
        );
        this.draggedPiece.drawGhost(this.ctx, dropPos.row, dropPos.col, moveCheck.valid);
      }
      
      // Dibujar la ficha arrastrada encima de todo
      this.draggedPiece.draw(this.ctx);
    }
  }

  /**
   * Limpieza al destruir
   */
  destroy() {
    this.stopTimer();
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }
}

/**
 * Función de inicialización exportada
 */
export function initPegSolitaire(root) {
  const game = new LogicGame(root);
  return game;
}