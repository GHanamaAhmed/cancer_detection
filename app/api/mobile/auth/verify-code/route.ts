import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiResponse, VerifyCodeRequest } from "@/types/mobile-api";

export async function POST(req: NextRequest) {
  try {
    const { email, code }: VerifyCodeRequest = await req.json();

    // Validate input
    if (!email || !code) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Email and code are required",
        },  
        { status: 400 }
      );
    }

    // Find user with their password reset record
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        passwordReset: true,
      },
    });

    if (!user || !user.passwordReset) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid code",
        },
        { status: 400 }
      );
    }

    // Check if code is valid and not expired
    if (
      user.passwordReset.code !== code ||
      user.passwordReset.expiresAt < new Date()
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid or expired code",
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Code verified successfully",
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while verifying the code",
      },
      { status: 500 }
    );
  }
}
