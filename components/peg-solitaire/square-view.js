import SquareLogic from './square-logic.js';

export default class SquareView {
    constructor(squareLogic, ctx, canvas) {
        this.squareLogic = squareLogic;
        this.ctx = ctx;
        this.canvas = canvas;
        this.radius = 30;
        this.image = new Image();
        this.image.src = './assets/chip.png';
    }
    
    draw() {
        // Get square state
        const isAvailable = this.squareLogic.getIsAvailable();
        const isEmpty = this.squareLogic.getIsEmpty();

        if (isAvailable) {
            if (!isEmpty) {
                this.drawOccupiedSquare();
            } else {
                this.drawEmptySquare();
            }
        }
    }

    drawEmptySquare() {
        // Draw hole
        // Get position of square
        const posSquare = this.squareLogic.getPos();
        
        // Draw hole circle
        this.ctx.beginPath();
        this.ctx.arc(posSquare.x, posSquare.y, this.radius, 0, Math.PI * 2);

        const holeGradient = this.ctx.createRadialGradient(
            posSquare.x, posSquare.y, 0,
            posSquare.x, posSquare.y, this.radius
        );
        holeGradient.addColorStop(0, '#1a2329');
        holeGradient.addColorStop(1, '#0d1116');
        this.ctx.fillStyle = holeGradient;
        this.ctx.fill();

        // Border for chip
        this.ctx.strokeStyle = 'rgba(126, 211, 33, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawOccupiedSquare() {
        // Get position of square
        const posSquare = this.squareLogic.getPos();

        // Calculate image size and position
        const imgSize = this.radius * 2.3;
        const imgX = posSquare.x - imgSize / 2;
        const imgY = posSquare.y - imgSize / 2;

        // Draw chip image clipped to circle
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(posSquare.x, posSquare.y, this.radius, 0, Math.PI * 2);
        this.ctx.clip();
        this.ctx.drawImage(this.image, imgX, imgY, imgSize, imgSize);
        this.ctx.restore();
        this.ctx.closePath();

        // Draw chip border
        this.ctx.beginPath();
        this.ctx.arc(posSquare.x, posSquare.y, this.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(126, 211, 33, 0.95)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    isMouseOver(mouseX, mouseY) {
        if (!this.squareLogic.getIsAvailable()) return false;
        
        // Si está vacía, aumentar el radio de detección
        const detectionRadius = this.squareLogic.getIsEmpty() ? this.radius * 1.8 : this.radius;

        // Obtenemos la posición del square
        const pos = this.squareLogic.getPos();
        
        // Calculamos la distancia entre el mouse y el centro del square
        const distance = Math.sqrt(
            Math.pow(mouseX - pos.x, 2) + 
            Math.pow(mouseY - pos.y, 2)
        );
        
        return distance <= detectionRadius;
    }
    
    startDrag(mouseX, mouseY) {
        return this.squareLogic.startDrag(mouseX, mouseY);
    }

    getSquareStatus() {
        return {
            isAvailable: this.squareLogic.getIsAvailable(),
            isEmpty: this.squareLogic.getIsEmpty()
        };
    }

    getId() {
        return this.squareLogic.getId();
    }

    updateHover(isHovered) {
        const square = this.getSquareStatus();
        if (square.isEmpty || !square.isAvailable) return;
        
        this.squareLogic.setIsHovered(isHovered);
        const targetScale = isHovered ? 1.15 : 1.0;
        const hoverScale = (targetScale - this.squareLogic.getHoverScale()) * 0.2;
        this.squareLogic.setHoverScale(this.squareLogic.getHoverScale() + hoverScale);
    }
}