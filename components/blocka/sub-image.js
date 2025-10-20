import { ImageFilter } from './image-filter.js';

export default class SubImage {
  constructor(image, sourceX, sourceY, width, height, canvasX, canvasY, correctRotation, filterType = null) {
    this.image = image; // This may be modified if a filter is applied
    this.originalImage = image; // To keep the unmodified image
    this.sourceX = Math.round(sourceX); // Source position in the original image
    this.sourceY = Math.round(sourceY); // Source position in the original image
    this.width = Math.round(width); // Width of the sub-image (already integer)
    this.height = Math.round(height); // Height of the sub-image (already integer)
    this.canvasX = Math.round(canvasX); // Canvas X position
    this.canvasY = Math.round(canvasY); // Canvas Y position
    this.correctRotation = correctRotation; // Correct rotation angle (0, 90, 180, 270)
    this.currentRotation = 0; // Current rotation angle
    this.filterType = filterType; // Type of filter to apply
    this.hasFilter = false; // Flag to track if filter is applied
    this.randomizeRotation(); // Randomize initial rotation
  }

  randomizeRotation() {
    // Randomly set current rotation to one of the incorrect angles
    const possibleRotations = [0, 90, 180, 270].filter((r) => r !== this.correctRotation);
    const randomIndex = Math.floor(Math.random() * possibleRotations.length);
    this.currentRotation = possibleRotations[randomIndex];
  }

  rotateLeft() {
    // Rotate counter-clockwise
    this.currentRotation = (this.currentRotation - 90 + 360) % 360;
  }

  rotateRight() {
    // Rotate clockwise
    this.currentRotation = (this.currentRotation + 90) % 360;
  }

  isCorrect() {
    // Check if current rotation matches the correct rotation
    return this.currentRotation === this.correctRotation;
  }

  async applyFilter() {
    // Apply filter if specified and not already applied
    if (this.filterType && !this.hasFilter) {
      this.image = await ImageFilter.applyFilter(this.originalImage, this.filterType);
      this.hasFilter = true;
    }
  }

  removeFilter() {
    // Remove filter and restore original image
    if (this.hasFilter) {
      this.image = this.originalImage;
      this.hasFilter = false;
    }
  }

  draw(ctx) {
    ctx.save();
    // Move to center, rotate, then draw
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