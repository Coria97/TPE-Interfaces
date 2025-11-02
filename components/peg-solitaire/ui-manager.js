/**
 * UIManager - Maneja todos los elementos de interfaz dentro del canvas
 * Se integra con BoardController sin modificar la arquitectura existente
 */
export default class UIManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasSize = 700;
        
        // Estado de UI
        this.showVictoryModal = false;
        this.showDefeatModal = false;
        this.chipsRemaining = 32;
        this.moveCount = 0;
        
        // Colores del theme
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
            success: '#10c27c',
            error: '#ff5252'
        };
        
        // Botones interactivos
        this.buttons = [];
        
        // Animaciones
        this.animationProgress = 0;
        this.animationSpeed = 0.02;
    }

    /**
     * Actualiza el estado del juego
     */
    updateGameState(chipsRemaining, moveCount) {
        this.chipsRemaining = chipsRemaining;
        this.moveCount = moveCount;
    }

    /**
     * Dibuja todo el HUD del juego
     */
    drawHUD() {
        this.drawChipCounter();
        this.drawMoveCounter();
        this.drawResetButton();
    }

    /**
     * Contador de fichas restantes (arriba izquierda)
     */
    drawChipCounter() {
        const x = 20;
        const y = 20;
        const height = 50;
        const width = 160;

        this.ctx.save();

        // Fondo del contador
        this.ctx.fillStyle = this.colors.backgroundDark;
        this.ctx.fillRect(x, y, width, height);

        // Borde brillante
        this.ctx.strokeStyle = this.colors.primary;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Icono de ficha (círculo pequeño)
        const iconX = x + 25;
        const iconY = y + height / 2;
        const iconRadius = 12;

        this.ctx.beginPath();
        this.ctx.arc(iconX, iconY, iconRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.fill();

        // Texto
        this.ctx.fillStyle = this.colors.textPrimary;
        this.ctx.font = 'bold 20px Orbitron, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.chipsRemaining}`, iconX + 25, iconY);

        // Label
        this.ctx.fillStyle = this.colors.textSecondary;
        this.ctx.font = '12px Arial, sans-serif';
        this.ctx.fillText('fichas', iconX + 25, iconY + 14);

        this.ctx.restore();
    }

    /**
     * Contador de movimientos (arriba derecha)
     */
    drawMoveCounter() {
        const x = this.canvasSize - 180;
        const y = 20;
        const height = 50;
        const width = 160;

        this.ctx.save();

        // Fondo del contador
        this.ctx.fillStyle = this.colors.backgroundDark;
        this.ctx.fillRect(x, y, width, height);

        // Borde brillante
        this.ctx.strokeStyle = this.colors.secondary;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Icono de movimiento
        const iconX = x + 25;
        const iconY = y + height / 2;
        
        this.ctx.strokeStyle = this.colors.secondary;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        // Flecha
        this.ctx.beginPath();
        this.ctx.moveTo(iconX - 10, iconY);
        this.ctx.lineTo(iconX + 10, iconY);
        this.ctx.moveTo(iconX + 6, iconY - 4);
        this.ctx.lineTo(iconX + 10, iconY);
        this.ctx.lineTo(iconX + 6, iconY + 4);
        this.ctx.stroke();

        // Texto
        this.ctx.fillStyle = this.colors.textPrimary;
        this.ctx.font = 'bold 20px Orbitron, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.moveCount}`, iconX + 25, iconY);

        // Label
        this.ctx.fillStyle = this.colors.textSecondary;
        this.ctx.font = '12px Arial, sans-serif';
        this.ctx.fillText('movimientos', iconX + 25, iconY + 14);

        this.ctx.restore();
    }

    /**
     * Botón de reiniciar (abajo derecha)
     */
    drawResetButton() {
        const size = 50;
        const margin = 20;
        const x = this.canvasSize - size - margin;
        const y = this.canvasSize - size - margin;

        // Guardar info del botón para detección de clicks
        this.resetButton = { x, y, width: size, height: size };

        this.ctx.save();

        // Fondo del botón
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(x, y, size, size);

        // Borde
        this.ctx.strokeStyle = this.colors.primary;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, size, size);

        // Icono de reinicio
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = 14;

        this.ctx.strokeStyle = this.colors.primaryLight;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        // Arco circular
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0.2 * Math.PI, 1.8 * Math.PI);
        this.ctx.stroke();

        // Punta de flecha
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + radius * 0.7, centerY - radius * 0.7);
        this.ctx.lineTo(centerX + radius * 0.9, centerY - radius * 0.3);
        this.ctx.lineTo(centerX + radius * 0.3, centerY - radius * 0.9);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Modal de victoria
     */
    drawVictoryModal() {
        this.showVictoryModal = true;
        this.drawModal(
            '🏆 ¡VICTORIA!',
            `Has completado el juego\nen ${this.moveCount} movimientos`,
            this.colors.success,
            [
                { text: 'Jugar de nuevo', action: 'restart', primary: true },
                { text: 'Salir', action: 'exit', primary: false }
            ]
        );
    }

    /**
     * Modal de derrota
     */
    drawDefeatModal() {
        this.showDefeatModal = true;
        this.drawModal(
            '💀 GAME OVER',
            `No quedan movimientos válidos\nQuedan ${this.chipsRemaining} fichas`,
            this.colors.error,
            [
                { text: 'Reintentar', action: 'restart', primary: true },
                { text: 'Salir', action: 'exit', primary: false }
            ]
        );
    }

    /**
     * Modal genérico reutilizable
     */
    drawModal(title, message, accentColor, buttons) {
        this.ctx.save();

        // Overlay oscuro
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

        // Dimensiones del modal
        const modalWidth = 500;
        const modalHeight = 300;
        const modalX = (this.canvasSize - modalWidth) / 2;
        const modalY = (this.canvasSize - modalHeight) / 2;

        // Fondo del modal
        const gradient = this.ctx.createLinearGradient(
            modalX, modalY,
            modalX, modalY + modalHeight
        );
        gradient.addColorStop(0, this.colors.backgroundDark);
        gradient.addColorStop(1, this.colors.background);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);

        // Borde brillante animado
        this.animationProgress += this.animationSpeed;
        if (this.animationProgress > 1) this.animationProgress = 0;
        
        const glowIntensity = 0.3 + Math.sin(this.animationProgress * Math.PI * 2) * 0.2;
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = accentColor;
        this.ctx.globalAlpha = glowIntensity;
        this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;

        // Línea decorativa superior
        this.ctx.fillStyle = accentColor;
        this.ctx.fillRect(modalX, modalY, modalWidth, 4);

        // Título
        this.ctx.fillStyle = this.colors.textPrimary;
        this.ctx.font = 'bold 36px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, modalX + modalWidth / 2, modalY + 60);

        // Mensaje
        this.ctx.fillStyle = this.colors.textSecondary;
        this.ctx.font = '18px Arial, sans-serif';
        const lines = message.split('\n');
        lines.forEach((line, index) => {
            this.ctx.fillText(line, modalX + modalWidth / 2, modalY + 120 + (index * 30));
        });

        // Botones
        this.buttons = [];
        const buttonWidth = 180;
        const buttonHeight = 50;
        const buttonSpacing = 20;
        const totalButtonWidth = (buttonWidth * buttons.length) + (buttonSpacing * (buttons.length - 1));
        const startX = modalX + (modalWidth - totalButtonWidth) / 2;
        const buttonY = modalY + modalHeight - 80;

        buttons.forEach((button, index) => {
            const btnX = startX + (buttonWidth + buttonSpacing) * index;
            
            // Guardar info del botón
            this.buttons.push({
                x: btnX,
                y: buttonY,
                width: buttonWidth,
                height: buttonHeight,
                action: button.action
            });

            // Dibujar botón
            if (button.primary) {
                this.ctx.fillStyle = this.colors.primary;
                this.ctx.fillRect(btnX, buttonY, buttonWidth, buttonHeight);
                
                this.ctx.strokeStyle = this.colors.primaryLight;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(btnX, buttonY, buttonWidth, buttonHeight);
                
                this.ctx.fillStyle = this.colors.backgroundDark;
            } else {
                this.ctx.strokeStyle = this.colors.border;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(btnX, buttonY, buttonWidth, buttonHeight);
                
                this.ctx.fillStyle = this.colors.textSecondary;
            }

            this.ctx.font = 'bold 16px Orbitron, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(button.text, btnX + buttonWidth / 2, buttonY + buttonHeight / 2);
        });

        this.ctx.restore();
    }

    /**
     * Hint para movimientos válidos
     */
    drawMoveHint(x, y) {
        const pulseScale = 1 + Math.sin(this.animationProgress * Math.PI * 4) * 0.15;
        const radius = 35 * pulseScale;

        this.ctx.save();

        // Aro exterior brillante
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.colors.primary;
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.colors.primary;
        this.ctx.globalAlpha = 0.7;
        this.ctx.stroke();

        // Aro interior
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 8, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.colors.primaryLight;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.5;
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Detecta click en botones del modal
     */
    checkButtonClick(mouseX, mouseY) {
        for (const button of this.buttons) {
            if (mouseX >= button.x && 
                mouseX <= button.x + button.width &&
                mouseY >= button.y && 
                mouseY <= button.y + button.height) {
                return button.action;
            }
        }
        return null;
    }

    /**
     * Detecta click en botón de reset
     */
    checkResetButton(mouseX, mouseY) {
        if (!this.resetButton) return false;
        
        return mouseX >= this.resetButton.x && 
               mouseX <= this.resetButton.x + this.resetButton.width &&
               mouseY >= this.resetButton.y && 
               mouseY <= this.resetButton.y + this.resetButton.height;
    }

    /**
     * Limpia los modales
     */
    clearModals() {
        this.showVictoryModal = false;
        this.showDefeatModal = false;
        this.buttons = [];
    }

    /**
     * Incrementa la animación
     */
    updateAnimation() {
        this.animationProgress += this.animationSpeed;
        if (this.animationProgress > 1) this.animationProgress = 0;
    }
}
