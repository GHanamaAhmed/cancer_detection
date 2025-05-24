import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  List,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { PatientList } from "@/components/patient-list";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { LesionRiskDistribution } from "@/components/lesion-risk-distribution";
import { AverageDetectionTime } from "@/components/average-detection-time";
import { Suspense } from "react";

export default async function Dashboard() {
  const user = await requireAuth();

  // Get current date and previous date ranges for comparisons
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // Last month date range
  const lastMonthStart = new Date(today);
  lastMonthStart.setMonth(today.getMonth() - 1);
  lastMonthStart.setDate(1);
  lastMonthStart.setHours(0, 0, 0, 0);

  const lastMonthEnd = new Date(today);
  lastMonthEnd.setDate(0); // Last day of previous month
  lastMonthEnd.setHours(23, 59, 59, 999);

  // Last week date range
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);

  // ======= CURRENT STATS =======
  // Fetch total patients
  const totalPatients = await prisma.user.count({
    where: {
      role: "PATIENT",
      patient: {
        ConnectionRequest: {
          some: {
            doctor: {
              userId: user.id,
            },
            status: "APPROVED",
          },
        },
      },
    },
  });

  // Fetch total patients from last month for comparison
  const lastMonthPatients = await prisma.user.count({
    where: {
      role: "PATIENT",
      patient: {
        ConnectionRequest: {
          some: {
            doctor: {
              userId: user.id,
            },
            status: "APPROVED",
            createdAt: {
              lt: lastMonthStart,
            },
          },
        },
      },
    },
  });

  // Calculate patient growth percentage
  const patientGrowth =
    lastMonthPatients > 0
      ? Math.round(
          ((totalPatients - lastMonthPatients) / lastMonthPatients) * 100
        )
      : 0;
  const patientGrowthText =
    patientGrowth > 0
      ? `+${patientGrowth}% from last month`
      : patientGrowth < 0
      ? `${patientGrowth}% from last month`
      : "No change from last month";

  // Fetch today's appointments
  const todayAppointments = await prisma.appointment.count({
    where: {
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
      doctor: {
        profile: {
          userId: user.id,
        },
      },
    },
  });

  // Count completed appointments today
  const completedAppointments = await prisma.appointment.count({
    where: {
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
      doctor: {
        profile: {
          userId: user.id,
        },
      },
      status: "COMPLETED",
    },
  });

  // Calculate remaining appointments
  const remainingAppointments = Math.max(
    0,
    todayAppointments - completedAppointments
  );
  const appointmentDescription =
    remainingAppointments > 0
      ? `${remainingAppointments} remaining today`
      : "All appointments completed";

  // Fetch high risk cases
  const highRiskCases = await prisma.analysisResult.count({
    where: {
      riskLevel: "HIGH",
      user: {
        patient: {
          ConnectionRequest: {
            some: {
              doctor: {
                userId: user.id,
              },
              status: "APPROVED",
            },
          },
        },
      },
    },
  });

  // Count unreviewed high risk cases
  const unreviewedHighRiskCases = await prisma.analysisResult.count({
    where: {
      riskLevel: "HIGH",
      reviewedByDoctor: false,
      user: {
        patient: {
          ConnectionRequest: {
            some: {
              doctor: {
                userId: user.id,
              },
              status: "APPROVED",
            },
          },
        },
      },
    },
  });

  // Create a meaningful description for high risk cases
  const highRiskDescription =
    unreviewedHighRiskCases > 0
      ? `${unreviewedHighRiskCases} need review`
      : "All cases reviewed";

  // Count new patients added this week
  const newConnectionsThisWeek = await prisma.connectionRequest.count({
    where: {
      doctor: {
        userId: user.id,
      },
      status: "APPROVED",
      createdAt: {
        gte: lastWeekStart,
      },
    },
  });

  // Create description for connected patients
  const connectionsDescription =
    newConnectionsThisWeek > 0
      ? `+${newConnectionsThisWeek} this week`
      : "No new connections this week";

  // Determine trend directions based on data
  const patientTrend =
    patientGrowth > 0 ? "up" : patientGrowth < 0 ? "down" : "neutral";
  const highRiskTrend = unreviewedHighRiskCases > 0 ? "up" : "down";
  const connectionsTrend = newConnectionsThisWeek > 0 ? "up" : "neutral";

  // Fetch upcoming appointments
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: user.id,
      date: {
        gte: new Date(),
      },
      status: {
        in: ["REQUESTED", "CONFIRMED"],
      },
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      lesionCase: {
        select: {
          riskLevel: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
    take: 5,
  });

  // Format appointments for the PatientList component
  const formattedAppointments = upcomingAppointments.map((appointment) => {
    const patientName = appointment.user.profile
      ? `${appointment.user.profile.firstName} ${appointment.user.profile.lastName}`
      : appointment.user.name || "Unknown Patient";

    const initials = appointment.user.profile
      ? `${appointment.user.profile.firstName.charAt(
          0
        )}${appointment.user.profile.lastName.charAt(0)}`
      : appointment.user.name
          ?.split(" ")
          .map((n) => n.charAt(0))
          .join("") || "??";

    // Map the risk level from the database to the expected type
    let risk: "low" | "medium" | "high" = "low";
    if (appointment.lesionCase?.riskLevel === "MEDIUM") {
      risk = "medium";
    } else if (
      appointment.lesionCase?.riskLevel === "HIGH" ||
      appointment.lesionCase?.riskLevel === "CRITICAL"
    ) {
      risk = "high";
    }

    return {
      id: appointment.id,
      name: patientName,
      image:
        appointment.user.image ||
        appointment.user.profile?.avatarUrl ||
        "/placeholder.svg?height=40&width=40",
      initials,
      appointment: appointment.type.replace(/_/g, " ").toLowerCase(),
      time: new Date(appointment.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      risk,
    };
  });

  const connectedPatients = await prisma.user.count({
    where: {
      patient: {
        ConnectionRequest: {
          some: {
            doctor: {
              userId: user.id,
            },
          },
        },
      },
    },
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || "Doctor"}!
          </h2>
          <p className="text-gray-500">
            Here's what's happening with your skin cancer patients today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/patients">
              <List className="mr-2 h-4 w-4" />
              View Patient List
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={totalPatients.toString()}
          description={patientGrowthText}
          icon={Users}
          trend={patientTrend}
        />
        <StatsCard
          title="Today's Screenings"
          value={todayAppointments.toString()}
          description={appointmentDescription}
          icon={Calendar}
          trend="neutral"
        />
        <StatsCard
          title="High Risk Lesions"
          value={highRiskCases.toString()}
          description={highRiskDescription}
          icon={AlertTriangle}
          trend={highRiskTrend}
        />
        <StatsCard
          title="Connected Patients"
          value={connectedPatients.toString()}
          description={connectionsDescription}
          icon={UserCheck}
          trend={connectionsTrend}
        />
        <Suspense
          fallback={
            <StatsCard
              title="Average Detection Time"
              value="Loading..."
              description=""
              icon={Clock}
              trend="neutral"
            />
          }
        >
          <AverageDetectionTime />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lesion Risk Distribution</CardTitle>
            <CardDescription>
              Patient cases by melanoma risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-[200px] flex items-center justify-center">
                  Loading risk data...
                </div>
              }
            >
              <LesionRiskDistribution />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your schedule for today</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/appointments">
                <UserPlus className="mr-2 h-4 w-4" />
                View Requests
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <PatientList patients={formattedAppointments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
