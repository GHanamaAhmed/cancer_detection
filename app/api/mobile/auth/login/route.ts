import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { ApiResponse, AuthResponse, LoginRequest } from "@/types/mobile-api"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe }: LoginRequest = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user || !user.password) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Generate tokens
    const tokenExpiry = rememberMe ? "30d" : "1d"
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.NEXTAUTH_SECRET!, {
      expiresIn: tokenExpiry,
    })

    const refreshToken = jwt.sign({ userId: user.id }, process.env.NEXTAUTH_SECRET!, { expiresIn: "60d" })
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
    }

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred during login",
      },
      { status: 500 },
    )
  }
}
