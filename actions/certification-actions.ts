"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface CertificationData {
  name: string;
  issuingBody: string;
  certificationType: string;
  issueDate: Date;
  expiryDate?: Date | null;
  doctorId: string;
}

export async function addCertification(data: CertificationData) {
  try {
    await prisma.certification.create({
      data: {
        name: data.name,
        issuingBody: data.issuingBody,
        certificationType: data.certificationType,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        isActive: !data.expiryDate || data.expiryDate > new Date(),
        doctorId: data.doctorId,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error adding certification:", error);
    throw new Error("Failed to add certification");
  }
}

export async function deleteCertification(id: string) {
  try {
    await prisma.certification.delete({
      where: { id },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error deleting certification:", error);
    throw new Error("Failed to delete certification");
  }
}
