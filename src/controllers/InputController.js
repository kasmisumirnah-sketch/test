/**
 * InputController
 * Handles all keyboard input for gameplay and level navigation
 */

import { CONSTANTS } from '../systems/Constants.js';

export class InputController {
  constructor() {
    this.keys = new Map();
    this.callbacks = {
      onRotateLeft: null,
      onRotateRight: null,
      onZoomIn: null,
      onZoomOut: null,
      onLevelChange: null
    };

    this.init();
  }

  init() {
    // Listen for keyboard events
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  /**
   * Handle key down events
   */
  onKeyDown(event) {
    const key = event.key.toLowerCase();
    this.keys.set(key, true);

    // Level navigation controls (immediate actions)
    switch (key) {
      case '[':
        this.triggerLevelChange(1); // Down 1 level
        break;
      case ']':
        this.triggerLevelChange(-1); // Up 1 level
        break;
      case '#':
        this.triggerLevelChange(10); // Down 10 levels
        break;
      case '$':
        this.triggerLevelChange(-10); // Up 10 levels
        break;
      case '(':
        this.triggerLevelChange(100); // Down 100 levels
        break;
      case ')':
        this.triggerLevelChange(-100); // Up 100 levels
        break;
      case '.':
        this.triggerLevelChange(1000); // Down 1000 levels
        break;
      case ',':
        this.triggerLevelChange(-1000); // Up 1000 levels
        break;
    }
  }

  /**
   * Handle key up events
   */
  onKeyUp(event) {
    const key = event.key.toLowerCase();
    this.keys.set(key, false);
  }

  /**
   * Trigger level change callback
   * @param {number} delta - Level change (negative = up, positive = down)
   */
  triggerLevelChange(delta) {
    if (this.callbacks.onLevelChange) {
      this.callbacks.onLevelChange(delta);
    }
  }

  /**
   * Update method called each frame
   * Handles continuous input like rotation
   */
  update(towerGroup) {
    // Tower rotation controls
    if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) {
      if (towerGroup) {
        towerGroup.rotation.y += CONSTANTS.TOWER_ROTATION_SPEED;
      }
      if (this.callbacks.onRotateLeft) {
        this.callbacks.onRotateLeft();
      }
    }

    if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) {
      if (towerGroup) {
        towerGroup.rotation.y -= CONSTANTS.TOWER_ROTATION_SPEED;
      }
      if (this.callbacks.onRotateRight) {
        this.callbacks.onRotateRight();
      }
    }

    // Camera zoom controls (optional)
    if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) {
      if (this.callbacks.onZoomIn) {
        this.callbacks.onZoomIn();
      }
    }

    if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) {
      if (this.callbacks.onZoomOut) {
        this.callbacks.onZoomOut();
      }
    }
  }

  /**
   * Check if a key is currently pressed
   * @param {string} key - Key name
   */
  isKeyPressed(key) {
    return this.keys.get(key) === true;
  }

  /**
   * Set callback for rotate left
   */
  onRotateLeft(callback) {
    this.callbacks.onRotateLeft = callback;
  }

  /**
   * Set callback for rotate right
   */
  onRotateRight(callback) {
    this.callbacks.onRotateRight = callback;
  }

  /**
   * Set callback for zoom in
   */
  onZoomIn(callback) {
    this.callbacks.onZoomIn = callback;
  }

  /**
   * Set callback for zoom out
   */
  onZoomOut(callback) {
    this.callbacks.onZoomOut = callback;
  }

  /**
   * Set callback for level changes
   */
  onLevelChange(callback) {
    this.callbacks.onLevelChange = callback;
  }

  /**
   * Get current rotation input (-1, 0, 1)
   */
  getRotationInput() {
    let rotation = 0;

    if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) {
      rotation += 1;
    }

    if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) {
      rotation -= 1;
    }

    return rotation;
  }

  /**
   * Get current zoom input (-1, 0, 1)
   */
  getZoomInput() {
    let zoom = 0;

    if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) {
      zoom += 1;
    }

    if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) {
      zoom -= 1;
    }

    return zoom;
  }

  /**
   * Cleanup
   */
  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.keys.clear();
  }
}
