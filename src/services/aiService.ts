// src/services/aiService.ts
import OpenAI from "openai";
import { logger } from "../utils/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PresentationSlide {
  title: string;
  content: string[];
}

export interface PresentationData {
  title: string;
  slides: PresentationSlide[];
}

/**
 * Generate presentation content using AI
 */
export async function generatePresentation(
  topic: string,
  pages: number,
  language: string
): Promise<PresentationData | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.error("OPENAI_API_KEY is not set in environment variables");
      return null;
    }

    const languageMap: Record<string, string> = {
      uzbek: "o'zbek",
      rus: "rus",
      ingliz: "ingliz",
      nemis: "nemis",
      fransuz: "fransuz",
    };

    const targetLanguage = languageMap[language.toLowerCase()] || "o'zbek";

    const prompt = `Siz talabalar uchun taqdimot yaratish yordamchisisiz. Quyidagi mavzu bo'yicha professional taqdimot tayyorlang.

Mavzu: ${topic}
Til: ${targetLanguage}
Slaydlar soni: ${pages}

Quyidagi formatda javob bering (JSON formatida):
{
  "title": "Taqdimot sarlavhasi",
  "slides": [
    {
      "title": "Slayd sarlavhasi",
      "content": ["Birinchi punkt", "Ikkinchi punkt", "Uchinchi punkt"]
    }
  ]
}

Taqdimot ${pages} ta slayddan iborat bo'lsin. Har bir slaydda 3-5 ta asosiy punkt bo'lsin. 
Mazmuni ${targetLanguage} tilida, ilmiy va professional bo'lsin.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Siz professional taqdimot yaratish yordamchisisiz. Faqat JSON formatida javob bering.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      logger.error("AI service returned empty response");
      return null;
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const presentationData: PresentationData = JSON.parse(jsonText);
    
    logger.info("Presentation generated successfully", { topic, slidesCount: presentationData.slides.length });
    return presentationData;
  } catch (error: any) {
    logger.error("Error generating presentation", error);
    return null;
  }
}

/**
 * Generate text content for a specific topic (for reports/essays)
 */
export async function generateTextContent(topic: string, type: "referat" | "mustaqil_ish" = "referat"): Promise<string | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      logger.error("OPENAI_API_KEY is not set in environment variables");
      return null;
    }

    const typeName = type === "referat" ? "referat" : "mustaqil ish";
    const prompt = `Quyidagi mavzu bo'yicha ${typeName} yozing:

Mavzu: ${topic}

Referat quyidagi qismlardan iborat bo'lsin:
1. Kirish
2. Asosiy qism (2-3 bo'lim)
3. Xulosa

Har bir bo'lim batafsil va ilmiy bo'lsin. O'zbek tilida yozing.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Siz professional ${typeName} yozish yordamchisisiz.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (content) {
      logger.info(`${typeName} generated successfully`, { topic });
    }
    
    return content || null;
  } catch (error: any) {
    logger.error(`Error generating ${type}`, error);
    return null;
  }
}

