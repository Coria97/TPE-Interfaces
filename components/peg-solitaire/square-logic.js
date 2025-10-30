export default class SquareLogic {
    constructor(id, height, width, isAvailable, isEmpty, posX, posY) {
        this.id = id;
        this.height = height; // Altura del square
        this.width = width; // Ancho del square
        this.isAvailable = isAvailable; // El square no es parte del tablero
        this.isEmpty = isEmpty; // El square no tiene ficha
        this.posX = posX + width / 2; // Posicion del centro del square X
        this.posY = posY + height / 2; // Posicion del centro del square Y
        this.isDragging = false; // La ficha está siendo arrastrada
        this.isSelected = false; // Si la ficha está seleccionada
        this.originalPosX = null; // Posicion original X antes de arrastrar
        this.originalPosY = null; // Posicion original Y antes de arrastrar
        this.dragX = null; // Posicion actual de arrastre X
        this.dragY = null;  // Posicion actual de arrastre Y
        this.isHovered = false; // Si la ficha está arriba de otra
        this.possibleMoves = [];
        this.possibleChipEats = [];
        this.calculatePossibleMoves();
        this.calculatePossibleChipEats();
    }

    hasPossibleMoves() {
        return this.possibleMoves.length > 0;
    }
    
    getPosibleMoves() {
        return this.possibleMoves;
    }

    getPosibleChipEats() {
        return this.possibleChipEats;
    }

    getIsAvailable() {
        return this.isAvailable;
    }

    getIsEmpty() {
        return this.isEmpty;
    }

    getPos() {
        return { x: this.posX, y: this.posY };
    }

    getId() {
        return this.id;
    }

    getHoverScale() {
        return this.hoverScale;
    }

    setHoverScale(hoverScale) {
        this.hoverScale = hoverScale;
    }

    setIsHovered(isHovered) {
        this.isHovered = isHovered;
    }
    
    updateSquare() {
        this.possibleChipEats = [];
        this.possibleMoves = [];
        this.calculatePossibleMoves;
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
    
    updateDrag(mouseX, mouseY) {
        if (!this.isDragging) return;
        
        this.dragX = mouseX;
        this.dragY = mouseY;
    }

    getIdChipToEatsByIndex(index) {
        return this.possibleChipEats[index];
    }

    setEmpty() {
        this.isEmpty = true;
        this.isDragging = false;
        this.isSelected = false;
        this.isHovered = false;
    }

}