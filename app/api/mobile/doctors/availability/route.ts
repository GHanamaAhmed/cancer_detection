import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get doctorId from query params
    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Get the doctor's user record to ensure they exist
    const doctorUser = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, doctor: { select: { id: true } } },
    });

    if (!doctorUser || !doctorUser.doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Parse the date range
    const today = new Date();
    const start = startDate ? new Date(startDate) : today;
    let end = endDate ? new Date(endDate) : new Date();
    end.setDate(start.getDate() + 14); // Default to 2 weeks if not specified

    // Get the doctor's availability schedule
    const availabilitySchedule = await prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctorUser.doctor.id,
        isAvailable: true,
      },
    });

    // Get the doctor's existing appointments in the date range
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        date: {
          gte: start,
          lte: end,
        },
        status: {
          in: ["CONFIRMED", "REQUESTED"],
        },
      },
      select: {
        date: true,
        duration: true,
      },
    });

    // Generate available slots for the date range
    const availableSlots = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 6 for Saturday

      // Find if this day is in the doctor's availability
      const daySchedule = availabilitySchedule.find(
        (a) => a.dayOfWeek === dayOfWeek
      );

      if (daySchedule) {
        // Parse the available hours
        const [startHour, startMinute] = daySchedule.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = daySchedule.endTime.split(":").map(Number);

        // Generate available time slots (30-minute blocks)
        let slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMinute, 0, 0);

        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHour, endMinute, 0, 0);

        // For past dates, don't generate slots
        if (slotEnd < today) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // For today, only generate slots that haven't passed yet
        if (currentDate.toDateString() === today.toDateString()) {
          const currentTime = new Date();
          // Add 1 hour buffer for today's appointments
          currentTime.setHours(currentTime.getHours() + 1);
          if (slotStart < currentTime) {
            slotStart = new Date(currentTime);
            // Round up to the nearest 30 minutes
            const minutes = slotStart.getMinutes();
            slotStart.setMinutes(minutes + (30 - (minutes % 30)), 0, 0);
          }
        }

        while (slotStart < slotEnd) {
          const slotEndTime = new Date(slotStart);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + 30); // 30-minute slots

          // Check if this slot conflicts with existing appointments
          const isBooked = existingAppointments.some((appt) => {
            const apptStart = new Date(appt.date);
            const apptEnd = new Date(appt.date);
            apptEnd.setMinutes(apptEnd.getMinutes() + appt.duration);

            return (
              (slotStart >= apptStart && slotStart < apptEnd) ||
              (slotEndTime > apptStart && slotEndTime <= apptEnd) ||
              (slotStart <= apptStart && slotEndTime >= apptEnd)
            );
          });

          if (!isBooked) {
            availableSlots.push({
              date: new Date(slotStart),
              formattedDate: slotStart.toISOString(),
              dayOfWeek: slotStart.toLocaleDateString("en-US", {
                weekday: "short",
              }),
              day: slotStart.getDate(),
              month: slotStart.toLocaleDateString("en-US", { month: "short" }),
              time: slotStart.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true, // Change to true for AM/PM format
              }),
            });
          }

          slotStart = slotEndTime;
        } 
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group slots by date
    const groupedSlots = availableSlots.reduce((acc, slot) => {
      const dateKey = slot.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          dayOfWeek: slot.dayOfWeek,
          day: slot.day,
          month: slot.month,
          slots: [],
        };
      }
      acc[dateKey].slots.push({
        time: slot.time,
        formattedDate: slot.formattedDate,
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: Object.values(groupedSlots),
    });
  } catch (error: any) {
    console.error("Error fetching doctor availability:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch doctor availability" },
      { status: 500 }
    );
  }
}
