# Labyrinth Game Enhancement Proposal

## New Gameplay Mechanics

### 1. Pac-Man Collection System
- Scatter small golden coins throughout all pathways in the maze
- Player must collect a certain percentage (e.g., 75%) of coins to activate the exit
- Add visual indicator showing collection progress on the UI
- Bonus time/points for collecting 100% of coins
- Some coins could be placed in high-risk areas to create risk/reward decisions

### 2. Dual Bomb System
- **Quick tap Space**: Deploy blue freeze bomb
  - Freezes nearby monsters for 5 seconds (monsters turn light blue)
  - Smaller blast radius than regular bombs
  - Shorter cooldown time between uses
- **Hold Space**: Deploy regular explosive bomb (existing functionality)
  - Visual indicator showing charge-up for the regular bomb
  - Small animation/particle effect to differentiate between bomb types

### 3. Monster Remains Power-Up
- Red glowing dots appear when monsters are destroyed
- Collecting gives 3-second invincibility (player glows golden)
- During invincibility, touching monsters freezes them instead of taking damage
- Visual and audio cues for when the power-up is active and about to expire
- Counter showing remaining invincibility time

### 4. Patrol Monsters
- Green monsters that follow fixed patrol routes
- Move slightly faster than regular monsters
- Not attracted to player but still dangerous on contact
- Patrol patterns could include:
  - Back-and-forth along corridors
  - Circular routes around specific maze sections
  - Random turns at intersections (but still predictable compared to hunting monsters)
- Visual indicators showing their patrol path (faint footprints)

## Technical Enhancements

### 5. Procedural Maze Generation
- Dynamically generate new maze layouts on each game start
- Algorithm ensures maze is always solvable
- Varying difficulty parameters:
  - Simple: Wider corridors, fewer dead ends
  - Medium: Balanced layout with some loops and dead ends
  - Hard: Narrow passages, many dead ends, complex structure
- Option to replay a particularly interesting maze (via seed system)

### 6. Progressive Difficulty System
- Wave-based monster spawning that increases over time
- New monster appears every 30 seconds
- Visual warning before new monsters spawn
- Limited total monster count based on difficulty level
- Increased monster speed in later waves

### 7. Themed Environments
- Multiple visual themes without changing core gameplay:
  - **Dungeon**: Dark stone walls, torch lighting effects
  - **Forest**: Green hedge maze, natural lighting
  - **Space Station**: Metallic walls, sci-fi lighting
  - **Haunted Mansion**: Wooden paneling, eerie lighting
- Each theme includes:
  - Unique background textures
  - Themed wall designs
  - Ambience audio
  - Thematic particle effects (dust, leaves, steam, etc.)
  - Customized exit and collectible appearances

### 8. Game Progression System
- Level-based progression with increasing challenges
- Unlock new themes by completing previous levels
- Track best times and highest collection percentages
- Achievement system for accomplishments like:
  - "Perfectionist": Collect all coins in a level
  - "Pacifist": Complete a level without destroying any monsters
  - "Speedrunner": Complete a level within a time limit
  - "Ghostbuster": Destroy all monsters in a level

This enhancement proposal maintains the core gameplay while adding substantial depth, replayability, and strategic elements to the Labyrinth Game.