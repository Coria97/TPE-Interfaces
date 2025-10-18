import { ImageFilter } from './image-filter.js';

export default class SubImage {
  constructor(image, sourceX, sourceY, width, height, canvasX, canvasY, correctRotation, filterType = null) {
    this.image = image;
    this.originalImage = image;
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.width = width;
    this.height = height;
    this.canvasX = canvasX;
    this.canvasY = canvasY;
    this.correctRotation = correctRotation;
    this.currentRotation = 0;
    this.filterType = filterType;
    this.hasFilter = false;
    this.randomizeRotation();
  }

  randomizeRotation() {
    const possibleRotations = [0, 90, 180, 270];
    const wrongRotations = possibleRotations.filter((r) => r !== this.correctRotation);
    const randomIndex = Math.floor(Math.random() * wrongRotations.length);
    this.currentRotation = wrongRotations[randomIndex];
  }

  rotateLeft() {
    this.currentRotation = (this.currentRotation - 90 + 360) % 360;
  }

  rotateRight() {
    this.currentRotation = (this.currentRotation + 90) % 360;
  }

  isCorrect() {
    return this.currentRotation === this.correctRotation;
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
    const centerX = this.canvasX + this.width / 2;
    const centerY = this.canvasY + this.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((this.currentRotation * Math.PI) / 180);
    ctx.drawImage(
      this.image,
      this.sourceX,
      this.sourceY,
      this.width,
      this.height,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
}