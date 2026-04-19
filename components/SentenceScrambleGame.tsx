"use client";

import { useState, useMemo } from "react";
import type { SentenceScrambleGameData } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function SentenceScrambleGame({ data, onComplete }: {
  data: SentenceScrambleGameData;
  onComplete?: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [placed, setPlaced] = useState<Array<{ word: string; id: number }>>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const sentence = data.sentences[currentIdx];

  const shuffledWords = useMemo(
    () => shuffle(sentence.words.map((w, i) => ({ word: w, id: i }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIdx]
  );

  const isWordPlaced = (id: number) => placed.some(p => p.id === id);

  const handleWordClick = (item: { word: string; id: number }) => {
    if (result || isWordPlaced(item.id)) return;
    const next = [...placed, item];
    setPlaced(next);

    if (next.length === sentence.words.length) {
      const correct = next.every((p, i) => p.word === sentence.words[i]);
      setResult(correct ? "correct" : "wrong");
      if (correct) {
        const nc = completed + 1;
        setCompleted(nc);
        setTimeout(() => {
          if (currentIdx + 1 < data.sentences.length) {
            setCurrentIdx(currentIdx + 1);
            setPlaced([]);
            setResult(null);
          } else {
            onComplete?.();
          }
        }, 900);
      }
    }
  };

  const handleRemove = (idx: number) => {
    if (result) return;
    setPlaced(placed.filter((_, i) => i !== idx));
  };

  const handleRetry = () => { setPlaced([]); setResult(null); };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{data.instructions}</p>

      <div className="flex gap-1.5">
        {data.sentences.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
            style={{ backgroundColor: i < completed ? "rgba(16,185,129,0.6)" : i === currentIdx ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)" }} />
        ))}
      </div>

      {/* Build area */}
      <div
        className="min-h-[64px] p-3 rounded-xl border flex flex-wrap gap-2 items-center"
        style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        {placed.length === 0 && <span className="text-slate-600 text-xs">Tap words below to build the sentence…</span>}
        {placed.map((item, i) => (
          <button
            key={i}
            onClick={() => handleRemove(i)}
            className="px-2.5 py-1.5 rounded-lg border text-sm font-medium transition-all"
            style={{ backgroundColor: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.35)", color: "#818CF8" }}
          >
            {item.word}
          </button>
        ))}
      </div>

      {result && (
        <div className={`px-4 py-2.5 rounded-xl text-sm ${
          result === "correct"
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border border-red-500/20 text-red-400"
        }`}>
          {result === "correct" ? "✓ Correct!" : `✗ Correct order: "${sentence.words.join(" ")}"`}
        </div>
      )}

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {shuffledWords.map(item => (
          <button
            key={item.id}
            onClick={() => handleWordClick(item)}
            disabled={isWordPlaced(item.id) || !!result}
            className="px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150"
            style={
              isWordPlaced(item.id)
                ? { opacity: 0, pointerEvents: "none" }
                : { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)", color: "#CBD5E1" }
            }
          >
            {item.word}
          </button>
        ))}
      </div>

      {result === "wrong" && (
        <button onClick={handleRetry} className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:border-accent/30 hover:text-white transition-all">
          Try Again
        </button>
      )}

      <p className="text-xs text-slate-600 text-center">Sentence {currentIdx + 1} of {data.sentences.length}</p>
    </div>
  );
}
