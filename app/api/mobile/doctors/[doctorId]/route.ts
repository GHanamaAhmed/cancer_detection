import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type {
  ApiResponse,
  DoctorDetail,
  DoctorReview,
} from "@/types/mobile-api";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ doctorId: string }> }
) {
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
    const params = await paramsPromise;
    const doctorId = params.doctorId;

    // Get doctor data
    const doctor = await prisma.user.findFirst({
      where: {
        doctor: {
          id: doctorId,
        },
        role: {
          in: ["DOCTOR", "DERMATOLOGIST", "ONCOLOGIST"],
        },
      },
      include: {
        doctor: {
          include: {
            reviews: {
              take: 5,
              orderBy: { createdAt: "desc" },
            },
            education: true,
          },
        },
      },
    });

    if (!doctor || !doctor.doctor) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Doctor not found",
        },
        { status: 404 }
      );
    }

    // Calculate average rating
    const reviews = doctor.doctor.reviews || [];
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Format reviews
    const formattedReviews: DoctorReview[] = reviews.map((review) => ({
      id: review.id,
      patientName: review.patientName || "Anonymous",
      rating: review.rating,
      comment: review.comment || "",
      date: review.createdAt.toISOString().split("T")[0],
    }));

    // Format education
    const education = doctor.doctor.education.map((edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      years: `${edu.startYear} - ${edu.endYear || "Present"}`,
    }));

    // Format specializations
    const specializations = doctor.doctor.specialties || [];

    // Format response
    const doctorDetail: DoctorDetail = {
      id: doctor.doctor.id,
      userId: doctor.id,
      name: doctor.name || "",
      specialty: specializations[0] || "",
      rating: Number.parseFloat(avgRating.toFixed(1)),
      reviewsCount: reviews.length,
      status: Math.random() > 0.5 ? "online" : "offline", // Mock online status
      avatarUrl: doctor.image || `/placeholder.svg?height=200&width=200`,
      experience: doctor.doctor.totalPatients || 0,
      patients: doctor.doctor.totalPatients || 0,
      specializations,
      education,
      reviews: formattedReviews,
    };

    return NextResponse.json<ApiResponse<DoctorDetail>>({
      success: true,
      data: doctorDetail,
    });
  } catch (error) {
    console.error("Doctor detail error:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "An error occurred while fetching doctor details",
      },
      { status: 500 }
    );
  }
}
