export type BlockColor = number | null;
export type Grid = BlockColor[][];

export let COLORS = [
  '#4DCCE6', // Aqua
  '#C8F471', // Lime
  '#F471B3', // Pink
  '#F4A261', // Orange
  '#A29BFE', // Purple
  '#FFD93D', // Yellow
  '#6BCB77', // Green
];

export function setColors(newColors: string[]) {
  if (newColors && newColors.length > 0) {
    COLORS = [...newColors];
  }
}

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

export function generateGrid(width: number, height: number, numColors: number): Grid {
  const totalCells = width * height;
  const flatColors: number[] = [];

  // Generate pairs to ensure even counts for each color instance
  for (let i = 0; i < Math.floor(totalCells / 2); i++) {
    const color = Math.floor(Math.random() * numColors);
    flatColors.push(color, color);
  }

  // Handle odd number of cells (rare with standard dimensions, but safe)
  if (totalCells % 2 !== 0) {
    flatColors.push(Math.floor(Math.random() * numColors));
  }

  // Fisher-Yates shuffle to randomize position while preserving parity
  for (let i = flatColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flatColors[i], flatColors[j]] = [flatColors[j], flatColors[i]];
  }

  const grid: Grid = [];
  for (let y = 0; y < height; y++) {
    const row: BlockColor[] = [];
    for (let x = 0; x < width; x++) {
      row.push(flatColors[y * width + x]);
    }
    grid.push(row);
  }
  return grid;
}

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

export function applyGravityAndConsolidate(grid: Grid): Grid {
  const newGrid = grid.map(row => [...row]);
  const width = newGrid[0].length;
  const height = newGrid.length;

  for (let x = 0; x < width; x++) {
    const column: BlockColor[] = [];
    for (let y = height - 1; y >= 0; y--) {
      if (newGrid[y][x] !== null) {
        column.push(newGrid[y][x]);
      }
    }
    while (column.length < height) {
      column.push(null);
    }
    for (let y = 0; y < height; y++) {
      newGrid[height - 1 - y][x] = column[y];
    }
  }

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

  while (columns.length < width) {
    columns.push(new Array(height).fill(null));
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      newGrid[y][x] = columns[x][y];
    }
  }

  return newGrid;
}

export function processClear(grid: Grid, group: [number, number][]): Grid {
  const newGrid = grid.map(row => [...row]);
  
  for (const [x, y] of group) {
    newGrid[y][x] = null;
  }

  return applyGravityAndConsolidate(newGrid);
}

export function rotateGridRaw(grid: Grid, direction: 'cw' | 'ccw'): Grid {
  const oldHeight = grid.length;
  const oldWidth = grid[0].length;
  const rotated: Grid = [];

  if (direction === 'cw') {
    for (let x = 0; x < oldWidth; x++) {
      const newRow: BlockColor[] = [];
      for (let y = oldHeight - 1; y >= 0; y--) {
        newRow.push(grid[y][x]);
      }
      rotated.push(newRow);
    }
  } else {
    for (let x = oldWidth - 1; x >= 0; x--) {
      const newRow: BlockColor[] = [];
      for (let y = 0; y < oldHeight; y++) {
        newRow.push(grid[y][x]);
      }
      rotated.push(newRow);
    }
  }

  return rotated;
}

export function rotateGrid(grid: Grid, direction: 'cw' | 'ccw'): Grid {
  const rotated = rotateGridRaw(grid, direction);
  return applyGravityAndConsolidate(rotated);
}

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

export function isGridEmpty(grid: Grid): boolean {
  return grid.every(row => row.every(cell => cell === null));
}

export function calculateMoveScore(n: number): number {
  return n * (n - 1) * 2;
}

export function getBlockCounts(grid: Grid): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const row of grid) {
    for (const colorIndex of row) {
      if (colorIndex !== null) {
        counts[colorIndex] = (counts[colorIndex] || 0) + 1;
      }
    }
  }
  return counts;
}
