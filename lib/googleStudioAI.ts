import {
  GoogleGenAI,
  Content,
  GenerationConfig,
  GenerateContentResponse,
} from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_STUDIO_AI_API_KEY,
});

const config: GenerationConfig = {
  responseMimeType: "text/plain",
};

export const gemini_2_5_flash_preview_05_20 = async (contents: Content[]) => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      config,
      contents,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error; // Re-throw the error for further handling if needed
  }
};


export const gemini_2_5_pro_preview_05_06 = async (contents: Content[]) => {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro-preview-05-06",
        config,
        contents,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating content:", error);
      throw error; // Re-throw the error for further handling if needed
    }
  };
  