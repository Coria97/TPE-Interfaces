
export default class Chip {
    constructor(id, height, width, isAvailable, isEmpty, posX, posY, context, canvas, radius) {
        this.id = id;
        this.height = height; // Height of the square
        this.width = width; // Width of the square
        this.isAvailable = isAvailable;
        this.isEmpty = isEmpty;
        this.posX = posX + width / 2; // Center squeare position X
        this.posY = posY + height / 2; // Center squeare position Y
        this.chip = null;
        this.ctx = context;
        this.canvas = canvas;
        this.possibleMoves = [];
        this.possibleChipEats = [];
        this.radius = radius;
        this.color = isAvailable ? (isEmpty ? 'lightgrey' : 'brown') : 'darkgrey';

        this.calculatePossibleMoves();
        this.calculatePossibleChipEats();
    }

    calculatePossibleChipEats() {
        if (!this.isAvailable) {
            return;
        }
        
        const chipLeft = this.id - 1;
        const chipRight = this.id + 1;
        const chipUp = this.id - 7;
        const chipDown = this.id + 7;

        if (chipLeft >= 0 && !this.isEmpty) {
            this.possibleChipEats.push(chipLeft);
        }
        if (chipRight < 48 && !this.isEmpty) {
            this.possibleChipEats.push(chipRight);
        }
        if (chipUp >= 0 && !this.isEmpty) {
            this.possibleChipEats.push(chipUp);
        }
        if (chipDown < 48 && !this.isEmpty) {
            this.possibleChipEats.push(chipDown);
        }
    }

    calculatePossibleMoves() {
        if (!this.isAvailable) {
            return;
        }

        const moveLeft = this.id - 2;
        const moveRight = this.id + 2;
        const moveUp = this.id - 14;
        const moveDown = this.id + 14;

        if (moveLeft >= 0 && !this.isEmpty) {
            this.possibleMoves.push(moveLeft);
        }
        if (moveRight < 48 && !this.isEmpty) {
            this.possibleMoves.push(moveRight);
        }
        if (moveUp >= 0 && !this.isEmpty) {
            this.possibleMoves.push(moveUp);
        }
        if (moveDown < 48 && !this.isEmpty) {
            this.possibleMoves.push(moveDown);
        }
    }

    draw(context) {
        if (this.isAvailable) {
            if (!this.isEmpty) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = 'rgba(126, 211, 33, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        } else {
            
            
        }
    }
}