import { BOMB_SIZE, EXPLOSION_SIZE, FREEZE_EXPLOSION_SIZE, REGULAR_BOMB_TIMER, FREEZE_BOMB_TIMER, FREEZE_DURATION } from './constants.js';

// Bomb class - base class for all bombs
class Bomb {
    constructor(x, y, timer) {
        this.x = x;
        this.y = y;
        this.timer = timer;
        this.exploded = false;
    }
    
    update(deltaTime) {
        this.timer -= deltaTime;
        
        if (this.timer <= 0 && !this.exploded) {
            this.exploded = true;
            return true; // Signal for explosion
        }
        
        return false;
    }
}

// Regular bomb - destroys monsters
export class RegularBomb extends Bomb {
    constructor(x, y) {
        super(x, y, REGULAR_BOMB_TIMER);
        this.type = 'regular';
    }
    
    draw(ctx) {
        // Orange/red bomb
        ctx.fillStyle = this.timer < 1000 ? '#f00' : '#FF8C00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, BOMB_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // Add an outline to make it more visible
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Freeze bomb - freezes monsters
export class FreezeBomb extends Bomb {
    constructor(x, y) {
        super(x, y, FREEZE_BOMB_TIMER);
        this.type = 'freeze';
    }
    
    draw(ctx) {
        try {
            // Blue bomb that pulses as it's about to explode
            const pulseSize = this.timer < 500 ? 
                BOMB_SIZE + (Math.sin(this.timer / 50) + 1) * 2 : 
                BOMB_SIZE;
            
            // Use a solid color instead of a gradient to avoid potential issues
            ctx.fillStyle = '#00BFFF'; // Light blue color
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Add an outline
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Add simplified ice crystal effect
            if (this.timer < 1000) {
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    const sparkX = this.x + Math.cos(angle) * (pulseSize + 2);
                    const sparkY = this.y + Math.sin(angle) * (pulseSize + 2);
                    
                    ctx.fillStyle = '#B0E2FF';
                    ctx.beginPath();
                    ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } catch (error) {
            console.error("Error drawing freeze bomb:", error);
            // Fallback to a simple blue circle if there's an error
            ctx.fillStyle = '#0080FF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, BOMB_SIZE, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Explosion class - base class for all explosions
class Explosion {
    constructor(x, y, duration, maxSize) {
        this.x = x;
        this.y = y;
        this.timer = duration;
        this.maxSize = maxSize;
        this.size = 0;
        this.initialDuration = duration;
    }
    
    update(deltaTime) {
        this.timer -= deltaTime;
        this.size = this.maxSize * (1 - this.timer / this.initialDuration);
        
        return this.timer > 0;
    }
}

// Regular explosion destroys monsters
export class RegularExplosion extends Explosion {
    constructor(x, y) {
        super(x, y, 500, EXPLOSION_SIZE);
        this.type = 'regular';
    }
    
    draw(ctx) {
        try {
            // Use a simpler approach for the gradient
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );
            gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } catch (error) {
            console.error("Error drawing regular explosion:", error);
            // Fallback to a simple orange circle
            ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Freeze explosion freezes monsters
export class FreezeExplosion extends Explosion {
    constructor(x, y) {
        super(x, y, 700, FREEZE_EXPLOSION_SIZE);
        this.type = 'freeze';
    }
    
    draw(ctx) {
        try {
            // Use a simpler gradient approach to reduce potential issues
            ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add a few ice particles (simplified)
            const particleCount = Math.min(20, Math.floor(this.size / 10));
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * this.size * 0.9;
                const x = this.x + Math.cos(angle) * distance;
                const y = this.y + Math.sin(angle) * distance;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } catch (error) {
            console.error("Error drawing freeze explosion:", error);
            // Fallback to a simple blue circle
            ctx.fillStyle = 'rgba(0, 128, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// BombManager handles all bombs and explosions
export class BombManager {
    constructor() {
        this.bombs = [];
        this.explosions = [];
    }
    
    placeRegularBomb(x, y) {
        this.bombs.push(new RegularBomb(x, y));
    }
    
    placeFreezeBomb(x, y) {
        this.bombs.push(new FreezeBomb(x, y));
    }
    
    createExplosion(x, y, type) {
        if (type === 'regular') {
            this.explosions.push(new RegularExplosion(x, y));
        } else if (type === 'freeze') {
            this.explosions.push(new FreezeExplosion(x, y));
        }
    }
    
    update(deltaTime, monsters, checkCollision) {
        try {
            // Update bombs
            for (let i = this.bombs.length - 1; i >= 0; i--) {
                const bomb = this.bombs[i];
                
                if (bomb.update(deltaTime)) {
                    // Bomb exploded, create appropriate explosion
                    this.createExplosion(bomb.x, bomb.y, bomb.type);
                    this.bombs.splice(i, 1);
                }
            }
            
            // Check if monsters hit bombs
            for (const monster of monsters) {
                if (!monster || typeof monster.x !== 'number' || typeof monster.y !== 'number') {
                    continue; // Skip invalid monsters
                }
                
                for (let i = this.bombs.length - 1; i >= 0; i--) {
                    const bomb = this.bombs[i];
                    if (!bomb.exploded && checkCollision(monster, monster.size, bomb, BOMB_SIZE)) {
                        bomb.exploded = true;
                        // Create appropriate explosion based on bomb type
                        this.createExplosion(bomb.x, bomb.y, bomb.type);
                        this.bombs.splice(i, 1);
                    }
                }
            }
            
            // Update explosions and check if they hit monsters
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                const explosion = this.explosions[i];
                
                if (!explosion.update(deltaTime)) {
                    this.explosions.splice(i, 1);
                    continue;
                }
                
                // Check explosion effects on monsters - only if the explosion is still active
                if (explosion.timer > 0) {
                    for (const monster of monsters) {
                        // Make sure monsters exist and have a position
                        if (!monster || typeof monster.x !== 'number' || typeof monster.y !== 'number') {
                            continue;
                        }
                        
                        if (checkCollision(explosion, explosion.size, monster, monster.size)) {
                            if (explosion.type === 'regular') {
                                monster.hit = true; // Mark for removal
                            } else if (explosion.type === 'freeze' && !monster.frozen) {
                                // Only freeze if not already frozen, don't destroy
                                monster.freeze(FREEZE_DURATION);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in BombManager update:", error);
        }
    }
    
    draw(ctx) {
        try {
            // Draw bombs
            for (const bomb of this.bombs) {
                bomb.draw(ctx);
            }
            
            // Draw explosions
            for (const explosion of this.explosions) {
                explosion.draw(ctx);
            }
        } catch (error) {
            console.error("Error in BombManager draw:", error);
        }
    }
}