"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";

interface SecuritySettings {
  sessionTimeout?: number;
  loginNotifications?: boolean;
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    // Get the user with their current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user || !user.password) {
      throw new Error("User not found or no password set");
    }

    // Verify current password
    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash and update new password
    const hashedPassword = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

export async function updateSecuritySettings(userId: string, settings: SecuritySettings) {
  try {
    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...settings,
      },
      update: {
        ...settings,
      },
    });
    
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating security settings:", error);
    throw new Error("Failed to update security settings");
  }
}