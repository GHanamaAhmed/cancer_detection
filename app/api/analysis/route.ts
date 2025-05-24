import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      imageId,
      lesionCaseId,
      riskLevel,
      confidence,
      lesionType,
      observations,
      recommendations,
      doctorNotes,
      reviewedByDoctor,
      abcdeData,
    } = await req.json();

    // Create a new analysis result
    const analysisResult = await prisma.analysisResult.create({
      data: {
        userId: session.user.id,
        imageId,
        lesionCaseId,
        riskLevel,
        confidence,
        lesionType,
        observations,
        recommendations,
        doctorNotes,
        reviewedByDoctor,
        // Create ABCDE criteria if provided
        abcdeResults: abcdeData
          ? {
              create: {
                asymmetry: abcdeData.asymmetry,
                asymmetryScore: abcdeData.asymmetryScore,
                border: abcdeData.border,
                borderScore: abcdeData.borderScore,
                color: abcdeData.color,
                colorScore: abcdeData.colorScore,
                diameter: abcdeData.diameter,
                diameterValue: abcdeData.diameterValue,
                evolution: abcdeData.evolution,
                evolutionNotes: abcdeData.evolutionNotes,
                totalFlags: abcdeData.totalFlags,
              },
            }
          : undefined,
      },
      include: {
        abcdeResults: true,
      },
    });

    // Update the lesion case risk level and type to match
    if (lesionCaseId) {
      await prisma.lesionCase.update({
        where: { id: lesionCaseId },
        data: {
          riskLevel,
          lesionType,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error("Error creating analysis:", error);
    return NextResponse.json(
      { error: "Failed to create analysis" },
      { status: 500 }
    );
  }
}
