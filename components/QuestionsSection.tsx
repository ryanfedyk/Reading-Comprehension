"use client";

import { useState } from "react";
import type { QuestionsData, Question } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

function QuestionCard({
  question,
  index,
  total,
  onAnswer,
}: {
  question: Question;
  index: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    onAnswer(opt === question.correctAnswer);
  };

  const getStyle = (opt: string) => {
    if (!answered) return "answer-option";
    if (opt === question.correctAnswer) return "answer-option correct";
    if (opt === selected) return "answer-option incorrect selected-wrong";
    return "answer-option opacity-40";
  };

  const getIcon = (opt: string) => {
    if (!answered) return null;
    if (opt === question.correctAnswer) return (
      <span className="text-success text-sm ml-auto shrink-0">✓</span>
    );
    if (opt === selected) return (
      <span className="text-danger text-sm ml-auto shrink-0">✗</span>
    );
    return null;
  };

  return (
    <div className="card p-5 space-y-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 border border-accent/25 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <p className="text-white font-medium text-[15px] leading-snug">{question.question}</p>
      </div>

      <div className="space-y-2 pl-9">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(opt)}
            disabled={answered}
            className={getStyle(opt)}
          >
            <span className="w-5 h-5 rounded-md bg-white/6 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
              {LETTERS[i]}
            </span>
            <span className="text-sm flex-1">{opt}</span>
            {getIcon(opt)}
          </button>
        ))}
      </div>

      {answered && (
        <div
          className={`ml-9 text-xs p-3 rounded-lg border animate-fade-in ${
            selected === question.correctAnswer
              ? "bg-success/8 border-success/20 text-emerald-300"
              : "bg-accent/6 border-accent/15 text-slate-300"
          }`}
        >
          {question.explanation}
        </div>
      )}
    </div>
  );
}

export default function QuestionsSection({ data, onNext }: { data: QuestionsData; onNext: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<boolean[]>([]);

  const total = data.questions.length;
  const allDone = scores.length === total;
  const correctCount = scores.filter(Boolean).length;

  const handleAnswer = (correct: boolean) => {
    const newScores = [...scores, correct];
    setScores(newScores);
    if (currentIdx < total - 1) {
      setTimeout(() => setCurrentIdx(currentIdx + 1), 1000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Comprehension</h2>
        <div className="flex items-center gap-2">
          {data.questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i < scores.length
                  ? scores[i] ? "bg-success w-6" : "bg-danger w-6"
                  : i === currentIdx ? "bg-accent w-6" : "bg-white/10 w-4"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {data.questions.map((q, i) => (
          <div
            key={i}
            className={`transition-all duration-500 ${
              i <= currentIdx ? "opacity-100" : "opacity-0 h-0 overflow-hidden pointer-events-none"
            }`}
          >
            <QuestionCard
              question={q}
              index={i}
              total={total}
              onAnswer={handleAnswer}
            />
          </div>
        ))}
      </div>

      {/* Score */}
      {allDone && (
        <div className="card p-6 text-center animate-slide-up">
          <div className="text-4xl font-display font-bold mb-1">
            <span className="gradient-text">{correctCount}/{total}</span>
          </div>
          <p className="text-slate-400 text-sm mb-5">
            {correctCount === total
              ? "Perfect score — outstanding!"
              : correctCount >= total - 1
              ? "Almost perfect — great reading!"
              : "Good effort — keep practicing!"}
          </p>
          <button onClick={onNext} className="btn-primary w-full py-3.5 text-sm font-semibold">
            Play the Word Game →
          </button>
        </div>
      )}
    </div>
  );
}
