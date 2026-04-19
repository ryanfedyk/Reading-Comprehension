"use client";

import { useState } from "react";
import type { WordMatchGameData } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const PAIR_COLORS = [
  { accent: "#6366F1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.4)" },
  { accent: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.35)" },
  { accent: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.35)" },
  { accent: "#EC4899", bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.35)" },
  { accent: "#06B6D4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.35)" },
  { accent: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.35)" },
];

export default function WordMatchGame({ data, onComplete }: { data: WordMatchGameData; onComplete?: () => void }) {
  const [words] = useState(() => shuffle(data.pairs.map((p) => p.word)));
  const [defs] = useState(() => shuffle(data.pairs.map((p) => p.definition)));
  const [selWord, setSelWord] = useState<string | null>(null);
  const [selDef, setSelDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<Map<string, number>>(new Map());
  const [wrongFlash, setWrongFlash] = useState(false);

  const checkMatch = (word: string | null, def: string | null) => {
    if (!word || !def) return;
    const pair = data.pairs.find((p) => p.word === word && p.definition === def);
    if (pair) {
      setMatched((prev) => {
        const next = new Map(prev);
        next.set(word, next.size % PAIR_COLORS.length);
        if (next.size === data.pairs.length) onComplete?.();
        return next;
      });
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 500);
    }
    setSelWord(null);
    setSelDef(null);
  };

  const handleWord = (w: string) => {
    if (matched.has(w)) return;
    const next = selWord === w ? null : w;
    setSelWord(next);
    if (next && selDef) checkMatch(next, selDef);
  };

  const handleDef = (d: string) => {
    const pair = data.pairs.find((p) => p.definition === d);
    if (pair && matched.has(pair.word)) return;
    const next = selDef === d ? null : d;
    setSelDef(next);
    if (selWord && next) checkMatch(selWord, next);
  };

  const getWordColor = (w: string) =>
    matched.has(w) ? PAIR_COLORS[matched.get(w)!] : null;

  const getDefColor = (d: string) => {
    const pair = data.pairs.find((p) => p.definition === d);
    return pair && matched.has(pair.word) ? PAIR_COLORS[matched.get(pair.word)!] : null;
  };

  const allMatched = matched.size === data.pairs.length;

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">{data.instructions}</p>

      {wrongFlash && (
        <div className="text-center animate-fade-in">
          <span className="text-xs px-3 py-1 rounded-full bg-danger/10 border border-danger/20 text-red-400">
            Not a match — try again
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Words */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Words</p>
          {words.map((word) => {
            const color = getWordColor(word);
            const isSelected = selWord === word;
            return (
              <button
                key={word}
                onClick={() => handleWord(word)}
                disabled={!!color}
                className="w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150"
                style={
                  color
                    ? { backgroundColor: color.bg, borderColor: color.border, color: color.accent, opacity: 0.7 }
                    : isSelected
                    ? { backgroundColor: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.5)", color: "#818CF8" }
                    : { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "#94A3B8" }
                }
              >
                {color ? "✓ " : ""}{word}
              </button>
            );
          })}
        </div>

        {/* Definitions */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Meanings</p>
          {defs.map((def) => {
            const color = getDefColor(def);
            const isSelected = selDef === def;
            return (
              <button
                key={def}
                onClick={() => handleDef(def)}
                disabled={!!color}
                className="w-full text-left px-3 py-2.5 rounded-xl border text-xs transition-all duration-150"
                style={
                  color
                    ? { backgroundColor: color.bg, borderColor: color.border, color: color.accent, opacity: 0.7 }
                    : isSelected
                    ? { backgroundColor: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.45)", color: "#C084FC" }
                    : { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "#94A3B8" }
                }
              >
                {def}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center">
        {matched.size} of {data.pairs.length} matched
      </p>

      {allMatched && (
        <div className="card p-5 text-center animate-slide-up">
          <p className="font-display text-xl font-bold gradient-text mb-1">All matched!</p>
          <p className="text-slate-500 text-sm">Great vocabulary work.</p>
        </div>
      )}
    </div>
  );
}
