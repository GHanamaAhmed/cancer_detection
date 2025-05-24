import { gemini_2_5_pro_preview_05_06 } from "@/lib/googleStudioAI";
import { Content } from "@google/genai";
import { RiskLevel, LesionType } from "@prisma/client"; // Import enums from Prisma

// Function to analyze the image with Gemini
export async function analyzeImageWithGemini(
  imageUrl: string,
  bodyLocation: string,
  lesionSize?: string,
  notes?: string
) {
  try {
    // Prepare image for Gemini (convert to base64 if needed)
    // For simplicity, assuming imageUrl is already accessible to Gemini
    // In practice, you might need to convert or download the image

    // Create prompt for Gemini
    const prompt: Content[] = [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this skin lesion image and provide a dermatological assessment. 
              Body location: ${bodyLocation || "Unknown"} 
              Size: ${lesionSize || "Unknown"} 
              Patient notes: ${notes || "None"}
              
              Format your response as a structured JSON with these fields:
              1. lesionType (must be one of: NEVUS, MELANOMA, BASAL_CELL_CARCINOMA, SQUAMOUS_CELL_CARCINOMA, ACTINIC_KERATOSIS, SEBORRHEIC_KERATOSIS, OTHER)
              2. riskLevel (must be one of: LOW, MEDIUM, HIGH, SEVERE)
              3. confidence (a number between 0-100)
              4. observations (detailed clinical observations)
              5. recommendations (medical advice for the patient)`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg", // Adjust based on your image format
              data: await imageUrlToBase64(imageUrl), // In practice, you'd need base64 encoding here
            },
          },
        ],
      },
    ];

    // Call Gemini API
    const analysisText = await gemini_2_5_pro_preview_05_06(prompt);

    // Parse the response (assuming it returns properly formatted JSON)
    let analysisData;
    try {
      // Extract JSON from the response text
      const jsonMatch =
        analysisText?.match(/```json\n([\s\S]*?)\n```/) ||
        analysisText?.match(/{[\s\S]*}/) ||
        null;

      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisText;
      if (!jsonStr) {
        throw new Error("No valid JSON found in Gemini response");
      }
      analysisData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      // Fallback to default values
      return defaultAnalysisResult();
    }

    // Validate and sanitize the response
    return {
      lesionType: validateLesionType(analysisData.lesionType),
      riskLevel: validateRiskLevel(analysisData.riskLevel),
      confidence: Number(analysisData.confidence) || 80,
      observations:
        analysisData.observations || "No observations provided by AI analysis.",
      recommendations:
        analysisData.recommendations ||
        "Please consult with a doctor for proper evaluation.",
    };
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    // Return default values if Gemini analysis fails
    return defaultAnalysisResult();
  }
}

// Helper function to provide default values if AI analysis fails
function defaultAnalysisResult() {
  return {
    lesionType: "NEVUS" as LesionType,
    riskLevel: "MEDIUM" as RiskLevel,
    confidence: 70,
    observations: "AI analysis unavailable. This is a default assessment.",
    recommendations: "Please consult with a doctor for proper evaluation.",
  };
}

// Validate lesion type to ensure it matches your enum
function validateLesionType(type: string): LesionType {
  const validTypes = [
    "NEVUS",
    "MELANOMA",
    "BASAL_CELL_CARCINOMA",
    "SQUAMOUS_CELL_CARCINOMA",
    "ACTINIC_KERATOSIS",
    "SEBORRHEIC_KERATOSIS",
    "OTHER",
  ];

  const normalizedType = type?.toUpperCase().trim();

  return validTypes.includes(normalizedType)
    ? (normalizedType as LesionType)
    : ("OTHER" as LesionType);
}

// Validate risk level to ensure it matches your enum
function validateRiskLevel(level: string): RiskLevel {
  const validLevels = ["LOW", "MEDIUM", "HIGH", "SEVERE"];

  const normalizedLevel = level?.toUpperCase().trim();

  return validLevels.includes(normalizedLevel)
    ? (normalizedLevel as RiskLevel)
    : ("MEDIUM" as RiskLevel);
}

async function imageUrlToBase64(url: string): Promise<string> {
  try {
    // For server-side fetching
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw new Error("Failed to process image");
  }
}
