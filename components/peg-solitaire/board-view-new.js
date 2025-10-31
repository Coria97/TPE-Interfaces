import SquareView from './square-view.js';

export default class BoardView {
    constructor(root, canvas, boardLogic) {
        this.root = root;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.boardLogic = boardLogic;
        this.canvasSize = 700;
        this.squaresView = [];
    }

    drawInitialBoard() {
        try {
            // Limpiar canvas
            this.clearCanvas();
            
            // Dibujar fondo y gradiente
            this.drawBackground();
            
            // Crear y dibujar las casillas
            this.createSquaresView();
            this.drawSquares();
        } catch (error) {
            console.error("Error drawing board:", error);
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    }

    drawBackground() {
        // Fondo oscuro
        this.ctx.fillStyle = '#0a0e13';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Gradiente verde
        const gradient = this.ctx.createRadialGradient(
            this.canvasSize / 2, this.canvasSize / 2, 0,
            this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2
        );
        gradient.addColorStop(0, 'rgba(0, 100, 50, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 50, 25, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    }

    createSquaresView() {
        // Solo crear las vistas si no existen
        if (this.squaresView.length === 0) {
            const squares = this.boardLogic.getSquares();
            squares.forEach(square => {
                const squareView = new SquareView(square, this.ctx, this.canvas);
                this.squaresView.push(squareView);
            });
        }
    }

    drawSquares() {
        this.squaresView.forEach(squareView => {
            squareView.draw();
        });
    }

    redraw() {
        this.clearCanvas();
        this.drawBackground();
        this.drawSquares();
    }

    getSquaresView() {
        return this.squaresView;
    }
}