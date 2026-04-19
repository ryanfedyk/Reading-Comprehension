"use client";

import { useState } from "react";
import type { GameSetup } from "@/lib/types";

const GRADES = [
  { id: "K-1", label: "K – 1", sub: "Ages 5–7", desc: "Beginning reader" },
  { id: "2-3", label: "2 – 3", sub: "Ages 7–9", desc: "Growing reader" },
  { id: "4-5", label: "4 – 5", sub: "Ages 9–11", desc: "Confident reader" },
  { id: "6-8", label: "6 – 8", sub: "Ages 11–14", desc: "Advanced reader" },
];

const GRADE_DESCRIPTIONS: Record<string, string> = {
  "K-1": "Simple sentences & sight words",
  "2-3": "Short paragraphs & growing vocabulary",
  "4-5": "Rich language & complex ideas",
  "6-8": "Advanced vocabulary & deep themes",
};

const SILLINESS: Record<number, { label: string; desc: string }> = {
  1: { label: "Serious", desc: "Grounded, realistic storytelling" },
  2: { label: "Light", desc: "A few gentle funny moments" },
  3: { label: "Playful", desc: "Humor woven throughout" },
  4: { label: "Silly", desc: "Absurd and hilarious" },
  5: { label: "Chaos", desc: "Completely wonderfully bonkers" },
};

const SUGGESTIONS = [
  "Harry Potter", "Warrior Cats", "Percy Jackson", "Minecraft",
  "Dinosaurs", "Space explorers", "Superheroes", "Ocean adventure",
];

export default function SetupForm({ onStart }: { onStart: (s: GameSetup) => void }) {
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [silliness, setSilliness] = useState(3);

  const ready = grade && topic.trim().length > 0;

  const handleSubmit = () => {
    if (!ready) return;
    const g = GRADES.find((r) => r.id === grade)!;
    onStart({
      ageRange: g.label,
      gradeLevel: grade,
      gradeLevelDescription: GRADE_DESCRIPTIONS[grade],
      topic: topic.trim(),
      sillinessLevel: silliness,
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-slide-up relative z-10">
      {/* Hero */}
      <div className="text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-glow-pulse" />
          AI-Powered Reading
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
          Reading <span className="gradient-text">Adventure</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Personalized stories, questions & games — made just for you.
        </p>
      </div>

      {/* Grade selector */}
      <div className="card p-5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Grade Level
        </label>
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.id}
              onClick={() => setGrade(g.id)}
              className={`relative p-3 rounded-xl border text-center transition-all duration-200 ${
                grade === g.id
                  ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  : "border-white/6 bg-white/2 hover:border-accent/30 hover:bg-accent/5"
              }`}
            >
              {grade === g.id && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
              <div className={`font-display font-bold text-sm mb-0.5 ${grade === g.id ? "text-accent-light" : "text-white"}`}>
                {g.label}
              </div>
              <div className="text-[10px] text-slate-500">{g.sub}</div>
            </button>
          ))}
        </div>
        {grade && (
          <p className="mt-3 text-xs text-slate-500 animate-fade-in">
            {GRADE_DESCRIPTIONS[grade]}
          </p>
        )}
      </div>

      {/* Topic input */}
      <div className="card p-5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Topic or Theme
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ready && handleSubmit()}
          placeholder="e.g. Harry Potter, Minecraft, Dinosaurs…"
          maxLength={60}
          className="input-field w-full px-4 py-3 text-sm"
        />
        <div className="flex flex-wrap gap-1.5 mt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                topic === s
                  ? "bg-accent/20 text-accent-light border border-accent/40"
                  : "bg-white/4 text-slate-400 border border-white/6 hover:border-accent/30 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tone / Silliness */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Tone
          </label>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
              silliness <= 2 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              silliness === 3 ? "bg-accent/10 text-accent-light border border-accent/20" :
              "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              {SILLINESS[silliness].label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-14 text-right shrink-0">Serious</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min={1}
              max={5}
              value={silliness}
              onChange={(e) => setSilliness(Number(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #6366F1 0%, #8B5CF6 ${((silliness - 1) / 4) * 100}%, rgba(255,255,255,0.08) ${((silliness - 1) / 4) * 100}%, rgba(255,255,255,0.08) 100%)`,
              }}
            />
          </div>
          <span className="text-xs text-slate-500 w-14 shrink-0">Chaos</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">{SILLINESS[silliness].desc}</p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!ready}
        className="btn-primary w-full py-4 text-sm font-semibold"
      >
        {ready ? "Generate My Story →" : "Select grade & topic to continue"}
      </button>
    </div>
  );
}
