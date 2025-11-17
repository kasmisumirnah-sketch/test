/**
 * LevelManager
 * Manages 20,000 levels with lazy ring generation/destruction
 */

import { CONSTANTS } from '../systems/Constants.js';

export class LevelManager {
  constructor(ringGenerator, sceneManager) {
    this.ringGenerator = ringGenerator;
    this.sceneManager = sceneManager;

    this.currentLevel = 0;
    this.rings = new Map(); // Map of levelIndex -> ring object

    // Keep a buffer of rings around current level for smooth gameplay
    this.ringBuffer = 5; // How many rings to keep above and below current level
  }

  /**
   * Initialize the level manager
   */
  init() {
    // Generate initial rings
    this.generateInitialRings();
  }

  /**
   * Generate initial rings around starting position
   */
  generateInitialRings() {
    // Generate rings for levels 0 to ringBuffer
    for (let i = 0; i <= this.ringBuffer; i++) {
      this.createRingAtLevel(i);
    }
  }

  /**
   * Create a ring at specific level
   * @param {number} levelIndex - Level index (0-19999)
   */
  createRingAtLevel(levelIndex) {
    // Validate level
    if (levelIndex < 0 || levelIndex >= CONSTANTS.MAX_LEVELS) {
      return null;
    }

    // Don't create if already exists
    if (this.rings.has(levelIndex)) {
      return this.rings.get(levelIndex);
    }

    // Generate pattern
    const pattern = this.ringGenerator.generateRingPattern(levelIndex);

    // Create ring
    const ring = this.ringGenerator.createRing(pattern);

    // Add to scene
    this.sceneManager.add(ring.group);

    // Store ring
    this.rings.set(levelIndex, ring);

    return ring;
  }

  /**
   * Destroy ring at specific level
   * @param {number} levelIndex - Level index
   */
  destroyRingAtLevel(levelIndex) {
    const ring = this.rings.get(levelIndex);
    if (ring) {
      this.ringGenerator.destroyRing(ring);
      this.rings.delete(levelIndex);
    }
  }

  /**
   * Move to a new level (called by player movement or keyboard)
   * @param {number} newLevel - New level index
   */
  moveToLevel(newLevel) {
    // Clamp to valid range
    newLevel = Math.max(0, Math.min(newLevel, CONSTANTS.MAX_LEVELS - 1));

    const oldLevel = this.currentLevel;
    this.currentLevel = newLevel;

    // Generate rings for new level range
    this.updateRingsForLevel(newLevel);

    // Clean up old rings outside buffer
    this.cleanupOldRings(newLevel);

    return {
      oldLevel,
      newLevel,
      yPosition: this.getLevelYPosition(newLevel)
    };
  }

  /**
   * Update rings for current level (lazy generation)
   * @param {number} levelIndex - Current level
   */
  updateRingsForLevel(levelIndex) {
    // Generate rings in buffer range
    const minLevel = Math.max(0, levelIndex - this.ringBuffer);
    const maxLevel = Math.min(CONSTANTS.MAX_LEVELS - 1, levelIndex + this.ringBuffer);

    for (let i = minLevel; i <= maxLevel; i++) {
      this.createRingAtLevel(i);
    }
  }

  /**
   * Clean up rings outside buffer range
   * @param {number} levelIndex - Current level
   */
  cleanupOldRings(levelIndex) {
    const minLevel = Math.max(0, levelIndex - this.ringBuffer);
    const maxLevel = Math.min(CONSTANTS.MAX_LEVELS - 1, levelIndex + this.ringBuffer);

    // Remove rings outside buffer
    const levelsToRemove = [];
    for (const [level, ring] of this.rings.entries()) {
      if (level < minLevel || level > maxLevel) {
        levelsToRemove.push(level);
      }
    }

    levelsToRemove.forEach(level => {
      this.destroyRingAtLevel(level);
    });
  }

  /**
   * Get Y position for a level
   * @param {number} levelIndex - Level index
   */
  getLevelYPosition(levelIndex) {
    return -levelIndex * CONSTANTS.LEVEL_HEIGHT;
  }

  /**
   * Get current level
   */
  getCurrentLevel() {
    return this.currentLevel;
  }

  /**
   * Get ring at level
   * @param {number} levelIndex - Level index
   */
  getRingAtLevel(levelIndex) {
    return this.rings.get(levelIndex);
  }

  /**
   * Navigate down levels (for keyboard controls)
   * @param {number} count - Number of levels to go down
   */
  goDown(count) {
    const newLevel = Math.min(this.currentLevel + count, CONSTANTS.MAX_LEVELS - 1);
    return this.moveToLevel(newLevel);
  }

  /**
   * Navigate up levels (for keyboard controls)
   * @param {number} count - Number of levels to go up
   */
  goUp(count) {
    const newLevel = Math.max(this.currentLevel - count, 0);
    return this.moveToLevel(newLevel);
  }

  /**
   * Handle trap collision (player goes down 1 level)
   * @returns {Object} - New level info
   */
  handleTrapHit() {
    console.log(`Trap hit at level ${this.currentLevel}! Moving down 1 level.`);
    return this.goDown(1);
  }

  /**
   * Get all active rings
   */
  getActiveRings() {
    return Array.from(this.rings.values());
  }

  /**
   * Get number of active rings
   */
  getActiveRingCount() {
    return this.rings.size;
  }

  /**
   * Cleanup all rings
   */
  dispose() {
    for (const level of this.rings.keys()) {
      this.destroyRingAtLevel(level);
    }
    this.rings.clear();
  }
}
