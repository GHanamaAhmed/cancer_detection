import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get page and limit parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch the user's patient record
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
      },
    });

    if (!user || !user.patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get total count for pagination
    const totalCases = await prisma.lesionCase.count({
      where: { patientId: user.patient.id },
    });

    // Get lesion cases with related data
    const lesionCases = await prisma.lesionCase.findMany({
      where: { patientId: user.patient.id },
      include: {
        images: {
          select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            captureDate: true,
            bodyLocation: true,
            createdAt: true,
          },
        },
        analysisResults: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            abcdeResults: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format the data for the mobile app
    const history = lesionCases.map((lesionCase) => {
      const latestAnalysis = lesionCase.analysisResults[0];
      const mainImage = lesionCase.images[0]; // Get the first image as the main image

      return {
        id: lesionCase.id,
        caseNumber: lesionCase.caseNumber,
        date: lesionCase.createdAt.toISOString(),
        formattedDate: new Date(lesionCase.createdAt).toLocaleDateString(),
        status: lesionCase.status,
        riskLevel: lesionCase.riskLevel,
        lesionType: lesionCase.lesionType,
        bodyLocation: lesionCase.bodyLocation,
        diagnosis: lesionCase.diagnosis,
        imageCount: lesionCase.images.length,
        mainImage: mainImage
          ? {
              id: mainImage.id,
              url: mainImage.imageUrl,
              thumbnailUrl: mainImage.thumbnailUrl,
            }
          : null,
        latestAnalysis: latestAnalysis
          ? {
              id: latestAnalysis.id,
              riskLevel: latestAnalysis.riskLevel,
              confidence: latestAnalysis.confidence,
              lesionType: latestAnalysis.lesionType,
              reviewedByDoctor: latestAnalysis.reviewedByDoctor,
              abcdeFlags: latestAnalysis.abcdeResults?.totalFlags || 0,
            }
          : null,
      };
    });

    // Return the data with pagination info
    return NextResponse.json({
      success: true,
      data: {
        history,
        pagination: {
          page,
          limit,
          total: totalCases,
          pages: Math.ceil(totalCases / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching history data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch history data" },
      { status: 500 }
    );
  }
}
