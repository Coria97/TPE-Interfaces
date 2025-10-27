/**
 * Piece - Representa una ficha del juego Peg Solitaire
 * Maneja el drag & drop y la renderización con la imagen del logo Green Lantern
 */
export default class Piece {
  constructor(row, col, image, board) {
    this.row = row;
    this.col = col;
    this.image = image; // Logo de Green Lantern
    this.board = board;
    
    // Estado de drag & drop
    this.isDragging = false;
    this.dragX = 0;
    this.dragY = 0;
    this.originalRow = row;
    this.originalCol = col;
    
    // Radio de la ficha (un poco menor que el agujero)
    this.radius = board.holeRadius * 0.85;
    
    // Animación de hover
    this.isHovered = false;
    this.hoverScale = 1.0;
    
    // Tipo de ficha (para futuras variantes)
    this.type = 'standard';
  }

  /**
   * Obtiene las coordenadas actuales de la ficha
   * Si está siendo arrastrada, usa dragX/dragY, sino usa su posición en el tablero
   */
  getCoordinates() {
    if (this.isDragging) {
      return { x: this.dragX, y: this.dragY };
    }
    return this.board.getCanvasCoordinates(this.row, this.col);
  }

  /**
   * Inicia el drag de la ficha
   */
  startDrag(mouseX, mouseY) {
    this.isDragging = true;
    this.dragX = mouseX;
    this.dragY = mouseY;
    this.originalRow = this.row;
    this.originalCol = this.col;
  }

  /**
   * Actualiza la posición durante el drag
   */
  updateDrag(mouseX, mouseY) {
    if (this.isDragging) {
      this.dragX = mouseX;
      this.dragY = mouseY;
    }
  }

  /**
   * Finaliza el drag de la ficha
   * Retorna la posición donde se soltó o null si es inválida
   */
  endDrag(mouseX, mouseY) {
    if (!this.isDragging) return null;
    
    this.isDragging = false;
    
    // Obtener la posición del tablero donde se soltó
    const dropPosition = this.board.getPositionFromCoordinates(mouseX, mouseY);
    
    if (!dropPosition) {
      // No se soltó sobre una posición válida, volver al origen
      return null;
    }
    
    return dropPosition;
  }

  /**
   * Cancela el drag y vuelve a la posición original
   */
  cancelDrag() {
    this.isDragging = false;
    this.row = this.originalRow;
    this.col = this.originalCol;
  }

  /**
   * Actualiza la posición de la ficha en el tablero
   */
  setPosition(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   * Verifica si el mouse está sobre esta ficha
   */
  isMouseOver(mouseX, mouseY) {
    const coords = this.getCoordinates();
    const distance = Math.sqrt(
      Math.pow(mouseX - coords.x, 2) + Math.pow(mouseY - coords.y, 2)
    );
    return distance <= this.radius;
  }

  /**
   * Actualiza el estado de hover
   */
  updateHover(isHovered) {
    this.isHovered = isHovered;
    
    // Animación suave de escala
    const targetScale = isHovered ? 1.1 : 1.0;
    this.hoverScale += (targetScale - this.hoverScale) * 0.2;
  }

  /**
   * Dibuja la ficha en el canvas
   */
  draw(ctx) {
    const coords = this.getCoordinates();
    
    ctx.save();
    
    // Aplicar escala de hover
    const scale = this.isDragging ? 1.15 : this.hoverScale;
    
    // Si está siendo arrastrada, dibujar sombra más grande
    if (this.isDragging) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(126, 211, 33, 0.8)';
      ctx.shadowOffsetY = 10;
    } else if (this.isHovered) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(126, 211, 33, 0.5)';
    } else {
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    }
    
    // Dibujar círculo de fondo (verde oscuro)
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, this.radius * scale, 0, Math.PI * 2);
    
    const bgGradient = ctx.createRadialGradient(
      coords.x - this.radius * 0.3,
      coords.y - this.radius * 0.3,
      0,
      coords.x,
      coords.y,
      this.radius * scale
    );
    bgGradient.addColorStop(0, '#2d5016');
    bgGradient.addColorStop(1, '#1a3010');
    ctx.fillStyle = bgGradient;
    ctx.fill();
    
    // Borde brillante
    ctx.strokeStyle = this.isDragging 
      ? 'rgba(183, 243, 77, 0.9)' 
      : 'rgba(126, 211, 33, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Dibujar el logo de Green Lantern
    if (this.image && this.image.complete) {
      const imgSize = this.radius * 1.4 * scale;
      ctx.drawImage(
        this.image,
        coords.x - imgSize / 2,
        coords.y - imgSize / 2,
        imgSize,
        imgSize
      );
    }
    
    // Resplandor adicional si está siendo arrastrada
    if (this.isDragging) {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, this.radius * scale + 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(126, 211, 33, 0.3)';
      ctx.lineWidth = 8;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * Dibuja una vista previa fantasma de la ficha (para mostrar donde caería)
   */
  drawGhost(ctx, row, col, isValid) {
    const coords = this.board.getCanvasCoordinates(row, col);
    
    ctx.save();
    ctx.globalAlpha = 0.4;
    
    // Color según si el movimiento es válido
    const color = isValid 
      ? 'rgba(126, 211, 33, 0.6)' 
      : 'rgba(255, 50, 50, 0.6)';
    
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = isValid 
      ? 'rgba(183, 243, 77, 0.8)' 
      : 'rgba(255, 100, 100, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }
}
