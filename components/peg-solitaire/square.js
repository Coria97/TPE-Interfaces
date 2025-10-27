import Chip from './chip.js';

export default class Square {
    constructor(id, height, width, padding, isAvailable, isEmpty, border, posX, posY, context, canvas) {
        this.id = id;
        this.height = height;
        this.width = width;
        this.paddingSize = 14;
        this.padding = padding;
        this.isAvailable = isAvailable;
        this.isEmpty = isEmpty;
        this.border = border;
        this.posX = posX;
        this.posY = posY;
        this.chip = null;
        this.context = context;
        this.canvas = canvas;
        this.possibleMoves = [];
        this.possibleChipEats = [];
        this.color = isAvailable ? (isEmpty ? 'lightgrey' : 'brown') : 'darkgrey';
        if (this.isAvailable) {
            if (!this.isEmpty) {
                this.chip = new Chip('blue', this.posX + this.width / 2, this.posY + this.height / 2, 30, this.canvas, this.context);
            }
            else {
                this.chip = new Chip('black', this.posX + this.width / 2, this.posY + this.height / 2, 15, this.canvas, this.context);;
            }
        }

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
        context.fillStyle = this.color;
        context.fillRect(this.posX, this.posY, this.width, this.height);
        if (this.chip) {
            this.chip.draw();
        }
    }
}