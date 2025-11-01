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
                this.drawOccupiedSquare(squareStatus.pos);
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
}