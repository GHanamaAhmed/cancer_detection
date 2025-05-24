import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiResponse, ResetPasswordRequest } from "@/types/mobile-api";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword }: ResetPasswordRequest = await req.json();

    // Validate input
    if (!email || !code || !newPassword) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Email, code, and new password are required",
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete reset code
    await prisma.passwordReset.delete({
      where: { userId: user.id },
    });

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while resetting your password",
      },
      { status: 500 }
    );
  }
}
