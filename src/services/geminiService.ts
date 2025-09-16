import { GoogleGenAI, Modality } from "@google/genai";
import { MODEL_NAME } from '../constants';
import type { EditResult } from '../types';

const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  throw new Error("VITE_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey });

const dataUrlToParts = (dataUrl: string): { base64Data: string; mimeType: string } | null => {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64Data: match[2] };
};

export const editImage = async (
  imageDataUrl: string,
  prompt: string
): Promise<EditResult> => {
  const imageParts = dataUrlToParts(imageDataUrl);
  if (!imageParts) {
    throw new Error("Invalid image data URL format.");
  }

  const { base64Data, mimeType } = imageParts;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const result: EditResult = { image: null, text: null };

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const { data, mimeType } = part.inlineData;
          result.image = `data:${mimeType};base64,${data}`;
        }
        if (part.text) {
          result.text = part.text;
        }
      }
    }

    if (!result.image) {
      throw new Error("API did not return an image. It might have been blocked.");
    }
    
    return result;

  } catch (error) {
    console.error("Error editing image with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to edit image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while editing the image.");
  }
};
