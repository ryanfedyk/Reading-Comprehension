"use client";

import type { StoryData, GameSetup } from "@/lib/types";

interface Props {
  story: StoryData;
  setup: GameSetup;
  onNext: () => void;
}

export default function StoryDisplay({ story, setup, onNext }: Props) {
  const paragraphs = story.story.split(/\n+/).filter((p) => p.trim());

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Story header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-medium mb-3">
          <span>📖</span>
          <span>
            {setup.ageRange} • {setup.topic} • Silliness Level {setup.sillinessLevel}
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-gray-800 mb-1">
          {story.title}
        </h1>
        <p className="text-gray-400 text-sm">{story.readingLevel}</p>
      </div>

      {/* Illustration */}
      <div className="bg-white rounded-3xl shadow-lg p-4 overflow-hidden">
        <div
          className="w-full flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 to-sky-50"
          style={{ minHeight: "200px" }}
          dangerouslySetInnerHTML={{ __html: story.svg }}
        />
      </div>

      {/* Story text */}
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-gray-700 leading-relaxed mb-4 last:mb-0"
              style={{ fontSize: "1.1rem", lineHeight: "1.85" }}
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full py-5 rounded-2xl font-display text-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
      >
        Answer Questions! 🧠
      </button>
    </div>
  );
}
