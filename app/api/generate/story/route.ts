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

async function generateImageWithPollinations(prompt: string): Promise<string | undefined> {
  const encoded = encodeURIComponent(prompt.slice(0, 500));
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=896&height=512&nologo=true&model=flux&safe=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const mime = res.headers.get("content-type") ?? "image/jpeg";
  return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  try {
    const client = createAnthropicClient();
    const { gradeLevel, topic, sillinessLevel } = await req.json();
    const config = GRADE_CONFIGS[gradeLevel];
    const sillinessDesc = SILLINESS_DESCRIPTIONS[sillinessLevel];

    const SETTINGS = ["underwater city","floating sky island","ancient forest","bustling marketplace","snowy mountain peak","underground cavern","futuristic space station","hidden garden","stormy coastline","enchanted library"];
    const TWISTS = ["a case of mistaken identity","an unexpected friendship","a secret hidden in plain sight","a plan that goes hilariously wrong","a surprising talent discovered","help from an unlikely stranger","a race against time","everything turning out backwards","a wish with unintended consequences","trading places with someone else"];
    const MOODS = ["hopeful and determined","nervous but brave","grumpy then grateful","curious and a little reckless","reluctant hero","overconfident then humbled","quietly clever","enthusiastically chaotic"];
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const seed = `[Unique story seed: setting=${pick(SETTINGS)}, twist=${pick(TWISTS)}, protagonist mood=${pick(MOODS)}, nonce=${Math.random().toString(36).slice(2, 8)}]`;

    const prompt = `You are a children's story generator. Create an engaging, age-appropriate story.

Grade Level: ${gradeLevel} grade
Topic/Theme: ${topic}
Story Length: ${config.wordCount} words
Sentence Style: ${config.sentenceComplexity}
Vocabulary: ${config.vocabulary}
Silliness: ${sillinessDesc}
${seed}

Incorporate the seed elements naturally — they are constraints to make this story unique, not a formula to state literally.

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

    const styleDesc = IMAGE_STYLES[gradeLevel] ?? IMAGE_STYLES["4-5"];
    const imgPrompt = `${styleDesc}. ${storyData.imagePrompt} No text, letters, or words anywhere in the image. Safe and appropriate for children.`;
    let imageUrl: string | undefined;

    // Strategy 1: Imagen 4 via Google AI (requires paid plan)
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateImages({
          model: "imagen-4.0-generate-001",
          prompt: imgPrompt,
          config: { numberOfImages: 1 },
        });
        const imgBytes = response.generatedImages?.[0]?.image?.imageBytes;
        const imgMime = response.generatedImages?.[0]?.image?.mimeType ?? "image/png";
        if (imgBytes) imageUrl = `data:${imgMime};base64,${imgBytes}`;
      } catch (e1) {
        console.warn("[img] Imagen 4 unavailable:", (e1 as Error).message?.slice(0, 80));
      }
    }

    // Strategy 2: Pollinations.ai (free, no key required)
    if (!imageUrl) {
      try {
        imageUrl = await generateImageWithPollinations(imgPrompt);
      } catch (e2) {
        console.error("[img] Pollinations failed:", (e2 as Error).message);
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
