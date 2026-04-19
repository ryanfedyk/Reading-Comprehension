"use client";

import { useState, useEffect } from "react";
import type { TrueFalseGameData } from "@/lib/types";

export default function TrueFalseGame({ data, onComplete }: {
  data: TrueFalseGameData;
  onComplete?: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => new Array(data.statements.length).fill(null));
  const [phase, setPhase] = useState<"playing" | "score">("playing");

  const stmt = data.statements[current];
  const userAnswer = answers[current];
  const answered = userAnswer !== null;
  const isCorrect = answered && userAnswer === stmt.answer;
  const score = answers.filter((a, i) => a !== null && a === data.statements[i].answer).length;

  useEffect(() => {
    if (!answered) return;
    const t = setTimeout(() => {
      if (current < data.statements.length - 1) {
        setCurrent(c => c + 1);
      } else {
        setPhase("score");
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [answered, current, data.statements.length]);

  useEffect(() => {
    if (phase !== "score") return;
    const t = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleAnswer = (val: boolean) => {
    if (answered) return;
    setAnswers(prev => { const n = [...prev]; n[current] = val; return n; });
  };

  const btnStyle = (btnVal: boolean): React.CSSProperties => {
    const selected = answered && userAnswer === btnVal;
    const isThisCorrect = stmt.answer === btnVal;
    if (selected && isThisCorrect)  return { backgroundColor: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.5)", color: "#34D399" };
    if (selected && !isThisCorrect) return { backgroundColor: "rgba(239,68,68,0.1)",  borderColor: "rgba(239,68,68,0.4)",  color: "#F87171" };
    if (!selected && answered && isThisCorrect && !isCorrect)
      return { backgroundColor: "rgba(16,185,129,0.07)", borderColor: "rgba(16,185,129,0.2)", color: "#6EE7B7" };
    return { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "#CBD5E1" };
  };

  const dotColor = (i: number) => {
    if (answers[i] === null) return i === current ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)";
    return answers[i] === data.statements[i].answer ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.5)";
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">{data.instructions}</p>

      <div className="flex gap-1.5">
        {data.statements.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: dotColor(i) }} />
        ))}
      </div>

      {phase === "playing" ? (
        <div className="space-y-4">
          <div className="card p-5 min-h-[90px] flex items-center">
            <p className="text-slate-200 text-sm leading-relaxed">{stmt.statement}</p>
          </div>

          {answered && (
            <div className={`px-4 py-3 rounded-xl text-sm animate-fade-in ${
              isCorrect ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
              {isCorrect ? "✓ Correct! " : `✗ Actually ${stmt.answer ? "true" : "false"}. `}
              <span className="text-slate-400 text-xs">{stmt.explanation}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {([true, false] as const).map(val => (
              <button
                key={String(val)}
                onClick={() => handleAnswer(val)}
                disabled={answered}
                className="py-4 rounded-xl border text-sm font-semibold transition-all duration-200"
                style={btnStyle(val)}
              >
                {val ? "True" : "False"}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-600 text-center">{current + 1} / {data.statements.length}</p>
        </div>
      ) : (
        <div className="card p-6 text-center space-y-2 animate-slide-up">
          <p className="font-display text-3xl font-bold gradient-text">{score}/{data.statements.length}</p>
          <p className="text-white font-medium">
            {score === data.statements.length ? "All correct! Amazing!" :
             score >= Math.ceil(data.statements.length * 0.7) ? "Great job!" :
             "Good try — keep reading carefully!"}
          </p>
        </div>
      )}
    </div>
  );
}
