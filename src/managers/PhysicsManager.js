/**
 * PhysicsManager
 * Manages Cannon-ES physics world
 */

import * as CANNON from 'cannon-es';
import { CONSTANTS } from '../systems/Constants.js';

export class PhysicsManager {
  constructor() {
    this.world = null;
    this.bodies = new Map(); // Track physics bodies
    this.init();
  }

  init() {
    // Create physics world
    this.world = new CANNON.World();
    this.world.gravity.set(0, CONSTANTS.GRAVITY, 0);

    // Configure solver for better performance
    this.world.solver.iterations = 10;
    this.world.allowSleep = true;

    // Default contact material
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: CONSTANTS.BALL_FRICTION,
        restitution: CONSTANTS.BALL_RESTITUTION
      }
    );
    this.world.addContactMaterial(defaultContactMaterial);
    this.world.defaultContactMaterial = defaultContactMaterial;
  }

  /**
   * Step the physics simulation
   * @param {number} deltaTime - Time since last update
   */
  step(deltaTime) {
    // Fixed timestep for stable physics
    const fixedTimeStep = 1 / 60;
    this.world.step(fixedTimeStep, deltaTime, 3);
  }

  /**
   * Add a body to the physics world
   * @param {CANNON.Body} body - Physics body
   * @param {string} id - Unique identifier
   */
  addBody(body, id) {
    this.world.addBody(body);
    if (id) {
      this.bodies.set(id, body);
    }
  }

  /**
   * Remove a body from the physics world
   * @param {CANNON.Body|string} bodyOrId - Physics body or its ID
   */
  removeBody(bodyOrId) {
    let body = bodyOrId;

    if (typeof bodyOrId === 'string') {
      body = this.bodies.get(bodyOrId);
      this.bodies.delete(bodyOrId);
    } else {
      // Find and remove from map
      for (const [id, b] of this.bodies.entries()) {
        if (b === bodyOrId) {
          this.bodies.delete(id);
          break;
        }
      }
    }

    if (body) {
      this.world.removeBody(body);
    }
  }

  /**
   * Get a body by ID
   * @param {string} id - Body identifier
   */
  getBody(id) {
    return this.bodies.get(id);
  }

  /**
   * Get the physics world
   */
  getWorld() {
    return this.world;
  }

  /**
   * Create a sphere body
   * @param {number} radius - Sphere radius
   * @param {number} mass - Body mass
   * @param {CANNON.Vec3} position - Initial position
   */
  createSphereBody(radius, mass, position) {
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass: mass,
      shape: shape,
      position: position
    });
    return body;
  }

  /**
   * Create a box body (for platform segments)
   * @param {CANNON.Vec3} halfExtents - Box half extents
   * @param {number} mass - Body mass (0 for static)
   * @param {CANNON.Vec3} position - Initial position
   * @param {CANNON.Quaternion} quaternion - Initial rotation
   */
  createBoxBody(halfExtents, mass, position, quaternion) {
    const shape = new CANNON.Box(halfExtents);
    const body = new CANNON.Body({
      mass: mass,
      shape: shape,
      position: position,
      quaternion: quaternion
    });
    return body;
  }

  /**
   * Clear all bodies (useful for reset)
   */
  clearBodies() {
    for (const body of this.bodies.values()) {
      this.world.removeBody(body);
    }
    this.bodies.clear();
  }

  /**
   * Cleanup
   */
  dispose() {
    this.clearBodies();
  }
}
