import { PLAYER_SIZE, PLAYER_SPEED, CELL_SIZE, SPACE_HOLD_THRESHOLD } from './constants.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lives = 3;
        this.spacePressed = false;
        this.spaceHoldTime = 0;
    }
    
    update(keys, deltaTime, checkWallCollision, placeBomb, placeFreezeWithSpaceBombTap) {
        let dx = 0;
        let dy = 0;
        
        if (keys.ArrowUp) dy -= PLAYER_SPEED;
        if (keys.ArrowDown) dy += PLAYER_SPEED;
        if (keys.ArrowLeft) dx -= PLAYER_SPEED;
        if (keys.ArrowRight) dx += PLAYER_SPEED;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071; // 1/sqrt(2)
            dy *= 0.7071;
        }
        
        // Check horizontal movement
        if (!checkWallCollision(this.x + dx, this.y, PLAYER_SIZE)) {
            this.x += dx;
        }
        
        // Check vertical movement
        if (!checkWallCollision(this.x, this.y + dy, PLAYER_SIZE)) {
            this.y += dy;
        }
        
        // Handle space key for bomb placement with new dual bomb system
        if (keys[' '] && !this.spacePressed) {
            this.spacePressed = true;
            this.spaceHoldTime = 0;
        } else if (keys[' '] && this.spacePressed) {
            this.spaceHoldTime += deltaTime;
        } else if (!keys[' '] && this.spacePressed) {
            this.spacePressed = false;
            
            if (this.spaceHoldTime < SPACE_HOLD_THRESHOLD) {
                // Quick tap - place freeze bomb
                placeFreezeWithSpaceBombTap(this.x, this.y);
            } else {
                // Hold - place regular bomb
                placeBomb(this.x, this.y);
            }
            
            this.spaceHoldTime = 0;
        }
    }
    
    reduceLife() {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        return this.lives <= 0;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(this.x, this.y, PLAYER_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }
}