import { verifyMobileAuth } from "@/lib/mobile-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Import your Prisma client
import { analyzeImageWithGemini } from "@/lib/helper";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the caseId from query params if available
    const url = new URL(req.url);
    const caseId = url.searchParams.get("caseId");

    // If caseId is provided, fetch a single case
    if (caseId) {
      const lesionCase = await prisma.lesionCase.findUnique({
        where: {
          id: caseId,
        },
        include: {
          images: true,
          analysisResults: true,
        },
      });

      if (!lesionCase) {
        return NextResponse.json(
          { error: "Lesion case not found" },
          { status: 404 }
        );
      }

      // Check if the case belongs to the authenticated user
      if (lesionCase.patientId !== userId) {
        return NextResponse.json(
          { error: "You don't have access to this case" },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: lesionCase,
      });
    }

    // Otherwise, fetch all cases for the user
    const lesionCases = await prisma.lesionCase.findMany({
      where: {
        patientId: userId,
      },
      include: {
        images: true,
        analysisResults: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Include only the latest analysis
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: lesionCases,
    });
  } catch (error: any) {
    console.error("Error fetching lesion cases:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch lesion cases" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { imageId, imageUrl, bodyLocation, lesionSize, notes } =
      await req.json();

    // Generate a case number
    const caseNumber = `LC-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // ===== GEMINI ANALYSIS =====
    // Analyze the image using Gemini
    const analysisResult = await analyzeImageWithGemini(
      imageUrl,
      bodyLocation,
      lesionSize,
      notes
    );

    // Create a new lesion case in the database with Gemini analysis data
    const newLesionCase = await prisma.lesionCase.create({
      data: {
        caseNumber,
        status: "OPEN",
        riskLevel: analysisResult.riskLevel,
        lesionType: analysisResult.lesionType,
        bodyLocation: bodyLocation || "OTHER",
        symptoms: notes || "No symptoms recorded",
        // Create the image record
        images: {
          connect: [{ id: imageId }],
        },
        patient: {
          connect: {
            userId: userId, // Connect to the authenticated user
          },
        },
        // Create an analysis result based on Gemini output
        analysisResults: {
          create: {
            userId: userId,
            riskLevel: analysisResult.riskLevel,
            confidence: analysisResult.confidence,
            lesionType: analysisResult.lesionType,
            observations: analysisResult.observations,
            recommendations: analysisResult.recommendations,
            reviewedByDoctor: false,
          },
        },
      },
      include: {
        images: true,
        analysisResults: true,
      },
    });

    // Return the new lesion case
    return NextResponse.json({
      success: true,
      data: newLesionCase,
    });
  } catch (error: any) {
    console.error("Error creating lesion case:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create lesion case" },
      { status: 500 }
    );
  }
}
