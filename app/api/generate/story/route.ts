import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GRADE_CONFIGS, SILLINESS_DESCRIPTIONS, extractJSON } from "@/lib/promptHelpers";
import { createAnthropicClient } from "@/lib/anthropic";

const IMAGE_STYLES: Record<string, string> = {
  "K-1": "soft watercolor children's book illustration, gentle and whimsical",
  "2-3": "colorful digital children's book illustration, vibrant and playful",
  "4-5": "detailed editorial children's illustration, dynamic and expressive",
  "6-8": "polished editorial illustration, cinematic lighting, rich colors",
};

export async function POST(req: NextRequest) {
  try {
    const client = createAnthropicClient();
    const { gradeLevel, topic, sillinessLevel } = await req.json();
    const config = GRADE_CONFIGS[gradeLevel];
    const sillinessDesc = SILLINESS_DESCRIPTIONS[sillinessLevel];

    const prompt = `You are a children's story generator. Create an engaging, age-appropriate story.

Grade Level: ${gradeLevel} grade
Topic/Theme: ${topic}
Story Length: ${config.wordCount} words
Sentence Style: ${config.sentenceComplexity}
Vocabulary: ${config.vocabulary}
Silliness: ${sillinessDesc}

Return ONLY this JSON object:
{
  "title": "A compelling story title",
  "story": "The complete story text (${config.wordCount} words). Use paragraph breaks. Engaging and perfectly matched to the grade level.",
  "imagePrompt": "A concise 1-2 sentence description of the key scene to illustrate. Describe characters, setting, action, mood. No text in image. Child-appropriate.",
  "readingLevel": "One sentence describing the reading level."
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const storyData = extractJSON(responseText) as {
      title: string;
      story: string;
      imagePrompt: string;
      readingLevel: string;
    };

    if (!storyData.title || !storyData.story) {
      throw new Error("Incomplete story response from AI");
    }

    // Generate image with DALL-E 3 in parallel if API key is available
    let imageUrl: string | undefined;
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const styleDesc = IMAGE_STYLES[gradeLevel] ?? IMAGE_STYLES["4-5"];
        const fullPrompt = `${styleDesc}. ${storyData.imagePrompt} No text, letters, or words in the image. Safe for children.`;

        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: fullPrompt,
          size: "1792x1024",
          quality: "standard",
          n: 1,
        });
        imageUrl = imageResponse.data?.[0]?.url;
      } catch (imgErr) {
        console.error("Image generation error (non-fatal):", imgErr);
      }
    }

    return NextResponse.json({
      title: storyData.title,
      story: storyData.story,
      readingLevel: storyData.readingLevel,
      imageUrl,
    });
  } catch (err) {
    console.error("Story generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate story. Please try again." },
      { status: 500 }
    );
  }
}
