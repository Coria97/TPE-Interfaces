import SquareView from './square-view.js';

export default class BoardView {
    constructor(root) {
        this.root = root;
        this.canvasSize = 700;
        this.canvas = root.querySelector('#pegSolitaireCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.squaresView = [];
    }

    setupEventListeners(onMouseDown, onMouseMove, onMouseUp) {
        this.canvas.addEventListener('mousedown', onMouseDown);
        this.canvas.addEventListener('mousemove', onMouseMove);
        this.canvas.addEventListener('mouseup', onMouseUp);
    }

    drawBoard() {
        console.log("Drawing board...");
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
            this.squaresView.forEach(square => {
                square.draw();
            });
            console.log("Finished drawing board.");
        } catch (error) {
            console.error("Error drawing board:", error);
        }
    }

    setSquareViews(squaresView) {
        this.squaresView = squaresView;
    }

    setCursorStyle(style) {
        // Cambiar el estilo del cursor del canvas
        this.canvas.style.cursor = style;
    }

    getMousePos(event) {
        // Obtengo la posición del mouse relativa al canvas
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}
