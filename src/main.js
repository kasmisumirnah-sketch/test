/**
 * Main entry point for Helix Jump 20k
 */

import { Game } from './Game.js';

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('Starting Helix Jump 20k Levels...');

  // Create and start game
  const game = new Game();

  // Make game accessible from console for debugging
  window.game = game;

  console.log('Game started! Use window.game to access game instance.');
});
