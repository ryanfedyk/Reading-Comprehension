"use client";

import { useState, useEffect } from "react";
import type { WordMatchGameData } from "@/lib/types";

interface Props {
  data: WordMatchGameData;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const PAIR_COLORS = [
  { bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-700", matched: "bg-yellow-200" },
  { bg: "bg-green-100", border: "border-green-400", text: "text-green-700", matched: "bg-green-200" },
  { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700", matched: "bg-blue-200" },
  { bg: "bg-pink-100", border: "border-pink-400", text: "text-pink-700", matched: "bg-pink-200" },
  { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-700", matched: "bg-orange-200" },
  { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-700", matched: "bg-purple-200" },
];

export default function WordMatchGame({ data }: Props) {
  const [words] = useState(() => shuffle(data.pairs.map((p) => p.word)));
  const [definitions] = useState(() => shuffle(data.pairs.map((p) => p.definition)));
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<Map<string, number>>(new Map());
  const [wrongPair, setWrongPair] = useState(false);

  useEffect(() => {
    if (!selectedWord || !selectedDef) return;

    const pair = data.pairs.find(
      (p) => p.word === selectedWord && p.definition === selectedDef
    );

    if (pair) {
      setMatched((prev) => {
        const next = new Map(prev);
        next.set(selectedWord, next.size);
        return next;
      });
      setSelectedWord(null);
      setSelectedDef(null);
    } else {
      setWrongPair(true);
      setTimeout(() => {
        setWrongPair(false);
        setSelectedWord(null);
        setSelectedDef(null);
      }, 800);
    }
  }, [selectedWord, selectedDef, data.pairs]);

  const getWordColorIdx = (word: string) => matched.get(word) ?? -1;
  const getDefColorIdx = (def: string) => {
    const pair = data.pairs.find((p) => p.definition === def);
    if (!pair) return -1;
    return matched.get(pair.word) ?? -1;
  };

  const allMatched = matched.size === data.pairs.length;

  const wordButtonStyle = (word: string) => {
    const colorIdx = getWordColorIdx(word);
    if (colorIdx >= 0) {
      const c = PAIR_COLORS[colorIdx % PAIR_COLORS.length];
      return `${c.matched} ${c.border} ${c.text} border-2 opacity-70`;
    }
    if (selectedWord === word) return "bg-purple-500 border-purple-500 text-white border-2 scale-105";
    if (wrongPair && selectedWord === word) return "bg-red-100 border-red-400 text-red-700 border-2";
    return "bg-white border-gray-200 text-gray-700 border-2 hover:border-purple-300 hover:bg-purple-50";
  };

  const defButtonStyle = (def: string) => {
    const colorIdx = getDefColorIdx(def);
    if (colorIdx >= 0) {
      const c = PAIR_COLORS[colorIdx % PAIR_COLORS.length];
      return `${c.matched} ${c.border} ${c.text} border-2 opacity-70`;
    }
    if (selectedDef === def) return "bg-pink-500 border-pink-500 text-white border-2 scale-105";
    if (wrongPair && selectedDef === def) return "bg-red-100 border-red-400 text-red-700 border-2";
    return "bg-white border-gray-200 text-gray-700 border-2 hover:border-pink-300 hover:bg-pink-50";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-500 text-sm">{data.instructions}</p>
        <p className="text-gray-400 text-xs mt-1">
          Click a word on the left, then its meaning on the right
        </p>
      </div>

      {wrongPair && (
        <div className="text-center animate-bounce">
          <span className="bg-red-100 text-red-600 font-bold px-4 py-2 rounded-full">
            ❌ Try again!
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Words column */}
        <div className="space-y-2">
          <p className="text-center font-bold text-purple-600 text-sm uppercase tracking-wide mb-3">
            Words
          </p>
          {words.map((word) => {
            const isMatched = matched.has(word);
            return (
              <button
                key={word}
                onClick={() => !isMatched && setSelectedWord(word)}
                disabled={isMatched}
                className={`w-full px-3 py-3 rounded-xl font-bold text-sm transition-all duration-150 ${wordButtonStyle(word)}`}
              >
                {isMatched ? "✓ " : ""}{word}
              </button>
            );
          })}
        </div>

        {/* Definitions column */}
        <div className="space-y-2">
          <p className="text-center font-bold text-pink-600 text-sm uppercase tracking-wide mb-3">
            Meanings
          </p>
          {definitions.map((def) => {
            const pair = data.pairs.find((p) => p.definition === def);
            const isMatched = pair ? matched.has(pair.word) : false;
            return (
              <button
                key={def}
                onClick={() => !isMatched && setSelectedDef(def)}
                disabled={isMatched}
                className={`w-full px-3 py-3 rounded-xl text-sm transition-all duration-150 text-left ${defButtonStyle(def)}`}
              >
                {def}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-sm text-gray-400">
        Matched: {matched.size} of {data.pairs.length}
      </div>

      {allMatched && (
        <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
          <div className="text-5xl mb-2">🌟</div>
          <p className="font-display text-2xl text-orange-500">
            You matched them all!
          </p>
          <p className="text-orange-400 mt-1">Outstanding vocabulary work!</p>
        </div>
      )}
    </div>
  );
}
