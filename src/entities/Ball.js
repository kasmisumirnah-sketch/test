/**
 * Ball
 * Player-controlled ball with physics
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CONSTANTS } from '../systems/Constants.js';

export class Ball {
  constructor(sceneManager, physicsManager) {
    this.sceneManager = sceneManager;
    this.physicsManager = physicsManager;

    this.mesh = null;
    this.body = null;
    this.currentLevel = 0;

    this.init();
  }

  init() {
    // Create visual mesh
    const geometry = new THREE.SphereGeometry(CONSTANTS.BALL_RADIUS, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00, // Yellow ball
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0xffff00,
      emissiveIntensity: 0.2
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add to scene
    this.sceneManager.add(this.mesh);

    // Create physics body
    const position = new CANNON.Vec3(0, CONSTANTS.BALL_START_Y, 0);
    this.body = this.physicsManager.createSphereBody(
      CONSTANTS.BALL_RADIUS,
      CONSTANTS.BALL_MASS,
      position
    );

    this.body.linearDamping = 0.1;
    this.body.angularDamping = 0.5;

    // Add to physics world
    this.physicsManager.addBody(this.body, 'ball');

    // Setup collision detection
    this.setupCollisionDetection();
  }

  /**
   * Setup collision detection for trap handling
   */
  setupCollisionDetection() {
    this.body.addEventListener('collide', (event) => {
      const contactBody = event.body;

      // Check if collision is with a segment
      if (contactBody.segmentData) {
        this.handleSegmentCollision(contactBody.segmentData);
      }
    });
  }

  /**
   * Handle collision with a segment
   * @param {Object} segmentData - Segment data from physics body
   */
  handleSegmentCollision(segmentData) {
    // This will be called from the Game class
    // We'll trigger a custom event
    if (segmentData.type === CONSTANTS.SEGMENT_TYPES.TRAP) {
      // Dispatch trap hit event
      window.dispatchEvent(new CustomEvent('trapHit', {
        detail: {
          levelIndex: segmentData.levelIndex,
          segmentIndex: segmentData.segmentIndex
        }
      }));
    }

    // Update current level based on collision
    this.currentLevel = segmentData.levelIndex;
  }

  /**
   * Update ball position from physics
   */
  update() {
    // Sync mesh position with physics body
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  /**
   * Get ball position
   */
  getPosition() {
    return this.body.position;
  }

  /**
   * Set ball position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} z - Z position
   */
  setPosition(x, y, z) {
    this.body.position.set(x, y, z);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.mesh.position.set(x, y, z);
  }

  /**
   * Reset ball to specific level
   * @param {number} levelIndex - Target level
   */
  resetToLevel(levelIndex) {
    const yPos = -levelIndex * CONSTANTS.LEVEL_HEIGHT + CONSTANTS.BALL_START_Y;
    this.setPosition(0, yPos, 0);
    this.currentLevel = levelIndex;
  }

  /**
   * Get current level
   */
  getCurrentLevel() {
    return this.currentLevel;
  }

  /**
   * Add velocity to ball (for testing/effects)
   * @param {CANNON.Vec3} velocity - Velocity to add
   */
  addVelocity(velocity) {
    this.body.velocity.vadd(velocity, this.body.velocity);
  }

  /**
   * Get velocity
   */
  getVelocity() {
    return this.body.velocity;
  }

  /**
   * Cleanup
   */
  dispose() {
    this.sceneManager.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.physicsManager.removeBody(this.body);
  }
}
