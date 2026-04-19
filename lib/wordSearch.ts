import type { WordSearchGrid, WordPlacement } from "./types";

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
];

function canPlace(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: [number, number],
  size: number
): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir[0] * i;
    const c = col + dir[1] * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: [number, number]
): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < word.length; i++) {
    const r = row + dir[0] * i;
    const c = col + dir[1] * i;
    grid[r][c] = word[i];
    cells.push([r, c]);
  }
  return cells;
}

export function generateWordSearchGrid(
  rawWords: string[],
  size: number = 12
): WordSearchGrid {
  const words = rawWords
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((w) => w.length > 0 && w.length <= size);

  const grid: string[][] = Array.from({ length: size }, () =>
    Array(size).fill("")
  );
  const placements: WordPlacement[] = [];

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (canPlace(grid, word, row, col, dir, size)) {
        const cells = placeWord(grid, word, row, col, dir);
        placements.push({ word, cells });
        placed = true;
      }
    }
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, placements };
}

export function getCellsBetween(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const [r1, c1] = start;
  const [r2, c2] = end;
  const dr = r2 - r1;
  const dc = c2 - c1;

  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return [start];

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [start];

  const stepR = dr / steps;
  const stepC = dc / steps;

  return Array.from({ length: steps + 1 }, (_, i) => [
    r1 + stepR * i,
    c1 + stepC * i,
  ]);
}
