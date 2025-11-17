/**
 * RingGenerator
 * Generates ring patterns with holes, safe platforms, and traps
 * Difficulty scales with level depth
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CONSTANTS } from '../systems/Constants.js';

export class RingGenerator {
  constructor(colorThemeSystem, sceneManager, physicsManager) {
    this.colorTheme = colorThemeSystem;
    this.sceneManager = sceneManager;
    this.physicsManager = physicsManager;
  }

  /**
   * Generate a ring pattern for a specific level
   * @param {number} levelIndex - Level index (0-19999)
   * @returns {Object} - Ring pattern data
   */
  generateRingPattern(levelIndex) {
    const segments = [];
    const numSegments = CONSTANTS.RING_SEGMENTS;

    // Calculate difficulty based on level
    const difficulty = this.calculateDifficulty(levelIndex);

    // Determine number of traps (0-3 based on difficulty)
    const numTraps = this.calculateNumTraps(difficulty);

    // Determine number of holes (ensure playability)
    const numHoles = this.calculateNumHoles(difficulty);

    // Create segment type array
    const segmentTypes = new Array(numSegments).fill(CONSTANTS.SEGMENT_TYPES.SAFE);

    // Place holes (ensure at least one consecutive hole for ball to pass)
    const holePositions = this.placeHoles(numHoles, numSegments);
    holePositions.forEach(pos => {
      segmentTypes[pos] = CONSTANTS.SEGMENT_TYPES.HOLE;
    });

    // Place traps (not in holes, and distributed)
    const trapPositions = this.placeTraps(numTraps, numSegments, holePositions);
    trapPositions.forEach(pos => {
      segmentTypes[pos] = CONSTANTS.SEGMENT_TYPES.TRAP;
    });

    // Create segment data
    for (let i = 0; i < numSegments; i++) {
      segments.push({
        index: i,
        type: segmentTypes[i],
        angle: (i / numSegments) * Math.PI * 2
      });
    }

    return {
      levelIndex,
      segments,
      difficulty
    };
  }

  /**
   * Calculate difficulty (0-1) based on level depth
   * @param {number} levelIndex - Level index
   */
  calculateDifficulty(levelIndex) {
    // Linear progression from 0 to 1 over 20k levels
    return Math.min(levelIndex / CONSTANTS.MAX_LEVELS, 1);
  }

  /**
   * Calculate number of traps based on difficulty
   * @param {number} difficulty - Difficulty (0-1)
   */
  calculateNumTraps(difficulty) {
    if (difficulty < 0.2) return Math.random() < 0.5 ? 0 : 1; // Shallow: 0-1 trap
    if (difficulty < 0.5) return Math.floor(Math.random() * 2) + 1; // Medium: 1-2 traps
    return Math.floor(Math.random() * 2) + 2; // Deep: 2-3 traps
  }

  /**
   * Calculate number of holes based on difficulty
   * @param {number} difficulty - Difficulty (0-1)
   */
  calculateNumHoles(difficulty) {
    // More holes at easier levels, fewer at harder levels
    if (difficulty < 0.3) return Math.floor(Math.random() * 2) + 3; // 3-4 holes
    if (difficulty < 0.6) return Math.floor(Math.random() * 2) + 2; // 2-3 holes
    return Math.floor(Math.random() * 2) + 1; // 1-2 holes
  }

  /**
   * Place holes ensuring at least one gap is big enough
   * @param {number} numHoles - Number of holes
   * @param {number} numSegments - Total segments
   */
  placeHoles(numHoles, numSegments) {
    const holes = [];

    // Ensure at least 2 consecutive holes for playability
    const startHole = Math.floor(Math.random() * numSegments);
    holes.push(startHole);
    if (numHoles > 1) {
      holes.push((startHole + 1) % numSegments);
    }

    // Place remaining holes randomly
    while (holes.length < numHoles) {
      const pos = Math.floor(Math.random() * numSegments);
      if (!holes.includes(pos)) {
        holes.push(pos);
      }
    }

    return holes;
  }

  /**
   * Place traps avoiding holes and ensuring distribution
   * @param {number} numTraps - Number of traps
   * @param {number} numSegments - Total segments
   * @param {Array} holePositions - Positions of holes
   */
  placeTraps(numTraps, numSegments, holePositions) {
    const traps = [];
    const availablePositions = [];

    // Get available positions (not holes)
    for (let i = 0; i < numSegments; i++) {
      if (!holePositions.includes(i)) {
        availablePositions.push(i);
      }
    }

    // Randomly select trap positions
    while (traps.length < numTraps && availablePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const pos = availablePositions[randomIndex];
      traps.push(pos);
      availablePositions.splice(randomIndex, 1);

      // Remove adjacent positions to spread traps out
      const adjIndex = availablePositions.indexOf((pos + 1) % numSegments);
      if (adjIndex !== -1) {
        availablePositions.splice(adjIndex, 1);
      }
    }

    return traps;
  }

  /**
   * Create a physical ring from pattern data
   * @param {Object} pattern - Ring pattern data
   * @returns {Object} - Ring object with meshes and bodies
   */
  createRing(pattern) {
    const ring = {
      levelIndex: pattern.levelIndex,
      segments: [],
      group: new THREE.Group(),
      bodies: []
    };

    const yPosition = -pattern.levelIndex * CONSTANTS.LEVEL_HEIGHT;

    pattern.segments.forEach(segmentData => {
      if (segmentData.type === CONSTANTS.SEGMENT_TYPES.HOLE) {
        // No geometry for holes
        return;
      }

      const segment = this.createSegment(
        segmentData,
        yPosition,
        pattern.levelIndex
      );

      if (segment) {
        ring.segments.push(segment);
        ring.group.add(segment.mesh);
        ring.bodies.push(segment.body);
      }
    });

    ring.group.position.y = yPosition;

    return ring;
  }

  /**
   * Create a single segment (safe or trap)
   * @param {Object} segmentData - Segment data
   * @param {number} yPosition - Y position
   * @param {number} levelIndex - Level index
   */
  createSegment(segmentData, yPosition, levelIndex) {
    const angle = segmentData.angle;
    const angleSpan = (Math.PI * 2) / CONSTANTS.RING_SEGMENTS;

    // Calculate segment dimensions
    const innerRadius = CONSTANTS.RING_RADIUS - CONSTANTS.SEGMENT_THICKNESS;
    const outerRadius = CONSTANTS.RING_RADIUS;
    const segmentWidth = (outerRadius * angleSpan);

    // Determine color
    let color;
    if (segmentData.type === CONSTANTS.SEGMENT_TYPES.TRAP) {
      color = this.colorTheme.getTrapColor();
    } else {
      color = this.colorTheme.getSafeColor(segmentData.index);
    }

    // Create mesh
    const geometry = new THREE.BoxGeometry(
      segmentWidth,
      CONSTANTS.SEGMENT_HEIGHT,
      CONSTANTS.SEGMENT_THICKNESS
    );
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Position segment
    const radius = (innerRadius + outerRadius) / 2;
    const x = Math.cos(angle + angleSpan / 2) * radius;
    const z = Math.sin(angle + angleSpan / 2) * radius;

    mesh.position.set(x, 0, z);
    mesh.rotation.y = angle + angleSpan / 2 + Math.PI / 2;

    // Create physics body
    const halfExtents = new CANNON.Vec3(
      segmentWidth / 2,
      CONSTANTS.SEGMENT_HEIGHT / 2,
      CONSTANTS.SEGMENT_THICKNESS / 2
    );

    const position = new CANNON.Vec3(x, yPosition, z);
    const quaternion = new CANNON.Quaternion();
    quaternion.setFromEuler(0, angle + angleSpan / 2 + Math.PI / 2, 0);

    const body = this.physicsManager.createBoxBody(
      halfExtents,
      0, // Static body
      position,
      quaternion
    );

    // Store segment metadata for collision detection
    body.segmentData = {
      type: segmentData.type,
      levelIndex: levelIndex,
      segmentIndex: segmentData.index
    };

    this.physicsManager.addBody(body, `segment_${levelIndex}_${segmentData.index}`);

    return {
      mesh,
      body,
      type: segmentData.type,
      index: segmentData.index
    };
  }

  /**
   * Destroy a ring and remove from scene/physics
   * @param {Object} ring - Ring object
   */
  destroyRing(ring) {
    // Remove meshes
    this.sceneManager.remove(ring.group);

    // Dispose geometries and materials
    ring.segments.forEach(segment => {
      segment.mesh.geometry.dispose();
      segment.mesh.material.dispose();
    });

    // Remove physics bodies
    ring.bodies.forEach(body => {
      this.physicsManager.removeBody(body);
    });

    // Clear references
    ring.segments = [];
    ring.bodies = [];
  }
}
