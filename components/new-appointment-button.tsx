"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAppointment } from "@/actions/appointment-actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our data
type Patient = {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
};

type Doctor = {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  specialties?: { name: string }[];
};
  
export function NewAppointmentButton() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch patients and doctors when the dialog opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          // Fetch patients
          const patientsRes = await fetch("/api/patients");
          const patientsData = await patientsRes.json();

          // Fetch doctors
          const doctorsRes = await fetch("/api/doctors");
          const doctorsData = await doctorsRes.json();

          setPatients(patientsData.patients || []);
          setDoctors(doctorsData.doctors || []);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error",
            description: "Failed to load patients and doctors",
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchData();
    }
  }, [open, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createAppointment(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <CalendarIcon className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a patient. Fill out all the required
              fields.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientId">Patient</Label>
              {isLoadingData ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select name="userId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.profile.firstName} {patient.profile.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doctorId">Doctor</Label>
              {isLoadingData ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select name="doctorId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.profile.firstName} {doctor.profile.lastName}
                        {doctor.specialties &&
                          doctor.specialties.length > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({doctor.specialties[0].name})
                            </span>
                          )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input id="date" name="date" type="datetime-local" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PERSON">In Person</SelectItem>
                  <SelectItem value="VIDEO_CONSULTATION">
                    Video Consultation
                  </SelectItem>
                  <SelectItem value="DERMOSCOPY_SCAN">
                    Dermoscopy Scan
                  </SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                  <SelectItem value="BIOPSY">Biopsy</SelectItem>
                  <SelectItem value="SURGICAL_CONSULT">
                    Surgical Consult
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="15"
                step="15"
                defaultValue="30"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Office, Video call, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reasonForVisit">Reason for Visit</Label>
              <Textarea
                id="reasonForVisit"
                name="reasonForVisit"
                placeholder="Brief description of the reason for the appointment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || isLoadingData}>
              {isLoading ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
