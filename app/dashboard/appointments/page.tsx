import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { Suspense } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, List } from "lucide-react";
import { AppointmentCalendar } from "@/components/appointment-calendar";
import { AppointmentDetails } from "@/components/appointment-details";
import { UpcomingAppointments } from "@/components/upcoming-appointments";
import { PastAppointments } from "@/components/past-appointments";
import { BookAppointment } from "@/components/book-appointment";
import { AppointmentCalendarSkeleton } from "@/components/appointment-calendar-skeleton";

export default async function AppointmentsPage({
  searchParams: p,
}: {
  searchParams: Promise<{
    date?: string;
    appointmentId?: string;
    tab?: string;
  }>;
}) {
  const user = await requireAuth();

  // Get selected date or default to today
  const searchParams = await p;
  const selectedDate = searchParams.date
    ? new Date(searchParams.date)
    : new Date();
  const selectedAppointmentId = searchParams.appointmentId;
  const activeTab = searchParams.tab || "calendar";

  // Format date for display
  const monthYear = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Dermatology Appointments
          </h2>
          <p className="text-gray-500">
            Manage your schedule and skin cancer screening appointments
          </p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar" asChild>
            <a
              href={`/dashboard/appointments?tab=calendar&date=${
                selectedDate.toISOString().split("T")[0]
              }`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </a>
          </TabsTrigger>
          <TabsTrigger value="upcoming" asChild>
            <a href="/dashboard/appointments?tab=upcoming">
              <Clock className="mr-2 h-4 w-4" />
              Upcoming
            </a>
          </TabsTrigger>
          {/* <TabsTrigger value="book" asChild>
            <a href="/dashboard/appointments?tab=book">
              <Calendar className="mr-2 h-4 w-4" />
              Book New
            </a>
          </TabsTrigger> */}
          <TabsTrigger value="past" asChild>
            <a href="/dashboard/appointments?tab=past">
              <List className="mr-2 h-4 w-4" />
              Past
            </a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{monthYear}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={`/dashboard/appointments?tab=calendar&date=${getPreviousMonth(
                        selectedDate
                      )}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous month</span>
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={`/dashboard/appointments?tab=calendar&date=${getNextMonth(
                        selectedDate
                      )}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next month</span>
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<AppointmentCalendarSkeleton />}>
                  <AppointmentCalendar
                    userId={user.id}
                    selectedDate={selectedDate}
                    selectedAppointmentId={selectedAppointmentId}
                  />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="h-[400px] flex items-center justify-center">
                      Loading...
                    </div>
                  }
                >
                  <AppointmentDetails appointmentId={selectedAppointmentId} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <Suspense fallback={<div>Loading upcoming appointments...</div>}>
            <UpcomingAppointments userId={user.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="book">
          <Suspense fallback={<div>Loading booking form...</div>}>
            <BookAppointment userId={user.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="past">
          <Suspense fallback={<div>Loading past appointments...</div>}>
            <PastAppointments userId={user.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for date navigation
function getPreviousMonth(date: Date): string {
  const prevMonth = new Date(date);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  return prevMonth.toISOString().split("T")[0];
}

function getNextMonth(date: Date): string {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toISOString().split("T")[0];
}
