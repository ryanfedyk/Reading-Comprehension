import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GRADE_CONFIGS, SILLINESS_DESCRIPTIONS, extractJSON } from "@/lib/promptHelpers";
import { createAnthropicClient } from "@/lib/anthropic";

const IMAGE_STYLES: Record<string, string> = {
  "K-1": "soft watercolor children's book illustration, gentle and whimsical, pastel colors",
  "2-3": "colorful digital children's book illustration, vibrant and playful, bright colors",
  "4-5": "detailed editorial children's illustration, dynamic and expressive, rich colors",
  "6-8": "polished editorial illustration, cinematic lighting, dramatic and vivid",
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
  "imagePrompt": "A vivid 1-2 sentence description of the key scene to illustrate. Describe characters, setting, and action clearly. No text or words in the image. Child-appropriate.",
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

    // Generate image with Imagen 3
    let imageUrl: string | undefined;
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const styleDesc = IMAGE_STYLES[gradeLevel] ?? IMAGE_STYLES["4-5"];
        const fullPrompt = `${styleDesc}. ${storyData.imagePrompt} No text, letters, or words anywhere in the image. Safe and appropriate for children.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-preview-image-generation",
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          config: { responseModalities: ["IMAGE"] },
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imgErr) {
        console.error("Imagen 3 error (non-fatal):", imgErr);
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
