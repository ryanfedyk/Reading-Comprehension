"use client";

import type { GameData, GameSetup } from "@/lib/types";
import WordSearchGame from "./WordSearchGame";
import FillBlankGame from "./FillBlankGame";
import WordMatchGame from "./WordMatchGame";

interface Props {
  data: GameData;
  setup: GameSetup;
  onPlayAgain: () => void;
}

export default function GameSection({ data, setup, onPlayAgain }: Props) {
  const gameEmoji =
    data.gameType === "word_search"
      ? "🔍"
      : data.gameType === "fill_blank"
      ? "✏️"
      : "🔗";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-2">{gameEmoji}</div>
        <h2 className="font-display text-3xl text-purple-600 mb-1">
          {data.title}
        </h2>
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">
          <span>Based on your {setup.topic} story</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">
        {data.gameType === "word_search" && <WordSearchGame data={data} />}
        {data.gameType === "fill_blank" && <FillBlankGame data={data} />}
        {data.gameType === "word_match" && <WordMatchGame data={data} />}
      </div>

      <button
        onClick={onPlayAgain}
        className="w-full py-5 rounded-2xl font-display text-2xl bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
      >
        🔄 Create a New Story!
      </button>
    </div>
  );
}
