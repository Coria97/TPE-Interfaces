/**
 * Board - Representa el tablero del juego Peg Solitaire
 * Maneja las posiciones válidas y la lógica del tablero inglés (33 posiciones)
 */
export default class Board {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Dimensiones del canvas
    this.canvasSize = canvas.width;
    
    // Configuración del tablero inglés (7x7 con forma de cruz)
    this.gridSize = 7;
    this.holeRadius = 30; // Radio de cada agujero
    this.holeSpacing = 90; // Espaciado entre agujeros
    
    // Calcular offset para centrar el tablero
    this.offsetX = (this.canvasSize - (this.gridSize * this.holeSpacing)) / 2;
    this.offsetY = (this.canvasSize - (this.gridSize * this.holeSpacing)) / 2;
    
    // Definir las posiciones válidas del tablero inglés
    // true = posición válida, false = fuera del tablero
    this.validPositions = [
      [false, false, true,  true,  true,  false, false],
      [false, false, true,  true,  true,  false, false],
      [true,  true,  true,  true,  true,  true,  true ],
      [true,  true,  true,  true,  true,  true,  true ],
      [true,  true,  true,  true,  true,  true,  true ],
      [false, false, true,  true,  true,  false, false],
      [false, false, true,  true,  true,  false, false]
    ];
    
    // Estado del tablero (null = vacío, objeto Piece = ocupado)
    this.state = this.createEmptyState();
  }

  /**
   * Crea el estado inicial del tablero
   * Todas las posiciones ocupadas excepto el centro
   */
  createEmptyState() {
    const state = [];
    for (let row = 0; row < this.gridSize; row++) {
      state[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        state[row][col] = null;
      }
    }
    return state;
  }

  /**
   * Verifica si una posición es válida en el tablero
   */
  isValidPosition(row, col) {
    if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
      return false;
    }
    return this.validPositions[row][col];
  }

  /**
   * Obtiene las coordenadas del canvas para una posición del tablero
   */
  getCanvasCoordinates(row, col) {
    return {
      x: this.offsetX + col * this.holeSpacing + this.holeSpacing / 2,
      y: this.offsetY + row * this.holeSpacing + this.holeSpacing / 2
    };
  }

  /**
   * Obtiene la posición del tablero desde coordenadas del canvas
   * Retorna null si no está sobre una posición válida
   */
  getPositionFromCoordinates(x, y) {
    const col = Math.floor((x - this.offsetX) / this.holeSpacing);
    const row = Math.floor((y - this.offsetY) / this.holeSpacing);
    
    if (!this.isValidPosition(row, col)) {
      return null;
    }
    
    // Verificar que esté dentro del radio del agujero
    const coords = this.getCanvasCoordinates(row, col);
    const distance = Math.sqrt(
      Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2)
    );
    
    if (distance <= this.holeRadius * 1.5) { // Un poco de tolerancia
      return { row, col };
    }
    
    return null;
  }

  /**
   * Verifica si una posición está ocupada
   */
  isOccupied(row, col) {
    return this.state[row] && this.state[row][col] !== null;
  }

  /**
   * Coloca una pieza en el tablero
   */
  setPiece(row, col, piece) {
    if (this.isValidPosition(row, col)) {
      this.state[row][col] = piece;
      return true;
    }
    return false;
  }

  /**
   * Remueve una pieza del tablero
   */
  removePiece(row, col) {
    if (this.isValidPosition(row, col)) {
      const piece = this.state[row][col];
      this.state[row][col] = null;
      return piece;
    }
    return null;
  }

  /**
   * Obtiene la pieza en una posición
   */
  getPiece(row, col) {
    if (!this.isValidPosition(row, col)) return null;
    return this.state[row][col];
  }

  /**
   * Verifica si un movimiento es válido
   * En Peg Solitaire: saltar una ficha adyacente a un espacio vacío
   */
  isValidMove(fromRow, fromCol, toRow, toCol) {
    // Verificar que ambas posiciones sean válidas
    if (!this.isValidPosition(fromRow, fromCol) || !this.isValidPosition(toRow, toCol)) {
      return { valid: false };
    }
    
    // Debe haber una pieza en el origen
    if (!this.isOccupied(fromRow, fromCol)) {
      return { valid: false };
    }
    
    // El destino debe estar vacío
    if (this.isOccupied(toRow, toCol)) {
      return { valid: false };
    }
    
    // Calcular la diferencia
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    
    // Solo movimientos ortogonales (no diagonales)
    if (Math.abs(rowDiff) > 0 && Math.abs(colDiff) > 0) {
      return { valid: false };
    }
    
    // Debe moverse exactamente 2 espacios
    if (Math.abs(rowDiff) !== 2 && Math.abs(colDiff) !== 2) {
      return { valid: false };
    }
    
    // Verificar que haya una pieza en el medio
    const middleRow = fromRow + rowDiff / 2;
    const middleCol = fromCol + colDiff / 2;
    
    if (!this.isOccupied(middleRow, middleCol)) {
      return { valid: false };
    }
    
    return {
      valid: true,
      jumpedRow: middleRow,
      jumpedCol: middleCol
    };
  }

  /**
   * Obtiene todos los movimientos válidos desde una posición
   */
  getValidMovesFrom(row, col) {
    const moves = [];
    const directions = [
      { dr: -2, dc: 0 },  // Arriba
      { dr: 2, dc: 0 },   // Abajo
      { dr: 0, dc: -2 },  // Izquierda
      { dr: 0, dc: 2 }    // Derecha
    ];
    
    for (const dir of directions) {
      const toRow = row + dir.dr;
      const toCol = col + dir.dc;
      const moveCheck = this.isValidMove(row, col, toRow, toCol);
      
      if (moveCheck.valid) {
        moves.push({
          toRow,
          toCol,
          jumpedRow: moveCheck.jumpedRow,
          jumpedCol: moveCheck.jumpedCol
        });
      }
    }
    
    return moves;
  }

  /**
   * Verifica si hay algún movimiento válido en todo el tablero
   */
  hasValidMoves() {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.isOccupied(row, col)) {
          const moves = this.getValidMovesFrom(row, col);
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Cuenta cuántas piezas quedan en el tablero
   */
  countPieces() {
    let count = 0;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.isOccupied(row, col)) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Dibuja el tablero (agujeros y fondo)
   */
  draw() {
    // Limpiar canvas
    this.ctx.fillStyle = '#0a0e13';
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    
    // Dibujar efecto de resplandor de fondo
    const gradient = this.ctx.createRadialGradient(
      this.canvasSize / 2, this.canvasSize / 2, 0,
      this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2
    );
    gradient.addColorStop(0, 'rgba(0, 100, 50, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 50, 25, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    
    // Dibujar los agujeros
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.isValidPosition(row, col)) {
          this.drawHole(row, col);
        }
      }
    }
  }

  /**
   * Dibuja un agujero del tablero
   */
  drawHole(row, col) {
    const coords = this.getCanvasCoordinates(row, col);
    
    // Sombra exterior
    this.ctx.beginPath();
    this.ctx.arc(coords.x, coords.y, this.holeRadius + 5, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fill();
    
    // Agujero principal
    this.ctx.beginPath();
    this.ctx.arc(coords.x, coords.y, this.holeRadius, 0, Math.PI * 2);
    
    // Gradiente para dar profundidad
    const holeGradient = this.ctx.createRadialGradient(
      coords.x, coords.y, 0,
      coords.x, coords.y, this.holeRadius
    );
    holeGradient.addColorStop(0, '#1a2329');
    holeGradient.addColorStop(1, '#0d1116');
    this.ctx.fillStyle = holeGradient;
    this.ctx.fill();
    
    // Borde brillante sutil
    this.ctx.strokeStyle = 'rgba(126, 211, 33, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  /**
   * Dibuja un hint animado en una posición
   */
  drawHint(row, col, animationProgress) {
    const coords = this.getCanvasCoordinates(row, col);
    
    // Aro de energía pulsante (estilo Green Lantern)
    const pulseScale = 1 + Math.sin(animationProgress * Math.PI * 2) * 0.2;
    const radius = this.holeRadius * pulseScale;
    
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(coords.x, coords.y, radius, 0, Math.PI * 2);
    
    // Resplandor verde
    this.ctx.strokeStyle = `rgba(126, 211, 33, ${0.8 - animationProgress * 0.3})`;
    this.ctx.lineWidth = 4;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#7ed321';
    this.ctx.stroke();
    
    // Aro interior
    this.ctx.beginPath();
    this.ctx.arc(coords.x, coords.y, radius - 5, 0, Math.PI * 2);
    this.ctx.strokeStyle = `rgba(183, 243, 77, ${0.6 - animationProgress * 0.2})`;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    this.ctx.restore();
  }
}
