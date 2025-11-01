import SquareLogic from './square-model.js';

export default class SquareView {
    constructor(squareController, root) {
        this.squareController = squareController;
        this.root = root;
        this.canvas = root.querySelector('#pegSolitaireCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.radius = 30;
        this.image = new Image();
        this.image.src = './assets/chip.png';
    }
    
    getRadius() {
        return this.radius;
    }

    draw() {
        console.log("Drawing square:", this.squareController.getId());
        // Get square state
        const squareStatus = this.squareController.getSquareStatus();

        if (squareStatus.isAvailable) {
            if (!squareStatus.isEmpty) {
                // Si está siendo arrastrada, dibujar el agujero en la posición original
                if (this.squareController.getIsDragging()) {
                    this.drawEmptySquare(squareStatus.pos);
                    // Y dibujar la ficha en la posición de drag
                    const dragPos = this.squareController.getDragPos();
                    this.drawOccupiedSquare(dragPos);
                } else {
                    // Si no está siendo arrastrada, dibujar normalmente
                    this.drawOccupiedSquare(squareStatus.pos);
                }
            } else {
                this.drawEmptySquare(squareStatus.pos);
            }
        }
        console.log("Finished drawing square:", this.squareController.getId());
    }

    drawEmptySquare(posSquare) {
        console.log("Drawing empty square at:", posSquare);
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

    drawOccupiedSquare(posSquare) {
        console.log("Drawing occupied square at:", posSquare);
        if (!this.image.complete) {
            this.image.onload = () => {
                this.draw();
            };
            return;
        }

        let chipRadius;

        if (this.squareController.getIsDragging()) {
            const hoverScale = this.squareController.squareModel.getHoverScale();
            const scaleFactor = 1 + hoverScale * 0.1;
            chipRadius = this.radius * scaleFactor;
        } else {
            
            chipRadius = this.radius;
        }

        // Calculate image size and position
        const imgSize = chipRadius * 2.3;
        const imgX = posSquare.x - imgSize / 2;
        const imgY = posSquare.y - imgSize / 2;

        // Draw chip image clipped to circle
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(posSquare.x, posSquare.y, chipRadius, 0, Math.PI * 2);
        this.ctx.clip();
        this.ctx.drawImage(this.image, imgX, imgY, imgSize, imgSize);
        this.ctx.restore();
        this.ctx.closePath();

        // Draw chip border
        this.ctx.beginPath();
        this.ctx.arc(posSquare.x, posSquare.y, chipRadius, 0, Math.PI * 2);
        
        // Borde diferente si está siendo arrastrada
        if (this.squareController.getIsDragging()) {
            this.ctx.strokeStyle = 'rgba(126, 211, 33, 1)';
            this.ctx.lineWidth = 4;
            // Agregar sombra para efecto de elevación
            this.ctx.shadowColor = 'rgba(126, 211, 33, 0.5)';
            this.ctx.shadowBlur = 15;
        } else {
            this.ctx.strokeStyle = 'rgba(126, 211, 33, 0.95)';
            this.ctx.lineWidth = 3;
        }
        
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Limpiar sombra
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        
        // Restaurar radius original
        this.radius = 30;
    }
}