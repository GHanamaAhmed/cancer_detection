import type React from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
    include: {
      patient: true,
      doctor: true,
    },
  });
  if (!user?.doctor && !user?.patient) {
    await prisma.doctor.create({
      data: {
        userId: user?.id!,
      },
    });
  }
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 flex">
        <DashboardNav />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
