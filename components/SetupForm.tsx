"use client";

import { useState } from "react";
import type { GameSetup } from "@/lib/types";

const AGE_RANGES = [
  {
    id: "K-1",
    label: "K – 1st Grade",
    ages: "Ages 5–7",
    emoji: "🌱",
    description: "Beginning Reader",
  },
  {
    id: "2-3",
    label: "2nd – 3rd Grade",
    ages: "Ages 7–9",
    emoji: "📖",
    description: "Growing Reader",
  },
  {
    id: "4-5",
    label: "4th – 5th Grade",
    ages: "Ages 9–11",
    emoji: "🚀",
    description: "Confident Reader",
  },
  {
    id: "6-8",
    label: "6th – 8th Grade",
    ages: "Ages 11–14",
    emoji: "⭐",
    description: "Advanced Reader",
  },
];

const GRADE_DESCRIPTIONS: Record<string, string> = {
  "K-1": "Simple sentences & basic words",
  "2-3": "Short paragraphs & growing vocabulary",
  "4-5": "Rich language & interesting ideas",
  "6-8": "Complex themes & advanced vocabulary",
};

const SILLINESS_LABELS: Record<number, { label: string; emoji: string }> = {
  1: { label: "Totally Serious", emoji: "🎓" },
  2: { label: "Slightly Silly", emoji: "😊" },
  3: { label: "Pretty Silly!", emoji: "😄" },
  4: { label: "Very Silly!!", emoji: "🤣" },
  5: { label: "MAXIMUM CHAOS!!!", emoji: "🤪" },
};

const TOPIC_SUGGESTIONS = [
  "Harry Potter",
  "Warrior Cats",
  "Percy Jackson",
  "Minecraft",
  "Dinosaurs",
  "Space explorers",
  "Unicorns & dragons",
  "Superheroes",
  "Ocean adventure",
  "Time travel",
];

interface Props {
  onStart: (setup: GameSetup) => void;
}

export default function SetupForm({ onStart }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [silliness, setSilliness] = useState(3);

  const handleSubmit = () => {
    if (!selectedGrade || !topic.trim()) return;
    const range = AGE_RANGES.find((r) => r.id === selectedGrade)!;
    onStart({
      ageRange: range.label,
      gradeLevel: selectedGrade,
      gradeLevelDescription: GRADE_DESCRIPTIONS[selectedGrade],
      topic: topic.trim(),
      sillinessLevel: silliness,
    });
  };

  const isReady = selectedGrade && topic.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-7xl mb-4 animate-float inline-block">📚</div>
        <h1 className="font-display text-4xl md:text-5xl text-purple-700 mb-2">
          Reading Adventure
        </h1>
        <p className="text-gray-500 text-lg">
          Create your own story, questions & game!
        </p>
      </div>

      {/* Grade Level Selection */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="font-display text-2xl text-purple-600 mb-4">
          Who&apos;s reading today? 👤
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {AGE_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => setSelectedGrade(range.id)}
              className={`p-4 rounded-2xl border-3 text-left transition-all duration-200 ${
                selectedGrade === range.id
                  ? "border-purple-500 bg-purple-50 shadow-md scale-105"
                  : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
              }`}
              style={{ borderWidth: "3px" }}
            >
              <div className="text-3xl mb-1">{range.emoji}</div>
              <div className="font-bold text-gray-800 text-sm">{range.label}</div>
              <div className="text-purple-500 text-xs font-medium">{range.ages}</div>
              <div className="text-gray-400 text-xs mt-1">{range.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic Input */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="font-display text-2xl text-orange-500 mb-2">
          What&apos;s your favorite topic? 🌟
        </h2>
        <p className="text-gray-400 text-sm mb-3">
          Enter any book, show, game, or idea you love!
        </p>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Harry Potter, Minecraft, Dinosaurs..."
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-gray-700 text-lg transition-colors"
          maxLength={60}
          onKeyDown={(e) => e.key === "Enter" && isReady && handleSubmit()}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {TOPIC_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-150 ${
                topic === s
                  ? "bg-orange-500 text-white"
                  : "bg-orange-50 text-orange-600 hover:bg-orange-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Silliness Slider */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="font-display text-2xl text-pink-500 mb-1">
          How silly should it be? 🎭
        </h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">🎓</span>
          <div className="flex-1 mx-4">
            <input
              type="range"
              min={1}
              max={5}
              value={silliness}
              onChange={(e) => setSilliness(Number(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${
                  ((silliness - 1) / 4) * 100
                }%, #e5e7eb ${((silliness - 1) / 4) * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>
          <span className="text-3xl">🤪</span>
        </div>
        <div className="text-center">
          <span className="text-4xl">
            {SILLINESS_LABELS[silliness].emoji}
          </span>
          <p className="font-bold text-gray-700 mt-1">
            Level {silliness}: {SILLINESS_LABELS[silliness].label}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setSilliness(i)}
                className={`w-8 h-8 rounded-full font-bold text-sm transition-all ${
                  i === silliness
                    ? "bg-pink-500 text-white scale-110"
                    : "bg-gray-100 text-gray-400 hover:bg-pink-100"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isReady}
        className={`w-full py-5 rounded-2xl font-display text-2xl shadow-lg transition-all duration-200 ${
          isReady
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 hover:shadow-xl cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isReady ? "✨ Create My Story! ✨" : "Fill in the details above ☝️"}
      </button>
    </div>
  );
}
