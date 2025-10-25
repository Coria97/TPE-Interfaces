class Chip {
    constructor(color, posX, posY, radius, canvas, context) {
        this.color = color;
        this.posX = posX;
        this.posY = posY;
        this.radius = radius;
        this.context = context;
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        this.context.fill();
    }
}