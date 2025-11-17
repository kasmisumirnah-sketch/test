/**
 * ColorThemeSystem
 * Manages color themes for the game
 * Each game randomly selects one theme with two colors for safe platforms
 * Traps are always red
 */

export class ColorThemeSystem {
  constructor() {
    this.themes = [
      {
        name: 'Ocean',
        colors: [0x1e3a8a, 0x3b82f6] // Dark blue & Light blue
      },
      {
        name: 'Forest',
        colors: [0x166534, 0x22c55e] // Dark green & Light green
      },
      {
        name: 'Purple',
        colors: [0x581c87, 0xa855f7] // Dark purple & Light purple
      },
      {
        name: 'Sunset',
        colors: [0x9a3412, 0xf97316] // Dark orange & Light orange
      },
      {
        name: 'Pink',
        colors: [0x9f1239, 0xf472b6] // Dark pink & Light pink
      },
      {
        name: 'Teal',
        colors: [0x115e59, 0x2dd4bf] // Dark teal & Light teal
      },
      {
        name: 'Yellow',
        colors: [0x854d0e, 0xfacc15] // Dark yellow & Light yellow
      },
      {
        name: 'Cyan',
        colors: [0x0e7490, 0x22d3ee] // Dark cyan & Light cyan
      }
    ];

    this.trapColor = 0xff0000; // Always red
    this.currentTheme = null;
    this.selectRandomTheme();
  }

  /**
   * Select a random theme from available themes
   */
  selectRandomTheme() {
    const randomIndex = Math.floor(Math.random() * this.themes.length);
    this.currentTheme = this.themes[randomIndex];
    console.log(`Selected theme: ${this.currentTheme.name}`);
    return this.currentTheme;
  }

  /**
   * Get color for a safe platform segment
   * @param {number} segmentIndex - Index of the segment in the ring
   * @returns {number} - Color hex value
   */
  getSafeColor(segmentIndex) {
    // Alternate between the two theme colors
    return this.currentTheme.colors[segmentIndex % 2];
  }

  /**
   * Get the trap color (always red)
   * @returns {number} - Red color hex value
   */
  getTrapColor() {
    return this.trapColor;
  }

  /**
   * Get current theme info
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
}
