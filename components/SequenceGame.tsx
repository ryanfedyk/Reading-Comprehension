"use client";

import { useState, useMemo } from "react";
import type { SequenceGameData } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function SequenceGame({ data, onComplete }: { data: SequenceGameData; onComplete?: () => void }) {
  const items = useMemo(
    () => shuffle(data.events.map((text, correctIndex) => ({ text, correctIndex }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const handleClick = (idx: number) => {
    if (checked || selected.includes(idx)) return;
    const next = [...selected, idx];
    setSelected(next);
    if (next.length === items.length) setChecked(true);
  };

  const handleReset = () => {
    setSelected([]);
    setChecked(false);
  };

  const allCorrect = checked && selected.every((si, pos) => items[si].correctIndex === pos);

  const itemStyle = (idx: number): React.CSSProperties => {
    const pos = selected.indexOf(idx);
    if (!checked || pos === -1)
      return pos >= 0
        ? { backgroundColor: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.4)", color: "#818CF8" }
        : { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "#94A3B8" };
    return items[idx].correctIndex === pos
      ? { backgroundColor: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.4)", color: "#34D399" }
      : { backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.35)", color: "#F87171" };
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{data.instructions}</p>

      {!checked ? (
        <p className="text-xs text-accent">
          Click events in the order they happened — {selected.length}/{items.length} selected
        </p>
      ) : (
        <p className={`text-xs font-medium ${allCorrect ? "text-emerald-400" : "text-red-400"}`}>
          {allCorrect ? "Perfect! You got the right order." : "Not quite — check the highlighted ones and try again."}
        </p>
      )}

      <div className="space-y-2">
        {items.map((item, idx) => {
          const pos = selected.indexOf(idx);
          return (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              disabled={checked || selected.includes(idx)}
              className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 flex items-center gap-3"
              style={itemStyle(idx)}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: pos >= 0 ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)" }}
              >
                {pos >= 0 ? pos + 1 : "·"}
              </span>
              {item.text}
            </button>
          );
        })}
      </div>

      {checked && !allCorrect && (
        <button
          onClick={handleReset}
          className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:border-accent/30 hover:text-white transition-all"
        >
          Try Again
        </button>
      )}

      {allCorrect && (
        <div className="card p-5 text-center animate-slide-up" onAnimationEnd={() => onComplete?.()}>
          <p className="font-display text-xl font-bold gradient-text mb-1">Perfect Order!</p>
          <p className="text-slate-500 text-sm">You remembered the whole story.</p>
        </div>
      )}
    </div>
  );
}
