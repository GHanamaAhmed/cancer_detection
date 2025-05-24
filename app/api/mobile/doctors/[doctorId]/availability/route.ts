import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { doctorId } = params;
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!doctorId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get doctor's availability settings
    const doctorAvailability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        isAvailable: true,
      },
    });

    if (!doctorAvailability || doctorAvailability.length === 0) {
      return NextResponse.json({ availability: [] });
    }

    // Get existing appointments
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { in: ["CONFIRMED", "REQUESTED"] },
      },
      select: {
        date: true,
        duration: true,
      },
    });

    // Parse date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate availability dates with slots
    const availabilityDates = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Check if doctor has availability settings for this day
      const dayAvailability = doctorAvailability.find(
        (a) => a.dayOfWeek === dayOfWeek
      );

      if (dayAvailability) {
        const date = currentDate.toISOString().split("T")[0];
        const slots = generateTimeSlots(
          currentDate,
          dayAvailability.startTime,
          dayAvailability.endTime,
          existingAppointments
        );

        // Only add days that have available slots
        if (slots.some((slot) => slot.available)) {
          availabilityDates.push({
            date,
            dayOfWeek: currentDate.toLocaleDateString("en-US", {
              weekday: "short",
            }),
            day: currentDate.getDate(),
            month: currentDate.toLocaleDateString("en-US", { month: "short" }),
            slots,
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({ availability: availabilityDates });
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// Helper function to generate time slots
function generateTimeSlots(
  date: Date,
  startTime: string,
  endTime: string,
  existingAppointments: { date: Date; duration: number }[]
) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const slotDate = new Date(date);
  slotDate.setHours(startHour, startMinute, 0, 0);

  const endDateTime = new Date(date);
  endDateTime.setHours(endHour, endMinute, 0, 0);

  // Generate slots in 30-minute intervals
  while (slotDate < endDateTime) {
    const slotEndTime = new Date(slotDate);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + 30);

    // Check if slot overlaps with existing appointments
    const isAvailable = !existingAppointments.some((appt) => {
      const apptEnd = new Date(appt.date);
      apptEnd.setMinutes(apptEnd.getMinutes() + appt.duration);

      return (
        (slotDate >= appt.date && slotDate < apptEnd) ||
        (slotEndTime > appt.date && slotEndTime <= apptEnd) ||
        (slotDate <= appt.date && slotEndTime >= apptEnd)
      );
    });

    // Format time for display
    const formattedTime = slotDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    slots.push({
      time: formattedTime,
      formattedDate: slotDate.toISOString(),
      available: isAvailable,
    });

    // Move to next slot
    slotDate.setMinutes(slotDate.getMinutes() + 30);
  }

  return slots;
}
 