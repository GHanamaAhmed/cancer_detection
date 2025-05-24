import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOption";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search patients
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          {
            user: {
              profile: {
                firstName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            user: {
              profile: {
                lastName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        user: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      take: 5,
    });

    // Search lesion cases
    const lesionCases = await prisma.lesionCase.findMany({
      where: {
        OR: [
          {
            caseNumber: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            diagnosis: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        caseNumber: true,
        diagnosis: true,
        riskLevel: true,
        patientId: true,
        patient: {
          select: {
            user: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 5,
    });

    // Format results
    const patientResults = patients.map((patient) => ({
      id: patient.id,
      type: "patient",
      title: `${patient.user.profile?.firstName} ${patient.user.profile?.lastName}`,
      subtitle: "Patient",
    }));

    const lesionResults = lesionCases.map((lesion) => ({
      id: lesion.id,
      type: "lesion",
      patientId: lesion.patientId,
      title: lesion.diagnosis || `Case ${lesion.caseNumber}`,
      subtitle: `${lesion.patient.user.profile?.firstName} ${lesion.patient.user.profile?.lastName} - ${lesion.riskLevel} Risk`,
    }));

    // Combine results
    const results = [...patientResults, ...lesionResults];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
