class Square {
    constructor(id, height, width, padding, isAvailable, isEmpty, border, padding, posX, posY, context, canvas) {
        this.id = id;
        this.height = height;
        this.width = width;
        this.padding = padding;
        this.isAvailable = isAvailable;
        this.isEmpty = isEmpty;
        this.border = border;
        this.padding = padding;
        this.posX = posX;
        this.posY = posY;
        this.chip = null;
        this.possibleMoves = [];
        this.color = isAvailable ? (isEmpty ? 'lightgrey' : 'brown') : 'darkgrey';
        if (!this.isEmpty && this.isAvailable) {
            this.chip = new Chip('blue', this.posX + this.width / 2, this.posY + this.height / 2, 30, this.context, this.canvas);
        }

        this.calculatePossibleMoves();
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
        context.fillStyle = this.border;
        context.fillRect(this.posX, this.posY, this.width, this.height);
        if (this.chip) {
            this.chip.draw();
        }
    }
}