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

    drawBoard(draggedSquareView = null) {
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

             // Dibujar la ficha arrastrada al final (encima de todo)
            if (draggedSquareView) {
                draggedSquareView.draw();
            }
            console.log("Finished drawing board.");
        } catch (error) {
            console.error("Error drawing board:", error);
        }
    }

    drawGameResult(result) {
        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Fondo oscuro
        this.ctx.fillStyle = '#0a0e13';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Configurar estilos según resultado
        const isVictory = result === 1;
        const bgColor = isVictory ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
        const textColor = isVictory ? '#00ff00' : '#ff0000';
        const message = isVictory ? '¡VICTORIA!' : 'GAME OVER';
        const subtitle = isVictory ? '¡Felicitaciones!' : 'No hay más movimientos';
        
        // Overlay semi-transparente
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Mensaje principal
        this.ctx.fillStyle = textColor;
        this.ctx.font = 'bold 72px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(message, this.canvasSize / 2, this.canvasSize / 2 - 40);
        
        // Subtítulo
        this.ctx.font = '32px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(subtitle, this.canvasSize / 2, this.canvasSize / 2 + 40);
        
        // Mensaje para reiniciar
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fillText('Presiona F5 para jugar de nuevo', this.canvasSize / 2, this.canvasSize / 2 + 100);
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
