import { CELL_SIZE, COIN_SIZE, COIN_SPACING, REQUIRED_COIN_PERCENTAGE } from './constants.js';

console.log("Coins module loaded with COIN_SIZE:", COIN_SIZE);

export class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.collected = false;
        this.size = COIN_SIZE;
        this.animationTimer = 0;
    }
    
    update(deltaTime) {
        this.animationTimer += deltaTime * 0.003;
    }
    
    draw(ctx) {
        // Skip drawing if coin is collected
        if (this.collected) return;
        
        // Add a slight pulsing animation to make coins more noticeable
        const pulseSize = this.size * (0.9 + 0.2 * Math.sin(this.animationTimer));
        
        // Gold color for coins
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a subtle glow effect
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class CoinManager {
    constructor(maze, cellSize) {
        console.log("CoinManager constructor called");
        this.coins = [];
        this.totalCoins = 0;
        this.collectedCoins = 0;
        this.exitActivated = false;
        this.onExitActivated = null; // Callback function when exit is activated
        
        // Place coins throughout the maze pathways
        this.generateCoins(maze, cellSize);
        console.log(`Total coins generated: ${this.totalCoins}`);
    }
    
    generateCoins(maze, cellSize) {
        console.log("Generating coins for maze");
        // Place coins on all passable cells (value 0) in the maze
        for (let row = 0; row < maze.length; row++) {
            for (let col = 0; col < maze[0].length; col++) {
                if (maze[row][col] === 0) {
                    // Add a coin in the center of each passable cell
                    const centerX = col * cellSize + cellSize / 2;
                    const centerY = row * cellSize + cellSize / 2;
                    
                    // Skip coins near the player start and exit positions
                    const isStartArea = (row < 2 && col < 2); // Top-left corner where player starts
                    const isExitArea = (row === 13 && col === 18); // Exit location
                    
                    if (!isStartArea && !isExitArea) {
                        this.coins.push(new Coin(centerX, centerY));
                        this.totalCoins++;
                    }
                }
            }
        }
        
        console.log(`Generated ${this.totalCoins} coins in the maze`);
    }
    
    update(deltaTime, player, checkCollision) {
        // Update all coins
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            if (!coin.collected) {
                coin.update(deltaTime);
                
                // DIRECT DISTANCE CHECK (bypassing checkCollision)
                const dx = player.x - coin.x;
                const dy = player.y - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Use a fixed 30px collection radius for reliability
                if (distance < 30) {
                    console.log(`COLLECTED COIN #${i} at distance ${distance.toFixed(1)}px!`);
                    coin.collected = true;
                    this.collectedCoins++;
                    
                    // Update UI and check exit activation
                    const percentage = (this.collectedCoins / this.totalCoins) * 100;
                    const progressBar = document.getElementById('collection-progress-bar');
                    const progressLabel = document.getElementById('collection-progress-label');
                    
                    if (progressBar && progressLabel) {
                        progressBar.style.width = `${percentage}%`;
                        progressBar.style.backgroundColor = percentage >= REQUIRED_COIN_PERCENTAGE ? '#0f0' : '#FFD700';
                        progressLabel.textContent = `Coins: ${Math.floor(percentage)}% / ${REQUIRED_COIN_PERCENTAGE}%`;
                    }
                    
                    if (percentage >= REQUIRED_COIN_PERCENTAGE && !this.exitActivated) {
                        this.exitActivated = true;
                        if (typeof this.onExitActivated === 'function') {
                            this.onExitActivated();
                        }
                    }
                }
            }
        }
    }
    
    getCollectionPercentage() {
        return Math.floor((this.collectedCoins / this.totalCoins) * 100);
    }
    
    isAllCollected() {
        return this.collectedCoins === this.totalCoins;
    }
    
    draw(ctx) {
        // Draw all uncollected coins
        for (const coin of this.coins) {
            coin.draw(ctx);
        }
    }
}