import { NextRequest, NextResponse } from "next/server";
import { GRADE_CONFIGS, SILLINESS_DESCRIPTIONS, extractJSON } from "@/lib/promptHelpers";
import { createAnthropicClient } from "@/lib/anthropic";
import type { QuestionsData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const client = createAnthropicClient();
    const { gradeLevel, story, title, sillinessLevel } = await req.json();
    const config = GRADE_CONFIGS[gradeLevel];
    const sillinessDesc = SILLINESS_DESCRIPTIONS[sillinessLevel];

    const prompt = `You are a reading comprehension teacher for ${gradeLevel} grade students.

Story Title: "${title}"
Story Text:
${story}

Grade Level: ${gradeLevel}
Question Style: ${config.questionStyle}
Number of Options per Question: ${config.numOptions}
Tone: ${sillinessDesc}

Create exactly 3 multiple-choice reading comprehension questions. Questions should:
1. Test literal comprehension (what happened in the story)
2. Test inference or character motivation (why or how)
3. Test vocabulary or theme appropriate to ${gradeLevel} grade

Each question must have exactly ${config.numOptions} answer choices. Make wrong answers plausible but clearly wrong.

Return ONLY this JSON object:
{
  "questions": [
    {
      "question": "The question text?",
      "type": "multiple_choice",
      "options": ["Option A text", "Option B text", "Option C text"${config.numOptions === 4 ? ', "Option D text"' : ""}],
      "correctAnswer": "The exact text of the correct option",
      "explanation": "A brief, encouraging explanation of why this is correct (1-2 sentences, appropriate for ${gradeLevel} grade)"
    }
  ]
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const data = extractJSON(responseText) as QuestionsData;

    if (!data.questions || data.questions.length !== 3) {
      throw new Error("Invalid questions response from AI");
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Questions generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
