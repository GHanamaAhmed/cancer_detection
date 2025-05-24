import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db";

const days = ["S", "M", "T", "W", "T", "F", "S"];

type Appointment = {
  id: string;
  title: string;
  time: string;
  color: string;
};

type CalendarDay = {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
};

interface AppointmentCalendarProps {
  userId: string;
  selectedDate: Date;
  selectedAppointmentId?: string;
}
  
export async function AppointmentCalendar({
  userId,
  selectedDate,
  selectedAppointmentId,
}: AppointmentCalendarProps) {
  // Get the first day of the month
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Get current date for highlighting today
  const currentDate = new Date();
  const isToday = (date: number) => {
    return (
      currentDate.getDate() === date &&
      currentDate.getMonth() === month &&
      currentDate.getFullYear() === year
    );
  };

  // Fetch appointments for this month
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [{ doctorId: userId }, { userId: userId }],
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Group appointments by day
  const appointmentsByDay = new Map<number, Appointment[]>();

  appointments.forEach((appointment) => {
    const appointmentDate = new Date(appointment.date);
    const day = appointmentDate.getDate();

    if (!appointmentsByDay.has(day)) {
      appointmentsByDay.set(day, []);
    }

    const patientName = appointment.user.profile
      ? `${appointment.user.profile.firstName} ${appointment.user.profile.lastName}`
      : appointment.user.name || "Unknown Patient";

    // Determine color based on appointment type and status
    let color = "bg-blue-100 text-blue-700 border-blue-300";
    if (appointment.status === "CANCELED") {
      color = "bg-red-100 text-red-700 border-red-300";
    } else if (appointment.status === "COMPLETED") {
      color = "bg-green-100 text-green-700 border-green-300";
    } else if (appointment.type === "DERMOSCOPY_SCAN") {
      color = "bg-purple-100 text-purple-700 border-purple-300";
    } else if (appointment.type === "BIOPSY") {
      color = "bg-yellow-100 text-yellow-700 border-yellow-300";
    }

    appointmentsByDay.get(day)?.push({
      id: appointment.id,
      title: `${appointment.type.replace(/_/g, " ")} - ${patientName}`,
      time: appointmentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      color,
    });
  });

  // Generate calendar days
  const calendarDays: CalendarDay[] = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      appointments: [],
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: i,
      isCurrentMonth: true,
      isToday: isToday(i),
      appointments: appointmentsByDay.get(i) || [],
    });
  }

  // Next month days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: i,
      isCurrentMonth: false,
      isToday: false,
      appointments: [],
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day, index) => (
          <div key={index} className="py-2 text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => (
          <div key={index} className="relative min-h-[100px] p-1">
            <Button
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full p-0",
                !day.isCurrentMonth && "text-gray-400",
                day.isToday && "bg-blue-100 text-blue-700",
                day.appointments.some((a) => a.id === selectedAppointmentId) &&
                  day.isCurrentMonth &&
                  "bg-blue-600 text-white"
              )}
              asChild
            >
              <a
                href={`/dashboard/appointments?date=${year}-${month + 1}-${
                  day.date
                }`}
              >
                {day.date}
              </a>
            </Button>

            <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
              {day.appointments.map((appointment) => (
                <a
                  key={appointment.id}
                  href={`/dashboard/appointments?date=${year}-${month + 1}-${
                    day.date
                  }&appointmentId=${appointment.id}`}
                  className={cn(
                    "text-xs px-1 py-0.5 rounded border block truncate",
                    appointment.color,
                    appointment.id === selectedAppointmentId &&
                      "ring-2 ring-blue-500"
                  )}
                  title={`${appointment.time} - ${appointment.title}`}
                >
                  {appointment.time}: {appointment.title}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
