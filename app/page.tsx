"use client";

import { useState } from "react";
import SetupForm from "@/components/SetupForm";
import StoryDisplay from "@/components/StoryDisplay";
import QuestionsSection from "@/components/QuestionsSection";
import GameSection from "@/components/GameSection";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { GameSetup, StoryData, QuestionsData, GameData } from "@/lib/types";

type Step = "setup" | "loading-story" | "story" | "loading-questions" | "questions" | "loading-game" | "game";

const STEP_ORDER: Step[] = ["setup", "story", "questions", "game"];

const STEP_LABELS: Partial<Record<Step, string>> = {
  story: "Story",
  questions: "Questions",
  game: "Game",
};

const LOADING_MESSAGES: Record<string, string[]> = {
  "loading-story": [
    "Summoning story ingredients... ✨",
    "Waking up the story wizard... 🧙‍♂️",
    "Mixing words and imagination... 🌈",
    "Painting your illustration... 🎨",
    "Almost ready to read... 📖",
  ],
  "loading-questions": [
    "Brewing comprehension questions... 🧪",
    "Thinking up tricky questions... 🤔",
    "Making questions just for you... 📝",
  ],
  "loading-game": [
    "Building your custom game... 🎮",
    "Hiding words in the puzzle... 🔍",
    "Creating a super fun challenge... ⭐",
  ],
};

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string; emoji: string }[] = [
    { key: "story", label: "Story", emoji: "📖" },
    { key: "questions", label: "Questions", emoji: "🧠" },
    { key: "game", label: "Game", emoji: "🎮" },
  ];

  const activeIndex = steps.findIndex(
    (s) =>
      step === s.key ||
      step === (`loading-${s.key === "story" ? "story" : s.key === "questions" ? "questions" : "game"}` as Step)
  );

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((s, i) => {
        const isActive = step === s.key || step === (`loading-${s.key === "story" ? "story" : s.key === "questions" ? "questions" : "game"}` as Step);
        const isDone = i < activeIndex;
        return (
          <div key={s.key} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${
                isActive ? "step-active scale-110" : isDone ? "step-done" : "step-pending"
              }`}
            >
              <span>{isDone ? "✓" : s.emoji}</span>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 h-1 mx-1 rounded-full transition-all duration-300 ${
                  isDone ? "bg-green-300" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("setup");
  const [setup, setSetup] = useState<GameSetup | null>(null);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (newSetup: GameSetup) => {
    setSetup(newSetup);
    setError(null);
    setStep("loading-story");

    try {
      const res = await fetch("/api/generate/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel: newSetup.gradeLevel,
          topic: newSetup.topic,
          sillinessLevel: newSetup.sillinessLevel,
        }),
      });

      if (!res.ok) throw new Error("Story generation failed");
      const data = await res.json() as StoryData & { error?: string };
      if (data.error) throw new Error(data.error);

      setStoryData(data);
      setStep("story");
    } catch (e) {
      setError("Oops! The story wizard had trouble. Please try again! 🧙‍♂️");
      setStep("setup");
    }
  };

  const handleStoryNext = async () => {
    if (!setup || !storyData) return;
    setError(null);
    setStep("loading-questions");

    try {
      const res = await fetch("/api/generate/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel: setup.gradeLevel,
          story: storyData.story,
          title: storyData.title,
          sillinessLevel: setup.sillinessLevel,
        }),
      });

      if (!res.ok) throw new Error("Questions generation failed");
      const data: QuestionsData = await res.json();
      if ((data as { error?: string }).error) throw new Error((data as { error?: string }).error);

      setQuestionsData(data);
      setStep("questions");
    } catch (e) {
      setError("Oops! Couldn't create questions. Please try again! 📝");
      setStep("story");
    }
  };

  const handleQuestionsNext = async () => {
    if (!setup || !storyData) return;
    setError(null);
    setStep("loading-game");

    try {
      const res = await fetch("/api/generate/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel: setup.gradeLevel,
          story: storyData.story,
          title: storyData.title,
        }),
      });

      if (!res.ok) throw new Error("Game generation failed");
      const data: GameData = await res.json();
      if ((data as { error?: string }).error) throw new Error((data as { error?: string }).error);

      setGameData(data);
      setStep("game");
    } catch (e) {
      setError("Oops! Couldn't build the game. Please try again! 🎮");
      setStep("questions");
    }
  };

  const handlePlayAgain = () => {
    setStep("setup");
    setSetup(null);
    setStoryData(null);
    setQuestionsData(null);
    setGameData(null);
    setError(null);
  };

  const showStepIndicator = !["setup", "loading-story"].includes(step);

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {showStepIndicator && <StepIndicator step={step} />}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {step === "setup" && <SetupForm onStart={handleStart} />}

        {(step === "loading-story" ||
          step === "loading-questions" ||
          step === "loading-game") && (
          <LoadingSpinner messages={LOADING_MESSAGES[step]} />
        )}

        {step === "story" && storyData && setup && (
          <StoryDisplay story={storyData} setup={setup} onNext={handleStoryNext} />
        )}

        {step === "questions" && questionsData && (
          <QuestionsSection data={questionsData} onNext={handleQuestionsNext} />
        )}

        {step === "game" && gameData && setup && (
          <GameSection data={gameData} setup={setup} onPlayAgain={handlePlayAgain} />
        )}
      </div>
    </main>
  );
}
