import BoardView from './board-view.js';
import BoardModel from './board-model.js';
import SquareController from './square-controller.js';

export default class BoardController {
    constructor(root) {
        console.log("BoardController initialized");
        // Inicializar la lógica y la vista del tablero
        this.root = root;
        this.boardModel = new BoardModel();
        this.boardView = new BoardView(root);
        
        // Inicializar controladores de casillas
        this.squareControllers = [];
        this.initializeSquareControllers();
        const squaresView = this.getSquaresView();
        this.boardView.setSquareViews(squaresView);

        // Atributos para manejar selección y arrastre
        this.selectedChipController = null; // Ficha seleccionada
        this.draggedChipController = null;  // Ficha que se está arrastrando

        // Handleo de eventos
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.setupEventListeners();

        // Dibujo inicial del tablero
        console.log("Call to drawBoard from BoardController");
        this.boardView.drawBoard();
    }

    setupEventListeners() {
        // Delegar la configuración de eventos a la vista
        this.boardView.setupEventListeners(
            this.handleMouseDown,
            this.handleMouseMove,
            this.handleMouseUp
        );
    }

    initializeSquareControllers() {
        const totalSquares = this.boardModel.getTotalSquares();
        for (let i = 0; i < totalSquares; i++) {
            // Calculamos atributos de la casilla
            const isAvailable = !this.boardModel.unavailableSquaresExists(i);
            const isEmpty = isAvailable && i === 24; // Centro vacío
            const posX = (i % 7) * 100; 
            const posY = Math.floor(i / 7) * 100;
            
            // Inicializamos el controlador de la casilla
            const squareController = new SquareController(this.root)
            squareController.initSquareModel(i, isAvailable, isEmpty, posX, posY);
            
            // Guardamos la referencia al controlador
            this.squareControllers.push(squareController);
        }
    }

    getSquaresView() {
        const squaresView = [];
        for (const squareController of this.squareControllers) {
            squaresView.push(squareController.getSquareView());
        }
        return squaresView;
    }

    handleMouseDown(event) {
        // Obtener posición del mouse al hacer click
        const mouse = this.boardView.getMousePos(event);

        // Buscar dentro del square clickeado la ficha
        for (const squareController of this.squareControllers) {
            const squareStatus = squareController.getSquareStatus();

            // Chequear si el mouse está sobre la casilla valida y si clickeo en la ficha
            if (squareController.isMouseOver(mouse.x, mouse.y) && !squareStatus.isEmpty) {
                if (squareController.startDrag(mouse.x, mouse.y)) {
                    // Actualizar estado en boardModel
                    this.selectedChipController = squareController;
                    this.draggedChipController = squareController;
                    this.boardView.setCursorStyle('grabbing');
                    return;
                }
            }
        }
    }

    handleMouseMove(event) {
        // Obtener posición del mouse al mover
        const mouse = this.boardView.getMousePos(event);

        // Actualizar drag
        if (this.draggedChipController) {
            this.draggedChipController.updateDrag(mouse.x, mouse.y);
        }

        // Actualizar hover de las fichas si pasa por una de ellas
        for (const squareController of this.squareControllers) {
            if (squareController === this.draggedChipController) 
                continue;

            const isHovered = squareController.isMouseOver(mouse.x, mouse.y);
            squareController.updateHover(isHovered);
        }
    }

    handleMouseUp(event) {
        // Chequeo de si hay una ficha siendo arrastrada
        if (!this.draggedChipController) return;

        // Obtener posición del mouse al soltar
        const mouse = this.boardView.getMousePos(event);

        let targetChip = null;
        let minDistance = Infinity;
        
        // Buscar la casilla destino más cercana al donde solto el click
        for (const squareController of this.squareControllers) {
            const squareStatus = squareController.getSquareStatus();

            if (squareStatus.isEmpty && squareStatus.isAvailable) {
                const chipPos = squareController.getPos();
                const x = (mouse.x - chipPos.x) * (mouse.x - chipPos.x);
                const y = (mouse.y - chipPos.y) * (mouse.y - chipPos.y);
                const distance = Math.sqrt(x + y);
                
                // Si está dentro de un radio razonable (60 pixeles) y es la más cercana hasta ahora
                if (distance < 60 && distance < minDistance) {
                    targetChip = squareController;
                    minDistance = distance;
                }
            }
        }
        
        // Chequear si el movimiento es válido y lo hace
        if (targetChip && this.validMovement(targetChip)) {
            const result = this.executeMove(targetChip);
            // Ver que hacer con el result:  0 sigue jugando, -1 pierde, 1 gana
            if (result === -1) {
                console.log("GAME OVER - Derrota detectada");
                this.boardView.drawGameResult(-1);
            } else if (result === 1) {
                console.log("GAME WON - Victoria detectada");
                this.boardView.drawGameResult(1);
            } else {
                this.boardView.drawBoard();
            }
        } else {
            this.cancelDrag();
        }
        
        // Limpiar estado de drag & hover en las fichas
        this.resetDragState();
        this.boardView.setCursorStyle('default');
    }

    validMovement(targetChipController) {
        const validTargetsControllers = [];
        const posiblesTargets = this.selectedChipController.getPosibleMoves();
        const posiblesEats = this.selectedChipController.getPosibleChipEats();

        // Verificar cada posible target
        for (let i = 0; i < 4; i++) {
            const targetId = posiblesTargets[i];
            const eatId = posiblesEats[i];

            const targetSquareController = this.squareControllers[targetId];
            const eatSquareController = this.squareControllers[eatId];

            if (this.verifyMove(targetSquareController, eatSquareController)) {
                validTargetsControllers.push(targetSquareController);
            }
        }

        // Verificar si el targetChipController está en los válidos
        for (const vt of validTargetsControllers) {
            if (vt === targetChipController) {
                return true;
            }
        }
        return false;
    }

    executeMove(targetChipController) {
        // Obtengo la ficha a comer
        const posibleMoves = this.selectedChipController.getPosibleMoves();
        let eatIndex = -1;
        const targetChipId = targetChipController.getId();
        for (let i = 0; i < posibleMoves.length; i++) {
            if (posibleMoves[i] === targetChipId) {
                eatIndex = i;
            }
        }
        const eatChipId = this.selectedChipController.getIdChipToEatsByIndex(eatIndex);
        const eatChip = this.squareControllers[eatChipId];

        // Actualizo los estados de las fichas
        this.selectedChipController.setEmpty();
        eatChip.setEmpty();
        targetChipController.setOccupied();

        // Recalculo los posibles movimientos
        for (const squareController of this.squareControllers) {
            squareController.updateSquare();
        }

        this.boardModel.incrementChipsEaten();
        
        console.log("Checking game state after move...");
        if (this.checkLose()) {
            console.log("Game lost");
            return -1;
        }
        if (this.checkVictory()) {
            console.log("Game won");
            return 1;
        }
        return 0; // Juego sigue
    }

    checkLose() {
        console.log("Checking for lose condition...");
        for (const squareController of this.squareControllers) {
            const squarePosibleMovesIndexes = squareController.getPosibleMoves();
            const squarePosibleChipEatsIndexes = squareController.getPosibleChipEats();

            if (!squareController.getIsEmpty()) {
                for (let i = 0; i < squarePosibleMovesIndexes.length; i++) {
                    const targetId = squarePosibleMovesIndexes[i];
                    const eatId = squarePosibleChipEatsIndexes[i];
                    
                    const targetSquareController = this.squareControllers[targetId];
                    const eatSquareController = this.squareControllers[eatId];
                    console.log("Verifying move from square", squareController.getId(), "to target", targetId, "eating", eatId);
                    if (this.verifyMove(targetSquareController, eatSquareController)) {
                        console.log("Valid move found! Game continues.");
                        return false; // Hay un movimiento válido
                    }
                }
            }
        }
        console.log("No valid moves found. Game lost!");
        return true;
    }

    verifyMove(targetSquareController, eatSquareController) {
        if (targetSquareController && eatSquareController)  {
            // Verificar que la casilla destino esté disponible y vacía
            const targetSquareStatus = targetSquareController.getSquareStatus();
            if (!targetSquareStatus.isAvailable || !targetSquareStatus.isEmpty) {
                return false;
            }
            const eatSquareStatus = eatSquareController.getSquareStatus();
            if (!eatSquareStatus.isEmpty && eatSquareStatus.isAvailable) {
                // La casilla a comer debe tener una ficha
                return true;
            }
        }
        return false;
    }
    
    

    checkVictory() {
        if (this.boardModel.getTotalChipsEaten() === this.boardModel.getTotalChips() - 1) {
            return true;
        }  
        return false;
    }

    resetDragState() {
        // Limpiar estado de drag & hover en las fichas
        this.draggedChipController.endDrag();
        this.draggedChipController = null;
        this.selectedChipController = null;
    }

    cancelDrag() {
        if (this.draggedChipController) {
            this.draggedChipController.endDrag();
        }
    }
}
