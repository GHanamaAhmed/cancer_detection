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

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        patient: true,
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format data for mobile app
    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            phoneNumber: user.profile.phoneNumber,
            dateOfBirth: user.profile.dateOfBirth,
            gender: user.profile.gender,
            avatarUrl: user.profile.avatarUrl,
            address: user.profile.address,
            city: user.profile.city,
            state: user.profile.state,
            zipCode: user.profile.zipCode,
            country: user.profile.country,
          }
        : null,
      patient: user.patient
        ? {
            height: user.patient.height,
            weight: user.patient.weight,
            allergies: user.patient.allergies,
            skinType: user.patient.skinType,
            familyHistory: user.patient.familyHistory,
            previousMelanoma: user.patient.previousMelanoma,
            sunscreenUse: user.patient.sunscreenUse,
            lastExamDate: user.patient.lastExamDate,
          }
        : null,
      settings: user.settings
        ? {
            darkMode: user.settings.darkMode,
            enableNotifications: user.settings.enableNotifications,
            enableCameraAccess: user.settings.enableCameraAccess,
            enableLocationAccess: user.settings.enableLocationAccess,
            language: user.settings.language,
          }
        : {
            darkMode: false,
            enableNotifications: true,
            enableCameraAccess: true,
            enableLocationAccess: true,
            language: "en",
          },
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error: any) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const updateData = await req.json();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        patient: true,
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user record
    if (updateData.name) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: updateData.name,
        },
      });
    }

    // Update or create profile
    if (updateData.profile) {
      const profileData = {
        firstName: updateData.profile.firstName,
        lastName: updateData.profile.lastName,
        phoneNumber: updateData.profile.phoneNumber,
        dateOfBirth: updateData.profile.dateOfBirth
          ? new Date(updateData.profile.dateOfBirth)
          : undefined,
        gender: updateData.profile.gender,
        address: updateData.profile.address,
        city: updateData.profile.city,
        state: updateData.profile.state,
        zipCode: updateData.profile.zipCode,
        country: updateData.profile.country,
      };

      if (user.profile) {
        await prisma.profile.update({
          where: { userId },
          data: profileData,
        });
      } else {
        await prisma.profile.create({
          data: {
            ...profileData,
            user: { connect: { id: userId } },
          },
        });
      }
    }

    // Update or create patient record
    if (updateData.patient) {
      const patientData = {
        height: updateData.patient.height,
        weight: updateData.patient.weight,
        allergies: updateData.patient.allergies,
        skinType: updateData.patient.skinType,
        familyHistory: updateData.patient.familyHistory,
        previousMelanoma: updateData.patient.previousMelanoma,
        sunscreenUse: updateData.patient.sunscreenUse,
        lastExamDate: updateData.patient.lastExamDate
          ? new Date(updateData.patient.lastExamDate)
          : undefined,
      };

      if (user.patient) {
        await prisma.patient.update({
          where: { userId },
          data: patientData,
        });
      } else {
        await prisma.patient.create({
          data: {
            ...patientData,
            user: { connect: { id: userId } },
          },
        });
      }
    }

    // Update or create settings
    if (updateData.settings) {
      const settingsData = {
        darkMode: updateData.settings.darkMode,
        enableNotifications: updateData.settings.enableNotifications,
        enableCameraAccess: updateData.settings.enableCameraAccess,
        enableLocationAccess: updateData.settings.enableLocationAccess,
        language: updateData.settings.language,
      };

      if (user.settings) {
        await prisma.userSettings.update({
          where: { userId },
          data: settingsData,
        });
      } else {
        await prisma.userSettings.create({
          data: {
            ...settingsData,
            user: { connect: { id: userId } },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
