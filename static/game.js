import { CELL_SIZE, PLAYER_SIZE, MONSTER_SIZE } from './constants.js';
import { Player } from './player.js';
import { HunterMonster, PatrolMonster, createMonster } from './monsters.js';
import { BombManager } from './bombs.js';

// Game variables
let canvas, ctx;
let player;
let monsters = [];
let bombManager;
let maze = [];
let exit = { x: 0, y: 0 };
let gameOver = false;
let gameWon = false;
let lastTime = 0;
let gameRunning = true;
let crushEffects = [];

// Key states
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false  // Space key
};

// Initialize the game
function init() {
    try {
        canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Game canvas not found');
            return;
        }
        
        ctx = canvas.getContext('2d');
        
        // Create player
        player = new Player(60, 60);
        
        // Create bomb manager
        bombManager = new BombManager();
        
        // Generate maze
        generateMaze();
        
        // Place initial monsters
        spawnMonsters(2, 'hunter');
        spawnMonsters(2, 'patrol');
        
        // Setup event listeners
        window.addEventListener('keydown', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = true;
                e.preventDefault(); // Prevent default actions like scrolling with arrow keys
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = false;
            }
        });
        
        // Update UI
        document.getElementById('lives').textContent = player.lives;
        
        // Add error handling
        window.addEventListener('error', function(event) {
            console.error('Game error detected:', event.message);
            gameRunning = false;
            // Try to recover
            setTimeout(() => {
                gameRunning = true;
                requestAnimationFrame(gameLoop);
            }, 1000);
        });
        
        // Start game loop
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error("Game initialization error:", error);
    }
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
    exit = { x: 18 * CELL_SIZE + CELL_SIZE / 2, y: 13 * CELL_SIZE + CELL_SIZE / 2 };
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
    if (!obj1 || !obj2 || typeof obj1.x !== 'number' || typeof obj1.y !== 'number' ||
        typeof obj2.x !== 'number' || typeof obj2.y !== 'number') {
        return false;
    }
    
    return (
        Math.abs(obj1.x - obj2.x) < (obj1Size + obj2Size) / 2 &&
        Math.abs(obj1.y - obj2.y) < (obj1Size + obj2Size) / 2
    );
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
        // Update player
        player.update(keys, deltaTime, checkWallCollision, 
            (x, y) => bombManager.placeRegularBomb(x, y),
            (x, y) => bombManager.placeFreezeBomb(x, y));
        
        // Check if player reached exit
        if (checkCollision(player, PLAYER_SIZE, exit, CELL_SIZE / 2)) {
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
                        gameOver = true;
                    } else {
                        // Reset player position on hit
                        player.reset(60, 60);
                    }
                } else {
                    // If monster is frozen, remove it when player runs over it
                    monster.hit = true;
                    
                    // Add a crushing effect (optional)
                    createCrushEffect(monster.x, monster.y);
                }
            }
        }
        
        // Update bombs and explosions
        bombManager.update(deltaTime, monsters, checkCollision);
        
        // Remove monsters that were hit by regular explosions
        // Make a copy of the array to avoid modification during iteration
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
    try {
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
        
        // Draw exit
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(exit.x, exit.y, CELL_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        
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
        
        // Display game over or win screen
        if (gameOver) {
            document.getElementById('game-over').style.display = 'block';
        }
        
        if (gameWon) {
            document.getElementById('win-screen').style.display = 'block';
        }
    } catch (error) {
        console.error("Error in render function:", error);
    }
}

// Game loop
function gameLoop(timestamp) {
    try {
        if (!gameRunning) return;
        
        // Calculate delta time in milliseconds (cap it to prevent huge jumps)
        const deltaTime = Math.min(timestamp - lastTime, 100);
        lastTime = timestamp;
        
        if (!gameOver && !gameWon) {
            update(deltaTime);
        }
        
        render();
        
        // Continue the game loop
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error("Game loop error:", error);
        gameRunning = false;
        
        // Try to recover
        setTimeout(() => {
            gameRunning = true;
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }, 1000);
    }
}

// Start the game when the page loads
window.onload = init;