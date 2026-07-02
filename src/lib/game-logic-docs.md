# Game Logic Documentation

This file contains descriptions for the core mechanics and helper functions used in Pop Block Blitz.

## Functions

### `generateGrid`
Generates a random game grid based on width, height, and the number of colors.

### `getConnectedBlocks`
Finds all adjacent blocks of the same color starting from a specific coordinate.

### `findBestMove`
Finds the largest connected group in the grid to provide hints to the player.

### `applyGravityAndConsolidate`
Applies gravity to pull blocks down and consolidates empty columns by shifting them to the left.

### `processClear`
Clears a group of blocks, then applies gravity and consolidation to update the grid state.

### `rotateGrid`
Rotates the entire grid clockwise or counter-clockwise and reapplies gravity.

### `checkGameOver`
Checks if any valid moves (groups of 2 or more) remain on the board.

### `calculateMoveScore`
Calculates the score for a specific move using the formula: `n * (n - 1)`, where `n` is the number of blocks cleared.