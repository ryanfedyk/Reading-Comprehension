"use client";

import { useState } from "react";
import type { GameData, GameSetup } from "@/lib/types";
import WordSearchGame from "./WordSearchGame";
import FillBlankGame from "./FillBlankGame";
import WordMatchGame from "./WordMatchGame";
import SequenceGame from "./SequenceGame";
import TrueFalseGame from "./TrueFalseGame";
import SentenceScrambleGame from "./SentenceScrambleGame";

const GAME_ICONS: Record<string, string> = {
  word_search: "◈",
  fill_blank: "◇",
  word_match: "⬡",
  sequence: "↕",
  true_false: "◎",
  sentence_scramble: "⟨⟩",
};

const GAME_LABELS: Record<string, string> = {
  word_search: "word search",
  fill_blank: "fill in the blank",
  word_match: "word match",
  sequence: "story sequence",
  true_false: "true or false",
  sentence_scramble: "sentence scramble",
};

export default function GameSection({ data, setup, onPlayAgain }: {
  data: GameData;
  setup: GameSetup;
  onPlayAgain: () => void;
}) {
  const [gameCompleted, setGameCompleted] = useState(false);
  const done = () => setGameCompleted(true);

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
          {GAME_LABELS[data.gameType] ?? data.gameType}
        </span>
      </div>

      {/* Game */}
      <div className="card p-5">
        {data.gameType === "word_search"      && <WordSearchGame      data={data} onComplete={done} />}
        {data.gameType === "fill_blank"       && <FillBlankGame       data={data} onComplete={done} />}
        {data.gameType === "word_match"       && <WordMatchGame       data={data} onComplete={done} />}
        {data.gameType === "sequence"         && <SequenceGame        data={data} onComplete={done} />}
        {data.gameType === "true_false"       && <TrueFalseGame       data={data} onComplete={done} />}
        {data.gameType === "sentence_scramble"&& <SentenceScrambleGame data={data} onComplete={done} />}
      </div>

      {/* Restart — only unlocks when game is done */}
      <div className="relative">
        <button
          onClick={onPlayAgain}
          disabled={!gameCompleted}
          className={`w-full py-3.5 rounded-xl border text-sm font-medium transition-all duration-300 ${
            gameCompleted
              ? "border-white/15 bg-white/3 text-slate-300 hover:border-accent/40 hover:bg-accent/6 hover:text-white cursor-pointer"
              : "border-white/4 bg-transparent text-slate-600 cursor-not-allowed"
          }`}
        >
          {gameCompleted ? "↺ Start a New Story" : "Finish the game to start a new story"}
        </button>
        {!gameCompleted && (
          <p className="text-center text-slate-600 text-xs mt-2">
            Complete the {GAME_LABELS[data.gameType] ?? data.gameType} above first
          </p>
        )}
      </div>
    </div>
  );
}
