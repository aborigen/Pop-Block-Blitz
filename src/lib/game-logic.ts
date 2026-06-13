export type BlockColor = number | null;
export type Grid = BlockColor[][];

export const COLORS = [
  '#4DCCE6', // Aqua
  '#C8F471', // Lime
  '#F471B3', // Pink
  '#F4A261', // Orange
  '#A29BFE', // Purple
  '#FFD93D', // Yellow
  '#6BCB77', // Green
];

export const SHAPES = [
  'square',
  'circle',
  'star',
  'triangle',
  'pentagon',
];

export type DifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'expert' | 'insane';

export interface GameState {
  grid: Grid;
  score: number;
  highScore: number;
  gameOver: boolean;
  moves: number;
  difficulty: DifficultyLevel;
  config: {
    width: number;
    height: number;
    numColors: number;
  };
}

/**
 * Generates a random game grid.
 */
export function generateGrid(width: number, height: number, numColors: number): Grid {
  const grid: Grid = [];
  for (let y = 0; y < height; y++) {
    const row: BlockColor[] = [];
    for (let x = 0; x < width; x++) {
      row.push(Math.floor(Math.random() * numColors));
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Finds all adjacent blocks of the same color.
 */
export function getConnectedBlocks(grid: Grid, x: number, y: number): [number, number][] {
  const color = grid[y][x];
  if (color === null) return [];

  const width = grid[0].length;
  const height = grid.length;
  const visited = new Set<string>();
  const stack: [number, number][] = [[x, y]];
  const group: [number, number][] = [];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    const key = `${cx},${cy}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (grid[cy][cx] === color) {
      group.push([cx, cy]);
      
      // Check neighbors
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(`${nx},${ny}`)) {
          stack.push([nx, ny]);
        }
      }
    }
  }

  return group;
}

/**
 * Finds the largest connected group in the grid.
 */
export function findBestMove(grid: Grid): [number, number][] {
  const width = grid[0].length;
  const height = grid.length;
  const visited = new Set<string>();
  let bestGroup: [number, number][] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`;
      if (grid[y][x] === null || visited.has(key)) continue;

      const group = getConnectedBlocks(grid, x, y);
      group.forEach(([gx, gy]) => visited.add(`${gx},${gy}`));

      if (group.length > bestGroup.length) {
        bestGroup = group;
      }
    }
  }

  return bestGroup.length >= 2 ? bestGroup : [];
}

/**
 * Clears blocks, applies gravity, and consolidates columns.
 */
export function processClear(grid: Grid, group: [number, number][]): Grid {
  const newGrid = grid.map(row => [...row]);
  
  // 1. Mark as null
  for (const [x, y] of group) {
    newGrid[y][x] = null;
  }

  const width = newGrid[0].length;
  const height = newGrid.length;

  // 2. Gravity (per column)
  for (let x = 0; x < width; x++) {
    const column: BlockColor[] = [];
    for (let y = height - 1; y >= 0; y--) {
      if (newGrid[y][x] !== null) {
        column.push(newGrid[y][x]);
      }
    }
    // Fill remaining with null
    while (column.length < height) {
      column.push(null);
    }
    // Update grid from bottom up
    for (let y = 0; y < height; y++) {
      newGrid[height - 1 - y][x] = column[y];
    }
  }

  // 3. Consolidate Columns (shift left if column is empty)
  const columns: BlockColor[][] = [];
  for (let x = 0; x < width; x++) {
    const column: BlockColor[] = [];
    let isEmpty = true;
    for (let y = 0; y < height; y++) {
      column.push(newGrid[y][x]);
      if (newGrid[y][x] !== null) isEmpty = false;
    }
    if (!isEmpty) {
      columns.push(column);
    }
  }

  // Fill remaining columns with null
  while (columns.length < width) {
    columns.push(new Array(height).fill(null));
  }

  // Reconstruct grid
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      newGrid[y][x] = columns[x][y];
    }
  }

  return newGrid;
}

/**
 * Checks if any valid moves remain.
 */
export function checkGameOver(grid: Grid): boolean {
  const width = grid[0].length;
  const height = grid.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === null) continue;
      const group = getConnectedBlocks(grid, x, y);
      if (group.length >= 2) return false;
    }
  }
  return true;
}

/**
 * Calculate score for a clear.
 * Formula: n * (n - 1)
 */
export function calculateMoveScore(n: number): number {
  return n * (n - 1);
}
