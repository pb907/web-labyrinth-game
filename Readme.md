# Labyrinth Game

A 2D maze game where you navigate through a labyrinth, avoid monsters, and use bombs strategically to reach the exit.

![Labyrinth Game Screenshot](https://placeholder-for-game-screenshot.jpg)

## Game Overview

In this game, you control a blue circle (the player) navigating through a maze. Your goal is to reach the green exit while avoiding red and green monsters. You have bombs at your disposal to deal with the monsters.

### Game Elements

- **Player**: Blue circle controlled with arrow keys
- **Hunter Monsters**: Red circles that chase the player when in range
- **Patrol Monsters**: Green circles that follow patrol routes through the maze
- **Regular Bombs**: Orange/red circles that explode after 3 seconds, destroying monsters
- **Freeze Bombs**: Blue circles that explode after 1.5 seconds, temporarily immobilizing monsters
- **Exit**: Green circle that you need to reach to win

### Game Controls

- **Arrow Keys**: Move the player
- **Space (Quick Tap)**: Drop a freeze bomb that temporarily immobilizes monsters
- **Space (Hold)**: Drop a regular bomb that destroys monsters
- **Objective**: Reach the green exit while avoiding monsters and using bombs strategically

## Project Structure

```
labyrinth-game/
│
├── app.py                      # Flask application server
├── templates/
│   └── index.html              # HTML template with game container and styles
├── static/
│   ├── constants.js            # Game constants and configuration
│   ├── player.js               # Player class and movement logic
│   ├── monsters.js             # Monster classes (Hunter and Patrol)
│   ├── bombs.js                # Bomb system (Regular and Freeze bombs)
│   └── game.js                 # Main game logic and rendering
├── requirements.txt            # Python dependencies for Flask
└── Dockerfile                  # Docker configuration for containerization
```

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- Flask and Werkzeug packages
- Web browser with JavaScript enabled
- (Optional) Docker for containerized deployment

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://your-repository-url/labyrinth-game.git
   cd labyrinth-game
   ```

2. **Create project structure:**
   ```bash
   mkdir -p templates static
   ```

3. **Copy files to the appropriate directories:**
   - Copy the HTML code to `templates/index.html`
   - Copy all JavaScript files to the `static` directory
   - Copy the Flask application code to `app.py`
   - Ensure `requirements.txt` is in the root directory

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the Flask application:**
   ```bash
   python app.py
   ```

6. **Access the game:**
   Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

### Running with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t labyrinth-game .
   ```

2. **Run the Docker container:**
   ```bash
   docker run -p 5000:5000 labyrinth-game
   ```

3. **Access the game:**
   Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Game Features

### Basic Gameplay

- Navigate through a maze filled with walls and monsters
- Collect power-ups and reach the exit to complete the level
- Each level increases in difficulty with more monsters and complex mazes

### Bomb System

The game features a dual bomb system:
- **Regular Bombs** (hold spacebar): Explode after 3 seconds, destroying monsters in their blast radius
- **Freeze Bombs** (quick tap spacebar): Explode after 1.5 seconds, freezing monsters temporarily

### Monster Types

- **Hunter Monsters**: Actively chase the player when within detection range
- **Patrol Monsters**: Follow patrol routes and change direction at intersections

## Development

### Adding New Features

To extend the game with new features:

1. **Add new monster types:**
   - Create a new monster class in `monsters.js` extending the base Monster class
   - Implement unique movement and behavior patterns
   - Update the factory function to include the new monster type

2. **Add new bomb types:**
   - Create a new bomb class in `bombs.js` extending the base Bomb class
   - Implement unique explosion effects
   - Update the BombManager to handle the new bomb type

3. **Create new maze layouts:**
   - Modify the maze array in the `generateMaze()` function in `game.js`
   - Consider adding multiple levels with increasing difficulty

### Customizing Game Parameters

Game parameters can be adjusted in `constants.js`:
- Player and monster speeds
- Bomb timers and explosion sizes
- Cell and entity sizes
- Freeze duration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the Flask team for the lightweight web framework
- Inspired by classic arcade maze games