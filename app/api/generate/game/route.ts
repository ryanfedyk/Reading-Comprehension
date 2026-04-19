import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractJSON } from "@/lib/promptHelpers";
import type { GameData } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GAME_GUIDANCE: Record<string, string> = {
  "K-1": 'Use "word_match" — match simple story words to short descriptions. Use 6 pairs with very simple 1-2 word definitions appropriate for kindergarten/1st grade.',
  "2-3": 'Use "fill_blank" — fill in the blank with a word from the story. Create 5 sentences, each with 3 word choices (one correct, two plausible wrong answers). Blank is shown as ___.',
  "4-5": 'Use "word_search" — provide exactly 8 important words from the story, all uppercase, 4-8 letters each.',
  "6-8": 'Use "word_search" — provide exactly 10 important vocabulary or story words, all uppercase, 4-10 letters each.',
};

export async function POST(req: NextRequest) {
  try {
    const { gradeLevel, story, title } = await req.json();
    const guidance = GAME_GUIDANCE[gradeLevel];

    const prompt = `You are creating an educational game based on a children's story.

Story Title: "${title}"
Story:
${story}

Grade Level: ${gradeLevel}
Game Type Guidance: ${guidance}

Return ONLY one of these JSON formats based on the game type:

For word_search:
{
  "gameType": "word_search",
  "title": "Fun game title",
  "instructions": "Find all the hidden words from the story!",
  "words": ["WORD1", "WORD2", "WORD3", "WORD4", "WORD5", "WORD6", "WORD7", "WORD8"]
}

For fill_blank:
{
  "gameType": "fill_blank",
  "title": "Fun game title",
  "instructions": "Fill in the missing word!",
  "sentences": [
    {
      "text": "The brave ___ went on an adventure.",
      "answer": "hero",
      "options": ["hero", "villain", "dragon"]
    }
  ]
}

For word_match:
{
  "gameType": "word_match",
  "title": "Fun game title",
  "instructions": "Match each word to what it means!",
  "pairs": [
    { "word": "castle", "definition": "a big building for kings" }
  ]
}

Return ONLY the JSON, no other text.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
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
