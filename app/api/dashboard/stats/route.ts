import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get dashboard stats
    const totalPatients = await prisma.user.count({
      where: { role: "PATIENT" },
    })

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })

    const highRiskCases = await prisma.analysisResult.count({
      where: {
        riskLevel: "HIGH",
      },
    })

    // Mock data for average detection time
    const avgDetectionTime = 14

    return NextResponse.json({
      totalPatients,
      todayAppointments,
      highRiskCases,
      avgDetectionTime,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
