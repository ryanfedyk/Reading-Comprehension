"use client";

import { useState } from "react";
import type { QuestionsData, Question } from "@/lib/types";

interface Props {
  data: QuestionsData;
  onNext: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

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

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const correct = option === question.correctAnswer;
    onAnswer(correct);
  };

  const getOptionStyle = (option: string) => {
    if (!answered) {
      return "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
    }
    if (option === question.correctAnswer) {
      return "border-green-400 bg-green-50";
    }
    if (option === selected && option !== question.correctAnswer) {
      return "border-red-400 bg-red-50";
    }
    return "border-gray-100 bg-gray-50 opacity-60";
  };

  const getOptionIcon = (option: string) => {
    if (!answered) return null;
    if (option === question.correctAnswer) return "✅";
    if (option === selected) return "❌";
    return null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-full text-sm">
          Question {index + 1} of {total}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-5 leading-snug">
        {question.question}
      </h3>

      <div className="space-y-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            disabled={answered}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${getOptionStyle(option)}`}
          >
            <span className="font-bold text-gray-500 text-sm w-6 shrink-0">
              {OPTION_LETTERS[i]}
            </span>
            <span className="text-gray-700 flex-1">{option}</span>
            {getOptionIcon(option) && (
              <span className="text-xl shrink-0">{getOptionIcon(option)}</span>
            )}
          </button>
        ))}
      </div>

      {answered && (
        <div
          className={`mt-5 p-4 rounded-xl ${
            selected === question.correctAnswer
              ? "bg-green-50 border border-green-200"
              : "bg-orange-50 border border-orange-200"
          }`}
        >
          <p className="font-bold text-gray-700 mb-1">
            {selected === question.correctAnswer
              ? "🌟 Great job!"
              : "💡 Good try!"}
          </p>
          <p className="text-gray-600 text-sm">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default function QuestionsSection({ data, onNext }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<boolean[]>([]);
  const [allDone, setAllDone] = useState(false);

  const handleAnswer = (correct: boolean) => {
    const newScores = [...scores, correct];
    setScores(newScores);
    if (newScores.length === data.questions.length) {
      setAllDone(true);
    }
  };

  const correctCount = scores.filter(Boolean).length;
  const total = data.questions.length;

  const getScoreMessage = () => {
    if (correctCount === total) return { msg: "Perfect Score! You're a superstar! 🌟", color: "text-yellow-500" };
    if (correctCount >= total - 1) return { msg: "Amazing work! Almost perfect! 🎉", color: "text-green-500" };
    if (correctCount >= Math.floor(total / 2)) return { msg: "Good effort! Keep reading! 📚", color: "text-blue-500" };
    return { msg: "Nice try! Reading takes practice! 💪", color: "text-purple-500" };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="font-display text-3xl text-blue-600 mb-1">
          Reading Questions 🧠
        </h2>
        <p className="text-gray-400">Answer each question after reading the story</p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-3">
        {data.questions.map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < scores.length
                ? scores[i]
                  ? "bg-green-400 scale-110"
                  : "bg-red-400 scale-110"
                : i === currentIdx
                ? "bg-blue-400 scale-125"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Questions — show all with staggered reveal */}
      <div className="space-y-6">
        {data.questions.map((q, i) => (
          <div
            key={i}
            className={`transition-all duration-500 ${
              i <= currentIdx ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
            }`}
          >
            <QuestionCard
              question={q}
              index={i}
              total={total}
              onAnswer={(correct) => {
                handleAnswer(correct);
                if (i === currentIdx && i < total - 1) {
                  setTimeout(() => setCurrentIdx(i + 1), 1200);
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Score summary */}
      {allDone && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 text-center border-2 border-purple-100">
          <div className="text-5xl mb-3">
            {correctCount === total ? "🏆" : correctCount >= total - 1 ? "🎉" : "📚"}
          </div>
          <p className={`font-display text-2xl mb-1 ${getScoreMessage().color}`}>
            {getScoreMessage().msg}
          </p>
          <p className="text-gray-500 mb-4">
            You got <strong>{correctCount}</strong> out of <strong>{total}</strong> correct!
          </p>
          <button
            onClick={onNext}
            className="py-4 px-8 rounded-2xl font-display text-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
          >
            Play the Game! 🎮
          </button>
        </div>
      )}
    </div>
  );
}
