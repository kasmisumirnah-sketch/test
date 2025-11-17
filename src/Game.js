/**
 * Game
 * Main game class that coordinates all systems
 */

import * as THREE from 'three';
import { SceneManager } from './managers/SceneManager.js';
import { PhysicsManager } from './managers/PhysicsManager.js';
import { RingGenerator } from './managers/RingGenerator.js';
import { LevelManager } from './managers/LevelManager.js';
import { InputController } from './controllers/InputController.js';
import { CameraController } from './controllers/CameraController.js';
import { ColorThemeSystem } from './systems/ColorThemeSystem.js';
import { Ball } from './entities/Ball.js';
import { CONSTANTS } from './systems/Constants.js';

export class Game {
  constructor() {
    // Systems
    this.colorTheme = null;
    this.sceneManager = null;
    this.physicsManager = null;
    this.ringGenerator = null;
    this.levelManager = null;
    this.inputController = null;
    this.cameraController = null;

    // Entities
    this.ball = null;

    // Game state
    this.towerGroup = null;
    this.isRunning = false;
    this.lastTime = 0;

    // UI
    this.uiElements = {};

    this.init();
  }

  /**
   * Initialize game
   */
  init() {
    console.log('Initializing Helix Jump 20k...');

    // Initialize systems in correct order
    this.colorTheme = new ColorThemeSystem();
    this.sceneManager = new SceneManager();
    this.physicsManager = new PhysicsManager();
    this.ringGenerator = new RingGenerator(
      this.colorTheme,
      this.sceneManager,
      this.physicsManager
    );
    this.levelManager = new LevelManager(
      this.ringGenerator,
      this.sceneManager
    );
    this.inputController = new InputController();
    this.cameraController = new CameraController(this.sceneManager.getCamera());

    // Create tower group (all rings will be children of this)
    this.towerGroup = new THREE.Group();
    this.sceneManager.add(this.towerGroup);

    // Initialize level manager (generate initial rings)
    this.levelManager.init();

    // Move all rings to tower group
    this.updateRingParents();

    // Create ball
    this.ball = new Ball(this.sceneManager, this.physicsManager);

    // Setup input callbacks
    this.setupInputCallbacks();

    // Setup trap collision handling
    this.setupTrapHandling();

    // Create UI
    this.createUI();

    // Set initial camera position
    this.cameraController.setPositionImmediate(this.ball.getPosition());

    // Start game loop
    this.start();

    console.log('Game initialized!');
    console.log(`Theme: ${this.colorTheme.getCurrentTheme().name}`);
    console.log('Controls:');
    console.log('  A/D or Arrow Left/Right: Rotate tower');
    console.log('  W/S or Arrow Up/Down: Zoom camera');
    console.log('  [ / ]: Navigate 1 level down/up');
    console.log('  # / $: Navigate 10 levels down/up');
    console.log('  ( / ): Navigate 100 levels down/up');
    console.log('  . / ,: Navigate 1000 levels down/up');
  }

  /**
   * Move all rings to tower group for rotation
   */
  updateRingParents() {
    const rings = this.levelManager.getActiveRings();
    rings.forEach(ring => {
      this.sceneManager.remove(ring.group);
      this.towerGroup.add(ring.group);
    });
  }

  /**
   * Setup input callbacks
   */
  setupInputCallbacks() {
    // Level change callback
    this.inputController.onLevelChange((delta) => {
      this.handleLevelNavigation(delta);
    });

    // Zoom callbacks
    this.inputController.onZoomIn(() => {
      this.cameraController.zoomIn();
    });

    this.inputController.onZoomOut(() => {
      this.cameraController.zoomOut();
    });
  }

  /**
   * Setup trap collision handling
   */
  setupTrapHandling() {
    window.addEventListener('trapHit', (event) => {
      console.log('TRAP HIT!', event.detail);

      // Move player down 1 level
      const levelInfo = this.levelManager.handleTrapHit();

      // Reset ball to new level
      this.ball.resetToLevel(levelInfo.newLevel);

      // Update UI
      this.updateUI();

      // Update ring parents
      setTimeout(() => {
        this.updateRingParents();
      }, 100);
    });
  }

  /**
   * Handle level navigation from keyboard
   * @param {number} delta - Level change (negative = up, positive = down)
   */
  handleLevelNavigation(delta) {
    let levelInfo;

    if (delta > 0) {
      // Going down
      levelInfo = this.levelManager.goDown(delta);
    } else {
      // Going up
      levelInfo = this.levelManager.goUp(-delta);
    }

    // Move ball to new level
    this.ball.resetToLevel(levelInfo.newLevel);

    // Update camera immediately
    this.cameraController.setPositionImmediate(this.ball.getPosition());

    // Update ring parents
    this.updateRingParents();

    // Update UI
    this.updateUI();

    console.log(`Navigated to level ${levelInfo.newLevel}`);
  }

  /**
   * Create UI elements
   */
  createUI() {
    // Create UI container
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'fixed';
    uiContainer.style.top = '10px';
    uiContainer.style.left = '10px';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'monospace';
    uiContainer.style.fontSize = '16px';
    uiContainer.style.background = 'rgba(0, 0, 0, 0.7)';
    uiContainer.style.padding = '15px';
    uiContainer.style.borderRadius = '5px';
    uiContainer.style.zIndex = '1000';
    uiContainer.style.minWidth = '250px';
    document.body.appendChild(uiContainer);

    // Level display
    const levelDisplay = document.createElement('div');
    levelDisplay.style.marginBottom = '10px';
    levelDisplay.style.fontSize = '20px';
    levelDisplay.style.fontWeight = 'bold';
    uiContainer.appendChild(levelDisplay);

    // Theme display
    const themeDisplay = document.createElement('div');
    themeDisplay.style.marginBottom = '10px';
    themeDisplay.textContent = `Theme: ${this.colorTheme.getCurrentTheme().name}`;
    uiContainer.appendChild(themeDisplay);

    // Ring count display
    const ringCountDisplay = document.createElement('div');
    ringCountDisplay.style.marginBottom = '10px';
    uiContainer.appendChild(ringCountDisplay);

    // Depth progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.marginTop = '10px';
    progressContainer.style.width = '100%';
    progressContainer.style.height = '20px';
    progressContainer.style.background = 'rgba(255, 255, 255, 0.2)';
    progressContainer.style.borderRadius = '10px';
    progressContainer.style.overflow = 'hidden';
    uiContainer.appendChild(progressContainer);

    const progressBar = document.createElement('div');
    progressBar.style.height = '100%';
    progressBar.style.background = 'linear-gradient(90deg, #00ff00, #ffff00, #ff0000)';
    progressBar.style.transition = 'width 0.3s';
    progressContainer.appendChild(progressBar);

    const progressText = document.createElement('div');
    progressText.style.marginTop = '5px';
    progressText.style.fontSize = '12px';
    uiContainer.appendChild(progressText);

    this.uiElements = {
      container: uiContainer,
      levelDisplay,
      themeDisplay,
      ringCountDisplay,
      progressBar,
      progressText
    };

    this.updateUI();
  }

  /**
   * Update UI displays
   */
  updateUI() {
    const currentLevel = this.levelManager.getCurrentLevel();
    const progress = (currentLevel / CONSTANTS.MAX_LEVELS) * 100;

    this.uiElements.levelDisplay.textContent = `Level: ${currentLevel} / ${CONSTANTS.MAX_LEVELS - 1}`;
    this.uiElements.ringCountDisplay.textContent = `Active Rings: ${this.levelManager.getActiveRingCount()}`;
    this.uiElements.progressBar.style.width = `${progress}%`;
    this.uiElements.progressText.textContent = `Depth: ${progress.toFixed(2)}%`;
  }

  /**
   * Start game loop
   */
  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  /**
   * Stop game loop
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Main game loop
   */
  gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update physics
    this.physicsManager.step(deltaTime);

    // Update ball
    this.ball.update();

    // Update input (tower rotation)
    this.inputController.update(this.towerGroup);

    // Update camera
    this.cameraController.update(this.ball.getPosition(), deltaTime);

    // Render scene
    this.sceneManager.render();

    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Cleanup
   */
  dispose() {
    this.stop();
    this.ball.dispose();
    this.levelManager.dispose();
    this.physicsManager.dispose();
    this.sceneManager.dispose();
    this.inputController.dispose();

    if (this.uiElements.container) {
      document.body.removeChild(this.uiElements.container);
    }
  }
}
