"use client";

import { useState } from "react";
import type { FillBlankGameData } from "@/lib/types";

interface Props {
  data: FillBlankGameData;
}

export default function FillBlankGame({ data }: Props) {
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(data.sentences.length).fill(null)
  );
  const [revealed, setRevealed] = useState<boolean[]>(
    Array(data.sentences.length).fill(false)
  );

  const handleSelect = (sentenceIdx: number, option: string) => {
    if (revealed[sentenceIdx]) return;
    const newAnswers = [...answers];
    newAnswers[sentenceIdx] = option;
    setAnswers(newAnswers);

    const newRevealed = [...revealed];
    newRevealed[sentenceIdx] = true;
    setRevealed(newRevealed);
  };

  const correctCount = answers.filter(
    (a, i) => a === data.sentences[i]?.answer
  ).length;
  const allDone = revealed.every(Boolean);

  const renderSentence = (text: string, answer: string | null, isRevealed: boolean) => {
    const parts = text.split("___");
    return (
      <span className="text-gray-700 text-lg leading-relaxed">
        {parts[0]}
        <span
          className={`inline-block min-w-[80px] border-b-4 text-center px-2 mx-1 font-bold transition-all duration-300 ${
            isRevealed
              ? "border-green-400 text-green-600 bg-green-50 rounded px-3"
              : answer
              ? "border-purple-400 text-purple-600"
              : "border-gray-300 text-gray-300"
          }`}
        >
          {isRevealed && answer ? answer : answer || "___"}
        </span>
        {parts[1]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-500 text-sm">{data.instructions}</p>
        <p className="text-gray-400 text-xs mt-1">
          Choose the word that best fits each blank
        </p>
      </div>

      <div className="space-y-5">
        {data.sentences.map((sentence, i) => {
          const userAnswer = answers[i];
          const isCorrect = userAnswer === sentence.answer;

          return (
            <div
              key={i}
              className={`bg-white rounded-2xl p-5 shadow transition-all duration-300 ${
                revealed[i]
                  ? isCorrect
                    ? "border-2 border-green-200"
                    : "border-2 border-orange-200"
                  : "border-2 border-gray-100"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-purple-100 text-purple-600 font-bold text-sm px-2.5 py-0.5 rounded-full shrink-0 mt-1">
                  {i + 1}
                </span>
                <div>
                  {renderSentence(sentence.text, userAnswer, revealed[i])}
                </div>
              </div>

              {!revealed[i] && (
                <div className="flex flex-wrap gap-2 ml-8">
                  {sentence.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(i, opt)}
                      className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 hover:scale-105 transition-all duration-150 border-2 border-purple-100"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {revealed[i] && (
                <div className={`ml-8 text-sm font-medium ${isCorrect ? "text-green-600" : "text-orange-500"}`}>
                  {isCorrect ? "✅ Correct!" : `❌ The answer was: ${sentence.answer}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
          <div className="text-5xl mb-2">
            {correctCount === data.sentences.length ? "🏆" : "🎉"}
          </div>
          <p className="font-display text-2xl text-purple-600">
            {correctCount} out of {data.sentences.length} correct!
          </p>
          {correctCount === data.sentences.length && (
            <p className="text-purple-400 mt-1">Perfect score! Amazing!</p>
          )}
        </div>
      )}
    </div>
  );
}
