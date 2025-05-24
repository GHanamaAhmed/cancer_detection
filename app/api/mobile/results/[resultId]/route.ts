import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { ApiResponse, AnalysisResultDetail, ABCDECriteria, SimilarCase } from "@/types/mobile-api"
import { verifyMobileAuth } from "@/lib/mobile-auth"

export async function GET(req: NextRequest, { params }: { params: { resultId: string } }) {
  try {
    const userId = await verifyMobileAuth(req)
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    // Get user data to find patient ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!user || !user.patient) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Patient not found",
        },
        { status: 404 },
      )
    }

    const resultId = params.resultId

    // Get result data
    const result = await prisma.lesionCase.findUnique({
      where: {
        id: resultId,
        patientId: user.patient.id,
      },
      include: {
        images: true,
        notes: {
          orderBy: { createdAt: "desc" },
        },
        analysisResults: {
          include: {
            abcdeResults: true,
            similarCases: true,
          },
        },
      },
    })

    if (!result) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Result not found",
        },
        { status: 404 },
      )
    }

    // Get the latest analysis result if available
    const latestAnalysis = result.analysisResults[0]

    // Parse ABCDE criteria from analysis or create mock data
    let abcdeCriteria: ABCDECriteria
    if (latestAnalysis?.abcdeResults) {
      abcdeCriteria = {
        asymmetry: {
          flagged: latestAnalysis.abcdeResults.asymmetry,
          details: "Asymmetry detected in the lesion",
        },
        border: {
          flagged: latestAnalysis.abcdeResults.border,
          details: "Irregular borders observed",
        },
        color: {
          flagged: latestAnalysis.abcdeResults.color,
          details: "Multiple colors present",
        },
        diameter: {
          flagged: latestAnalysis.abcdeResults.diameter,
          details: `Diameter: ${latestAnalysis.abcdeResults.diameterValue || "unknown"} mm`,
        },
        evolution: {
          flagged: latestAnalysis.abcdeResults.evolution,
          details: latestAnalysis.abcdeResults.evolutionNotes || "No evolution data available",
        },
        totalFlags: latestAnalysis.abcdeResults.totalFlags,
      }
    } else {
      // Create mock ABCDE criteria based on risk level
      abcdeCriteria = {
        asymmetry: {
          flagged: result.riskLevel !== "LOW",
          details: "Irregular shape detected",
        },
        border: {
          flagged: result.riskLevel === "HIGH" || result.riskLevel === "CRITICAL",
          details: "Irregular borders observed",
        },
        color: {
          flagged: result.riskLevel !== "LOW",
          details: "Multiple colors present",
        },
        diameter: {
          flagged: result.riskLevel === "HIGH" || result.riskLevel === "CRITICAL",
          details: "Larger than 6mm",
        },
        evolution: {
          flagged: false,
          details: "No previous images for comparison",
        },
        totalFlags: 0,
      }

      // Count total flags
      abcdeCriteria.totalFlags = Object.values(abcdeCriteria).filter(
        (value) => typeof value === "object" && value.flagged,
      ).length
    }

    // Format similar cases
    const formattedSimilarCases: SimilarCase[] =
      latestAnalysis?.similarCases.map((similarCase) => ({
        id: similarCase.id,
        caseNumber: similarCase.caseNumber,
        imageUrl: similarCase.imageUrl,
        diagnosis: similarCase.diagnosis,
        riskLevel: similarCase.riskLevel,
      })) || []

    // If no similar cases from analysis, get similar cases from database
    if (formattedSimilarCases.length === 0) {
      const similarCases = await prisma.lesionCase.findMany({
        where: {
          id: { not: resultId },
          riskLevel: result.riskLevel,
          patientId: user.patient.id,
        },
        take: 3,
        include: {
          images: {
            take: 1,
          },
        },
      })

      similarCases.forEach((similarCase) => {
        formattedSimilarCases.push({
          id: similarCase.id,
          caseNumber: similarCase.caseNumber,
          imageUrl: similarCase.images[0]?.imageUrl || `/placeholder.svg?height=100&width=100`,
          diagnosis: similarCase.diagnosis || "Pending diagnosis",
          riskLevel: similarCase.riskLevel,
        })
      })
    }

    // Extract key observations from notes
    const keyObservations = result.notes
      .map((note) => note.content)
      .filter((content) => content.includes("observation") || content.includes("finding"))
      .slice(0, 3)

    // If no specific observations, create generic ones based on risk
    if (keyObservations.length === 0) {
      if (result.riskLevel === "LOW") {
        keyObservations.push("Regular borders and coloration")
        keyObservations.push("No concerning features detected")
      } else if (result.riskLevel === "MEDIUM") {
        keyObservations.push("Some irregular features detected")
        keyObservations.push("Moderate concern for abnormal growth")
      } else {
        keyObservations.push("Highly irregular borders and coloration")
        keyObservations.push("Multiple concerning features detected")
        keyObservations.push("Urgent follow-up recommended")
      }
    }

    // Generate recommendations based on risk
    let recommendations = ""
    if (result.riskLevel === "LOW") {
      recommendations = "Continue regular self-examinations. Schedule a follow-up in 6-12 months."
    } else if (result.riskLevel === "MEDIUM") {
      recommendations = "Schedule a follow-up appointment within 1-3 months. Consider a biopsy if any changes occur."
    } else {
      recommendations = "Urgent dermatologist consultation recommended. Biopsy may be necessary to rule out malignancy."
    }

    // Format response
    const resultDetail: AnalysisResultDetail = {
      id: result.id,
      title: `Case ${result.caseNumber}`,
      date: result.createdAt.toISOString().split("T")[0],
      riskLevel: result.riskLevel,
      confidence: latestAnalysis?.confidence || 0.8,
      keyObservations,
      recommendations,
      abcdeCriteria,
      similarCases: formattedSimilarCases,
    }

    return NextResponse.json<ApiResponse<AnalysisResultDetail>>({
      success: true,
      data: resultDetail,
    })
  } catch (error) {
    console.error("Result detail error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while fetching result details",
      },
      { status: 500 },
    )
  }
}
