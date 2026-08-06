# Game Logic Documentation

This file contains descriptions for the core mechanics and helper functions used in Pop Block Blitz.

## Functions

### `generateGrid`
Generates a random game grid based on width, height, and the number of colors. Ensures even quantity of colors for solvability.

### `getConnectedBlocks`
Finds all adjacent blocks of the same color starting from a specific coordinate.

### `findBestMove`
Finds the largest connected group in the grid to provide hints to the player.

### `findTopMoves`
Finds the top N largest connected groups in the grid. Useful for providing multiple hints to the player simultaneously.

### `applyGravityAndConsolidate`
Applies gravity to pull blocks down and consolidates empty columns by shifting them to the left.

### `processClear`
Clears a group of blocks, then applies gravity and consolidation to update the grid state.

### `rotateGrid`
Rotates the entire grid clockwise or counter-clockwise and reapplies gravity.

### `checkGameOver`
Checks if any valid moves (groups of 2 or more) remain on the board.

### `isGridEmpty`
Checks if every cell in the grid is `null`.

### `calculateMoveScore`
Calculates the score for a specific move using the formula: `Score = n * (n - 1) * 2`, where `n` is the number of blocks cleared.

## Scoring Rules
The game rewards larger clusters exponentially and board mastery:
- **Combo Formula:** `Points = n × (n - 1) × 2`
- **Perfect Clear:** Total score multiplied by 5 if board is empty on game over.
