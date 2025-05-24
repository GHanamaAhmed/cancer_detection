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

    // Get the patient record
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient record not found" },
        { status: 404 }
      );
    }

    // Find all approved connection requests for this patient
    const connections = await prisma.connectionRequest.findMany({
      where: {
        patientId: patient.id,
        status: "APPROVED",
      },
      select: {
        doctorId: true,
        doctor: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
            specialties: true,
            consultationFee: true,
            rating: true,
            bio: true,
            facilities: {
              select: {
                facility: {
                  select: {
                    name: true,
                    address: true,
                    city: true,
                    state: true,
                  },
                },
                isPrimary: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const doctors = connections.map((connection) => {
      const doctor = connection.doctor;
      const primaryFacility =
        doctor.facilities.find((f) => f.isPrimary)?.facility ||
        doctor.facilities[0]?.facility;

      return {
        id: doctor.user.id,
        name: doctor.user.name,
        image: doctor.user.image || doctor.user.profile?.avatarUrl,
        role: doctor.user.role,
        specialties: doctor.specialties,
        consultationFee: doctor.consultationFee,
        rating: doctor.rating,
        bio: doctor.bio,
        location: primaryFacility
          ? `${primaryFacility.name}, ${primaryFacility.city}`
          : "Remote consultations available",
      };
    });

    return NextResponse.json({
      success: true,
      data: doctors,
    });
  } catch (error: any) {
    console.error("Error fetching connected doctors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch connected doctors" },
      { status: 500 }
    );  
  }
}
 