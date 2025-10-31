import SquareLogic from './square-logic.js';

export default class BoardLogic {
    /*
    0  1  2  3  4  5  6
    7  8  9  10 11 12 13
    14 15 16 17 18 19 20
    21 22 23 24 25 26 27
    28 29 30 31 32 33 34
    35 36 37 38 39 40 41
    42 43 44 45 46 47 48
    */
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
        
        // Verificar cada posible target
        for (let i = 0; i < 4; i++) {
            const targetId = posiblesTargets[i];
            const eatId = posiblesEats[i];

            const targetSqueare = this.squares[targetId];
            const eatSqueare = this.squares[eatId];

            if (targetSqueare) {
                // Verificar que la casilla destino esté disponible y vacía
                if (!targetSqueare.getIsAvailable() || !targetSqueare.getIsEmpty()) {
                    continue;
                }
                // Verificar que la casilla a comer tenga ficha
                if (eatSqueare && eatSqueare.getIsAvailable() && !eatSqueare.getIsEmpty()) {
                    // Guardar target válido
                    console.log('✔ Target válido encontrado:', targetSqueare.getId());
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
        let eatIndex = -1;
        const targetChipId = targetChip.getId();
        for (let i = 0; i < posibleMoves.length; i++) {
            if (posibleMoves[i] === targetChipId) {
                eatIndex = i;
            }
        }
        const eatChipId = this.selectedChip.getIdChipToEatsByIndex(eatIndex);
        const eatChip = this.squares[eatChipId];

        // Actualizo los estados de las fichas
        this.selectedChip.setEmpty();
        eatChip.setEmpty();
        this.squares[targetChipId].setOccupied();

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

    cancelDrag() {
        if (this.draggedChip) {
            this.draggedChip.endDrag();
        }
    }
}
