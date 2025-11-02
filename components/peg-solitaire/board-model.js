export default class BoardModel {
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
        this.totalSquares = 49; // 7x7 tablero
        this.totalChips = 32; // Fichas totales
        this.totalChipsEaten = 0; // Fichas comidas
        // Casillas no disponibles del tablero (esquinas)
        this.unavailableSquares = [0, 1, 5, 6, 7, 8, 12, 13, 35, 36, 40, 41, 42, 43, 47, 48];
    }

    getTotalSquares() {
        return this.totalSquares;
    }

    unavailableSquaresExists(id) {
        return this.unavailableSquares.includes(id);
    }

    incrementChipsEaten() {
        this.totalChipsEaten += 1;
    }

    getTotalChipsEaten() {
        return this.totalChipsEaten;
    }

    getTotalChips() {
        return this.totalChips;
    }
}
