# Helix Jump - 20,000 Levels

A 3D Helix Jump game implementation with 20,000 procedurally generated levels using Three.js, Cannon-ES, and GSAP.

## Features

- **20,000 Levels**: Journey from level 0 (top) to level 19,999 (bottom)
- **Lazy Generation**: Rings are only created when needed and destroyed when far away
- **Dynamic Color Themes**: Each game randomly selects from 8 different color themes
- **Trap System**: Red platforms make you go down 1 level instead of killing you
- **Scaling Difficulty**: More traps appear as you go deeper
- **Smooth Controls**: Rotate the tower with keyboard controls
- **Physics-Based**: Realistic ball physics with gravity and bounce

## Game Mechanics

### Platforms

- **Safe Platforms**: Colored tiles (based on theme) that you can bounce on safely
- **Traps (Red)**: If you hit a red platform, you drop down 1 level
- **Holes**: Gaps in the ring where the ball can fall through

### Difficulty Scaling

- **Shallow Levels (0-4000)**: 0-1 traps per ring, 3-4 holes
- **Medium Levels (4000-12000)**: 1-2 traps per ring, 2-3 holes
- **Deep Levels (12000-20000)**: 2-3 traps per ring, 1-2 holes

Maximum traps per ring: 3

## Controls

### Gameplay
- **A / D** or **Arrow Left / Right**: Rotate tower
- **W / S** or **Arrow Up / Down**: Zoom camera in/out

### Level Navigation (Debug)
- **[** : Move down 1 level
- **]** : Move up 1 level
- **#** : Move down 10 levels
- **$** : Move up 10 levels
- **(** : Move down 100 levels
- **)** : Move up 100 levels
- **.** : Move down 1000 levels
- **,** : Move up 1000 levels

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Three.js**: 3D rendering and graphics
- **Cannon-ES**: Physics simulation
- **GSAP**: Smooth animations
- **Vite**: Build tool and dev server

## Project Structure

```
src/
├── managers/
│   ├── SceneManager.js      # Three.js scene setup
│   ├── PhysicsManager.js    # Cannon-ES physics world
│   ├── RingGenerator.js     # Procedural ring generation
│   └── LevelManager.js      # 20k level management
├── controllers/
│   ├── InputController.js   # Keyboard input handling
│   └── CameraController.js  # Camera following and zoom
├── systems/
│   ├── ColorThemeSystem.js  # Color theme management
│   └── Constants.js         # Game constants
├── entities/
│   └── Ball.js              # Player ball entity
├── Game.js                  # Main game coordinator
└── main.js                  # Entry point
```

## Color Themes

The game randomly selects one of these themes at the start:

1. **Ocean**: Dark blue & Light blue
2. **Forest**: Dark green & Light green
3. **Purple**: Dark purple & Light purple
4. **Sunset**: Dark orange & Light orange
5. **Pink**: Dark pink & Light pink
6. **Teal**: Dark teal & Light teal
7. **Yellow**: Dark yellow & Light yellow
8. **Cyan**: Dark cyan & Light cyan

Traps are always **red** for easy identification.

## Performance

The game uses lazy generation and ring cleanup to maintain performance:

- Only 11 rings are active at once (current level ± 5 buffer)
- Rings outside the buffer are destroyed
- Total possible depth: 20,000 levels
- Y position: `-levelIndex * 4`

## Development

The game instance is accessible via `window.game` in the console for debugging:

```javascript
// Jump to level 10000
window.game.levelManager.moveToLevel(10000);

// Get current level
window.game.levelManager.getCurrentLevel();

// Get active ring count
window.game.levelManager.getActiveRingCount();
```

## License

MIT
