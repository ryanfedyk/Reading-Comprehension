"use client";

import { useState, useCallback, useEffect } from "react";
import { generateWordSearchGrid, getCellsBetween } from "@/lib/wordSearch";
import type { WordSearchGameData } from "@/lib/types";

interface Props {
  data: WordSearchGameData;
}

const FOUND_COLORS = [
  "bg-yellow-300",
  "bg-green-300",
  "bg-blue-300",
  "bg-pink-300",
  "bg-orange-300",
  "bg-purple-300",
  "bg-teal-300",
  "bg-red-300",
  "bg-indigo-300",
  "bg-lime-300",
];

export default function WordSearchGame({ data }: Props) {
  const [{ grid, placements }] = useState(() =>
    generateWordSearchGrid(data.words, 12)
  );
  const [foundWords, setFoundWords] = useState<Map<string, number>>(new Map());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [shake, setShake] = useState(false);
  const [lastFound, setLastFound] = useState<string | null>(null);

  const placedWords = new Set(placements.map((p) => p.word));

  const getCellFoundColor = useCallback(
    (row: number, col: number): string | null => {
      for (const [word, colorIdx] of Array.from(foundWords)) {
        const placement = placements.find((p) => p.word === word);
        if (placement?.cells.some(([r, c]) => r === row && c === col)) {
          return FOUND_COLORS[colorIdx % FOUND_COLORS.length];
        }
      }
      return null;
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
      const matchedWord = matchFwd ? word : wordRev;
      setFoundWords((prev) => {
        const next = new Map(prev);
        next.set(matchedWord, next.size);
        return next;
      });
      setLastFound(matchedWord);
      setTimeout(() => setLastFound(null), 2000);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }

    setStartCell(null);
    setSelectedCells([]);
  };

  const handleCellHover = (row: number, col: number) => {
    if (!startCell) return;
    const cells = getCellsBetween(startCell, [row, col]);
    setSelectedCells(cells);
  };

  const allFound = foundWords.size === placedWords.size;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-500 text-sm">{data.instructions}</p>
        <p className="text-gray-400 text-xs mt-1">
          Click the first letter, then the last letter of a word
        </p>
      </div>

      {lastFound && (
        <div className="text-center animate-bounce">
          <span className="bg-yellow-100 text-yellow-700 font-bold px-4 py-2 rounded-full text-lg">
            🎉 Found: {lastFound}!
          </span>
        </div>
      )}

      {/* Grid */}
      <div className={`flex justify-center ${shake ? "animate-wiggle" : ""}`}>
        <div
          className="inline-grid gap-0.5 rounded-2xl overflow-hidden shadow-lg bg-purple-100 p-2"
          style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 12}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const foundColor = getCellFoundColor(r, c);
              const sel = isSelected(r, c);
              const isStart =
                startCell && startCell[0] === r && startCell[1] === c;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onMouseEnter={() => handleCellHover(r, c)}
                  className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-bold rounded transition-all duration-100 select-none
                    ${
                      foundColor
                        ? `${foundColor} text-gray-700`
                        : sel
                        ? isStart
                          ? "bg-purple-500 text-white scale-110"
                          : "bg-purple-300 text-purple-900"
                        : "bg-white text-gray-700 hover:bg-purple-50"
                    }`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Word list */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <h4 className="font-bold text-gray-600 text-sm mb-3 uppercase tracking-wide">
          Find these words:
        </h4>
        <div className="flex flex-wrap gap-2">
          {Array.from(placedWords).map((word) => {
            const found = foundWords.has(word);
            const colorIdx = foundWords.get(word);
            return (
              <span
                key={word}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
                  found
                    ? `${FOUND_COLORS[(colorIdx ?? 0) % FOUND_COLORS.length]} text-gray-700 line-through opacity-70`
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {found ? "✓ " : ""}{word}
              </span>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Found {foundWords.size} of {placedWords.size} words
        </p>
      </div>

      {allFound && (
        <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
          <div className="text-5xl mb-2">🏆</div>
          <p className="font-display text-2xl text-yellow-600">
            You found all the words!
          </p>
        </div>
      )}
    </div>
  );
}
