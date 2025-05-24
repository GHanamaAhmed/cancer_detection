import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { ApiResponse, ImageQualityCheck, ImageUploadResponse } from "@/types/mobile-api"
import { verifyMobileAuth } from "@/lib/mobile-auth"
import crypto from "crypto"

export async function POST(req: NextRequest) {
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

    // In a real implementation, we would handle file upload
    // For this example, we'll simulate it
    const formData = await req.formData()
    const image = formData.get("image") as File
    const bodyLocation = formData.get("bodyLocation") as string
    const notes = formData.get("notes") as string

    if (!image) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Image is required",
        },
        { status: 400 },
      )
    }

    // Simulate image processing and quality check
    const qualityCheck: ImageQualityCheck = {
      clarity: {
        score: Math.random() * 100,
        status: Math.random() > 0.3 ? "Good" : Math.random() > 0.5 ? "Fair" : "Poor",
      },
      lighting: {
        score: Math.random() * 100,
        status: Math.random() > 0.3 ? "Good" : Math.random() > 0.5 ? "Fair" : "Poor",
      },
      framing: {
        score: Math.random() * 100,
        status: Math.random() > 0.3 ? "Good" : Math.random() > 0.5 ? "Fair" : "Poor",
      },
    }

    // In a real implementation, we would upload the image to storage
    // and get back URLs
    const imageUrl = `/placeholder.svg?height=400&width=400`
    const thumbnailUrl = `/placeholder.svg?height=100&width=100`

    // Generate a unique case number
    const caseNumber = `SC-${crypto.randomInt(10000, 99999)}`

    // Create a new lesion case
    const lesionCase = await prisma.lesionCase.create({
      data: {
        patientId: user.patient.id,
        caseNumber: caseNumber,
        status: "OPEN",
        riskLevel: "UNKNOWN", // Will be updated after analysis
        bodyLocation: bodyLocation ? (bodyLocation.toUpperCase() as any) : undefined,
        images: {
          create: {
            userId: userId,
            imageUrl: imageUrl,
            thumbnailUrl: thumbnailUrl,
            bodyLocation: bodyLocation ? (bodyLocation.toUpperCase() as any) : undefined,
            notes: notes,
          },
        },
        notes: {
          create: {
            userId: userId,
            content: notes || "Image uploaded from mobile app",
          },
        },
      },
      include: {
        images: true,
      },
    })

    const response: ImageUploadResponse = {
      id: lesionCase.images[0].id,
      imageUrl,
      thumbnailUrl,
      qualityCheck,
    }

    return NextResponse.json<ApiResponse<ImageUploadResponse>>({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while uploading the image",
      },
      { status: 500 },
    )
  }
}
