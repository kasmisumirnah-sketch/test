/**
 * Game Constants
 * All constant values used throughout the game
 */

export const CONSTANTS = {
  // Level constants
  MAX_LEVELS: 20000,
  LEVEL_HEIGHT: 4, // Vertical spacing between rings

  // Ring constants
  RING_RADIUS: 5,
  RING_SEGMENTS: 12, // Number of segments per ring
  SEGMENT_THICKNESS: 0.3,
  SEGMENT_HEIGHT: 0.2,

  // Trap constants
  MAX_TRAPS_PER_RING: 3,

  // Ball constants
  BALL_RADIUS: 0.25,
  BALL_MASS: 1,
  BALL_START_Y: 2,

  // Physics constants
  GRAVITY: -20,
  BALL_RESTITUTION: 0.3, // Bounce factor
  BALL_FRICTION: 0.1,

  // Camera constants
  CAMERA_OFFSET_Y: 3,
  CAMERA_OFFSET_Z: 8,
  CAMERA_LERP_SPEED: 0.1,

  // Control constants
  TOWER_ROTATION_SPEED: 0.05,

  // Segment types
  SEGMENT_TYPES: {
    HOLE: 'hole',
    SAFE: 'safe',
    TRAP: 'trap'
  }
};
