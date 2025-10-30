import SquareLogic from './square-logic.js';

export default class BoardLogic {
    constructor() {
        this.totalSquares = 49;
        this.totalChips = 32;
        this.chipsEats = 0;
        // Casillas no disponibles del tablero (esquinas)
        this.unavailableSquares = [0, 1, 5, 6, 7, 8, 12, 13, 35, 36, 40, 41, 42, 43, 47, 48];

        // Crea el tablero con las casillas
        this.squares = this.createSquares();
        
        this.selectedChip = null; // Ficha seleccionada
        this.draggedChip = null;  // Ficha que se está arrastrando
    }

    createSquares() {
        const squares = [];
        for (let i = 0; i < this.totalSquares; i++) {
            const isAvailable = !this.unavailableSquares.includes(i);
            const isEmpty = !this.unavailableSquares.includes(i) && i === 24; // Centro vacío
            const posX = (i % 7) * 100; 
            const posY = Math.floor(i / 7) * 100;

            const square = new SquareLogic(
                i, 
                100, 
                100, 
                isAvailable, 
                isEmpty, 
                posX, 
                posY, 
            );
            squares.push(square);
        }
        return squares;
    }

    getSquares() {
        return this.squares;
    }

    setSelectedChip(id) {
        this.selectedChip = this.squares[id];
    }

    setDraggedChip(id) {
        this.draggedChip = this.squares[id];
    }

    getValidTargets() {
        const validTargets = [];
        const posiblesTargets = this.selectedChip.getPosibleMoves();
        const posiblesEats = this.selectedChip.getPosibleChipEats();
        
        for (let i = 0; i < 4; i++) {
            const targetId = posiblesTargets[i];
            const eatId = posiblesEats[i];

            const targetSqueare = this.squares[targetId];
            const eatSqueare = this.squares[eatId];

            if (targetSqueare) {
                if (!targetSqueare.getIsAvailable() || !targetSqueare.getIsEmpty()) {
                    continue;
                }
                // Verificar que la casilla a comer tenga ficha
                if (eatSqueare && eatSqueare.getIsAvailable() && !eatSqueare.getIsEmpty()) {
                    validTargets.push(targetSqueare);
                }
            }
        }

        return validTargets;
    }

    getDraggedChip() {
        return this.draggedChip;
    }
    
    executeMove(targetChip) {
        // Obtengo la ficha a comer
        const posibleMoves = this.selectedChip.getPosibleMoves();
        const eatIndex = -1;
        for (let i = 0; i < posibleMoves.length; i++) {
            if (posibleMoves[i] === targetChip.getId()) {
                eatIndex = i;
            }
        }
        const eatChipId = this.selectedChip.getIdChipToEatsByIndex(eatIndex);
        const eatChip = this.squares[eatChipId];

        // Actualizo los estados de las fichas
        this.selectedChip.setEmpty();
        eatChip.setEmpty();
        targetChip.isEmpty = false;

        // Recalculo los posibles movimientos
        for (const square of this.squares) {
            square.updateSquare();
        }

        this.chipsEats += 1;
        
        if (this.checkLose()) {
            return -1;
        }
        if (this.checkVictory()) {
            return 1;
        }
        return 0; // Juego sigue
        
    }

    checkLose() {   
        for (const square of this.squares) {
            if (square.hasPossibleMoves())
                return false;
        }
        return true;
    }

    checkVictory() {
        if (this.chipsEats === this.totalChips - 1) {
            console.log('🏆 ¡Has ganado el juego!');
        }  
    }

    resetDragState() {
        this.draggedChip.endDrag();
        this.draggedChip = null;
        this.selectedChip = null;
        this.validTargets = [];
    }
}
