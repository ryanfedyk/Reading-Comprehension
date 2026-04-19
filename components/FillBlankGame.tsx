"use client";

import { useState } from "react";
import type { FillBlankGameData } from "@/lib/types";

export default function FillBlankGame({ data, onComplete }: { data: FillBlankGameData; onComplete?: () => void }) {
  const [answers, setAnswers] = useState<(string | null)[]>(Array(data.sentences.length).fill(null));
  const [revealed, setRevealed] = useState<boolean[]>(Array(data.sentences.length).fill(false));

  const handleSelect = (i: number, opt: string) => {
    if (revealed[i]) return;
    setAnswers((prev) => { const n = [...prev]; n[i] = opt; return n; });
    setRevealed((prev) => {
      const n = [...prev]; n[i] = true;
      if (n.every(Boolean)) onComplete?.();
      return n;
    });
  };

  const correctCount = answers.filter((a, i) => a === data.sentences[i]?.answer).length;
  const allDone = revealed.every(Boolean);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{data.instructions}</p>

      {data.sentences.map((sentence, i) => {
        const isRevealed = revealed[i];
        const isCorrect = answers[i] === sentence.answer;
        const parts = sentence.text.split("___");

        return (
          <div
            key={i}
            className={`card p-4 transition-colors duration-300 ${
              isRevealed
                ? isCorrect
                  ? "border-success/25 bg-success/4"
                  : "border-danger/20 bg-danger/4"
                : ""
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isRevealed
                  ? isCorrect ? "bg-success/15 text-emerald-400" : "bg-danger/15 text-red-400"
                  : "bg-white/6 text-slate-400"
              }`}>
                {isRevealed ? (isCorrect ? "✓" : "✗") : i + 1}
              </span>
              <p className="text-[15px] text-slate-200 leading-relaxed">
                {parts[0]}
                <span
                  className={`inline-block min-w-[70px] mx-1 px-2 py-0.5 rounded-md text-center font-semibold border-b-2 transition-all ${
                    isRevealed
                      ? isCorrect
                        ? "border-success text-emerald-300 bg-success/10"
                        : "border-danger text-red-300 bg-danger/10"
                      : answers[i]
                      ? "border-accent text-accent-light bg-accent/10"
                      : "border-white/15 text-slate-500"
                  }`}
                >
                  {isRevealed && answers[i] ? answers[i] : answers[i] || "___"}
                </span>
                {parts[1]}
              </p>
            </div>

            {!isRevealed && (
              <div className="flex flex-wrap gap-2 pl-9">
                {sentence.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(i, opt)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-accent/20 bg-accent/6 text-accent-light hover:bg-accent/15 hover:border-accent/40 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {isRevealed && !isCorrect && (
              <p className="pl-9 text-xs text-slate-500 mt-1">
                Answer: <span className="text-emerald-400 font-medium">{sentence.answer}</span>
              </p>
            )}
          </div>
        );
      })}

      {allDone && (
        <div className="card p-5 text-center animate-slide-up">
          <div className="font-display text-2xl font-bold mb-1">
            <span className="gradient-text">{correctCount}/{data.sentences.length}</span>
          </div>
          <p className="text-slate-400 text-sm">
            {correctCount === data.sentences.length ? "Flawless!" : "Nice work!"}
          </p>
        </div>
      )}
    </div>
  );
}
