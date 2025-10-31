import BoardLogic from './board-logic.js';
import BoardView from './board-view.js';

export default class BoardController {
    constructor(root) {
        this.root = root;
        this.canvas = root.querySelector('#pegSolitaireCanvas');
        
        // Inicializar Model y View
        this.boardLogic = new BoardLogic();
        this.boardView = new BoardView(root, this.canvas, this.boardLogic);
        
        // Bind methods
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        // Setup eventos
        this.setupEventListeners();
        
        // Dibujar tablero inicial
        this.boardView.drawInitialBoard();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    handleMouseDown(event) {
        const mouse = this.getMousePos(event);
        const squaresView = this.boardView.getSquaresView();

        // Buscar dentro del square clickeado la ficha
        for (const chip of squaresView) {
            const squareStatus = chip.getSquareStatus();

            // Chequear si el mouse está sobre la casilla valida y si clickeo en la ficha
            if (chip.isMouseOver(mouse.x, mouse.y) && !squareStatus.isEmpty) {
                if (chip.startDrag(mouse.x, mouse.y)) {
                    // Actualizar estado en boardLogic
                    this.boardLogic.setSelectedChip(chip.getId());
                    this.boardLogic.setDraggedChip(chip.getId());
                    this.canvas.style.cursor = 'grabbing';
                    return;
                }
            }
        }
    }

    handleMouseMove(event) {
        const mouse = this.getMousePos(event);

        // Actualizar drag
        const draggedChip = this.boardLogic.getDraggedChip();
        if (draggedChip) {
            draggedChip.updateDrag(mouse.x, mouse.y);
        }

        // Actualizar hover de las fichas si pasa por una de ellas
        const squaresView = this.boardView.getSquaresView();
        for (const chip of squaresView) {
            if (chip === draggedChip) 
                continue;
            
            const isHovered = chip.isMouseOver(mouse.x, mouse.y);
            chip.updateHover(isHovered);
        }
    }

    handleMouseUp(event) {
        let draggedChip = this.boardLogic.getDraggedChip();
        if (!draggedChip) return;

        const mouse = this.getMousePos(event);
        const squaresView = this.boardView.getSquaresView();
        
        let targetChip = null;
        let minDistance = Infinity;
        
        // Buscar la casilla destino más cercana al donde solto el click
        for (const chip of squaresView) {
            const squareStatus = chip.getSquareStatus();
            if (squareStatus.isEmpty && squareStatus.isAvailable) {
                const chipPos = chip.squareLogic.getPos();
                const x = (mouse.x - chipPos.x) * (mouse.x - chipPos.x);
                const y = (mouse.y - chipPos.y) * (mouse.y - chipPos.y);
                const distance = Math.sqrt(x + y);
                
                // Si está dentro de un radio razonable (60 pixeles) y es la más cercana hasta ahora
                if (distance < 60 && distance < minDistance) {
                    targetChip = chip.squareLogic;
                    minDistance = distance;
                }
            }
        }
        
        // Debug
        if (targetChip) {
            console.log('🎯 Intento de movimiento:');
            console.log('   Desde:', draggedChip.getId());
            console.log('   Hasta:', targetChip.getId());
            console.log('   Distancia:', minDistance.toFixed(2));
            console.log('   ¿Es válido?:', this.isValidMove(targetChip));
        } else {
            console.log('❌ No se encontró casilla destino cerca del mouse');
        }
        
        // Chequear si el movimiento es válido y lo hace
        if (targetChip && this.isValidMove(targetChip)) {
            console.log('✅ Movimiento ejecutado');
            const result = this.boardLogic.executeMove(targetChip);
            
            // Redibujar el tablero después del movimiento
            this.boardView.redraw();
            
            // Manejar resultado del juego
            if (result === 1) {
                console.log('🎉 ¡Ganaste!');
                // TODO: Mostrar mensaje de victoria
            } else if (result === -1) {
                console.log('😢 Perdiste - No hay más movimientos');
                // TODO: Mostrar mensaje de derrota
            }
        } else {
            console.log('❌ Movimiento cancelado');
        }
        
        this.boardLogic.resetDragState();
        // Limpiar estado de drag & hover en las fichas
        this.canvas.style.cursor = 'default';
        
        // Redibujar para limpiar estados visuales
        this.boardView.redraw();
    }

    isValidMove(targetChip) {
        const validTargets = this.boardLogic.getValidTargets();
        for (const vt of validTargets) {
            if (vt.getId() === targetChip.getId()) {
                return true;
            }
        }
        return false;
    }
}
