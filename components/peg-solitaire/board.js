import Square from './square.js';

export default class Board {
    constructor(root) {
        this.root = root;
        
        this.canvas = root.querySelector('#pegSolitaireCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.unavailableSquares = [ 0, 1, 5, 6, 7, 8, 12, 13, 35, 36, 40, 41, 42, 43, 47, 48 ];
        this.squareBorderTop = [ 2, 3, 4, 14, 15, 19, 20 ];
        this.squareBorderLeft = [ 21, 9, 37 ];
        this.squareBorderRight = [ 11, 27, 39 ];
        this.squareBorderBottom = [ 44, 45, 46, 28, 29, 33, 34 ];
        this.paddingTop = [ 2, 3, 4 ];
        this.paddingLeft = [ 14, 21, 28 ];
        this.paddingRight = [ 20, 27, 34 ];
        this.paddingBottom = [ 44, 45, 46 ];
        this.totalSquares = 49;
        this.squares = this.createSquares();
    }

    createSquares() {
        const squares = [];
        for (let i = 0; i < this.totalSquares; i++) {
            const isAvailable = !this.unavailableSquares.includes(i);
            const isEmpty = !this.unavailableSquares.includes(i) && i === 24;
            const hasBorderTop = this.squareBorderTop.includes(i);
            const hasBorderLeft = this.squareBorderLeft.includes(i);
            const hasBorderRight = this.squareBorderRight.includes(i);
            const hasBorderBottom = this.squareBorderBottom.includes(i);
            const border = [hasBorderTop, hasBorderLeft, hasBorderRight, hasBorderBottom];
            const hasPaddingTop = this.paddingTop.includes(i);
            const hasPaddingLeft = this.paddingLeft.includes(i);
            const hasPaddingRight = this.paddingRight.includes(i);
            const hasPaddingBottom = this.paddingBottom.includes(i);
            const padding = [hasPaddingTop, hasPaddingLeft, hasPaddingRight, hasPaddingBottom];
            const posX = (i % 7) * 100; 
            const posY = Math.floor(i / 7) * 100;

            const square = new Square(i, 100, 100, padding, isAvailable, isEmpty, border, posX, posY, this.ctx, this.canvas);
            squares.push(square);
        }
        return squares;
    }

    draw() {
        try {
            this.squares.forEach(square => square.draw(this.ctx));
        } catch (error) {
            console.error("Error drawing board:", error);
        }
    }
}