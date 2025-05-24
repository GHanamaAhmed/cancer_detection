"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  User,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  Check,
} from "lucide-react";
import { createAppointment } from "@/actions/appointment-actions";

interface BookAppointmentProps {
  userId: string;
}

interface Doctor {
  id: string;
  name: string;
  image?: string | null;
  specialties?: string[];
  role: string;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

interface AvailabilitySlot {
  time: string;
  formattedDate: string;
  available: boolean;
}

interface AvailabilityDate {
  date: string;
  dayOfWeek: string;
  day: string;
  month: string;
  slots: AvailabilitySlot[];
}

export function BookAppointment({ userId }: BookAppointmentProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilityDates, setAvailabilityDates] = useState<
    AvailabilityDate[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>("IN_PERSON");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(
    new Date()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch connected patients on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/doctors");
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.error || "Failed to fetch doctors");

        setDoctors(data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch doctor availability when a doctor and month are selected
  useEffect(() => {
    if (selectedDoctor && selectedMonth) {
      fetchDoctorAvailability();
    }
  }, [selectedDoctor, selectedMonth]);

  const fetchDoctorAvailability = async () => {
    if (!selectedDoctor) return;

    try {
      setLoading(true);

      // Format dates for API request
      const startDate = new Date(selectedMonth!);
      startDate.setDate(1);

      const endDate = new Date(selectedMonth!);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      const response = await fetch(
        `/api/doctors/${
          selectedDoctor.id
        }/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to fetch availability");

      setAvailabilityDates(data.availability);
      setSelectedDate(null);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleContinueToConfirmation = () => {
    if (!selectedSlot) {
      toast({
        title: "No time selected",
        description: "Please select an available time slot",
        variant: "destructive",
      });
      return;
    }

    setStep(3);
  };

  const handleSubmitAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) {
      toast({
        title: "Missing information",
        description: "Please select a doctor and appointment time",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const appointmentData = {
        doctorId: selectedDoctor.id,
        userId,
        date: selectedSlot,
        type: appointmentType,
        reasonForVisit,
        location: appointmentType === "IN_PERSON" ? "Clinic" : "Video call",
        duration: 30,
      };

      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Appointment booked",
          description: "Your appointment has been scheduled successfully",
        });
        router.push("/dashboard/appointments?tab=upcoming");
      } else {
        throw new Error(result.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking failed",
        description:
          error instanceof Error ? error.message : "Failed to book appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextMonth = () => {
    if (!selectedMonth) return;
    const next = new Date(selectedMonth);
    next.setMonth(next.getMonth() + 1);
    setSelectedMonth(next);
  };

  const prevMonth = () => {
    if (!selectedMonth) return;
    const prev = new Date(selectedMonth);
    prev.setMonth(prev.getMonth() - 1);

    // Don't allow going to past months
    const now = new Date();
    if (
      prev.getMonth() < now.getMonth() &&
      prev.getFullYear() <= now.getFullYear()
    ) {
      return;
    }

    setSelectedMonth(prev);
  };

  // Step 1: Doctor Selection
  const renderDoctorSelection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-6 min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading doctors...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-6 min-h-[400px]">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      );
    }

    if (doctors.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 min-h-[400px]">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No doctors available
          </h3>
          <p className="text-gray-500 text-center mb-6">
            There are no doctors available for scheduling appointments at this
            time.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Select a Doctor</h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleDoctorSelect(doctor)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={doctor.image || undefined}
                      alt={doctor.name}
                    />
                    <AvatarFallback>
                      {doctor.profile
                        ? `${doctor.profile.firstName[0]}${doctor.profile.lastName[0]}`
                        : doctor.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {doctor.profile
                        ? `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName}`
                        : doctor.name}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {doctor.role?.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </div>

                {doctor.specialties && doctor.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doctor.specialties.map((specialty, i) => (
                      <Badge key={i} variant="secondary" className="capitalize">
                        {specialty.toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button className="w-full mt-2">
                  Select
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Step 2: Date & Time Selection
  const renderDateTimeSelection = () => {
    if (!selectedDoctor) return null;

    if (loading) {
      return (
        <div className="flex items-center justify-center p-6 min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading availability...</p>
          </div>
        </div>
      );
    }

    const currentMonth = selectedMonth?.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep(1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Doctors
          </Button>
          <h3 className="text-lg font-medium">Select Date & Time</h3>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={selectedDoctor.image || undefined}
                  alt={selectedDoctor.name}
                />
                <AvatarFallback>
                  {selectedDoctor.profile
                    ? `${selectedDoctor.profile.firstName[0]}${selectedDoctor.profile.lastName[0]}`
                    : selectedDoctor.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedDoctor.profile
                    ? `Dr. ${selectedDoctor.profile.firstName} ${selectedDoctor.profile.lastName}`
                    : selectedDoctor.name}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {selectedDoctor.role?.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <h4 className="text-md font-medium">{currentMonth}</h4>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>

        {availabilityDates.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div
                        key={i}
                        className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Generate calendar days */}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const date = new Date(selectedMonth!);
                      date.setDate(1);
                      const firstDay = date.getDay();
                      date.setDate(i - firstDay + 1);

                      // Check if this day has availability
                      const dateString = date.toISOString().split("T")[0];
                      const hasAvailability = availabilityDates.some(
                        (d) => d.date === dateString
                      );

                      // Check if this date is selected
                      const isSelected = selectedDate === dateString;

                      // Check if day is in current month
                      const isCurrentMonth =
                        date.getMonth() === selectedMonth?.getMonth();

                      // Check if day is in the past
                      const isPast =
                        date < new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <Button
                          key={i}
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          className={`h-8 w-full ${
                            !isCurrentMonth
                              ? "text-gray-300"
                              : isPast
                              ? "text-gray-400 cursor-not-allowed"
                              : !hasAvailability
                              ? "text-gray-400 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={
                            !isCurrentMonth || isPast || !hasAvailability
                          }
                          onClick={() => handleDateSelect(dateString)}
                        >
                          {date.getDate()}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {selectedDate ? (
                <>
                  <h4 className="text-md font-medium">
                    Available Times for{" "}
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {availabilityDates
                      .find((d) => d.date === selectedDate)
                      ?.slots.map((slot, i) => (
                        <Button
                          key={i}
                          variant={
                            selectedSlot === slot.formattedDate
                              ? "default"
                              : "outline"
                          }
                          onClick={() => handleSlotSelect(slot.formattedDate)}
                          disabled={!slot.available}
                        >
                          {slot.time}
                        </Button>
                      ))}
                  </div>

                  {selectedSlot && (
                    <Button
                      className="w-full mt-4"
                      onClick={handleContinueToConfirmation}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Select a date to see available times
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No availability
            </h3>
            <p className="text-gray-500 mb-6">
              This doctor doesn't have any available slots in {currentMonth}.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Select Another Doctor
              </Button>
              <Button onClick={nextMonth}>Check Next Month</Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Step 3: Appointment Details & Confirmation
  const renderAppointmentDetails = () => {
    if (!selectedDoctor || !selectedSlot) return null;

    const appointmentDate = new Date(selectedSlot);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep(2)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Schedule
          </Button>
          <h3 className="text-lg font-medium">Confirm Appointment</h3>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={selectedDoctor.image || undefined}
                    alt={selectedDoctor.name}
                  />
                  <AvatarFallback>
                    {selectedDoctor.profile
                      ? `${selectedDoctor.profile.firstName[0]}${selectedDoctor.profile.lastName[0]}`
                      : selectedDoctor.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedDoctor.profile
                      ? `Dr. ${selectedDoctor.profile.firstName} ${selectedDoctor.profile.lastName}`
                      : selectedDoctor.name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedDoctor.role.toLowerCase().replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{formattedDate}</p>
                  <p className="text-sm text-gray-500">{formattedTime}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h4 className="font-medium">Appointment Type</h4>
          <RadioGroup
            value={appointmentType}
            onValueChange={setAppointmentType}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                id="in-person"
                value="IN_PERSON"
                className="peer sr-only"
              />
              <Label
                htmlFor="in-person"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <User className="mb-2 h-6 w-6" />
                <span>In Person</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                id="video"
                value="VIDEO_CONSULTATION"
                className="peer sr-only"
              />
              <Label
                htmlFor="video"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Video className="mb-2 h-6 w-6" />
                <span>Video Call</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Visit</Label>
          <Textarea
            id="reason"
            placeholder="Briefly describe your symptoms or reason for the visit"
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSubmitAppointment}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Booking...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Confirm Appointment
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {step === 1 && renderDoctorSelection()}
      {step === 2 && renderDateTimeSelection()}
      {step === 3 && renderAppointmentDetails()}
    </div>
  );
}
