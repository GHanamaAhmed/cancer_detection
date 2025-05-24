"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Upload, X, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CldUploadWidget } from "next-cloudinary";

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number | null;
}

interface EditProfileDialogProps {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  specialties?: string[];
  education?: Education[];
  isDoctor: boolean;
}

export function EditProfileDialog({
  userId,
  name,
  avatarUrl,
  specialties = [],
  education = [],
  isDoctor,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState(name);
  const [userSpecialties, setUserSpecialties] = useState(
    specialties.join(", ")
  );
  const [educationList, setEducationList] = useState<Education[]>(education);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Handle education changes
  const handleEducationChange = (
    id: string,
    field: string,
    value: string | number | null
  ) => {
    setEducationList(
      educationList.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  // Add a new education entry
  const addEducation = () => {
    setEducationList([
      ...educationList,
      {
        id: `temp-${Date.now()}`,
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startYear: new Date().getFullYear(),
        endYear: null,
      },
    ]);
  };

  // Remove education entry
  const removeEducation = (id: string) => {
    setEducationList(educationList.filter((edu) => edu.id !== id));
  };

  // Handle Cloudinary upload success
  const handleUploadSuccess = (result: any) => {
    setUploadedImageUrl(result.info.secure_url);
    toast({
      title: "Image uploaded",
      description: "Your profile photo has been uploaded successfully",
    });
  };

  // Submit the form data
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update the user profile data
      const response = await fetch(`/api/users/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          avatarUrl: uploadedImageUrl,
          specialties: userSpecialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          education: educationList,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
            {/* Profile Photo */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={uploadedImageUrl || avatarUrl || "/placeholder.svg"}
                  alt={userName}
                />
                <AvatarFallback>
                  {userName?.substring(0, 2) || "??"}
                </AvatarFallback>
              </Avatar>

              <CldUploadWidget
                
                uploadPreset={
                  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
                  "heathcare"
                }
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => open()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Photo
                  </Button>
                )}
              </CldUploadWidget>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            {/* Doctor-specific fields */}
            {isDoctor && (
              <>
                {/* Specialties */}
                <div className="grid gap-2">
                  <Label htmlFor="specialties">Specialization</Label>
                  <Textarea
                    id="specialties"
                    value={userSpecialties}
                    onChange={(e) => setUserSpecialties(e.target.value)}
                    placeholder="Enter specialties separated by commas"
                    className="min-h-[80px]"
                  />
                  <p className="text-sm text-gray-500">
                    Enter specialties separated by commas (e.g., "Dermatology,
                    Skin Cancer, Melanoma")
                  </p>
                </div>

                {/* Education (for experience calculation) */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Education History</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEducation}
                    >
                      Add Education
                    </Button>
                  </div>

                  {educationList.map((edu, index) => (
                    <div
                      key={edu.id}
                      className="grid gap-3 p-3 border rounded-md relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>

                      <div className="grid gap-2">
                        <Label htmlFor={`institution-${index}`}>
                          Institution
                        </Label>
                        <Input
                          id={`institution-${index}`}
                          value={edu.institution}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              "institution",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`degree-${index}`}>Degree</Label>
                        <Input
                          id={`degree-${index}`}
                          value={edu.degree}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              "degree",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`field-${index}`}>Field of Study</Label>
                        <Input
                          id={`field-${index}`}
                          value={edu.fieldOfStudy}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              "fieldOfStudy",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`startYear-${index}`}>
                            Start Year
                          </Label>
                          <Input
                            id={`startYear-${index}`}
                            type="number"
                            value={edu.startYear}
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                "startYear",
                                parseInt(e.target.value, 10)
                              )
                            }
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`endYear-${index}`}>End Year</Label>
                          <Input
                            id={`endYear-${index}`}
                            type="number"
                            value={edu.endYear || ""}
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                "endYear",
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : null
                              )
                            }
                            placeholder="Current"
                          />
                          <p className="text-xs text-gray-500">
                            Leave empty if currently attending
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {educationList.length === 0 && (
                    <div className="p-4 text-center border border-dashed rounded-md text-gray-500">
                      No education history. Add your education to calculate
                      experience years.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
