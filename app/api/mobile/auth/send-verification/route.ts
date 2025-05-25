import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types/mobile-api";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { transporter } from "@/lib/node-mailer";


export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Email already in use",
        },
        { status: 409 }
      );
    }

    // Generate a 6-digit code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the verification code temporarily
    // We'll create a temporary record in the VerificationToken table
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: "registration",
        },
      },
      update: {
        token: verificationCode,
        expires: codeExpiry,
      },
      create: {
        identifier: email,
        token: verificationCode,
        expires: codeExpiry,
      },
    });

    // Send the verification code via email
    const mailOptions = {
      from: `"DermoXpert App" <${
        process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER
      }>`,
      to: email,
      subject: "Email Verification Code",
      text: `Your email verification code is: ${verificationCode}\nThis code will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00a896;">Verify Your Email</h2>
          <p>Thank you for signing up for the Cancer Detection App. Please use the verification code below to complete your registration:</p>
          <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; font-size: 36px; margin: 0;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send verification code error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while sending verification code",
      },
      { status: 500 }
    );
  }
}
