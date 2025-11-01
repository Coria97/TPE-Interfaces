import SquareModel from './square-model.js';
import SquareView from './square-view.js';

export default class SquareController {
    constructor(root) {
        this.squareModel = null;
        this.squareView = new SquareView(this, root);
    }

    initSquareModel(id, isAvailable, isEmpty, posX, posY){
        this.squareModel = new SquareModel(
            id,
            100,
            100,
            isAvailable,
            isEmpty,
            posX,
            posY
        );
    }
    
    getId() {
        return this.squareModel.getId();
    }
    
    getSquareView() {
        return this.squareView;
    }

    getIdChipToEatsByIndex(index) {
        return this.squareModel.getIdChipToEatsByIndex(index);
    }

    getPos() {
        return this.squareModel.getPos();
    }

    getPosibleMoves() {
        return this.squareModel.getPosibleMoves();
    }

    getPosibleChipEats() {
        return this.squareModel.getPosibleChipEats();
    }

    getSquareStatus() {
        return {
            isAvailable: this.squareModel.getIsAvailable(),
            isEmpty: this.squareModel.getIsEmpty(),
            id: this.squareModel.getId(),
            pos: this.squareModel.getPos()
        };
    }

    setEmpty() {
        this.squareModel.setEmpty(true);
    }

    setOccupied() {
        this.squareModel.setOccupied();
    }

    isMouseOver(mouseX, mouseY) {
        if (!this.squareModel.getIsAvailable()) return false;
        
        // Si está vacía, aumentar el radio de detección
        const detectionRadius = this.squareModel.getIsEmpty() ? this.squareView.getRadius() * 1.8 : this.squareView.getRadius();

        // Obtenemos la posición del square
        const pos = this.squareModel.getPos();
        
        // Calculamos la distancia entre el mouse y el centro del square
        const distance = Math.sqrt(
            Math.pow(mouseX - pos.x, 2) + 
            Math.pow(mouseY - pos.y, 2)
        );
        
        return distance <= detectionRadius;
    }
    
    startDrag(mouseX, mouseY) {
        return this.squareModel.startDrag(mouseX, mouseY);
    }

    updateDrag(mouseX, mouseY) {
        this.squareModel.updateDrag(mouseX, mouseY);
    }

    updateHover(isHovered) {        
        this.squareModel.updateHover(isHovered);
    }

    updateSquare() {
        this.squareModel.updateSquare();
    }

    hasPossibleMoves() {
        return this.squareModel.hasPossibleMoves();
    }

    endDrag() {
        this.squareModel.endDrag();
    }
}