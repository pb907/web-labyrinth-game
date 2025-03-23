// Game constants
export const CELL_SIZE = 40;
export const PLAYER_SIZE = 20;
export const MONSTER_SIZE = 25;
export const PATROL_MONSTER_SIZE = 22;
export const BOMB_SIZE = 15;
export const EXPLOSION_SIZE = 100;
export const FREEZE_EXPLOSION_SIZE = 80;
export const PLAYER_SPEED = 5;
export const MONSTER_SPEED = 3.5;
export const PATROL_MONSTER_SPEED = 4;
export const REGULAR_BOMB_TIMER = 3000; // 3 seconds
export const FREEZE_BOMB_TIMER = 1500; // 1.5 seconds
export const FREEZE_DURATION = 5000; // 5 seconds
export const SPACE_HOLD_THRESHOLD = 300; // 300ms to differentiate tap from hold

// Coin system constants
export const COIN_SIZE = 12; // Increased for better visibility
export const COIN_SPACING = CELL_SIZE / 2;
export const REQUIRED_COIN_PERCENTAGE = 75; // Player needs to collect 75% of coins to activate exit

console.log("Constants module loaded with COIN_SIZE:", COIN_SIZE);