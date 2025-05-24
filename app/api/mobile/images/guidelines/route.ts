import { type NextRequest, NextResponse } from "next/server"
import type { ApiResponse } from "@/types/mobile-api"
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

    // Return capture guidelines
    return NextResponse.json<
      ApiResponse<{
        guidelines: {
          title: string
          description: string
          icon: string
        }[]
      }>
    >({
      success: true,
      data: {
        guidelines: [
          {
            title: "Good Lighting",
            description: "Ensure the area is well-lit with natural light if possible.",
            icon: "sun",
          },
          {
            title: "Clean Lens",
            description: "Make sure your camera lens is clean and free of smudges.",
            icon: "camera",
          },
          {
            title: "Proper Distance",
            description: "Hold the camera 4-6 inches (10-15 cm) from the skin.",
            icon: "ruler",
          },
          {
            title: "Steady Hand",
            description: "Keep your hand steady to avoid blurry images.",
            icon: "hand",
          },
          {
            title: "Multiple Angles",
            description: "Take photos from different angles for better analysis.",
            icon: "rotate-3d",
          },
        ],
      },
    })
  } catch (error) {
    console.error("Guidelines error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while fetching guidelines",
      },
      { status: 500 },
    )
  }
}
