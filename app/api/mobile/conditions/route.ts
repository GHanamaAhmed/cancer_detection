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

    // Mock skin conditions data
    const conditions = [
      { id: "1", name: "Acne", category: "Common" },
      { id: "2", name: "Eczema", category: "Common" },
      { id: "3", name: "Psoriasis", category: "Common" },
      { id: "4", name: "Rosacea", category: "Common" },
      { id: "5", name: "Melanoma", category: "Cancerous" },
      { id: "6", name: "Basal Cell Carcinoma", category: "Cancerous" },
      { id: "7", name: "Squamous Cell Carcinoma", category: "Cancerous" },
      { id: "8", name: "Dermatitis", category: "Inflammatory" },
      { id: "9", name: "Hives", category: "Inflammatory" },
      { id: "10", name: "Vitiligo", category: "Pigmentation" },
      { id: "11", name: "Melasma", category: "Pigmentation" },
      { id: "12", name: "Warts", category: "Viral" },
      { id: "13", name: "Herpes", category: "Viral" },
      { id: "14", name: "Ringworm", category: "Fungal" },
      { id: "15", name: "Athlete's Foot", category: "Fungal" },
    ]

    return NextResponse.json<
      ApiResponse<{
        conditions: {
          id: string
          name: string
          category?: string
        }[]
        total: number
      }>
    >({
      success: true,
      data: {
        conditions,
        total: conditions.length,
      },
    })
  } catch (error) {
    console.error("Conditions list error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while fetching conditions",
      },
      { status: 500 },
    )
  }
}
