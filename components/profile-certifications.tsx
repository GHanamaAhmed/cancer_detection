"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Award,
  FileText,
  ExternalLink,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addCertification,
  deleteCertification,
} from "@/actions/certification-actions";
import { toast } from "sonner";

interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  certificationType: string;
  issueDate: Date;
  expiryDate?: Date | null;
  certificateUrl?: string | null;
  isActive: boolean;
}

interface CertificationData {
  name: string;
  issuingBody: string;
  certificationType: string;
  issueDate: Date;
  expiryDate?: Date | null;
  doctorId: string;
}

interface ProfileCertificationsProps {
  certifications: Certification[];
  doctorId: string;
}

export function ProfileCertifications({
  certifications = [],
  doctorId,
}: ProfileCertificationsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleAddCertification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Convert form data to object
      const data: CertificationData = {
        name: formData.get("name") as string,
        issuingBody: formData.get("issuingBody") as string,
        certificationType: formData.get("certificationType") as string,
        issueDate: new Date(formData.get("issueDate") as string),
        expiryDate: formData.get("expiryDate")
          ? new Date(formData.get("expiryDate") as string)
          : null,
        doctorId,
      };

      await addCertification(data);
      toast.success("Certification added successfully");

      // Close dialog by clicking the close button
      // Close dialog by clicking the close button
      (
        document.querySelector("[data-dialog-close]") as HTMLButtonElement
      )?.click();
      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add certification");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCertification(id: string) {
    if (!confirm("Are you sure you want to delete this certification?")) {
      return;
    }

    try {
      await deleteCertification(id);
      toast.success("Certification deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete certification");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="font-medium">Medical Certifications</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Certification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCertification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Certification Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuingBody">Issuing Organization</Label>
                <Input id="issuingBody" name="issuingBody" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificationType">Certification Type</Label>
                <Select name="certificationType" required>
                  <SelectTrigger id="certificationType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOARD">Board Certification</SelectItem>
                    <SelectItem value="SPECIALTY">
                      Specialty Certification
                    </SelectItem>
                    <SelectItem value="COURSE">Course Certificate</SelectItem>
                    <SelectItem value="FELLOWSHIP">Fellowship</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input id="issueDate" name="issueDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">
                    Expiry Date (if applicable)
                  </Label>
                  <Input id="expiryDate" name="expiryDate" type="date" />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline" type="button" data-dialog-close>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Certification"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {certifications.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No certifications added yet. Add your first certification to
            showcase your qualifications.
          </p>
        ) : (
          certifications.map((cert) => (
            <div key={cert.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{cert.name}</h4>
                    <p className="text-sm text-gray-500">{cert.issuingBody}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        {cert.expiryDate &&
                          ` • Expires: ${new Date(
                            cert.expiryDate
                          ).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge
                        className={`${
                          cert.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {cert.isActive ? "Active" : "Expired"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {cert.certificateUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View Certificate</span>
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteCertification(cert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete Certificate</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
