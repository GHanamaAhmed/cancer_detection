import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiResponse, ForgotPasswordRequest } from "@/types/mobile-api";
import crypto from "crypto";
import { transporter } from "@/lib/node-mailer";



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

    // Store the reset code
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

    // Send the code via email
    const mailOptions = {
      from: `"Cancer Detection App" <${
        process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER
      }>`,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}\nThis code will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00a896;">Password Reset Code</h2>
          <p>You requested to reset your password for the Cancer Detection App.</p>
          <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; font-size: 36px; margin: 0;">${resetCode}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

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
