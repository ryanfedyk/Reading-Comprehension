"use client";

import { useState, useRef } from "react";
import SetupForm from "@/components/SetupForm";
import StoryDisplay from "@/components/StoryDisplay";
import QuestionsSection from "@/components/QuestionsSection";
import GameSection from "@/components/GameSection";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { GameSetup, StoryData, QuestionsData, GameData } from "@/lib/types";

type Step = "setup" | "loading-story" | "story" | "loading-questions" | "questions" | "loading-game" | "game";

const LOADING_MESSAGES: Record<string, string[]> = {
  "loading-story": [
    "Generating your story…",
    "Crafting the narrative…",
    "Creating your illustration…",
    "Painting the scene…",
    "Almost ready…",
  ],
  "loading-questions": [
    "Finalizing your questions…",
    "Almost there…",
  ],
  "loading-game": [
    "Building your game…",
    "Hiding the words…",
    "Almost there…",
  ],
};

const STEPS = [
  { key: "story", label: "Story" },
  { key: "questions", label: "Questions" },
  { key: "game", label: "Game" },
];

function StepBar({ step }: { step: Step }) {
  const loadingMap: Record<string, string> = {
    "loading-story": "story",
    "loading-questions": "questions",
    "loading-game": "game",
  };
  const activeKey = loadingMap[step] ?? step;
  const activeIdx = STEPS.findIndex((s) => s.key === activeKey);

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {STEPS.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                done ? "bg-success/15 border border-success/30 text-emerald-400"
                : active ? "bg-accent/15 border border-accent/40 text-accent-light"
                : "bg-white/4 border border-white/8 text-slate-600"
              }`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium transition-colors duration-300 ${
                done ? "text-emerald-500" : active ? "text-slate-200" : "text-slate-600"
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px transition-colors duration-500 ${done ? "bg-success/30" : "bg-white/8"}`} />
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
  const [questionsReady, setQuestionsReady] = useState(false);

  // Holds the in-flight questions fetch so we can await it when the user is done reading
  const questionsFetchRef = useRef<Promise<QuestionsData | null> | null>(null);

  const prefetchQuestions = (story: StoryData, s: GameSetup) => {
    setQuestionsReady(false);
    const promise = fetch("/api/generate/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gradeLevel: s.gradeLevel,
        story: story.story,
        title: story.title,
        sillinessLevel: s.sillinessLevel,
      }),
    })
      .then((res) => res.json())
      .then((data: QuestionsData & { error?: string }) => {
        if (data.error) throw new Error(data.error);
        setQuestionsData(data);
        setQuestionsReady(true);
        return data as QuestionsData;
      })
      .catch(() => null);

    questionsFetchRef.current = promise;
    return promise;
  };

  const handleStart = async (newSetup: GameSetup) => {
    setSetup(newSetup);
    setError(null);
    setQuestionsReady(false);
    questionsFetchRef.current = null;
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
      const data = await res.json() as StoryData & { error?: string };
      if (data.error) throw new Error(data.error);

      setStoryData(data);
      setStep("story");

      // Start fetching questions in the background while user reads
      prefetchQuestions(data, newSetup);
    } catch {
      setError("Story generation failed. Check your API key and try again.");
      setStep("setup");
    }
  };

  const handleStoryNext = async () => {
    if (!setup || !storyData) return;
    setError(null);

    // If questions are already ready, go straight to them
    if (questionsData && questionsReady) {
      setStep("questions");
      return;
    }

    // Otherwise wait for the in-flight fetch to complete
    setStep("loading-questions");
    try {
      const data = questionsFetchRef.current ? await questionsFetchRef.current : null;
      if (data) {
        setQuestionsData(data);
        setStep("questions");
        return;
      }
      throw new Error("Questions unavailable");
    } catch {
      // Last resort: try a fresh fetch
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
        const data = await res.json() as QuestionsData & { error?: string };
        if (data.error) throw new Error(data.error);
        setQuestionsData(data);
        setStep("questions");
      } catch {
        setError("Failed to generate questions. Please try again.");
        setStep("story");
      }
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
      const data = await res.json() as GameData & { error?: string };
      if (data.error) throw new Error(data.error);
      setGameData(data);
      setStep("game");
    } catch {
      setError("Failed to generate game. Please try again.");
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
    setQuestionsReady(false);
    questionsFetchRef.current = null;
  };

  const showStepBar = !["setup", "loading-story"].includes(step);

  return (
    <main className="min-h-screen px-4 py-10 relative z-10">
      <div className="max-w-xl mx-auto">
        {showStepBar && <StepBar step={step} />}

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-danger/8 border border-danger/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {step === "setup" && <SetupForm onStart={handleStart} />}

        {(step === "loading-story" || step === "loading-questions" || step === "loading-game") && (
          <LoadingSpinner messages={LOADING_MESSAGES[step]} />
        )}

        {step === "story" && storyData && setup && (
          <StoryDisplay
            story={storyData}
            setup={setup}
            onNext={handleStoryNext}
            questionsReady={questionsReady}
          />
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
