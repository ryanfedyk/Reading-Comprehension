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
    <div className="max-w-xl mx-auto space-y-5 animate-slide-up relative z-10">
      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
          Grade {setup.gradeLevel}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-slate-400 text-xs">
          {setup.topic}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-slate-400 text-xs">
          Tone {setup.sillinessLevel}/5
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">
          {story.title}
        </h1>
        <p className="text-slate-500 text-xs mt-1">{story.readingLevel}</p>
      </div>

      {/* Illustration */}
      <div className="card overflow-hidden">
        <div
          className="story-illustration w-full flex items-center justify-center p-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)",
            minHeight: "200px",
          }}
          dangerouslySetInnerHTML={{ __html: story.svg }}
        />
      </div>

      {/* Story */}
      <div className="card p-6">
        <div className="space-y-4">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-slate-300 leading-relaxed text-[15px]"
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={onNext} className="btn-primary w-full py-4 text-sm font-semibold">
        Answer Comprehension Questions →
      </button>
    </div>
  );
}
