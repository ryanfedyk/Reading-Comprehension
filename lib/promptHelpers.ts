export const GRADE_CONFIGS: Record<
  string,
  {
    wordCount: string;
    sentenceComplexity: string;
    vocabulary: string;
    questionStyle: string;
    numOptions: number;
  }
> = {
  "K-1": {
    wordCount: "100-150",
    sentenceComplexity: "very short, simple sentences (5-8 words each)",
    vocabulary: "basic sight words and simple common words",
    questionStyle: "very simple, literal questions about what happened",
    numOptions: 3,
  },
  "2-3": {
    wordCount: "200-250",
    sentenceComplexity: "short to medium sentences with some descriptive words",
    vocabulary: "grade 2-3 vocabulary with some new challenging words",
    questionStyle: "mostly literal with one simple inferential question",
    numOptions: 3,
  },
  "4-5": {
    wordCount: "300-350",
    sentenceComplexity: "varied sentence lengths with figurative language",
    vocabulary: "grade 4-5 vocabulary including some challenging words",
    questionStyle: "mix of literal, inferential, and vocabulary questions",
    numOptions: 4,
  },
  "6-8": {
    wordCount: "400-450",
    sentenceComplexity:
      "complex sentences with rich vocabulary and literary devices",
    vocabulary: "grade 6-8 vocabulary with context clues in the text",
    questionStyle:
      "analysis, inference, theme, and vocabulary in context questions",
    numOptions: 4,
  },
};

export const SILLINESS_DESCRIPTIONS: Record<number, string> = {
  1: "completely serious, realistic, and educational with no humor",
  2: "mostly serious with one or two light, gentle funny moments",
  3: "moderately silly with humorous situations and fun wordplay",
  4: "very silly with absurd, exaggerated, and hilarious scenarios",
  5: "maximum chaos — completely ridiculous, outrageous, wonderfully weird, and hilariously bonkers",
};

export function extractJSON(text: string): unknown {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlock) {
    return JSON.parse(codeBlock[1]);
  }
  const jsonMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  throw new Error("No JSON found in AI response");
}
