import { Clock } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { prisma } from "@/lib/db";

export async function AverageDetectionTime() {
  // Fetch average detection time from the database
  const analyticsData = await prisma.analyticsData.findMany({
    orderBy: {
      date: "desc",
    },
    take: 1,
  });

  // Get the average detection time from the most recent analytics data
  // If no data exists, use a default value
  const avgDetectionTime =
    analyticsData.length > 0 ? analyticsData[0].avgDetectionTime : 14;

  // Calculate the trend based on previous data
  const previousAnalytics = await prisma.analyticsData.findMany({
    orderBy: {
      date: "desc",
    },
    skip: 1,
    take: 1,
  });

  let trend: "neutral" | "up" | "down" | undefined = "neutral";
  let description = "";

  if (previousAnalytics.length > 0) {
    const previousAvgTime = previousAnalytics[0].avgDetectionTime;
    const difference = previousAvgTime - avgDetectionTime;

    if (difference > 0) {
      trend = "up";
      description = `-${difference.toFixed(1)} days from last month`;
    } else if (difference < 0) {
      trend = "down";
      description = `+${Math.abs(difference).toFixed(1)} days from last month`;
    } else {
      description = "Same as last month";
    }
  } else {
    description = "No previous data for comparison";
  }

  return (
    <StatsCard
      title="Average Detection Time"
      value={`${avgDetectionTime.toFixed(1)} days`}
      description={description}
      icon={Clock}
      trend={trend}
    />
  );
}
