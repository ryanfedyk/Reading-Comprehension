"use client";

import { useState, useCallback } from "react";
import { generateWordSearchGrid, getCellsBetween } from "@/lib/wordSearch";
import type { WordSearchGameData } from "@/lib/types";

const FOUND_COLORS = [
  { bg: "#6366F1", text: "#fff" },
  { bg: "#10B981", text: "#fff" },
  { bg: "#F59E0B", text: "#0F172A" },
  { bg: "#EC4899", text: "#fff" },
  { bg: "#06B6D4", text: "#0F172A" },
  { bg: "#8B5CF6", text: "#fff" },
  { bg: "#F97316", text: "#fff" },
  { bg: "#84CC16", text: "#0F172A" },
];

export default function WordSearchGame({ data, onComplete }: { data: WordSearchGameData; onComplete?: () => void }) {
  const [{ grid, placements }] = useState(() => generateWordSearchGrid(data.words, 10));
  const [foundWords, setFoundWords] = useState<Map<string, number>>(new Map());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [lastFound, setLastFound] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const placedWords = new Set(placements.map((p) => p.word));

  const getCellFoundIdx = useCallback(
    (row: number, col: number): number => {
      for (const [word, idx] of Array.from(foundWords)) {
        const p = placements.find((pl) => pl.word === word);
        if (p?.cells.some(([r, c]) => r === row && c === col)) return idx;
      }
      return -1;
    },
    [foundWords, placements]
  );

  const isSelected = (row: number, col: number) =>
    selectedCells.some(([r, c]) => r === row && c === col);

  const handleCellClick = (row: number, col: number) => {
    if (!startCell) {
      setStartCell([row, col]);
      setSelectedCells([[row, col]]);
      return;
    }
    if (startCell[0] === row && startCell[1] === col) {
      setStartCell(null);
      setSelectedCells([]);
      return;
    }
    const cells = getCellsBetween(startCell, [row, col]);
    const word = cells.map(([r, c]) => grid[r][c]).join("");
    const wordRev = word.split("").reverse().join("");
    const matchFwd = placedWords.has(word) && !foundWords.has(word);
    const matchRev = placedWords.has(wordRev) && !foundWords.has(wordRev);

    if (matchFwd || matchRev) {
      const matched = matchFwd ? word : wordRev;
      setFoundWords((prev) => {
        const next = new Map(prev);
        next.set(matched, next.size % FOUND_COLORS.length);
        if (next.size === placedWords.size) onComplete?.();
        return next;
      });
      setLastFound(matched);
      setTimeout(() => setLastFound(null), 2000);
    } else {
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    }
    setStartCell(null);
    setSelectedCells([]);
  };

  const handleCellHover = (row: number, col: number) => {
    if (!startCell) return;
    setSelectedCells(getCellsBetween(startCell, [row, col]));
  };

  const allFound = foundWords.size === placedWords.size;
  const cols = grid[0]?.length ?? 10;

  return (
    <div className="space-y-5">
      {/* Toast */}
      <div className="h-7 flex items-center justify-center">
        {lastFound && (
          <div className="animate-slide-up text-xs font-semibold px-3 py-1 rounded-full bg-success/15 border border-success/25 text-emerald-300">
            Found: {lastFound}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex justify-center">
        <div
          className={`inline-grid gap-1 p-3 rounded-2xl border transition-colors duration-150 ${
            flash ? "border-danger/40 bg-danger/5" : "border-white/6 bg-surface"
          }`}
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const foundIdx = getCellFoundIdx(r, c);
              const sel = isSelected(r, c);
              const isStart = startCell?.[0] === r && startCell?.[1] === c;
              const foundColor = foundIdx >= 0 ? FOUND_COLORS[foundIdx] : null;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onMouseEnter={() => handleCellHover(r, c)}
                  className={`ws-cell w-10 h-10 text-sm ${
                    foundColor
                      ? "found"
                      : sel
                      ? isStart
                        ? "selected ring-1 ring-accent"
                        : "selected"
                      : ""
                  }`}
                  style={
                    foundColor
                      ? { backgroundColor: foundColor.bg, color: foundColor.text }
                      : undefined
                  }
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Word list */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Words to Find
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from(placedWords).map((word) => {
            const foundIdx = foundWords.has(word) ? foundWords.get(word)! : -1;
            const color = foundIdx >= 0 ? FOUND_COLORS[foundIdx] : null;
            return (
              <span
                key={word}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  color
                    ? "line-through opacity-60"
                    : "bg-white/4 border border-white/8 text-slate-300"
                }`}
                style={color ? { backgroundColor: color.bg + "22", color: color.bg, border: `1px solid ${color.bg}44` } : {}}
              >
                {word}
              </span>
            );
          })}
        </div>
        <p className="text-xs text-slate-600 mt-2">
          {foundWords.size} of {placedWords.size} found · Click first letter, then last letter
        </p>
      </div>

      {allFound && (
        <div className="card p-5 text-center animate-slide-up">
          <p className="font-display text-xl font-bold gradient-text mb-1">All words found!</p>
          <p className="text-slate-500 text-sm">Excellent vocabulary work.</p>
        </div>
      )}
    </div>
  );
}
