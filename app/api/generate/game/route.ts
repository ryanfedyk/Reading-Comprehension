import { NextRequest, NextResponse } from "next/server";
import { extractJSON } from "@/lib/promptHelpers";
import { createAnthropicClient } from "@/lib/anthropic";
import type { GameData } from "@/lib/types";

interface GameOption {
  type: string;
  guidance: string;
  format: string;
}

const GAME_POOL: Record<string, GameOption[]> = {
  "K-1": [
    {
      type: "word_match",
      guidance: "6 pairs. Each definition is 1-3 simple words a kindergartener knows.",
      format: `{
  "gameType": "word_match",
  "title": "Fun game title",
  "instructions": "Match each word to what it means!",
  "pairs": [{ "word": "castle", "definition": "home for a king" }]
}`,
    },
    {
      type: "sequence",
      guidance: "4 events from the story in correct order. Each event is one short simple sentence (5-10 words), very concrete and literal.",
      format: `{
  "gameType": "sequence",
  "title": "Fun game title",
  "instructions": "Click the events in the order they happened in the story!",
  "events": ["The dog found a bone.", "The dog ran home.", "The dog ate the bone.", "The dog fell asleep."]
}`,
    },
  ],
  "2-3": [
    {
      type: "fill_blank",
      guidance: "5 sentences from or about the story. Each has 3 word choices (1 correct, 2 plausible distractors). Blank shown as ___.",
      format: `{
  "gameType": "fill_blank",
  "title": "Fun game title",
  "instructions": "Fill in the missing word!",
  "sentences": [{ "text": "The brave ___ went on an adventure.", "answer": "hero", "options": ["hero", "villain", "dragon"] }]
}`,
    },
    {
      type: "true_false",
      guidance: "5 statements about the story — mix 3 true and 2 false. Keep language at 2nd-3rd grade level. Each explanation is one short sentence.",
      format: `{
  "gameType": "true_false",
  "title": "Fun game title",
  "instructions": "Is each statement true or false?",
  "statements": [{ "statement": "The hero found a golden key.", "answer": true, "explanation": "She found it under the oak tree." }]
}`,
    },
  ],
  "4-5": [
    {
      type: "word_search",
      guidance: "Exactly 8 important words from the story, all UPPERCASE, 4-8 letters each. No spaces.",
      format: `{
  "gameType": "word_search",
  "title": "Fun game title",
  "instructions": "Find all the hidden story words!",
  "words": ["BRAVE", "QUEST", "CASTLE", "DRAGON", "SHIELD", "FOREST", "MAGIC", "RIVER"]
}`,
    },
    {
      type: "sentence_scramble",
      guidance: "3 sentences taken directly from the story or closely paraphrased, 6-9 words each. Provide words in correct order — the game scrambles them.",
      format: `{
  "gameType": "sentence_scramble",
  "title": "Fun game title",
  "instructions": "Tap the words in the right order to rebuild the sentence!",
  "sentences": [{ "words": ["The", "knight", "rode", "bravely", "into", "the", "forest."] }]
}`,
    },
    {
      type: "true_false",
      guidance: "6 statements requiring some inference or detail recall — mix 3 true and 3 false. Explanations are one concise sentence each.",
      format: `{
  "gameType": "true_false",
  "title": "Fun game title",
  "instructions": "True or false — think carefully!",
  "statements": [{ "statement": "The hero trusted the stranger immediately.", "answer": false, "explanation": "She was suspicious at first and tested him." }]
}`,
    },
  ],
  "6-8": [
    {
      type: "word_search",
      guidance: "Exactly 10 vocabulary or key story words, all UPPERCASE, 4-10 letters each. No spaces.",
      format: `{
  "gameType": "word_search",
  "title": "Fun game title",
  "instructions": "Find all the hidden words!",
  "words": ["COURAGE", "DESOLATE", "MENTOR", "BETRAYAL", "RESOLVE", "ANCIENT", "PURSUIT", "FORESEE", "VALOR", "CUNNING"]
}`,
    },
    {
      type: "sentence_scramble",
      guidance: "4 sentences taken directly from the story, 8-12 words each, some with complex structure. Provide words in correct order.",
      format: `{
  "gameType": "sentence_scramble",
  "title": "Fun game title",
  "instructions": "Rebuild these sentences from the story!",
  "sentences": [{ "words": ["Despite", "her", "fear,", "she", "stepped", "forward", "into", "the", "unknown."] }]
}`,
    },
  ],
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export async function POST(req: NextRequest) {
  try {
    const client = createAnthropicClient();
    const { gradeLevel, story, title } = await req.json();

    const pool = GAME_POOL[gradeLevel] ?? GAME_POOL["4-5"];
    const game = pick(pool);

    const prompt = `You are creating an educational game based on a children's story.

Story Title: "${title}"
Story:
${story}

Grade Level: ${gradeLevel}
Game Type: ${game.type}
Instructions: ${game.guidance}

Return ONLY this JSON (no other text):
${game.format}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const data = extractJSON(responseText) as GameData;

    if (!data.gameType || !data.title) {
      throw new Error("Invalid game response from AI");
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Game generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate game. Please try again." },
      { status: 500 }
    );
  }
}
