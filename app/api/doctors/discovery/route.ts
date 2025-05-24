import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/authOption";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const specialty = searchParams.get("specialty");
    const location = searchParams.get("location");
    const name = searchParams.get("name");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build the where clause based on filters
    const where: any = {
      role: {
        in: ["DOCTOR", "DERMATOLOGIST", "ONCOLOGIST"],
      },
    };

    if (name) {
      where.OR = [
        { name: { contains: name, mode: "insensitive" } },
        { profile: { firstName: { contains: name, mode: "insensitive" } } },
        { profile: { lastName: { contains: name, mode: "insensitive" } } },
      ];
    }

    if (specialty) {
      where.doctor = {
        specialties: {
          has: specialty,
        },
      };
    }

    if (location) {
      where.profile = {
        OR: [
          { city: { contains: location, mode: "insensitive" } },
          { state: { contains: location, mode: "insensitive" } },
          { country: { contains: location, mode: "insensitive" } },
        ],
      };
    }

    // Query doctors
    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        profile: true,
        doctor: {
          include: {
            specialties: true,
            facilities: {
              include: {
                facility: true,
              },
            },
          },
        },
      },
      orderBy: {
        doctor: {
          rating: "desc",
        },
      },
      skip,
      take: limit,
    });

    // Count total matching doctors
    const total = await prisma.user.count({ where });

    return NextResponse.json({
      doctors,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error discovering doctors:", error);
    return NextResponse.json(
      { error: "Failed to discover doctors" },
      { status: 500 }
    );
  }
}
