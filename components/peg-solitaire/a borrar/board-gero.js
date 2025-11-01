import Chip from './chip.js';

/**
 * Board - Maneja el tablero del juego Peg Solitaire
 * Ahora con drag & drop, validación de movimientos, timer y control del juego
 */
export default class BoardLogic {
    constructor() {
        this.totalSquares = 49;
        
        // Casillas no disponibles del tablero (esquinas)
        this.unavailableSquares = [0, 1, 5, 6, 7, 8, 12, 13, 35, 36, 40, 41, 42, 43, 47, 48];
        
        // Estado del juego
        this.isPlaying = false;
        this.squares = this.createSquares();
        this.selectedChip = null;
        this.draggedChip = null;
        this.validTargets = [];
        
        // Animación
        this.hintAnimationProgress = 0;
        this.animationFrameId = null;
        
        // Timer
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.maxTimeSeconds = 300; // 5 minutos
        
        // Estadísticas
        this.movesCount = 0;
        
        // Mouse position
        this.mousePos = { x: 0, y: 0 };
        
        // Bind de métodos
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        // Setup inicial
        this.setupEventListeners();
        this.setupUI();
        this.startAnimationLoop();
    }

    /**
     * Crea todas las casillas del tablero
     */
    createSquares() {
        const squares = [];
        for (let i = 0; i < this.totalSquares; i++) {
            const isAvailable = !this.unavailableSquares.includes(i);
            const isEmpty = !this.unavailableSquares.includes(i) && i === 24; // Centro vacío
            const posX = (i % 7) * 100; 
            const posY = Math.floor(i / 7) * 100;

            const square = new Chip(
                i, 
                100, 
                100, 
                isAvailable, 
                isEmpty, 
                posX, 
                posY, 
                this.ctx, 
                this.canvas, 
                30
            );
            squares.push(square);
        }
        return squares;
    }

    /**
     * Configura los event listeners del canvas
     */
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
    }

    /**
     * Configura la UI (botones, timer, etc)
     */
    setupUI() {
        // Crear contenedor de controles
        const controlsHTML = `
            <div class="peg-controls">
                <button id="btnStart" class="btn-primary">Comenzar Misión</button>
                <button id="btnReset" class="btn-secondary" disabled>Reiniciar</button>
                
                <div class="timer-display">
                    <span class="timer-label">Tiempo:</span>
                    <span id="timerValue">00:00</span>
                    <span id="timerHint"> / 05:00</span>
                </div>
                
                <div class="moves-display">
                    <span class="moves-label">Movimientos:</span>
                    <span id="movesValue">0</span>
                </div>
                
                <div class="pieces-display">
                    <span class="pieces-label">Fichas:</span>
                    <span id="piecesValue">32</span>
                </div>
            </div>
            
            <div id="resultPanel" class="result-controls" style="display: none">
                <h2 id="resultTitle">Resultado</h2>
                <p id="resultMessage">Mensaje del resultado</p>
                
                <div class="result-stats">
                    <div class="stat-item">
                        <span class="stat-label">Tiempo:</span>
                        <span id="finalTime" class="stat-value">00:00</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Movimientos:</span>
                        <span id="finalMoves" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Fichas restantes:</span>
                        <span id="finalPieces" class="stat-value">0</span>
                    </div>
                </div>
                
                <div class="result-buttons">
                    <button id="btnMenu" class="btn-secondary">Menú Principal</button>
                    <button id="btnRetry" class="btn-primary">Reintentar</button>
                </div>
            </div>
        `;

        // Insertar controles antes del canvas
        const container = this.canvas.parentElement;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = controlsHTML;
        
        while (tempDiv.firstChild) {
            container.insertBefore(tempDiv.firstChild, this.canvas);
        }

        // Event listeners de botones
        this.root.querySelector('#btnStart')?.addEventListener('click', () => this.startGame());
        this.root.querySelector('#btnReset')?.addEventListener('click', () => this.resetGame());
        this.root.querySelector('#btnMenu')?.addEventListener('click', () => this.goToMenu());
        this.root.querySelector('#btnRetry')?.addEventListener('click', () => this.resetGame());
    }

    /**
     * Inicia el juego
     */
    startGame() {
        this.isPlaying = true;
        this.movesCount = 0;
        this.timerSeconds = 0;
        
        // Resetear tablero
        this.squares = this.createSquares();
        
        // UI
        const btnStart = this.root.querySelector('#btnStart');
        const btnReset = this.root.querySelector('#btnReset');
        if (btnStart) btnStart.disabled = true;
        if (btnReset) btnReset.disabled = false;
        
        this.hideResultPanel();
        this.updateMovesDisplay();
        this.updatePiecesDisplay();
        
        // Iniciar timer
        this.startTimer();
        
        // Dibujar
        this.draw();
    }

    /**
     * Reinicia el juego
     */
    resetGame() {
        this.stopTimer();
        this.selectedChip = null;
        this.draggedChip = null;
        this.validTargets = [];
        this.startGame();
    }

    /**
     * Vuelve al menú
     */
    goToMenu() {
        this.stopTimer();
        this.isPlaying = false;
        this.selectedChip = null;
        this.draggedChip = null;
        this.validTargets = [];
        this.movesCount = 0;
        
        const btnStart = this.root.querySelector('#btnStart');
        const btnReset = this.root.querySelector('#btnReset');
        if (btnStart) btnStart.disabled = false;
        if (btnReset) btnReset.disabled = true;
        
        this.hideResultPanel();
        this.squares = this.createSquares();
        this.updateMovesDisplay();
        this.updatePiecesDisplay();
        this.updateTimerDisplay();
        this.draw();
    }

    /**
     * Maneja mousedown - Selecciona ficha
     */
    handleMouseDown(event) {
        if (!this.isPlaying) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Buscar chip clickeado
        for (const chip of this.squares) {
            if (chip.isMouseOver(mouseX, mouseY) && !chip.isEmpty) {
                if (chip.startDrag(mouseX, mouseY)) {
                    this.selectedChip = chip;
                    this.draggedChip = chip;
                    
                    // Calcular destinos válidos y guardarlos
                    this.validTargets = this.getValidTargets(chip);
                    
                    // Importante: guardar copia para debug
                    this.lastValidTargets = [...this.validTargets];
                    
                    // Debug: mostrar información
                    console.log('🎯 Ficha seleccionada:', chip.id);
                    console.log('📍 Posición:', {
                        row: Math.floor(chip.id / 7),
                        col: chip.id % 7
                    });
                    console.log('✅ Movimientos válidos:', this.validTargets.length);
                    if (this.validTargets.length > 0) {
                        console.log('   Destinos:', this.validTargets.map(vt => 
                            `${vt.target.id} (come ${vt.eaten.id})`
                        ).join(', '));
                    } else {
                        console.warn('⚠️ Esta ficha no tiene movimientos válidos');
                    }
                    
                    this.canvas.style.cursor = 'grabbing';
                    return;
                }
            }
        }
    }

    /**
     * Maneja mousemove - Actualiza drag y hover
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        this.mousePos = { x: mouseX, y: mouseY };
        
        // Actualizar drag
        if (this.draggedChip) {
            this.draggedChip.updateDrag(mouseX, mouseY);
            return;
        }
        
        // Actualizar hover
        let isOverChip = false;
        for (const chip of this.squares) {
            const isHovered = chip.isMouseOver(mouseX, mouseY);
            chip.updateHover(isHovered);
            if (isHovered && !chip.isEmpty) {
                isOverChip = true;
            }
        }
        
        this.canvas.style.cursor = isOverChip ? 'grab' : 'default';
    }

    /**
     * Maneja mouseup - Ejecuta movimiento
     */
    handleMouseUp(event) {
        if (!this.isPlaying || !this.draggedChip) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Buscar casilla destino (aumentar el área de detección)
        let targetChip = null;
        let minDistance = Infinity;
        
        for (const chip of this.squares) {
            if (chip.isEmpty && chip.isAvailable) {
                const distance = Math.sqrt(
                    Math.pow(mouseX - chip.posX, 2) + 
                    Math.pow(mouseY - chip.posY, 2)
                );
                
                // Si está dentro de un radio razonable (60 pixeles)
                if (distance < 60 && distance < minDistance) {
                    targetChip = chip;
                    minDistance = distance;
                }
            }
        }
        
        // Debug
        if (targetChip) {
            console.log('🎯 Intento de movimiento:');
            console.log('   Desde:', this.draggedChip.id);
            console.log('   Hasta:', targetChip.id);
            console.log('   Distancia:', minDistance.toFixed(2));
            console.log('   ¿Es válido?:', this.isValidMove(this.draggedChip, targetChip));
        } else {
            console.log('❌ No se encontró casilla destino cerca del mouse');
        }
        
        // Validar y ejecutar movimiento
        if (targetChip && this.isValidMove(this.draggedChip, targetChip)) {
            console.log('✅ Movimiento ejecutado');
            this.executeMove(this.draggedChip, targetChip);
        } else {
            console.log('❌ Movimiento cancelado');
            this.draggedChip.cancelDrag();
        }
        
        // Limpiar estado
        this.draggedChip.endDrag();
        this.draggedChip = null;
        this.selectedChip = null;
        this.validTargets = [];
        this.canvas.style.cursor = 'default';
    }

    /**
     * Obtiene los destinos válidos para una ficha
     * Valida dinámicamente basándose en el estado actual del tablero
     */
    getValidTargets(chip) {
        const targets = [];
        
        if (!chip || chip.isEmpty || !chip.isAvailable) {
            return targets;
        }
        
        // Recalcular movimientos posibles para esta ficha
        chip.calculatePossibleMoves();
        
        // Validar cada movimiento posible
        for (const move of chip.possibleMoves) {
            const targetChip = this.squares[move.targetId];
            const eatenChip = this.squares[move.eatenId];
            
            // Verificar que:
            // 1. El destino existe y es válido
            // 2. El destino está vacío
            // 3. La ficha a comer existe y es válida
            // 4. La ficha a comer NO está vacía (tiene ficha)
            if (targetChip && targetChip.isAvailable && targetChip.isEmpty && 
                eatenChip && eatenChip.isAvailable && !eatenChip.isEmpty) {
                targets.push({
                    target: targetChip,
                    eaten: eatenChip
                });
            }
        }
        
        return targets;
    }

    /**
     * Verifica si un movimiento es válido
     */
    isValidMove(fromChip, toChip) {
        const isValid = this.validTargets.some(vt => vt.target.id === toChip.id);
        
        // Debug detallado
        console.log('🔍 Validando movimiento:');
        console.log('   De:', fromChip.id, '→ A:', toChip.id);
        console.log('   ValidTargets:', this.validTargets.map(vt => vt.target.id));
        console.log('   ¿Está en targets?:', isValid);
        
        return isValid;
    }

    /**
     * Ejecuta un movimiento válido
     */
    executeMove(fromChip, toChip) {
        // Encontrar la ficha comida
        const validTarget = this.validTargets.find(vt => vt.target.id === toChip.id);
        
        if (!validTarget) return;
        
        // Importante: Actualizar el estado ANTES de cambiar isEmpty
        // para que calculatePossibleMoves funcione correctamente
        
        // 1. Marcar casilla destino como ocupada
        toChip.setOccupied();
        
        // 2. Eliminar ficha comida del medio
        validTarget.eaten.setEmpty();
        
        // 3. Vaciar casilla origen
        fromChip.setEmpty();
        
        // 4. Recalcular movimientos posibles para todas las fichas
        this.squares.forEach(chip => {
            chip.possibleMoves = [];
            chip.possibleChipEats = [];
            chip.calculatePossibleMoves();
            chip.calculatePossibleChipEats();
        });
        
        // Actualizar estadísticas
        this.movesCount++;
        this.updateMovesDisplay();
        this.updatePiecesDisplay();
        
        // Verificar fin de juego
        setTimeout(() => this.checkGameEnd(), 300);
    }

    /**
     * Verifica si el juego terminó
     */
    checkGameEnd() {
        if (!this.isPlaying) return;
        
        const hasMoves = this.hasValidMoves();
        const piecesRemaining = this.countPieces();
        
        if (!hasMoves) {
            this.isPlaying = false;
            this.stopTimer();
            
            // Victoria perfecta: 1 ficha en el centro
            const centerChip = this.squares[24];
            const isVictory = piecesRemaining === 1 && !centerChip.isEmpty;
            
            setTimeout(() => this.showResultPanel(isVictory, piecesRemaining), 500);
        }
    }

    /**
     * Verifica si quedan movimientos válidos
     */
    hasValidMoves() {
        for (const chip of this.squares) {
            if (!chip.isEmpty && chip.isAvailable) {
                const targets = this.getValidTargets(chip);
                if (targets.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Cuenta las fichas restantes
     */
    countPieces() {
        return this.squares.filter(chip => chip.isAvailable && !chip.isEmpty).length;
    }

    /**
     * Timer
     */
    startTimer() {
        this.timerSeconds = 0;
        this.updateTimerDisplay();
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            this.updateTimerDisplay();
            
            if (this.timerSeconds >= this.maxTimeSeconds) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    handleTimeUp() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.stopTimer();
        
        const piecesRemaining = this.countPieces();
        setTimeout(() => this.showResultPanel(false, piecesRemaining), 300);
    }

    /**
     * Actualiza displays de UI
     */
    updateTimerDisplay() {
        const timerValue = this.root.querySelector('#timerValue');
        if (timerValue) {
            timerValue.textContent = this.formatTime(this.timerSeconds);
        }
    }

    updateMovesDisplay() {
        const movesValue = this.root.querySelector('#movesValue');
        if (movesValue) {
            movesValue.textContent = this.movesCount;
        }
    }

    updatePiecesDisplay() {
        const piecesValue = this.root.querySelector('#piecesValue');
        if (piecesValue) {
            piecesValue.textContent = this.countPieces();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Muestra panel de resultados
     */
    showResultPanel(isVictory, piecesRemaining) {
        const resultPanel = this.root.querySelector('#resultPanel');
        const resultTitle = this.root.querySelector('#resultTitle');
        const resultMessage = this.root.querySelector('#resultMessage');
        const finalTime = this.root.querySelector('#finalTime');
        const finalMoves = this.root.querySelector('#finalMoves');
        const finalPieces = this.root.querySelector('#finalPieces');
        
        if (!resultPanel) return;
        
        if (isVictory) {
            resultTitle.textContent = '¡Victoria Perfecta!';
            resultMessage.textContent = '¡Has completado el desafío del Solitario Esmeralda!';
        } else if (this.timerSeconds >= this.maxTimeSeconds) {
            resultTitle.textContent = 'Tiempo Agotado';
            resultMessage.textContent = 'El tiempo se ha agotado. ¡Intenta de nuevo!';
        } else {
            resultTitle.textContent = 'Juego Terminado';
            resultMessage.textContent = 'No hay más movimientos posibles.';
        }
        
        if (finalTime) finalTime.textContent = this.formatTime(this.timerSeconds);
        if (finalMoves) finalMoves.textContent = this.movesCount;
        if (finalPieces) finalPieces.textContent = piecesRemaining;
        
        resultPanel.style.display = 'flex';
    }

    hideResultPanel() {
        const resultPanel = this.root.querySelector('#resultPanel');
        if (resultPanel) {
            resultPanel.style.display = 'none';
        }
    }

    /**
     * Loop de animación
     */
    startAnimationLoop() {
        const animate = () => {
            this.hintAnimationProgress = (this.hintAnimationProgress + 0.02) % 1;
            this.draw();
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Dibuja todo el tablero
     */
    draw() {
        try {
            // Fondo
            this.ctx.fillStyle = '#0a0e13';
            this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
            
            // Gradiente
            const gradient = this.ctx.createRadialGradient(
                this.canvasSize / 2, this.canvasSize / 2, 0,
                this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2
            );
            gradient.addColorStop(0, 'rgba(0, 100, 50, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 50, 25, 0.1)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
            
            // Fichas (excepto la arrastrada)
            this.squares.forEach(chip => {
                if (chip !== this.draggedChip) {
                    chip.draw();
                }
            });
            
            // Hints animados
            if (this.draggedChip && this.validTargets.length > 0) {
                this.validTargets.forEach(vt => {
                    vt.target.drawHint(this.hintAnimationProgress);
                });
            }
            
            // Preview fantasma
            if (this.draggedChip) {
                for (const chip of this.squares) {
                    if (chip.isEmpty && chip.isMouseOver(this.mousePos.x, this.mousePos.y)) {
                        const isValid = this.isValidMove(this.draggedChip, chip);
                        chip.drawGhost(isValid);
                        break;
                    }
                }
            }
            
            // Ficha arrastrada (encima de todo)
            if (this.draggedChip) {
                this.draggedChip.draw();
            }
            
        } catch (error) {
            console.error("Error drawing board:", error);
        }
    }

    /**
     * Limpieza
     */
    destroy() {
        this.stopTimer();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    }
}
