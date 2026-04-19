"use client";

import type { StoryData, GameSetup } from "@/lib/types";

interface Props {
  story: StoryData;
  setup: GameSetup;
  onNext: () => void;
  questionsReady: boolean;
}

export default function StoryDisplay({ story, setup, onNext, questionsReady }: Props) {
  const paragraphs = story.story.split(/\n+/).filter((p) => p.trim());

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-slide-up relative z-10">
      {/* Meta chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
          Grade {setup.gradeLevel}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-slate-400 text-xs">
          {setup.topic}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-slate-400 text-xs">
          Tone {setup.sillinessLevel}/5
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">{story.title}</h1>
        <p className="text-slate-500 text-xs mt-1">{story.readingLevel}</p>
      </div>

      {/* Illustration */}
      {story.imageUrl && (
        <div className="card overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full object-cover"
            style={{ maxHeight: "320px" }}
          />
        </div>
      )}

      {/* Story text */}
      <div className="card p-6 space-y-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-slate-300 leading-relaxed text-[15px]">
            {para}
          </p>
        ))}
      </div>

      {/* CTA */}
      <button onClick={onNext} className="btn-primary w-full py-4 text-sm font-semibold flex items-center justify-center gap-2">
        {questionsReady ? (
          <>Answer Comprehension Questions →</>
        ) : (
          <>
            <span className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
            Preparing questions…
          </>
        )}
      </button>
    </div>
  );
}
