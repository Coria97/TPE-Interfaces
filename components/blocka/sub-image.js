import { ImageFilter } from './image-filter.js';

export default class SubImage {
  constructor(image, sourceX, sourceY, width, height, canvasX, canvasY, correctRotation, filterType = null) {
    this.image = image;
    this.originalImage = image;
    this.sourceX = Math.round(sourceX);
    this.sourceY = Math.round(sourceY);
    this.width = Math.round(width);
    this.height = Math.round(height);
    this.canvasX = Math.round(canvasX);
    this.canvasY = Math.round(canvasY);
    this.correctRotation = correctRotation;
    this.currentRotation = 0;
    this.filterType = filterType;
    this.hasFilter = false;
    this.isFixed = false; // 🆕 Nueva propiedad para ayudita
    this.randomizeRotation();
  }

  randomizeRotation() {
    const possibleRotations = [0, 90, 180, 270].filter((r) => r !== this.correctRotation);
    const randomIndex = Math.floor(Math.random() * possibleRotations.length);
    this.currentRotation = possibleRotations[randomIndex];
  }

  rotateLeft() {
    // 🆕 No rotar si está fija
    if (this.isFixed) return;
    this.currentRotation = (this.currentRotation - 90 + 360) % 360;
  }

  rotateRight() {
    // 🆕 No rotar si está fija
    if (this.isFixed) return;
    this.currentRotation = (this.currentRotation + 90) % 360;
  }

  isCorrect() {
    return this.currentRotation === this.correctRotation;
  }

  // 🆕 Nuevo método para fijar la pieza
  fixToCorrectRotation() {
    this.currentRotation = this.correctRotation;
    this.isFixed = true;
    this.removeFilter(); // Mostrar sin filtro para que sea obvio que está correcta
  }

  async applyFilter() {
    if (this.filterType && !this.hasFilter) {
      this.image = await ImageFilter.applyFilter(this.originalImage, this.filterType);
      this.hasFilter = true;
    }
  }

  removeFilter() {
    if (this.hasFilter) {
      this.image = this.originalImage;
      this.hasFilter = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.canvasX, this.canvasY, this.width, this.height);
    ctx.clip();

    const centerX = this.canvasX + this.width / 2;
    const centerY = this.canvasY + this.height / 2;
    ctx.translate(centerX, centerY);

    const angleRad = (this.currentRotation * Math.PI) / 180;
    ctx.rotate(angleRad);

    const normalized = ((this.currentRotation % 360) + 360) % 360;
    let destW = this.width;
    let destH = this.height;
    if (normalized === 90 || normalized === 270) {
      destW = this.height;
      destH = this.width;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
      this.image,
      this.sourceX,
      this.sourceY,
      this.width,
      this.height,
      -destW / 2,
      -destH / 2,
      destW,
      destH
    );

    ctx.restore();

    // 🆕 Dibujar borde verde si está fija
    if (this.isFixed) {
      ctx.save();
      ctx.strokeStyle = '#7ed321';
      ctx.lineWidth = 4;
      ctx.strokeRect(this.canvasX + 2, this.canvasY + 2, this.width - 4, this.height - 4);
      ctx.restore();
    }
  }
}