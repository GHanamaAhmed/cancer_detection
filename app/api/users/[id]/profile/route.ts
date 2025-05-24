import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params:p }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const params = await p;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to update their own profile, or admins to update any profile
    if (session.user.id !== params.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const { name, avatarUrl, specialties, education } = data;

    // Start a transaction for related updates
    const result = await prisma.$transaction(async (tx) => {
      // Update user's name
      const updatedUser = await tx.user.update({
        where: { id: params.id },
        data: {
          name,
          ...(avatarUrl ? { image: avatarUrl } : {}),
        },
      });

      // Update profile avatar if it exists
      if (avatarUrl) {
        const profile = await tx.profile.findUnique({
          where: { userId: params.id },
        });

        if (profile) {
          await tx.profile.update({
            where: { userId: params.id },
            data: { avatarUrl },
          });
        }
      }

      // If user is a doctor, update doctor-specific fields
      const doctor = await tx.doctor.findUnique({
        where: { userId: params.id },
      });

      if (doctor) {
        // Update specialties if provided
        if (specialties) {
          await tx.doctor.update({
            where: { id: doctor.id },
            data: { specialties },
          });
        }

        // Handle education updates for experience calculation
        if (education && education.length > 0) {
          // First, keep track of which existing education entries to keep
          const existingEducationIds = education
            .filter((edu) => !edu.id.toString().startsWith("temp-"))
            .map((edu) => edu.id);

          // Delete education entries not in the updated list
          await tx.education.deleteMany({
            where: {
              doctorId: doctor.id,
              id: { notIn: existingEducationIds },
            },
          });

          // Then update or create new entries
          for (const edu of education) {
            if (edu.id.toString().startsWith("temp-")) {
              // Create new education entry
              await tx.education.create({
                data: {
                  doctorId: doctor.id,
                  institution: edu.institution,
                  degree: edu.degree,
                  fieldOfStudy: edu.fieldOfStudy,
                  startYear: edu.startYear,
                  endYear: edu.endYear || null,
                },
              });
            } else {
              // Update existing education entry
              await tx.education.update({
                where: { id: edu.id },
                data: {
                  institution: edu.institution,
                  degree: edu.degree,
                  fieldOfStudy: edu.fieldOfStudy,
                  startYear: edu.startYear,
                  endYear: edu.endYear || null,
                },
              });
            }
          }
        }
      }

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile", error: String(error) },
      { status: 500 }
    );
  }
}
