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
        // Recalcular movimientos posibles
        this.possibleChipEats = [];
        this.possibleMoves = [];
        this.calculatePossibleMoves();
        this.calculatePossibleChipEats();
    }

    calculatePossibleMoves() {
        this.possibleMoves = [];
        
        if (!this.isAvailable || this.isEmpty) {
            return;
        }

        const moveLeft = this.id - 2;
        const moveRight = this.id + 2;
        const moveUp = this.id - 14;
        const moveDown = this.id + 14;

        // Izquierda
        if (moveLeft >= 0) {
            this.possibleMoves.push(moveLeft);
        }
        // Derecha
        if (moveRight < 49) {
            this.possibleMoves.push(moveRight);
        }
        // Arriba
        if (moveUp >= 0) {
            this.possibleMoves.push(moveUp);
        }
        // Abajo
        if (moveDown < 49) {
            this.possibleMoves.push(moveDown);
        }
    }

    calculatePossibleChipEats() {
        this.possibleChipEats = [];
        
        if (!this.isAvailable || this.isEmpty) {
            return;
        }
        
        const chipLeft = this.id - 1;
        const chipRight = this.id + 1;
        const chipUp = this.id - 7;
        const chipDown = this.id + 7;

        const moveLeft = this.id - 2;
        const moveRight = this.id + 2;
        const moveUp = this.id - 14;
        const moveDown = this.id + 14;

        // Izquierda - verificar si moveLeft está en possibleMoves
        if (moveLeft >= 0 && this.possibleMoves.includes(moveLeft)) {
            this.possibleChipEats.push(chipLeft);
        }
        // Derecha
        if (moveRight < 49 && this.possibleMoves.includes(moveRight)) {
            this.possibleChipEats.push(chipRight);
        }
        // Arriba
        if (moveUp >= 0 && this.possibleMoves.includes(moveUp)) {
            this.possibleChipEats.push(chipUp);
        }
        // Abajo
        if (moveDown < 49 && this.possibleMoves.includes(moveDown)) {
            this.possibleChipEats.push(chipDown);
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
    setOccupied() {
        this.isEmpty = false;
    }

    endDrag() {
        this.isDragging = false;
        this.isSelected = false;
        this.dragX = null;
        this.dragY = null;
    }
}