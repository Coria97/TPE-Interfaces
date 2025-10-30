import BoardLogic from './board-logic.js';
import SquareView from './square-view.js';

export default class BoardView {
    constructor(root) {
        this.root = root;
        this.canvasSize = 700;
        this.canvas = root.querySelector('#pegSolitaireCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.boardLogic = new BoardLogic();
        this.squaresView = [];
        this.drawInitialBoard();
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.setupEventListeners();
    }

    drawInitialBoard() {
        try {
            // Fondo
            this.ctx.fillStyle = '#0a0e13';
            this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
            
            // Gradiente
            const gradient = this.ctx.createRadialGradient(
                this.canvasSize / 2, this.canvasSize / 2, 0,
                this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2
            );
            gradient.addColorStop(0, 'rgba(0, 100, 50, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 50, 25, 0.1)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
            
            // Dibujar las casillas
            const squares = this.boardLogic.getSquares();
            squares.forEach(square => {
                const squareView = new SquareView(square, this.ctx, this.canvas);
                this.squaresView.push(squareView);
                squareView.draw();
            });
        } catch (error) {
            console.error("Error drawing board:", error);
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
       // this.canvas.addEventListener('mouseup', this.handleMouseUp);
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

        // Buscar dentro del square clickeado la ficha
        for (const chip of this.squaresView) {
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
        for (const chip of this.squaresView) {
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
        
        let targetChip = null;
        let minDistance = Infinity;
        
        // Buscar la casilla destino más cercana al donde solto el click
        for (const chip of this.squaresView) {
            if (chip.isEmpty && chip.isAvailable) {
                const chipPos = chip.getPos();
                const x = (mouse.x - chipPos.x) * (mouse.x - chipPos.x);
                const y = (mouse.y - chipPos.y) * (mouse.y - chipPos.y);
                const distance = Math.sqrt(x + y);
                
                // Si está dentro de un radio razonable (60 pixeles) y es la más cercana hasta ahora
                if (distance < 60 && distance < minDistance) {
                    targetChip = chip;
                    minDistance = distance;
                }
            }
        }
        
        // Debug
        if (targetChip) {
            console.log('🎯 Intento de movimiento:');
            console.log('   Desde:', draggedChip.id);
            console.log('   Hasta:', targetChip.id);
            console.log('   Distancia:', minDistance.toFixed(2));
            console.log('   ¿Es válido?:', this.isValidMove(draggedChip, targetChip));
        } else {
            console.log('❌ No se encontró casilla destino cerca del mouse');
        }
        
        // Chequear si el movimiento es válido y lo hace
        if (targetChip && this.isValidMove(targetChip)) {
            console.log('✅ Movimiento ejecutado');
            const result = this.boardLogic.executeMove(targetChip);
            // Ver que hacer con el result:  0 sigue jugando, -1 pierde, 1 gana
        } else {
            console.log('❌ Movimiento cancelado');
            this.boardLogic.cancelDrag();
        }
        
        this.boardLogic.resetDragState();
        // Limpiar estado de drag & hover en las fichas
        this.canvas.style.cursor = 'default';
    }

    validMovement(targetChip) {
        const validTargets = this.boardLogic.getValidTargets();
        for (const vt of validTargets) {
            if (vt.target.id === targetChip.id) {
                return true;
            }
        }
        return false;
    }
}
