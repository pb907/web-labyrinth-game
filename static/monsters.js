import { MONSTER_SIZE, MONSTER_SPEED, PATROL_MONSTER_SIZE, PATROL_MONSTER_SPEED, CELL_SIZE } from './constants.js';

// Base Monster class
class Monster {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frozen = false;
        this.frozenTimer = 0;
    }
    
    freeze(duration) {
        this.frozen = true;
        this.frozenTimer = duration;
    }
    
    updateFrozenState(deltaTime) {
        if (this.frozen) {
            this.frozenTimer -= deltaTime;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
            }
            return true; // Still frozen
        }
        return false; // Not frozen
    }
}

// Hunter Monster that chases player
export class HunterMonster extends Monster {
    constructor(x, y) {
        super(x, y);
        this.size = MONSTER_SIZE;
        this.speed = MONSTER_SPEED;
    }
    
    update(deltaTime, player, checkWallCollision) {
        // Skip movement if frozen
        if (this.updateFrozenState(deltaTime)) return;
        
        // Simple AI: Move toward player if possible
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) { // Only chase if player is within range
            let moveX = (dx / distance) * this.speed;
            let moveY = (dy / distance) * this.speed;
            
            // Check horizontal movement
            if (!checkWallCollision(this.x + moveX, this.y, this.size)) {
                this.x += moveX;
            }
            
            // Check vertical movement
            if (!checkWallCollision(this.x, this.y + moveY, this.size)) {
                this.y += moveY;
            }
        } else {
            // Random movement if player is not in range
            if (Math.random() < 0.02) { // 2% chance to change direction
                const directions = [
                    { x: 0, y: -1 },
                    { x: 0, y: 1 },
                    { x: -1, y: 0 },
                    { x: 1, y: 0 }
                ];
                
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const newX = this.x + dir.x * this.speed * 5;
                const newY = this.y + dir.y * this.speed * 5;
                
                if (!checkWallCollision(newX, this.y, this.size)) {
                    this.x = newX;
                }
                
                if (!checkWallCollision(this.x, newY, this.size)) {
                    this.y = newY;
                }
            }
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = this.frozen ? '#87CEFA' : '#e74c3c'; // Light blue when frozen, red normally
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Patrol Monster that follows fixed routes
export class PatrolMonster extends Monster {
    constructor(x, y, maze) {
        super(x, y);
        this.size = PATROL_MONSTER_SIZE;
        this.speed = PATROL_MONSTER_SPEED;
        this.direction = this.selectInitialDirection(maze);
        this.pathTimer = 0;
        this.maze = maze;
    }
    
    selectInitialDirection(maze) {
        // Try to find a direction with an open path
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
        ];
        
        // Shuffle the directions array
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        for (const dir of directions) {
            const row = Math.floor((this.y + dir.y * CELL_SIZE) / CELL_SIZE);
            const col = Math.floor((this.x + dir.x * CELL_SIZE) / CELL_SIZE);
            
            if (row >= 0 && row < maze.length && col >= 0 && col < maze[0].length) {
                if (maze[row][col] === 0) {
                    return dir;
                }
            }
        }
        
        // Default to a random direction if no clear path is found
        return directions[0];
    }
    
    changeDirection(maze) {
        // Get possible directions (excluding the reverse of current direction)
        const directions = [];
        
        if (this.direction.x !== 0) {
            // Currently moving horizontally, so check vertical options
            directions.push({ x: 0, y: -1 });
            directions.push({ x: 0, y: 1 });
        } else {
            // Currently moving vertically, so check horizontal options
            directions.push({ x: -1, y: 0 });
            directions.push({ x: 1, y: 0 });
        }
        
        // Add current direction with higher probability
        directions.push(this.direction);
        directions.push(this.direction);
        
        // Shuffle the directions
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        // Try each direction until we find a valid path
        for (const dir of directions) {
            const nextX = this.x + dir.x * CELL_SIZE;
            const nextY = this.y + dir.y * CELL_SIZE;
            
            const row = Math.floor(nextY / CELL_SIZE);
            const col = Math.floor(nextX / CELL_SIZE);
            
            if (row >= 0 && row < maze.length && col >= 0 && col < maze[0].length) {
                if (maze[row][col] === 0) {
                    return dir;
                }
            }
        }
        
        // If no valid path, reverse direction
        return { x: -this.direction.x, y: -this.direction.y };
    }
    
    update(deltaTime, player, checkWallCollision) {
        // Skip movement if frozen
        if (this.updateFrozenState(deltaTime)) return;
        
        // Update timer and potentially change direction
        this.pathTimer += deltaTime;
        
        // Move in the current direction
        const moveX = this.direction.x * this.speed;
        const moveY = this.direction.y * this.speed;
        
        // Safety check in case direction is undefined
        if (!this.direction || (this.direction.x === 0 && this.direction.y === 0)) {
            this.direction = { x: 1, y: 0 }; // Default to moving right
        }
        
        // Check if we're about to hit a wall
        if (checkWallCollision(this.x + moveX, this.y + moveY, this.size)) {
            // We're going to hit a wall, so change direction
            this.direction = this.changeDirection(this.maze);
            return;
        }
        
        // Check if we're centered on a cell (good time to potentially change direction)
        const isCenteredX = Math.abs((this.x % CELL_SIZE) - CELL_SIZE/2) < this.speed;
        const isCenteredY = Math.abs((this.y % CELL_SIZE) - CELL_SIZE/2) < this.speed;
        
        if (isCenteredX && isCenteredY && Math.random() < 0.2) {
            this.direction = this.changeDirection(this.maze);
        }
        
        // Apply movement
        this.x += moveX;
        this.y += moveY;
    }
    
    draw(ctx) {
        // Green for patrol monsters, light blue when frozen
        ctx.fillStyle = this.frozen ? '#87CEFA' : '#2ecc71';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw a simple indicator of direction
        const dirX = this.x + this.direction.x * this.size;
        const dirY = this.y + this.direction.y * this.size;
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(dirX, dirY, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Factory function to create monsters
export function createMonster(type, x, y, maze) {
    if (type === 'hunter') {
        return new HunterMonster(x, y);
    } else if (type === 'patrol') {
        return new PatrolMonster(x, y, maze);
    }
    throw new Error(`Unknown monster type: ${type}`);
}