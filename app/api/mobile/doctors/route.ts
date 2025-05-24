import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type {
  ApiResponse,
  DoctorsListResponse,
  DoctorSummary,
} from "@/types/mobile-api";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const specialty = url.searchParams.get("specialty") || undefined;
    const name = url.searchParams.get("name") || undefined;
    const location = url.searchParams.get("location") || undefined;
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      role: {
        in: ["DOCTOR", "DERMATOLOGIST", "ONCOLOGIST"],
      },
    };

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    // Get doctors
    const doctors = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        doctor: {
          include: {
            reviews: true,
          },
        },
      },
    });

    // Filter by specialty if provided
    let filteredDoctors = doctors;
    if (specialty && filteredDoctors.length > 0) {
      filteredDoctors = doctors.filter((doctor) =>
        doctor.doctor?.specialties?.some((s) =>
          s.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }

    // Count total
    const total = filteredDoctors.length;

    // Format response
    const formattedDoctors: DoctorSummary[] = filteredDoctors.map((doctor) => {
      const reviews = doctor.doctor?.reviews || [];
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      return {
        id: doctor.doctor?.id || "",
        name: doctor.name || "",
        specialty: doctor.doctor?.specialties?.[0] || "",
        rating: Number.parseFloat(avgRating.toFixed(1)),
        reviews: reviews.length,
        status: Math.random() > 0.5 ? "online" : "offline", // Mock online status
        avatarUrl: doctor.image || `/placeholder.svg?height=100&width=100`,
      };
    });

    const response: DoctorsListResponse = {
      doctors: formattedDoctors,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + formattedDoctors.length < total,
      },
    };

    return NextResponse.json<ApiResponse<DoctorsListResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Doctors list error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while fetching doctors",
      },
      { status: 500 }
    );
  }
}
