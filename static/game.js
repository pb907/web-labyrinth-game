import { CELL_SIZE, PLAYER_SIZE, MONSTER_SIZE, REQUIRED_COIN_PERCENTAGE } from './constants.js';
import { Player } from './player.js';
import { HunterMonster, PatrolMonster, createMonster } from './monsters.js';
import { BombManager } from './bombs.js';
import { CoinManager } from './coins.js';

console.log("Game module loaded!");
console.log("Loaded constants:", { CELL_SIZE, PLAYER_SIZE, MONSTER_SIZE, REQUIRED_COIN_PERCENTAGE });

// Game variables
let canvas, ctx;
let player;
let monsters = [];
let bombManager;
let coinManager;
let maze = [];
let exit = { x: 0, y: 0, active: false };
let gameOver = false;
let gameWon = false;
let lastTime = 0;
let crushEffects = [];
let bonusLifeAdded = false;

// Key states
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false  // Space key
};

// Function to log coin collection status
function logCoinCollectionStatus() {
    if (!player || !coinManager) return;
    
    // Find the closest coin to the player
    let closestCoin = null;
    let closestDistance = Infinity;
    
    for (let i = 0; i < coinManager.coins.length; i++) {
        const coin = coinManager.coins[i];
        if (!coin.collected) {
            const dx = player.x - coin.x;
            const dy = player.y - coin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestCoin = {index: i, coin: coin, distance: distance};
            }
        }
    }
    
    if (closestCoin) {
        console.log("%c COIN COLLECTION STATUS:", "background: #333; color: #ff0; font-size: 14px; padding: 2px 5px;");
        console.log(`Player position: (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
        console.log(`Closest coin #${closestCoin.index}: (${closestCoin.coin.x.toFixed(1)}, ${closestCoin.coin.y.toFixed(1)})`);
        console.log(`Distance to closest coin: ${closestCoin.distance.toFixed(1)}px`);
        console.log(`Collection radius: 30px (fixed)`);
        console.log(`Should collect? ${closestCoin.distance < 30 ? 'YES' : 'NO'}`);
    }
}

// Initialize the game
function init() {
    console.log("Game initialization started");
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Create player
    player = new Player(60, 60);
    console.log("Player created at position:", player.x, player.y);
    
    // Generate maze
    generateMaze();
    console.log("Maze generated");
    
    // Create coin manager
    coinManager = new CoinManager(maze, CELL_SIZE);
    coinManager.onExitActivated = activateExit;
    console.log("Coin manager created with", coinManager.totalCoins, "coins");
    
    // Make coinManager globally accessible for debugging
    window.coinManager = coinManager;
    
    // Create bomb manager
    bombManager = new BombManager();
    
    // Place initial monsters
    spawnMonsters(2, 'hunter');
    spawnMonsters(2, 'patrol');
    console.log("Monsters spawned:", monsters.length);
    
    // Setup event listeners
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
            e.preventDefault(); // Prevent scrolling with arrow keys
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });
    
    // Update UI
    document.getElementById('lives').textContent = player.lives;
    updateCollectionUI();
    
    console.log("Game initialization completed");
    
    // Start game loop
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Generate a simple maze
function generateMaze() {
    // Create a simple maze layout (1 = wall, 0 = path)
    maze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    // Set exit point
    exit = { 
        x: 18 * CELL_SIZE + CELL_SIZE / 2, 
        y: 13 * CELL_SIZE + CELL_SIZE / 2,
        active: false
    };
    
    console.log("Exit point set at:", exit.x, exit.y);
}

// Function to activate the exit when enough coins are collected
function activateExit() {
    console.log("Exit activated function called!");
    exit.active = true;
    
    // Update the exit status display
    const exitStatus = document.getElementById('exit-status');
    if (exitStatus) {
        exitStatus.textContent = 'Exit: Active (Go to the green exit)';
        exitStatus.className = 'active';
        console.log("Exit status UI updated");
    } else {
        console.log("Warning: exit-status element not found");
    }
    
    // Display a notification to the player
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Exit Activated!';
    
    document.getElementById('game-container').appendChild(notification);
    console.log("Exit activation notification added");
    
    // Remove the notification after animation
    setTimeout(() => {
        notification.remove();
        console.log("Exit activation notification removed");
    }, 2000);
}

// Update collection UI
function updateCollectionUI() {
    if (!coinManager) {
        console.log("Warning: coinManager not initialized in updateCollectionUI");
        return;
    }
    
    const percentage = coinManager.getCollectionPercentage();
    const requiredPercentage = REQUIRED_COIN_PERCENTAGE;
    
    // Update the progress bar
    const progressBar = document.getElementById('collection-progress-bar');
    const progressLabel = document.getElementById('collection-progress-label');
    
    if (progressBar && progressLabel) {
        progressBar.style.width = `${percentage}%`;
        progressBar.style.backgroundColor = percentage >= requiredPercentage ? '#0f0' : '#FFD700';
        
        progressLabel.textContent = `Coins: ${percentage}% / ${requiredPercentage}%`;
        
        // If 100% collected, display a bonus message and give an extra life
        if (percentage === 100 && !bonusLifeAdded) {
            console.log("100% coins collected - adding bonus life!");
            const bonusMsg = document.createElement('div');
            bonusMsg.className = 'notification';
            bonusMsg.textContent = 'PERFECT COLLECTION! +1 LIFE';
            bonusMsg.style.color = '#FFD700';
            
            document.getElementById('game-container').appendChild(bonusMsg);
            
            // Remove the bonus message after animation
            setTimeout(() => {
                bonusMsg.remove();
            }, 3000);
            
            // Give player a bonus life
            player.lives++;
            document.getElementById('lives').textContent = player.lives;
            bonusLifeAdded = true;
        }
    } else {
        console.log("Warning: progress bar UI elements not found");
    }
    
    // Update exit status display
    const exitStatus = document.getElementById('exit-status');
    if (exitStatus && !exit.active) {
        exitStatus.textContent = `Exit: Inactive (Collect ${requiredPercentage}% of coins)`;
        exitStatus.className = 'inactive';
    }
}

// Create crush effect
function createCrushEffect(x, y) {
    crushEffects.push({
        x: x,
        y: y,
        size: 20,
        duration: 300,
        timer: 300,
        draw: function(ctx) {
            const progress = 1 - this.timer / this.duration;
            const alpha = 1 - progress;
            
            ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * progress * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Particles
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i + progress * Math.PI;
                const distance = this.size * progress * 2;
                const particleX = this.x + Math.cos(angle) * distance;
                const particleY = this.y + Math.sin(angle) * distance;
                
                ctx.fillStyle = `rgba(200, 200, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, 3 * (1 - progress), 0, Math.PI * 2);
                ctx.fill();
            }
        },
        update: function(deltaTime) {
            this.timer -= deltaTime;
            return this.timer > 0;
        }
    });
}

// Spawn monsters at random valid positions
function spawnMonsters(count, type) {
    for (let i = 0; i < count; i++) {
        let x, y;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops
        
        do {
            attempts++;
            const row = Math.floor(Math.random() * maze.length);
            const col = Math.floor(Math.random() * maze[0].length);
            
            if (maze[row][col] === 0) {
                x = col * CELL_SIZE + CELL_SIZE / 2;
                y = row * CELL_SIZE + CELL_SIZE / 2;
                
                // Ensure monsters don't spawn too close to player
                const distToPlayer = Math.sqrt(
                    Math.pow(x - player.x, 2) + Math.pow(y - player.y, 2)
                );
                
                if (distToPlayer > 200) {
                    break;
                }
            }
            
            if (attempts >= maxAttempts) {
                // Default fallback position if can't find a good spot
                x = 300;
                y = 300;
                console.log(`Max attempts reached for monster spawn. Using fallback position: (${x}, ${y})`);
                break;
            }
        } while (true);
        
        try {
            const monster = createMonster(type, x, y, maze);
            monsters.push(monster);
        } catch (error) {
            console.error(`Error creating ${type} monster:`, error);
        }
    }
}

// Check collision between two objects
function checkCollision(obj1, obj1Size, obj2, obj2Size) {
    if (!obj1 || !obj2) {
        return false;
    }
    
    if (typeof obj1.x !== 'number' || typeof obj1.y !== 'number' ||
        typeof obj2.x !== 'number' || typeof obj2.y !== 'number') {
        return false;
    }
    
    // Calculate distance between centers
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate the collision threshold (sum of radii)
    const collisionThreshold = (obj1Size + obj2Size) / 2;
    
    // If the distance is less than the sum of the radii, there's a collision
    return distance < collisionThreshold;
}

// Check if a position collides with walls
function checkWallCollision(x, y, size) {
    // Check corners around the entity
    const points = [
        { x: x - size / 2, y: y - size / 2 },
        { x: x + size / 2, y: y - size / 2 },
        { x: x - size / 2, y: y + size / 2 },
        { x: x + size / 2, y: y + size / 2 }
    ];
    
    for (const point of points) {
        const row = Math.floor(point.y / CELL_SIZE);
        const col = Math.floor(point.x / CELL_SIZE);
        
        if (row >= 0 && row < maze.length && col >= 0 && col < maze[0].length) {
            if (maze[row][col] === 1) {
                return true;
            }
        }
    }
    
    return false;
}

// Update game state
function update(deltaTime) {
    try {
        // Log coin collection status occasionally
        // if (Math.random() < 0.03) logCoinCollectionStatus(); // 3% chance per frame
        
        // Update player
        player.update(keys, deltaTime, checkWallCollision, 
            (x, y) => bombManager.placeRegularBomb(x, y),
            (x, y) => bombManager.placeFreezeBomb(x, y));
        
        // Update coins and check collection
        coinManager.update(deltaTime, player, checkCollision);
        
        // Update the collection UI
        updateCollectionUI();
        
        // Check if player reached exit (only works if exit is active)
        if (exit.active && checkCollision(player, PLAYER_SIZE, exit, CELL_SIZE / 2)) {
            console.log("Player reached the exit! Game won!");
            gameWon = true;
        }
        
        // Update monsters
        for (let i = monsters.length - 1; i >= 0; i--) {
            const monster = monsters[i];
            monster.update(deltaTime, player, checkWallCollision);
            
            // Check if monster caught player
            if (checkCollision(monster, monster.size, player, PLAYER_SIZE)) {
                // Only take damage if the monster is not frozen
                if (!monster.frozen) {
                    if (player.reduceLife()) {
                        console.log("Game over! No more lives left.");
                        gameOver = true;
                    } else {
                        // Reset player position on hit
                        console.log("Player hit by monster! Lives left:", player.lives);
                        player.reset(60, 60);
                    }
                } else {
                    // If monster is frozen, remove it when player runs over it
                    console.log("Player crushed a frozen monster!");
                    monster.hit = true;
                    
                    // Add a crushing effect
                    createCrushEffect(monster.x, monster.y);
                }
            }
        }
        
        // Update bombs and explosions
        bombManager.update(deltaTime, monsters, checkCollision);
        
        // Update crush effects
        for (let i = crushEffects.length - 1; i >= 0; i--) {
            if (!crushEffects[i].update(deltaTime)) {
                crushEffects.splice(i, 1);
            }
        }
        
        // Remove monsters that were hit
        monsters = monsters.filter(monster => {
            if (!monster) return false;
            return !monster.hit;
        });
    } catch (error) {
        console.error("Error in update function:", error);
    }
}

// Render the game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 1) {
                ctx.fillStyle = '#444';
                ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
    
    // Draw coins
    coinManager.draw(ctx);
    
    // Draw exit with special effects if active
    if (exit.active) {
        // Active exit has a pulsing green glow
        const pulseSize = CELL_SIZE / 3 + Math.sin(lastTime * 0.005) * 5;
        
        // Draw glow
        const gradient = ctx.createRadialGradient(
            exit.x, exit.y, pulseSize * 0.5,
            exit.x, exit.y, pulseSize * 2
        );
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(exit.x, exit.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw exit
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(exit.x, exit.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Inactive exit is dimmed
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(exit.x, exit.y, CELL_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw "locked" indicator
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(exit.x - 8, exit.y - 8);
        ctx.lineTo(exit.x + 8, exit.y + 8);
        ctx.moveTo(exit.x + 8, exit.y - 8);
        ctx.lineTo(exit.x - 8, exit.y + 8);
        ctx.stroke();
    }
    
    // Draw bombs and explosions
    bombManager.draw(ctx);
    
    // Draw crush effects
    for (const effect of crushEffects) {
        effect.draw(ctx);
    }
    
    // Draw monsters
    for (const monster of monsters) {
        if (monster) {
            monster.draw(ctx);
        }
    }
    
    // Draw player
    player.draw(ctx);
    
    // Draw coin hitboxes if debug mode is on
    if (window.DEBUG_COINS) {
        for (let i = 0; i < coinManager.coins.length; i++) {
            const coin = coinManager.coins[i];
            if (!coin.collected) {
                // Draw collection radius (30px)
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(coin.x, coin.y, 30, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw index number
                ctx.fillStyle = 'white';
                ctx.font = '8px Arial';
                ctx.fillText(i.toString(), coin.x - 2, coin.y + 3);
            }
        }
    }
    
    // Display game over or win screen
    if (gameOver) {
        document.getElementById('game-over').style.display = 'block';
    }
    
    if (gameWon) {
        document.getElementById('win-screen').style.display = 'block';
        
        // Display collection percentage in win screen
        const winScreen = document.getElementById('win-screen');
        let collectionStats = document.getElementById('collection-stats');
        
        if (!collectionStats) {
            collectionStats = document.createElement('div');
            collectionStats.id = 'collection-stats';
            collectionStats.style.fontSize = '24px';
            collectionStats.style.marginTop = '10px';
            
            const percentage = coinManager.getCollectionPercentage();
            let message = `Coins collected: ${percentage}%`;
            
            if (percentage === 100) {
                message += " - PERFECT!";
                collectionStats.style.color = '#FFD700';
            }
            
            collectionStats.textContent = message;
            winScreen.insertBefore(collectionStats, winScreen.querySelector('button'));
        }
    }
}

// Game loop
function gameLoop(timestamp) {
    // Calculate delta time in milliseconds (cap it to prevent huge jumps)
    const deltaTime = Math.min(timestamp - lastTime, 100);
    lastTime = timestamp;
    
    if (!gameOver && !gameWon) {
        update(deltaTime);
    }
    
    render();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Enable coin debugging with a global flag
window.DEBUG_COINS = false;

// Start the game when the page loads
window.onload = init;