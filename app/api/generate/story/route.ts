import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GRADE_CONFIGS, SILLINESS_DESCRIPTIONS, extractJSON } from "@/lib/promptHelpers";
import type { StoryData } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { gradeLevel, topic, sillinessLevel } = await req.json();
    const config = GRADE_CONFIGS[gradeLevel];
    const sillinessDesc = SILLINESS_DESCRIPTIONS[sillinessLevel];

    const prompt = `You are a children's story generator. Create a story and SVG illustration for children.

Grade Level: ${gradeLevel} grade
Topic/Theme: ${topic}
Story Length: ${config.wordCount} words
Sentence Style: ${config.sentenceComplexity}
Vocabulary: ${config.vocabulary}
Silliness: ${sillinessDesc}

Generate a complete response as a JSON object with these exact fields:
{
  "title": "A fun, engaging story title related to ${topic}",
  "story": "The complete story text (${config.wordCount} words). Use paragraphs. Make it engaging and perfectly matched to the grade level.",
  "svg": "A complete SVG illustration string (viewBox='0 0 400 300'). Requirements: use ONLY rect, circle, ellipse, polygon, path, and text elements. NO filters, NO clipPath, NO masks, NO external images, NO JavaScript, NO use elements. Use bright cheerful colors. Draw a scene from the story showing the main character and setting. The SVG must start with <svg and end with </svg>.",
  "readingLevel": "A brief 1-sentence description of the reading level (e.g., 'Beginning reader with simple sight words')"
}

Return ONLY the JSON object, no other text. Make the SVG colorful and child-friendly with simple shapes representing the story scene.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const data = extractJSON(responseText) as StoryData;

    if (!data.title || !data.story || !data.svg) {
      throw new Error("Incomplete response from AI");
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Story generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate story. Please try again." },
      { status: 500 }
    );
  }
}
