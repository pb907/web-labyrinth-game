// Game constants
const CELL_SIZE = 40;
const PLAYER_SIZE = 20;
const MONSTER_SIZE = 25;
const BOMB_SIZE = 15;
const EXPLOSION_SIZE = 100;
const PLAYER_SPEED = 5;
const MONSTER_SPEED = 3.5; // Increased from 2 to 3.5
const BOMB_TIMER = 3000; // 3 seconds

// Game variables
let canvas, ctx;
let player = { x: 60, y: 60, lives: 3 };
let monsters = [];
let bombs = [];
let explosions = [];
let maze = [];
let exit = { x: 0, y: 0 };
let gameOver = false;
let gameWon = false;
let lastTime = 0;

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
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Generate maze
    generateMaze();
    
    // Place initial monsters
    spawnMonsters(3);
    
    // Setup event listeners
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });
    
    // Start game loop
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
    exit = { x: 18 * CELL_SIZE + CELL_SIZE / 2, y: 13 * CELL_SIZE + CELL_SIZE / 2 };
}

// Spawn monsters at random valid positions
function spawnMonsters(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
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
        } while (true);
        
        monsters.push({ x, y });
    }
}

// Place a bomb at player position
function placeBomb() {
    bombs.push({
        x: player.x,
        y: player.y,
        timer: BOMB_TIMER,
        exploded: false
    });
}

// Create explosion
function createExplosion(x, y) {
    explosions.push({
        x,
        y,
        timer: 500, // Explosion lasts 0.5 seconds
        size: 0
    });
}

// Check collision between two objects
function checkCollision(obj1, obj1Size, obj2, obj2Size) {
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

// Update player position based on key presses
function updatePlayer(deltaTime) {
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
    if (!checkWallCollision(player.x + dx, player.y, PLAYER_SIZE)) {
        player.x += dx;
    }
    
    // Check vertical movement
    if (!checkWallCollision(player.x, player.y + dy, PLAYER_SIZE)) {
        player.y += dy;
    }
    
    // Place bomb on spacebar
    if (keys[' ']) {
        keys[' '] = false; // Reset to prevent multiple bombs
        placeBomb();
    }
    
    // Check if player reached exit
    if (checkCollision(player, PLAYER_SIZE, exit, CELL_SIZE / 2)) {
        gameWon = true;
    }
}

// Update monster positions
function updateMonsters(deltaTime) {
    for (let i = 0; i < monsters.length; i++) {
        const monster = monsters[i];
        
        // Simple AI: Move toward player if possible
        const dx = player.x - monster.x;
        const dy = player.y - monster.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) { // Only chase if player is within range
            let moveX = (dx / distance) * MONSTER_SPEED;
            let moveY = (dy / distance) * MONSTER_SPEED;
            
            // Check horizontal movement
            if (!checkWallCollision(monster.x + moveX, monster.y, MONSTER_SIZE)) {
                monster.x += moveX;
            }
            
            // Check vertical movement
            if (!checkWallCollision(monster.x, monster.y + moveY, MONSTER_SIZE)) {
                monster.y += moveY;
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
                const newX = monster.x + dir.x * MONSTER_SPEED * 5;
                const newY = monster.y + dir.y * MONSTER_SPEED * 5;
                
                if (!checkWallCollision(newX, monster.y, MONSTER_SIZE)) {
                    monster.x = newX;
                }
                
                if (!checkWallCollision(monster.x, newY, MONSTER_SIZE)) {
                    monster.y = newY;
                }
            }
        }
        
        // Check if monster caught player
        if (checkCollision(monster, MONSTER_SIZE, player, PLAYER_SIZE)) {
            player.lives--;
            document.getElementById('lives').textContent = player.lives;
            
            if (player.lives <= 0) {
                gameOver = true;
            } else {
                // Reset player position
                player.x = 60;
                player.y = 60;
            }
        }
        
        // Check if monster hit bombs
        for (let j = 0; j < bombs.length; j++) {
            const bomb = bombs[j];
            if (!bomb.exploded && checkCollision(monster, MONSTER_SIZE, bomb, BOMB_SIZE)) {
                bomb.exploded = true;
                bomb.timer = 0;
                createExplosion(bomb.x, bomb.y);
            }
        }
    }
}

// Update bombs
function updateBombs(deltaTime) {
    for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];
        
        bomb.timer -= deltaTime;
        
        if (bomb.timer <= 0 && !bomb.exploded) {
            bomb.exploded = true;
            createExplosion(bomb.x, bomb.y);
            bombs.splice(i, 1);
        }
    }
}

// Update explosions
function updateExplosions(deltaTime) {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        
        explosion.timer -= deltaTime;
        explosion.size = EXPLOSION_SIZE * (1 - explosion.timer / 500);
        
        // Check if explosion hit monsters
        for (let j = monsters.length - 1; j >= 0; j--) {
            const monster = monsters[j];
            if (checkCollision(explosion, explosion.size, monster, MONSTER_SIZE)) {
                monsters.splice(j, 1);
            }
        }
        
        if (explosion.timer <= 0) {
            explosions.splice(i, 1);
        }
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
    
    // Draw exit
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bombs
    for (const bomb of bombs) {
        // Changed bomb color from black to orange/brown to make it visible against the path
        ctx.fillStyle = bomb.timer < 1000 ? '#f00' : '#FF8C00';
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y, BOMB_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a dark outline to make it more visible
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw explosions
    for (const explosion of explosions) {
        const gradient = ctx.createRadialGradient(
            explosion.x, explosion.y, 0,
            explosion.x, explosion.y, explosion.size
        );
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw player
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw monsters
    for (const monster of monsters) {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(monster.x, monster.y, MONSTER_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Display game over or win screen
    if (gameOver) {
        document.getElementById('game-over').style.display = 'block';
    }
    
    if (gameWon) {
        document.getElementById('win-screen').style.display = 'block';
    }
}

// Game loop
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (!gameOver && !gameWon) {
        updatePlayer(deltaTime);
        updateMonsters(deltaTime);
        updateBombs(deltaTime);
        updateExplosions(deltaTime);
    }
    
    render();
    
    requestAnimationFrame(gameLoop);
}

// Start the game when the page loads
window.onload = init;