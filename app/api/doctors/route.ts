import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOption";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctors = await prisma.user.findMany({
      where: {
        OR: [
          { role: "DOCTOR" },
          { role: "DERMATOLOGIST" },
          { role: "ONCOLOGIST" },
        ],
      },
      select: {
        id: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            specialties: true, // Changed this line to include all specialties
            isVerified: true,
          },
        },
      },
      orderBy: {
        profile: {
          firstName: "asc",
        },
      },
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
