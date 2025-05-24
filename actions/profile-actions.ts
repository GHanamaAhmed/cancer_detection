"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specialties?: string[];
  licenseNumber?: string;
  bio?: string;
  facilityName?: string;
  address?: string;
}

export async function updateProfileInfo(userId: string, data: ProfileData) {
  // Extract data fields
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    specialties,
    licenseNumber,
    bio,
    facilityName,
    address,
  } = data;

  // Begin transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Update user email
      if (email) {
        await tx.user.update({
          where: { id: userId },
          data: {
            email,
            name: `${firstName} ${lastName}`,
          },
        });
      }

      // Update or create profile
      await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          firstName,
          lastName,
          phoneNumber,
          address,
        },
        update: {
          firstName,
          lastName,
          phoneNumber,
          address,
        },
      });

      // Check if user has doctor role
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { role: true, doctor: { select: { id: true } } },
      });

      if (
        user &&
        (user.role === "DOCTOR" ||
          user.role === "DERMATOLOGIST" ||
          user.role === "ONCOLOGIST" ||
          user.role === "PATHOLOGIST")
      ) {
        // Update or create doctor record
        if (user.doctor) {
          await tx.doctor.update({
            where: { id: user.doctor.id },
            data: {
              licenseNumber,
              bio,
              specialties: specialties ? specialties.filter(Boolean) : [],
            },
          });
        } else {
          await tx.doctor.create({
            data: {
              userId,
              licenseNumber,
              bio,
              specialties: specialties ? specialties.filter(Boolean) : [],
            },
          });
        }

        // Handle facility if provided
        if (facilityName && user.doctor) {
          // First find the facility by name
          const existingFacility = await tx.facility.findFirst({
            where: {
              name: facilityName,
            },
          });

          // Then create or update based on whether it exists
          let facility;
          if (existingFacility) {
            facility = existingFacility;
          } else {
            facility = await tx.facility.create({
              data: {
                name: facilityName,
                facilityType: "CLINIC",
                address: address || "Address not provided",
                city: "N/A",
                state: "N/A",
                zipCode: "N/A",
                country: "N/A",
              },
            });
          }

          // Find if a relationship already exists
          const existingDoctorFacility = await tx.doctorFacility.findFirst({
            where: {
              doctorId: user.doctor.id,
              facilityId: facility.id,
            },
          });

          // Create or update the doctor-facility relationship
          if (existingDoctorFacility) {
            // Update existing relationship
            await tx.doctorFacility.update({
              where: {
                id: existingDoctorFacility.id,
              },
              data: {
                isPrimary: true,
              },
            });
          } else {
            // Create new relationship
            await tx.doctorFacility.create({
              data: {
                doctorId: user.doctor.id,
                facilityId: facility.id,
                isPrimary: true,
              },
            });
          }

          // Set all other facilities as non-primary
          if (existingDoctorFacility?.id) {
            await tx.doctorFacility.updateMany({
              where: {
                doctorId: user.doctor.id,
                id: { not: existingDoctorFacility.id },
              },
              data: {
                isPrimary: false,
              },
            });
          }
        }
      }
    });

    // Revalidate the profile page
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }
}
