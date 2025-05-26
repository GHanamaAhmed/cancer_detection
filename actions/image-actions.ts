"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { pusher } from "@/lib/pusher";

// Mock function for image analysis (in a real app, this would call an AI service)
async function analyzeImage(imageUrl: string, bodyLocation: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Random risk level with weighted distribution
  const riskLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const weights = [0.6, 0.25, 0.1, 0.05]; // 60% low, 25% medium, 10% high, 5% critical

  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedRiskLevel = "LOW";

  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      selectedRiskLevel = riskLevels[i];
      break;
    }
  }

  // Random confidence score between 70-99
  const confidence = 70 + Math.floor(Math.random() * 30);

  // Random lesion type
  const lesionTypes = [
    "MELANOMA",
    "BASAL_CELL_CARCINOMA",
    "SQUAMOUS_CELL_CARCINOMA",
    "ACTINIC_KERATOSIS",
    "NEVUS",
    "SEBORRHEIC_KERATOSIS",
  ];
  const lesionType =
    lesionTypes[Math.floor(Math.random() * lesionTypes.length)];

  // ABCDE criteria
  const asymmetry = Math.random() > 0.5;
  const border = Math.random() > 0.5;
  const color = Math.random() > 0.5;
  const diameter = Math.random() > 0.5;
  const evolution = Math.random() > 0.5;

  const totalFlags = [asymmetry, border, color, diameter, evolution].filter(
    Boolean
  ).length;

  return {
    riskLevel: selectedRiskLevel,
    confidence,
    lesionType,
    observations: `AI analysis detected a potential ${lesionType
      .toLowerCase()
      .replace(/_/g, " ")} with ${confidence}% confidence.`,
    recommendations:
      selectedRiskLevel === "LOW"
        ? "Regular monitoring recommended."
        : selectedRiskLevel === "MEDIUM"
        ? "Follow-up examination recommended within 3 months."
        : "Immediate dermatologist consultation recommended.",
    abcdeResults: {
      asymmetry,
      asymmetryScore: asymmetry
        ? 0.3 + Math.random() * 0.7
        : Math.random() * 0.3,
      border,
      borderScore: border ? 0.3 + Math.random() * 0.7 : Math.random() * 0.3,
      color,
      colorScore: color ? 0.3 + Math.random() * 0.7 : Math.random() * 0.3,
      diameter,
      diameterValue: 1 + Math.random() * 9, // 1-10mm
      evolution,
      totalFlags,
    },
  };
}

export async function uploadAndAnalyzeImage(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // In a real app, you would upload the image to a storage service
    // Here we'll simulate it with a placeholder URL
    const imageFile = formData.get("image") as File;
    const bodyLocation = formData.get("bodyLocation") as string;
    const notes = formData.get("notes") as string;
    const patientId = formData.get("patientId") as string;

    if (!imageFile || !bodyLocation) {
      return {
        success: false,
        message: "Image and body location are required",
      };
    }

    // Generate a unique image URL (in a real app, this would be the uploaded image URL)
    const imageUrl = `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(
      imageFile.name
    )}`;
    const thumbnailUrl = `/placeholder.svg?height=100&width=100&text=${encodeURIComponent(
      imageFile.name
    )}`;

    // Create image upload record
    const imageUpload = await prisma.imageUpload.create({
      data: {
        userId: user.id,
        imageUrl,
        thumbnailUrl,
        bodyLocation: bodyLocation as any,
        notes,
        captureDate: new Date(),
      },
    });

    // Analyze the image
    const analysisResult = await analyzeImage(imageUrl, bodyLocation);

    // Create analysis result record
    const analysis = await prisma.analysisResult.create({
      data: {
        userId: user.id,
        imageId: imageUpload.id,
        riskLevel: analysisResult.riskLevel as any,
        confidence: analysisResult.confidence,
        lesionType: analysisResult.lesionType as any,
        observations: analysisResult.observations,
        recommendations: analysisResult.recommendations,
        reviewedByDoctor: false,
        abcdeResults: {
          create: {
            asymmetry: analysisResult.abcdeResults.asymmetry,
            asymmetryScore: analysisResult.abcdeResults.asymmetryScore,
            border: analysisResult.abcdeResults.border,
            borderScore: analysisResult.abcdeResults.borderScore,
            color: analysisResult.abcdeResults.color,
            colorScore: analysisResult.abcdeResults.colorScore,
            diameter: analysisResult.abcdeResults.diameter,
            diameterValue: analysisResult.abcdeResults.diameterValue,
            evolution: analysisResult.abcdeResults.evolution,
            totalFlags: analysisResult.abcdeResults.totalFlags,
          },
        },
      },
    });

    // If this is a high risk result, create a notification
    if (
      analysisResult.riskLevel === "HIGH" ||
      analysisResult.riskLevel === "CRITICAL"
    ) {
    const n=  await prisma.notification.create({
        data: {
          userId: user.id,
          type: "HIGH_RISK_ALERT",
          title: "High Risk Lesion Detected",
          message:
            "A high risk lesion has been detected. Please consult with a dermatologist as soon as possible.",
          relatedEntityId: analysis.id,
        },
      });
      await pusher.trigger(
        `private-notifications-${user.id}`,
        "new-notification",
        n
      );
    }

    // Create or update lesion case if patient ID is provided
    if (patientId) {
      // Check if there's an existing open case for this patient and body location
      const existingCase = await prisma.lesionCase.findFirst({
        where: {
          patientId,
          bodyLocation: bodyLocation as any,
          status: "OPEN",
        },
      });

      if (existingCase) {
        // Update existing case
        await prisma.lesionCase.update({
          where: { id: existingCase.id },
          data: {
            riskLevel: analysisResult.riskLevel as any,
            lesionType: analysisResult.lesionType as any,
            updatedAt: new Date(),
            images: {
              connect: { id: imageUpload.id },
            },
            analysisResults: {
              connect: { id: analysis.id },
            },
          },
        });

        // Update image and analysis with case ID
        await prisma.imageUpload.update({
          where: { id: imageUpload.id },
          data: { lesionCaseId: existingCase.id },
        });

        await prisma.analysisResult.update({
          where: { id: analysis.id },
          data: { lesionCaseId: existingCase.id },
        });
      } else {
        // Create new case
        const newCase = await prisma.lesionCase.create({
          data: {
            // userId: user.id,
            patientId,
            caseNumber: `CASE-${uuidv4().substring(0, 8).toUpperCase()}`,
            status: "OPEN",
            riskLevel: analysisResult.riskLevel as any,
            lesionType: analysisResult.lesionType as any,
            bodyLocation: bodyLocation as any,
            firstNoticed: new Date(),
            images: {
              connect: { id: imageUpload.id },
            },
            analysisResults: {
              connect: { id: analysis.id },
            },
          },
        });

        // Update image and analysis with case ID
        await prisma.imageUpload.update({
          where: { id: imageUpload.id },
          data: { lesionCaseId: newCase.id },
        });

        await prisma.analysisResult.update({
          where: { id: analysis.id },
          data: { lesionCaseId: newCase.id },
        });
      }
    }

    revalidatePath("/dashboard/patients");

    return {
      success: true,
      message: "Image uploaded and analyzed successfully",
      imageId: imageUpload.id,
      analysisId: analysis.id,
      riskLevel: analysisResult.riskLevel,
    };
  } catch (error) {
    console.error("Error uploading and analyzing image:", error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function reviewAnalysisResult(
  analysisId: string,
  doctorNotes: string,
  doctorDiagnosis?: string
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const analysis = await prisma.analysisResult.findUnique({
      where: { id: analysisId },
      include: { lesionCase: true },
    });

    if (!analysis) {
      return { success: false, message: "Analysis result not found" };
    }

    // Update analysis result
    await prisma.analysisResult.update({
      where: { id: analysisId },
      data: {
        reviewedByDoctor: true,
        doctorNotes,
      },
    });

    // If there's a lesion case, update it with the diagnosis
    if (analysis.lesionCaseId && doctorDiagnosis) {
      await prisma.lesionCase.update({
        where: { id: analysis.lesionCaseId },
        data: {
          diagnosis: doctorDiagnosis,
        },
      });
    }

    // Create notification for the patient
    if (analysis.lesionCase) {
      const n = await prisma.notification.create({
        data: {
          userId: analysis.lesionCase.patientId,
          type: "RESULT_AVAILABLE",
          title: "Analysis Result Reviewed",
          message: "Your skin lesion analysis has been reviewed by a doctor.",
          relatedEntityId: analysisId,
        },
      });
      await pusher.trigger(
        `private-notifications-${analysis.lesionCase.patientId}`,
        "new-notification",
        n
      );
    }

    revalidatePath("/dashboard/patients");

    return {
      success: true,
      message: "Analysis result reviewed successfully",
    };
  } catch (error) {
    console.error("Error reviewing analysis result:", error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
