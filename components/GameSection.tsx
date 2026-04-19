"use client";

import type { GameData, GameSetup } from "@/lib/types";
import WordSearchGame from "./WordSearchGame";
import FillBlankGame from "./FillBlankGame";
import WordMatchGame from "./WordMatchGame";

const GAME_ICONS: Record<string, string> = {
  word_search: "◈",
  fill_blank: "◇",
  word_match: "⬡",
};

export default function GameSection({ data, setup, onPlayAgain }: {
  data: GameData;
  setup: GameSetup;
  onPlayAgain: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto space-y-5 relative z-10 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent font-mono text-lg">{GAME_ICONS[data.gameType]}</span>
            <h2 className="font-display text-xl font-bold text-white">{data.title}</h2>
          </div>
          <p className="text-slate-500 text-xs">Based on your {setup.topic} story</p>
        </div>
        <span className="px-2 py-1 rounded-lg bg-white/4 border border-white/6 text-slate-500 text-[10px] font-medium uppercase tracking-wide">
          {data.gameType.replace("_", " ")}
        </span>
      </div>

      {/* Game */}
      <div className="card p-5">
        {data.gameType === "word_search" && <WordSearchGame data={data} />}
        {data.gameType === "fill_blank" && <FillBlankGame data={data} />}
        {data.gameType === "word_match" && <WordMatchGame data={data} />}
      </div>

      {/* Restart */}
      <button
        onClick={onPlayAgain}
        className="w-full py-3.5 rounded-xl border border-white/8 bg-white/2 text-slate-300 text-sm font-medium hover:border-accent/30 hover:bg-accent/5 hover:text-white transition-all duration-200"
      >
        ↺ Start a New Story
      </button>
    </div>
  );
}
