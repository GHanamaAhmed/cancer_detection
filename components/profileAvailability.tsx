"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  updateDoctorAvailability,
  deleteDoctorAvailability,
  addDoctorAvailability,
} from "@/actions/availability-actions";

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface ProfileAvailabilityProps {
  doctorId: string;
  availability: Availability[];
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Generate time options from 00:00 to 23:30 in 30-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      options.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export function ProfileAvailability({
  doctorId,
  availability,
}: ProfileAvailabilityProps) {
  const [availabilitySlots, setAvailabilitySlots] = useState<Availability[]>(
    availability || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  });

  // Group availabilities by day for better UI organization
  const availabilitiesByDay = availabilitySlots.reduce((acc, slot) => {
    const day = slot.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(slot);
    return acc;
  }, {} as Record<number, Availability[]>);

  async function handleUpdateAvailability(slot: Availability, isAvailable: boolean) {
    setIsLoading(true);
    try {
      await updateDoctorAvailability(slot.id, { isAvailable });
      setAvailabilitySlots(
        availabilitySlots.map((s) =>
          s.id === slot.id ? { ...s, isAvailable } : s
        )
      );
      toast.success("Availability updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update availability");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteAvailability(id: string) {
    if (!confirm("Are you sure you want to delete this availability slot?")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteDoctorAvailability(id);
      setAvailabilitySlots(availabilitySlots.filter((slot) => slot.id !== id));
      toast.success("Availability slot deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete availability slot");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddAvailability() {
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setIsLoading(true);
    try {
      const addedSlot = await addDoctorAvailability({
        ...newSlot,
        doctorId,
      });
      
      setAvailabilitySlots([...availabilitySlots, addedSlot]);
      toast.success("Availability slot added");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add availability slot");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Appointment Availability</h3>
        <div className="text-sm text-gray-500">
          Set your weekly availability for appointments
        </div>
      </div>

      {/* Add new availability slot */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <h4 className="font-medium">Add New Availability Slot</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week</Label>
                <Select
                  value={newSlot.dayOfWeek.toString()}
                  onValueChange={(value) =>
                    setNewSlot({ ...newSlot, dayOfWeek: parseInt(value) })
                  }
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  value={newSlot.startTime}
                  onValueChange={(value) =>
                    setNewSlot({ ...newSlot, startTime: value })
                  }
                >
                  <SelectTrigger id="startTime">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  value={newSlot.endTime}
                  onValueChange={(value) =>
                    setNewSlot({ ...newSlot, endTime: value })
                  }
                >
                  <SelectTrigger id="endTime">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleAddAvailability} 
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slot
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current availability */}
      <div className="space-y-4">
        <h4 className="font-medium">Current Availability</h4>
        {Object.keys(availabilitiesByDay).length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No availability slots defined yet. Add your first slot above.
          </p>
        ) : (
          Object.entries(availabilitiesByDay).map(([dayNum, slots]) => (
            <Card key={dayNum}>
              <CardContent className="p-4">
                <div className="mb-2 font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {DAYS_OF_WEEK[parseInt(dayNum)]}
                </div>
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between py-2 border-t border-gray-100"
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`available-${slot.id}`}
                          checked={slot.isAvailable}
                          onCheckedChange={(checked) =>
                            handleUpdateAvailability(slot, checked)
                          }
                          disabled={isLoading}
                        />
                        <Label
                          htmlFor={`available-${slot.id}`}
                          className="text-sm text-gray-600"
                        >
                          {slot.isAvailable ? "Available" : "Unavailable"}
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAvailability(slot.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Slot</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}