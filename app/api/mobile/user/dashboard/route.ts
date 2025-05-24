import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user and related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        patient: {
          include: {
            lesionCases: {
              include: {
                images: true,
                analysisResults: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate analytics from user data
    const lesionCases = user.patient?.lesionCases || [];

    // Count total images (scans)
    const totalScans = lesionCases.reduce(
      (total, cs) => total + cs.images.length,
      0
    );

    // Calculate days since last check
    const daysSinceLastCheck =
      lesionCases.length > 0
        ? Math.floor(
            (new Date().getTime() -
              new Date(lesionCases[0].createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

    // Count cases by risk level
    const highRiskCases = lesionCases.filter(
      (cs) => cs.riskLevel === "HIGH" || cs.riskLevel === "CRITICAL"
    ).length;

    const mediumRiskCases = lesionCases.filter(
      (cs) => cs.riskLevel === "MEDIUM"
    ).length;

    const lowRiskCases = lesionCases.filter(
      (cs) => cs.riskLevel === "LOW"
    ).length;

    // Count cases marked for monitoring
    const monitoredLesions = lesionCases.filter(
      (cs) => cs.status === "MONITORING" || cs.status === "FOLLOW_UP"
    ).length;

    // Determine if follow-up is needed
    const followUpNeeded = lesionCases.some(
      (cs) =>
        cs.analysisResults[0]?.recommendations?.includes("follow-up") ||
        cs.riskLevel === "HIGH" ||
        cs.riskLevel === "CRITICAL" ||
        cs.status === "FOLLOW_UP"
    );

    // Format user data for response
    const userData = {
      id: user.id,
      fullName: user.profile
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.name || "User",
      email: user.email,
      profileImage: user.image || user.profile?.avatarUrl,
    };

    // Get recent results (latest 3 lesion cases)
    const recentResults = lesionCases.slice(0, 3).map((lesionCase) => {
      const latestAnalysis = lesionCase.analysisResults[0];
      return {
        id: lesionCase.id,
        title: `Case #${lesionCase.caseNumber}`,
        date: new Date(lesionCase.createdAt).toLocaleDateString(),
        riskLevel: latestAnalysis?.riskLevel || "UNKNOWN",
      };
    });

    // Get upcoming appointment if any
    // Fixed appointment query - according to the prisma schema
    const upcomingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: userId, // This is correct based on the schema
        date: { gte: new Date() },
        status: { in: ["REQUESTED", "CONFIRMED"] }, // Using the correct enum values
      },
      orderBy: { date: "asc" },
      include: {
        doctor: true, // This is a User relation in the schema
      },
    });

    // Prepare response data
    const dashboardData = {
      user: userData,
      analytics: {
        totalScans,
        daysSinceLastCheck,
        monitoredLesions,
        highRiskCases,
        mediumRiskCases,
        lowRiskCases,
        followUpNeeded,
      },
      recentResults,
      upcomingAppointment: upcomingAppointment
        ? {
            id: upcomingAppointment.id,
            // Fixed to use the correct object path based on the schema
            doctorName: upcomingAppointment.doctor.name || "Unknown Doctor",
            doctorSpecialty: "Specialist", // We can't access this directly with current schema
            date: new Date(upcomingAppointment.date).toLocaleDateString(),
            time: new Date(upcomingAppointment.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
        : null,
    };

    // Return success response
    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
