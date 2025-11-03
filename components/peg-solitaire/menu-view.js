export default class MenuView {
    constructor(root, onPlayCallback) {
        this.canvas = root.querySelector('#pegSolitaireCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.onPlayCallback = onPlayCallback;
        
        // Tipos de fichas disponibles
        this.chipTypes = [
            { id: 1, name: 'Ficha 1', image: './assets/chip-1.jpeg' },
            { id: 2, name: 'Ficha 2', image: './assets/chip-2.png' },
            { id: 3, name: 'Ficha 3', image: './assets/chip-3.jpeg' },
            { id: 4, name: 'Ficha 4', image: './assets/chip-default.png' }
        ];
        
        this.selectedChipType = 1; // Por defecto
        this.chipImages = {};
        this.loadImages();
        
        // Colores del theme (iguales a UI-Manager y Board)
        this.colors = {
            primary: '#7ed321',
            primaryLight: '#b7f34d',
            primaryDark: '#6f982f',
            secondary: '#10c27c',
            background: 'rgba(20, 23, 27, 0.95)',
            backgroundDark: 'rgba(14, 15, 16, 0.98)',
            border: '#2b323a',
            textPrimary: '#ffffff',
            textSecondary: 'rgba(255, 255, 255, 0.8)',
            boardBackground: '#14171b'
        };
        
        // Configuración del menú
        this.menuConfig = {
            title: 'PEG SOLITAIRE',
            chipRadius: 40,
            chipSpacing: 140,
            playButton: {
                width: 220,
                height: 60,
                text: 'JUGAR'
            }
        };
        
        this.setupEventListeners();
    }
    
    async loadImages() {
        const promises = this.chipTypes.map(chip => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.chipImages[chip.id] = img;
                    resolve();
                };
                img.onerror = reject;
                img.src = chip.image;
            });
        });
        
        await Promise.all(promises);
        this.draw();
    }
    
    setupEventListeners() {
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.hoveredChip = null;
        this.hoveredButton = false;
    }
    
    removeEventListeners() {
        this.canvas.removeEventListener('click', this.handleClick);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fondo oscuro como el tablero
        this.ctx.fillStyle = this.colors.boardBackground;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Título sin animación
        this.ctx.save();
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.colors.primary;
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.font = 'bold 56px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.menuConfig.title, this.canvas.width / 2, 100);
        this.ctx.restore();
        
        // Línea decorativa debajo del título
        const lineWidth = 300;
        const lineX = (this.canvas.width - lineWidth) / 2;
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.fillRect(lineX, 130, lineWidth, 3);
        
        // Subtítulo
        this.ctx.fillStyle = this.colors.textSecondary;
        this.ctx.font = '20px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Selecciona tu ficha', this.canvas.width / 2, 190);
        
        // Dibujar opciones de fichas
        this.drawChipOptions();
        
        // Botón Play
        this.drawPlayButton();
    }
    
    drawChipOptions() {
        const startX = (this.canvas.width - (this.chipTypes.length * this.menuConfig.chipSpacing)) / 2;
        const y = this.canvas.height / 2 - 30;
        
        this.chipTypes.forEach((chip, index) => {
            const x = startX + (index * this.menuConfig.chipSpacing) + this.menuConfig.chipSpacing / 2;
            
            // Determinar si está seleccionada o hover
            const isSelected = this.selectedChipType === chip.id;
            const isHovered = this.hoveredChip === chip.id;
            const chipRadius = isSelected ? this.menuConfig.chipRadius * 1.15 : 
                             isHovered ? this.menuConfig.chipRadius * 1.08 : 
                             this.menuConfig.chipRadius;
            
            // Dibujar ficha usando el mismo estilo que square-view.js
            if (this.chipImages[chip.id] && this.chipImages[chip.id].complete) {
                // Calculate image size and position
                const imgSize = chipRadius * 2.3;
                const imgX = x - imgSize / 2;
                const imgY = y - imgSize / 2;

                // Draw chip image clipped to circle
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(x, y, chipRadius, 0, Math.PI * 2);
                this.ctx.clip();
                this.ctx.drawImage(this.chipImages[chip.id], imgX, imgY, imgSize, imgSize);
                this.ctx.restore();
                this.ctx.closePath();

                // Draw chip border
                this.ctx.beginPath();
                this.ctx.arc(x, y, chipRadius, 0, Math.PI * 2);
                
                if (isSelected) {
                    // Borde destacado para ficha seleccionada
                    this.ctx.strokeStyle = this.colors.primary;
                    this.ctx.lineWidth = 5;
                    this.ctx.shadowColor = this.colors.primary;
                    this.ctx.shadowBlur = 25;
                } else if (isHovered) {
                    // Borde para hover
                    this.ctx.strokeStyle = this.colors.primaryLight;
                    this.ctx.lineWidth = 4;
                    this.ctx.shadowColor = this.colors.primaryLight;
                    this.ctx.shadowBlur = 15;
                } else {
                    // Borde normal
                    this.ctx.strokeStyle = 'rgba(126, 211, 33, 0.5)';
                    this.ctx.lineWidth = 3;
                }
                
                this.ctx.stroke();
                this.ctx.closePath();
                
                // Limpiar efectos
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
            } else {
                // Si la imagen no está cargada, dibujar círculo de placeholder
                this.ctx.beginPath();
                this.ctx.arc(x, y, chipRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = this.colors.backgroundDark;
                this.ctx.fill();
                this.ctx.strokeStyle = this.colors.border;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.closePath();
            }
            
            // Nombre de la ficha
            this.ctx.fillStyle = isSelected ? this.colors.primary : this.colors.textSecondary;
            this.ctx.font = isSelected ? 'bold 18px Orbitron, sans-serif' : '16px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(chip.name, x, y + chipRadius + 45);
        });
    }
    
    drawPlayButton() {
        const buttonX = (this.canvas.width - this.menuConfig.playButton.width) / 2;
        const buttonY = this.canvas.height - 120;
        
        this.ctx.save();
        
        // Efecto de hover
        if (this.hoveredButton) {
            this.ctx.shadowColor = this.colors.primary;
            this.ctx.shadowBlur = 25;
        }
        
        // Fondo del botón
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.beginPath();
        this.ctx.roundRect(
            buttonX,
            buttonY,
            this.menuConfig.playButton.width,
            this.menuConfig.playButton.height,
            10
        );
        this.ctx.fill();
        
        // Borde brillante
        this.ctx.strokeStyle = this.colors.primaryLight;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Texto del botón
        this.ctx.fillStyle = this.colors.backgroundDark;
        this.ctx.font = 'bold 24px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            this.menuConfig.playButton.text,
            this.canvas.width / 2,
            buttonY + this.menuConfig.playButton.height / 2
        );
        
        // Guardar coordenadas del botón para detección
        this.playButtonBounds = {
            x: buttonX,
            y: buttonY,
            width: this.menuConfig.playButton.width,
            height: this.menuConfig.playButton.height
        };
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        let needsRedraw = false;
        
        // Verificar hover en fichas
        const startX = (this.canvas.width - (this.chipTypes.length * this.menuConfig.chipSpacing)) / 2;
        const chipY = this.canvas.height / 2 - 30;
        
        let newHoveredChip = null;
        this.chipTypes.forEach((chip, index) => {
            const chipX = startX + (index * this.menuConfig.chipSpacing) + this.menuConfig.chipSpacing / 2;
            const distance = Math.sqrt(Math.pow(x - chipX, 2) + Math.pow(y - chipY, 2));
            
            if (distance <= this.menuConfig.chipRadius * 1.2) {
                newHoveredChip = chip.id;
            }
        });
        
        if (newHoveredChip !== this.hoveredChip) {
            this.hoveredChip = newHoveredChip;
            needsRedraw = true;
            this.canvas.style.cursor = newHoveredChip ? 'pointer' : 'default';
        }
        
        // Verificar hover en botón
        const buttonX = (this.canvas.width - this.menuConfig.playButton.width) / 2;
        const buttonY = this.canvas.height - 120;
        
        const newHoveredButton = x >= buttonX && 
            x <= buttonX + this.menuConfig.playButton.width &&
            y >= buttonY && 
            y <= buttonY + this.menuConfig.playButton.height;
            
        if (newHoveredButton !== this.hoveredButton) {
            this.hoveredButton = newHoveredButton;
            needsRedraw = true;
            this.canvas.style.cursor = newHoveredButton ? 'pointer' : 'default';
        }
        
        // Redibujar solo si hay cambios
        if (needsRedraw) {
            this.draw();
        }
    }
    
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Verificar click en fichas
        const startX = (this.canvas.width - (this.chipTypes.length * this.menuConfig.chipSpacing)) / 2;
        const chipY = this.canvas.height / 2 - 30;
        
        this.chipTypes.forEach((chip, index) => {
            const chipX = startX + (index * this.menuConfig.chipSpacing) + this.menuConfig.chipSpacing / 2;
            const distance = Math.sqrt(Math.pow(x - chipX, 2) + Math.pow(y - chipY, 2));
            
            if (distance <= this.menuConfig.chipRadius * 1.2) {
                this.selectedChipType = chip.id;
                this.draw();
            }
        });
        
        // Verificar click en botón Play
        const buttonX = (this.canvas.width - this.menuConfig.playButton.width) / 2;
        const buttonY = this.canvas.height - 120;
        
        if (x >= buttonX && 
            x <= buttonX + this.menuConfig.playButton.width &&
            y >= buttonY && 
            y <= buttonY + this.menuConfig.playButton.height) {
            this.startGame();
        }
    }
    
    startGame() {
        this.removeEventListeners();
        this.onPlayCallback(this.selectedChipType);
    }
    
    getSelectedChipType() {
        return this.selectedChipType;
    }
}