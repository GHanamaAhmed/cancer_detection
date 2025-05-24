import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params: p }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const params = await p;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      riskLevel,
      confidence,
      lesionType,
      observations,
      recommendations,
      doctorNotes,
      reviewedByDoctor,
      lesionCaseId,
      abcdeData,
    } = await req.json();

    // Find the existing analysis first to check permissions
    const existingAnalysis = await prisma.analysisResult.findUnique({
      where: { id: params.id },
    });

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Update the analysis
    const updatedAnalysis = await prisma.analysisResult.update({
      where: { id: params.id },
      data: {
        riskLevel,
        confidence,
        lesionType,
        observations,
        recommendations,
        doctorNotes,
        reviewedByDoctor,
        updatedAt: new Date(),
      },
    });

    // Update or create ABCDE criteria
    if (abcdeData) {
      const existingABCDE = await prisma.aBCDECriteria.findUnique({
        where: { analysisResultId: params.id },
      });

      if (existingABCDE) {
        await prisma.aBCDECriteria.update({
          where: { id: existingABCDE.id },
          data: {
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
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.aBCDECriteria.create({
          data: {
            analysisResultId: params.id,
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
        });
      }
    }

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
      data: updatedAnalysis,
    });
  } catch (error) {
    console.error("Error updating analysis:", error);
    return NextResponse.json(
      { error: "Failed to update analysis" },
      { status: 500 }
    );
  }
}
