export interface GameSetup {
  ageRange: string;
  gradeLevel: string;
  gradeLevelDescription: string;
  topic: string;
  sillinessLevel: number;
}

export interface StoryData {
  title: string;
  story: string;
  imageUrl?: string;
  readingLevel: string;
}

export interface Question {
  question: string;
  type: "multiple_choice";
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuestionsData {
  questions: Question[];
}

export interface FillBlankSentence {
  text: string;
  answer: string;
  options: string[];
}

export interface WordMatchPair {
  word: string;
  definition: string;
}

export interface WordSearchGameData {
  gameType: "word_search";
  title: string;
  instructions: string;
  words: string[];
}

export interface FillBlankGameData {
  gameType: "fill_blank";
  title: string;
  instructions: string;
  sentences: FillBlankSentence[];
}

export interface WordMatchGameData {
  gameType: "word_match";
  title: string;
  instructions: string;
  pairs: WordMatchPair[];
}

export interface SequenceGameData {
  gameType: "sequence";
  title: string;
  instructions: string;
  events: string[];
}

export interface TrueFalseStatement {
  statement: string;
  answer: boolean;
  explanation: string;
}

export interface TrueFalseGameData {
  gameType: "true_false";
  title: string;
  instructions: string;
  statements: TrueFalseStatement[];
}

export interface ScrambleSentence {
  words: string[];
}

export interface SentenceScrambleGameData {
  gameType: "sentence_scramble";
  title: string;
  instructions: string;
  sentences: ScrambleSentence[];
}

export type GameData =
  | WordSearchGameData
  | FillBlankGameData
  | WordMatchGameData
  | SequenceGameData
  | TrueFalseGameData
  | SentenceScrambleGameData;

export interface WordPlacement {
  word: string;
  cells: [number, number][];
}

export interface WordSearchGrid {
  grid: string[][];
  placements: WordPlacement[];
}
