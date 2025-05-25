import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiResponse, AuthResponse } from "@/types/mobile-api";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, verificationCode, agreeToTerms } =
      await req.json();

    // Validate input
    if (!fullName || !email || !password || !verificationCode) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            "Full name, email, password, and verification code are required",
        },
        { status: 400 }
      );
    }

    if (!agreeToTerms) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "You must agree to the terms and conditions",
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

    // Verify the code
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: verificationCode,
        },
      },
    });

    if (!verificationRecord || verificationRecord.expires < new Date()) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid or expired verification code",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: "PATIENT",
        emailVerified: new Date(), // Mark email as verified since we've confirmed it
        patient: {
          create: {
            // Create empty patient record
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: {
        id: verificationRecord.id,
      },
    });

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "60d" }
    );

    // Format response
    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email || "",
        fullName: user.name || "",
        role: user.role,
        avatarUrl: user.image || undefined,
        createdAt: user.createdAt.toISOString(),
      },
      token,
      refreshToken,
    };

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred during registration",
      },
      { status: 500 }
    );
  }
}
