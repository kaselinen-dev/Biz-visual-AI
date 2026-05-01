import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function editBusinessImage(
  imageBase64: string,
  mimeType: string,
  editPrompt: string
): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `You are a professional designer specialized in business presentations. 
            Edit this image based on the following instruction: "${editPrompt}". 
            Ensure the result is high-quality, professional, and reliable. 
            Avoid any "unprofessional" filters; focus on clarity, professional lighting, and corporate aesthetics.`,
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) return null;

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateProfessionalImage(
  prompt: string
): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a professional, high-quality business image for a presentation slide: ${prompt || "Professional executive business background, high-end corporate style"}. 
            Style: Photorealistic, clean, minimalist, corporate. Highly reliable and trustworthy looking.`,
          },
        ],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) return null;

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
