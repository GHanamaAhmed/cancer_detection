import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Upload, Award, Clock, Users, FileText } from "lucide-react";
import { ProfileInfo } from "@/components/profile-info";
import { ProfileCertifications } from "@/components/profile-certifications";
import { ProfileSecurity } from "@/components/profile-security";
import { getSession } from "@/lib/auth";
import { ProfileAvailability } from "@/components/profileAvailability";
import { EditProfileDialog } from "@/components/edit-profile-dialog";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch user data with related profile and doctor info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      doctor: {
        include: {
          certifications: true,
          education: true,
          availability: true,
          facilities: {
            include: {
              facility: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Get primary facility if it exists
  const primaryFacility = user.doctor?.facilities.find(
    (f) => f.isPrimary
  )?.facility;

  // Format doctor experience (years since first education end date)
  const getExperienceYears = (): string => {
    if (!user.doctor?.education || user.doctor.education.length === 0) {
      return "N/A";
    }

    const earliestGradYear = Math.min(
      ...user.doctor.education
        .filter((edu) => edu.endYear)
        .map((edu) => edu.endYear || 9999)
    );

    if (earliestGradYear === 9999) return "N/A";

    const years = new Date().getFullYear() - earliestGradYear;
    return years > 0 ? `${years}+ years` : "New";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          <p className="text-gray-500">
            Manage your account and view your statistics
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={
                      user.profile?.avatarUrl ||
                      user.image ||
                      "/placeholder.svg?height=96&width=96"
                    }
                    alt={user.name || "Profile"}
                  />
                  <AvatarFallback>
                    {user.name?.substring(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
                <EditProfileDialog
                  userId={user.id}
                  name={user.name || ""}
                  avatarUrl={user.profile?.avatarUrl || user.image}
                  specialties={user.doctor?.specialties || []}
                  education={user.doctor?.education || []}
                  isDoctor={!!user.doctor}
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-sm text-gray-500">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>

            {user.doctor && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Experience</p>
                    <p className="text-sm text-gray-500">
                      {getExperienceYears()}
                    </p>
                  </div>
                </div>

                {user.doctor.specialties &&
                  user.doctor.specialties.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Specialization</p>
                        <p className="text-sm text-gray-500">
                          {user.doctor.specialties.join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-gray-500">
                      {user.createdAt.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <Tabs defaultValue="info">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Details</CardTitle>
                <TabsList>
                  <TabsTrigger value="info">Personal Info</TabsTrigger>
                  {user.doctor && (
                    <>
                      <TabsTrigger value="certifications">
                        Certifications
                      </TabsTrigger>
                      <TabsTrigger value="availability">
                        Availability
                      </TabsTrigger>
                    </>
                  )}
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Manage your profile information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="info">
                <ProfileInfo
                  user={user}
                  doctor={user.doctor}
                  profile={user.profile}
                  primaryFacility={primaryFacility}
                />
              </TabsContent>
              {user.doctor && (
                <>
                  <TabsContent value="certifications">
                    <ProfileCertifications
                      certifications={user.doctor.certifications}
                      doctorId={user.doctor.id}
                    />
                  </TabsContent>
                  <TabsContent value="availability">
                    <ProfileAvailability
                      doctorId={user.doctor.id}
                      availability={user.doctor.availability}
                    />
                  </TabsContent>
                </>
              )}
              <TabsContent value="security">
                <ProfileSecurity userId={user.id} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
