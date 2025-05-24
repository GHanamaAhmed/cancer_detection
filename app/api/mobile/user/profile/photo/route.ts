import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();
    const { imageUrl } = data;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user image
    await prisma.user.update({
      where: { id: userId },
      data: {
        image: imageUrl,
      },
    });

    // Update profile avatar if it exists
    if (user.profile) {
      await prisma.profile.update({
        where: { userId },
        data: {
          avatarUrl: imageUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile photo updated successfully",
      data: { imageUrl },
    });
  } catch (error: any) {
    console.error("Error updating profile photo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile photo" },
      { status: 500 }
    );
  }
}
