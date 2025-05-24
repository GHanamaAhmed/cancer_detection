import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function verifyMobileAuth(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}
