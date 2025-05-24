import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { ApiResponse, ResultsListResponse, AnalysisResultSummary } from "@/types/mobile-api"
import { verifyMobileAuth } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const url = new URL(req.url)
    const type = url.searchParams.get("type") || undefined
    const startDate = url.searchParams.get("startDate") || undefined
    const endDate = url.searchParams.get("endDate") || undefined
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      patientId: user.patient.id,
    }

    if (type && type.toUpperCase() in prisma.LesionType) {
      where.lesionType = type.toUpperCase()
    }

    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(endDate),
      }
    }

    // Get results
    const results = await prisma.lesionCase.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    // Count total
    const total = await prisma.lesionCase.count({ where })

    // Format response
    const formattedResults: AnalysisResultSummary[] = results.map((result) => {
      let variant: "success" | "warning" | "destructive" | "default" = "default"

      if (result.riskLevel === "LOW") {
        variant = "success"
      } else if (result.riskLevel === "MEDIUM") {
        variant = "warning"
      } else if (result.riskLevel === "HIGH" || result.riskLevel === "CRITICAL") {
        variant = "destructive"
      }

      return {
        id: result.id,
        title: `Case ${result.caseNumber}`,
        date: result.createdAt.toISOString().split("T")[0],
        riskLevel: result.riskLevel,
        variant,
      }
    })

    const response: ResultsListResponse = {
      results: formattedResults,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + results.length < total,
      },
    }

    return NextResponse.json<ApiResponse<ResultsListResponse>>({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("Results list error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while fetching results",
      },
      { status: 500 },
    )
  }
}
