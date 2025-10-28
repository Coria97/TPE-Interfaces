import Chip from './chip.js';

export default class Board {
    constructor(root) {
        this.root = root;
        this.canvasSize = 700;
        this.canvas = root.querySelector('#pegSolitaireCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.unavailableSquares = [ 0, 1, 5, 6, 7, 8, 12, 13, 35, 36, 40, 41, 42, 43, 47, 48 ];
        this.totalSquares = 49;
        this.squares = this.createSquares();
    }

    createSquares() {
        const squares = [];
        for (let i = 0; i < this.totalSquares; i++) {
            const isAvailable = !this.unavailableSquares.includes(i);
            const isEmpty = !this.unavailableSquares.includes(i) && i === 24;
            const posX = (i % 7) * 100; 
            const posY = Math.floor(i / 7) * 100;

            const square = new Chip(i, 100, 100, isAvailable, isEmpty, posX, posY, this.ctx, this.canvas, 30);
            squares.push(square);
        }
        return squares;
    }

    draw() {
        try {
            // Background gradient
            const gradient = this.ctx.createRadialGradient(
                this.canvasSize / 2, this.canvasSize / 2, 0,
                this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2
            );
            gradient.addColorStop(0, 'rgba(0, 100, 50, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 50, 25, 0.1)');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
            
            this.squares.forEach(square => square.draw(this.ctx));
        } catch (error) {
            console.error("Error drawing board:", error);
        }
    }
}