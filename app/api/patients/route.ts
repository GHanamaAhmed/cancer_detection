import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get patients with their profiles
    const patients = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { profile: { firstName: { contains: search, mode: "insensitive" } } },
          { profile: { lastName: { contains: search, mode: "insensitive" } } },
        ],
      },
      include: {
        profile: true,
        patient: {
          include: {
            lesionCases: {
              include: {
                analysisResults: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
    })

    const total = await prisma.user.count({
      where: {
        role: "PATIENT",
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { profile: { firstName: { contains: search, mode: "insensitive" } } },
          { profile: { lastName: { contains: search, mode: "insensitive" } } },
        ],
      },
    })

    // Format the response
    const formattedPatients = patients.map((patient) => {
      // Calculate risk level based on analysis results
      let riskLevel = "LOW"
      if (
        patient.patient?.lesionCases.some((c) =>
          c.analysisResults.some((r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL"),
        )
      ) {
        riskLevel = "HIGH"
      } else if (patient.patient?.lesionCases.some((c) => c.analysisResults.some((r) => r.riskLevel === "MEDIUM"))) {
        riskLevel = "MEDIUM"
      }

      return {
        id: patient.id,
        name: patient.profile ? `${patient.profile.firstName} ${patient.profile.lastName}` : patient.name,
        email: patient.email,
        image: patient.image || patient.profile?.avatarUrl,
        initials: patient.profile
          ? `${patient.profile.firstName.charAt(0)}${patient.profile.lastName.charAt(0)}`
          : patient.name
              ?.split(" ")
              .map((n) => n.charAt(0))
              .join("") || "??",
        examDate: patient.patient?.lastExamDate,
        risk: riskLevel.toLowerCase(),
      }
    })

    return NextResponse.json({
      patients: formattedPatients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
