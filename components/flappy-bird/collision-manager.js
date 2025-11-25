export default class CollisionManager {
  constructor() {
    // Configuración de hitbox
    this.playerHitboxPadding = 5;
  }

  checkBoundaryCollisions(player) {
    // Verifica colisiones con los límites del juego
    const bounds = player.getBounds();
    const collisions = {
      top: false,
      bottom: false,
      hasCollision: false
    };

    // Verificar límite superior
    if (bounds.y < player.minY) {
      collisions.top = true;
      collisions.hasCollision = true;
    }

    // Verificar límite inferior
    if (bounds.y + bounds.size > player.maxY) {
      collisions.bottom = true;
      collisions.hasCollision = true;
    }

    return collisions;
  }

  checkObstacleCollision(player, obstacle) {
    // Verifica colisiones con el obstáculo
    const playerBounds = player.getBounds();
    
    // Aplicar padding al hitbox del jugador
    const playerLeft = playerBounds.x + this.playerHitboxPadding;
    const playerRight = playerBounds.x + playerBounds.size - this.playerHitboxPadding;
    const playerTop = playerBounds.y + this.playerHitboxPadding;
    const playerBottom = playerBounds.y + playerBounds.size - this.playerHitboxPadding;
    
    // Hitbox del obstáculo con padding
    const obstacleLeft = obstacle.x + obstacle.hitboxPadding;
    const obstacleRight = obstacle.x + obstacle.width - obstacle.hitboxPadding;
    
    // Verificar si el jugador está dentro del rango horizontal del obstáculo
    if (playerRight > obstacleLeft && playerLeft < obstacleRight) {
      // Verificar colisión con tubería superior
      if (playerTop < obstacle.gapY - 10) {
        return true;
      }
      // Verificar colisión con tubería inferior
      if (playerBottom > obstacle.gapY + obstacle.gap + 10) {
        return true;
      }
    }
    
    return false;
  }

  checkPowerUpCollision(player, powerUp) {
    // Verifica colisiones con power-ups
    if (!powerUp.isActive()) return false;
    
    const playerBounds = player.getBounds();
    const powerUpBounds = powerUp.getBounds();
    
    // Aplicar padding al hitbox del jugador
    const playerLeft = playerBounds.x + this.playerHitboxPadding;
    const playerRight = playerBounds.x + playerBounds.size - this.playerHitboxPadding;
    const playerTop = playerBounds.y + this.playerHitboxPadding;
    const playerBottom = playerBounds.y + playerBounds.size - this.playerHitboxPadding;
    
    // Hitbox del power-up
    const powerUpLeft = powerUpBounds.x;
    const powerUpRight = powerUpBounds.x + powerUpBounds.width;
    const powerUpTop = powerUpBounds.y;
    const powerUpBottom = powerUpBounds.y + powerUpBounds.height;
    
    // Verificar colisión rectangular
    return (
      playerRight > powerUpLeft &&
      playerLeft < powerUpRight &&
      playerBottom > powerUpTop &&
      playerTop < powerUpBottom
    );
  }
}

