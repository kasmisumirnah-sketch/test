/**
 * CameraController
 * Handles smooth camera following and zoom
 */

import * as THREE from 'three';
import { CONSTANTS } from '../systems/Constants.js';

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.targetPosition = new THREE.Vector3();
    this.currentZoomOffset = CONSTANTS.CAMERA_OFFSET_Z;
    this.minZoom = 8;
    this.maxZoom = 25;
    this.zoomSpeed = 0.5;
  }

  /**
   * Update camera position to follow target (ball)
   * @param {THREE.Vector3} targetPos - Position to follow
   * @param {number} deltaTime - Time since last update
   */
  update(targetPos, deltaTime) {
    // Calculate target camera position
    this.targetPosition.set(
      0, // Keep camera centered on X
      targetPos.y + CONSTANTS.CAMERA_OFFSET_Y,
      this.currentZoomOffset
    );

    // Smoothly interpolate camera position (lerp)
    this.camera.position.lerp(this.targetPosition, CONSTANTS.CAMERA_LERP_SPEED);

    // Always look at a point below the ball to see the rings
    const lookAtPoint = new THREE.Vector3(0, targetPos.y - 3, 0);
    this.camera.lookAt(lookAtPoint);
  }

  /**
   * Zoom in
   */
  zoomIn() {
    this.currentZoomOffset = Math.max(
      this.minZoom,
      this.currentZoomOffset - this.zoomSpeed
    );
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.currentZoomOffset = Math.min(
      this.maxZoom,
      this.currentZoomOffset + this.zoomSpeed
    );
  }

  /**
   * Set camera position immediately (no lerp)
   * @param {THREE.Vector3} position - Target position
   */
  setPositionImmediate(position) {
    this.camera.position.set(
      0,
      position.y + CONSTANTS.CAMERA_OFFSET_Y,
      this.currentZoomOffset
    );
    this.camera.lookAt(0, position.y - 3, 0);
  }

  /**
   * Reset camera zoom to default
   */
  resetZoom() {
    this.currentZoomOffset = CONSTANTS.CAMERA_OFFSET_Z;
  }

  /**
   * Get current camera position
   */
  getPosition() {
    return this.camera.position;
  }
}
