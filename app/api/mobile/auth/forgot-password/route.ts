import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiResponse, ForgotPasswordRequest } from "@/types/mobile-api";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email }: ForgotPasswordRequest = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return NextResponse.json<ApiResponse<null>>({
        success: true,
        message: "If your email is registered, you will receive a reset code",
      });
    }

    // Generate a 6-digit code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the reset code - fixed to use the correct model
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        code: resetCode,
        expiresAt: resetCodeExpiry,
      },
      create: {
        userId: user.id,
        code: resetCode,
        expiresAt: resetCodeExpiry,
      },
    });

    // In a real app, send the code via email
    console.log(`Reset code for ${email}: ${resetCode}`);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "If your email is registered, you will receive a reset code",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
