"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfileInfo } from "@/actions/profile-actions";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";

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
type User = Prisma.UserGetPayload<{
  include: {
    profile: true;
    doctor: {
      include: {
        certifications: true;
        education: true;
        availability: true;
        facilities: {
          include: {
            facility: true;
          };
        };
      };
    };
  };
}>;

type Doctor = User["doctor"];

type Profile = User["profile"];

type Facility = Prisma.FacilityGetPayload<{}>;

interface ProfileInfoProps {
  user: User;
  doctor?: Doctor | null;
  profile?: Profile | null;
  primaryFacility?: Facility | null;
}

export function ProfileInfo({
  user,
  doctor,
  profile,
  primaryFacility,
}: ProfileInfoProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Convert form data to object
      const data: ProfileData = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phoneNumber: formData.get("phone") as string,
        specialties: formData.get("specialty")
          ? [formData.get("specialty") as string]
          : [],
        licenseNumber: formData.get("license") as string,
        bio: formData.get("bio") as string,
        facilityName: formData.get("hospital") as string,
        address: formData.get("address") as string,
      };

      await updateProfileInfo(user.id, data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={profile?.firstName || ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={profile?.lastName || ""}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email || ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phoneNumber || ""}
          />
        </div>
      </div>

      {doctor && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specialty">Primary Specialty</Label>
              <Select
                defaultValue={doctor.specialties?.[0] || ""}
                name="specialty"
              >
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="oncology">Oncology</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                  <SelectItem value="general">General Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Medical License Number</Label>
              <Input
                id="license"
                name="license"
                defaultValue={doctor.licenseNumber || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={5}
              defaultValue={doctor.bio || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hospital">Primary Hospital/Clinic</Label>
              <Input
                id="hospital"
                name="hospital"
                defaultValue={primaryFacility?.name || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Office Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={
                  primaryFacility?.address || profile?.address || ""
                }
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
