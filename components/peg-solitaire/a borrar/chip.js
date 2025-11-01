/**
 * Chip - Representa una casilla/ficha del tablero de Peg Solitaire
 * Ahora con capacidades de drag & drop y efectos visuales mejorados
 */
export default class Chip {
    constructor(id, height, width, isAvailable, isEmpty, posX, posY, context, canvas, radius) {
        this.id = id;
        this.height = height;
        this.width = width;
        this.isAvailable = isAvailable;
        this.isEmpty = isEmpty;
        this.posX = posX + width / 2; // Centro del cuadrado X
        this.posY = posY + height / 2; // Centro del cuadrado Y
        this.ctx = context;
        this.canvas = canvas;
        this.radius = radius;
        
        // Estado de drag & drop
        this.isDragging = false;
        this.dragX = this.posX;
        this.dragY = this.posY;
        this.originalPosX = this.posX;
        this.originalPosY = this.posY;
        
        // Estado visual
        this.isHovered = false;
        this.hoverScale = 1.0;
        this.isSelected = false;
        
        // Imagen de la ficha
        this.image = new Image();
        this.image.src = './assets/chip.png';
        
        // Calcular movimientos posibles
        this.possibleMoves = [];
        this.possibleChipEats = [];
        this.calculatePossibleMoves();
        this.calculatePossibleChipEats();
    }

    /**
     * Calcula las fichas que pueden ser comidas desde esta posición
     * IMPORTANTE: Este método debe llamarse dinámicamente durante el juego
     */
    calculatePossibleChipEats() {
        this.possibleChipEats = [];
        
        if (!this.isAvailable || this.isEmpty) {
            return;
        }
        
        const directions = [
            { id: this.id - 1, name: 'left' },   // Izquierda
            { id: this.id + 1, name: 'right' },  // Derecha
            { id: this.id - 7, name: 'up' },     // Arriba
            { id: this.id + 7, name: 'down' }    // Abajo
        ];

        for (const dir of directions) {
            if (dir.id >= 0 && dir.id < 49) {
                this.possibleChipEats.push(dir.id);
            }
        }
    }

    /**
     * Calcula los movimientos posibles desde esta casilla
     * En Senku: saltar 2 espacios (comiendo la ficha del medio)
     * IMPORTANTE: Este método debe llamarse dinámicamente durante el juego
     */
    calculatePossibleMoves() {
        this.possibleMoves = [];
        
        if (!this.isAvailable || this.isEmpty) {
            return;
        }

        // Calcular fila y columna actual
        const currentRow = Math.floor(this.id / 7);
        const currentCol = this.id % 7;

        const moves = [
            { 
                id: this.id - 2, 
                eaten: this.id - 1, 
                name: 'left',
                validCheck: () => currentCol >= 2  // No salir por el borde izquierdo
            },
            { 
                id: this.id + 2, 
                eaten: this.id + 1, 
                name: 'right',
                validCheck: () => currentCol <= 4  // No salir por el borde derecho
            },
            { 
                id: this.id - 14, 
                eaten: this.id - 7, 
                name: 'up',
                validCheck: () => currentRow >= 2  // No salir por arriba
            },
            { 
                id: this.id + 14, 
                eaten: this.id + 7, 
                name: 'down',
                validCheck: () => currentRow <= 4  // No salir por abajo
            }
        ];

        for (const move of moves) {
            // Verificar que el id esté dentro del rango y que no cruce bordes
            if (move.id >= 0 && move.id < 49 && move.validCheck()) {
                this.possibleMoves.push({
                    targetId: move.id,
                    eatenId: move.eaten,
                    direction: move.name
                });
            }
        }
    }

    /**
     * Verifica si el mouse está sobre esta ficha/casilla
     * Aumenta el área de detección para mejor UX
     */
    isMouseOver(mouseX, mouseY) {
        if (!this.isAvailable) return false;
        
        // Si está vacía, aumentar el radio de detección
        const detectionRadius = this.isEmpty ? this.radius * 1.8 : this.radius;
        
        const distance = Math.sqrt(
            Math.pow(mouseX - this.posX, 2) + 
            Math.pow(mouseY - this.posY, 2)
        );
        
        return distance <= detectionRadius;
    }

    /**
     * Inicia el drag de la ficha
     */
    startDrag(mouseX, mouseY) {
        if (this.isEmpty || !this.isAvailable) return false;
        
        this.isDragging = true;
        this.isSelected = true;
        this.dragX = mouseX;
        this.dragY = mouseY;
        this.originalPosX = this.posX;
        this.originalPosY = this.posY;
        return true;
    }

    /**
     * Actualiza la posición durante el drag
     */


    /**
     * Finaliza el drag
     */
    endDrag() {
        this.isDragging = false;
        this.isSelected = false;
    }

    /**
     * Cancela el drag y vuelve a la posición original
     */
    cancelDrag() {
        this.isDragging = false;
        this.isSelected = false;
        this.dragX = this.originalPosX;
        this.dragY = this.originalPosY;
    }

    /**
     * Actualiza el estado de hover con animación suave
     */
    updateHover(isHovered) {
        if (this.isEmpty || !this.isAvailable) return;
        
        this.isHovered = isHovered;
        const targetScale = isHovered ? 1.15 : 1.0;
        this.hoverScale += (targetScale - this.hoverScale) * 0.2;
    }

    /**
     * Convierte esta casilla en vacía (cuando se come una ficha)
     */
    setEmpty() {
        this.isEmpty = true;
        this.isDragging = false;
        this.isSelected = false;
        this.isHovered = false;
    }

    /**
     * Coloca una ficha en esta casilla
     */
    setOccupied() {
        this.isEmpty = false;
    }

    /**
     * Dibuja la casilla/ficha
     */
    draw() {
        if (!this.isAvailable) return;
        
        if (this.isEmpty) {
            this.drawEmptySquare();
        } else {
            this.drawChip();
        }
    }

    /**
     * Dibuja un agujero vacío
     */
    drawEmptySquare() {
        this.ctx.save();
        
        // Sombra exterior
        this.ctx.beginPath();
        this.ctx.arc(this.posX, this.posY, this.radius + 5, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fill();
        
        // Agujero principal
        this.ctx.beginPath();
        this.ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);

        const holeGradient = this.ctx.createRadialGradient(
            this.posX, this.posY, 0,
            this.posX, this.posY, this.radius
        );
        holeGradient.addColorStop(0, '#1a2329');
        holeGradient.addColorStop(1, '#0d1116');
        this.ctx.fillStyle = holeGradient;
        this.ctx.fill();

        // Borde brillante
        this.ctx.strokeStyle = 'rgba(126, 211, 33, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    /**
     * Dibuja la ficha con efectos visuales
     */
    drawChip() {
        // Usar posición de drag si está siendo arrastrada
        const x = this.isDragging ? this.dragX : this.posX;
        const y = this.isDragging ? this.dragY : this.posY;
        const scale = this.isDragging ? 1.2 : this.hoverScale;
        const drawRadius = this.radius * scale;

        this.ctx.save();

        // Sombra y resplandor
        if (this.isDragging) {
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = 'rgba(126, 211, 33, 0.8)';
            this.ctx.shadowOffsetY = 10;
        } else if (this.isHovered) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = 'rgba(126, 211, 33, 0.5)';
        } else {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        }

        // Círculo de fondo
        this.ctx.beginPath();
        this.ctx.arc(x, y, drawRadius, 0, Math.PI * 2);
        
        const bgGradient = this.ctx.createRadialGradient(
            x - drawRadius * 0.3,
            y - drawRadius * 0.3,
            0,
            x,
            y,
            drawRadius
        );
        bgGradient.addColorStop(0, '#2d5016');
        bgGradient.addColorStop(1, '#1a3010');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fill();

        // Borde brillante
        this.ctx.strokeStyle = this.isDragging || this.isSelected
            ? 'rgba(183, 243, 77, 0.9)' 
            : 'rgba(126, 211, 33, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;

        // Dibujar imagen de la ficha (recortada en círculo)
        if (this.image && this.image.complete) {
            const imgSize = drawRadius * 2.3;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, drawRadius, 0, Math.PI * 2);
            this.ctx.clip();
            
            this.ctx.drawImage(
                this.image,
                x - imgSize / 2,
                y - imgSize / 2,
                imgSize,
                imgSize
            );
        }

        this.ctx.restore();

        // Resplandor adicional si está siendo arrastrada
        if (this.isDragging) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x, y, drawRadius + 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(126, 211, 33, 0.3)';
            this.ctx.lineWidth = 8;
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    /**
     * Dibuja un hint animado sobre esta casilla
     * (Cuando es un destino válido)
     */
    drawHint(animationProgress) {
        if (!this.isEmpty || !this.isAvailable) return;

        const pulseScale = 1 + Math.sin(animationProgress * Math.PI * 2) * 0.2;
        const radius = this.radius * pulseScale;

        this.ctx.save();

        // Aro exterior brillante
        this.ctx.beginPath();
        this.ctx.arc(this.posX, this.posY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(126, 211, 33, ${0.8 - animationProgress * 0.3})`;
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#7ed321';
        this.ctx.stroke();

        // Aro interior
        this.ctx.beginPath();
        this.ctx.arc(this.posX, this.posY, radius - 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(183, 243, 77, ${0.6 - animationProgress * 0.2})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Dibuja una vista previa fantasma (durante drag)
     */
    drawGhost(isValid) {
        if (!this.isEmpty || !this.isAvailable) return;

        this.ctx.save();
        this.ctx.globalAlpha = 0.5;

        const color = isValid 
            ? 'rgba(126, 211, 33, 0.6)' 
            : 'rgba(255, 50, 50, 0.6)';

        this.ctx.beginPath();
        this.ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        this.ctx.strokeStyle = isValid 
            ? 'rgba(183, 243, 77, 0.8)' 
            : 'rgba(255, 100, 100, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.restore();
    }
}
