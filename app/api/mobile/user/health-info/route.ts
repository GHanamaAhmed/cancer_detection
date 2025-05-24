import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { ApiResponse, HealthInformation, UpdateHealthInfoRequest } from "@/types/mobile-api"
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

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
      },
    })

    if (!user || !user.patient) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    // Format health information
    let healthInfo: HealthInformation = {}
    if (user.patient) {
      healthInfo = {
        height: user.patient.height
          ? {
              value: user.patient.height,
              unit: "cm",
            }
          : undefined,
        weight: user.patient.weight
          ? {
              value: user.patient.weight,
              unit: "kg",
            }
          : undefined,
        allergies: user.patient.allergies ? [user.patient.allergies] : [],
      }
    }

    return NextResponse.json<ApiResponse<HealthInformation>>({
      success: true,
      data: healthInfo,
    })
  } catch (error) {
    console.error("Health info error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while fetching health information",
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest) {
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

    const { height, weight, allergies }: UpdateHealthInfoRequest = await req.json()

    // Get patient
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
      },
    })

    if (!user || !user.patient) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    // Update health info
    const updatedPatient = await prisma.patient.update({
      where: {
        id: user.patient.id,
      },
      data: {
        height: height?.value,
        weight: weight?.value,
        allergies: allergies ? allergies.join(", ") : null,
      },
    })

    // Format response
    const formattedHealthInfo: HealthInformation = {
      height: updatedPatient.height
        ? {
            value: updatedPatient.height,
            unit: "cm",
          }
        : undefined,
      weight: updatedPatient.weight
        ? {
            value: updatedPatient.weight,
            unit: "kg",
          }
        : undefined,
      allergies: updatedPatient.allergies ? [updatedPatient.allergies] : [],
    }

    return NextResponse.json<ApiResponse<HealthInformation>>({
      success: true,
      data: formattedHealthInfo,
    })
  } catch (error) {
    console.error("Health info update error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while updating health information",
      },
      { status: 500 },
    )
  }
}
