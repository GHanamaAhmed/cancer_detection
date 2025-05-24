import { prisma } from "@/lib/db";

interface DetectionRatesChartProps {
  period: string;
}

export async function DetectionRatesChart({
  period,
}: DetectionRatesChartProps) {
  // In a real app, this would fetch actual data from the database
  // For now, we'll use mock data that simulates database results

  // Get analytics data from the database
  const analyticsData = await prisma.analyticsData.findMany({
    orderBy: {
      date: "asc",
    },
    take: period === "weekly" ? 7 : period === "monthly" ? 6 : 12,
  });

  // If no data exists, create some sample data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  // Calculate early and late detection percentages
  const chartData =
    analyticsData.length > 0
      ? analyticsData.map((data) => {
          const totalDetections = data.earlyDetections + data.lateDetections;
          const earlyPercentage =
            totalDetections > 0
              ? Math.round((data.earlyDetections / totalDetections) * 100)
              : 0;
          const latePercentage =
            totalDetections > 0
              ? Math.round((data.lateDetections / totalDetections) * 100)
              : 0;

          return {
            month: new Date(data.date).toLocaleString("default", {
              month: "short",
            }),
            earlyPercentage,
            latePercentage,
          };
        })
      : months.map((month, index) => {
          // Generate random percentages that add up to 100%
          const earlyPercentage = 60 + Math.floor(Math.random() * 25);
          const latePercentage = 100 - earlyPercentage;

          return {
            month,
            earlyPercentage,
            latePercentage,
          };
        });

  // Calculate averages for the stats
  const avgEarlyDetection = Math.round(
    chartData.reduce((sum, item) => sum + item.earlyPercentage, 0) /
      chartData.length
  );
  const avgLateDetection = Math.round(
    chartData.reduce((sum, item) => sum + item.latePercentage, 0) /
      chartData.length
  );

  // Calculate improvement from previous period (mock data)
  const improvement = 5.2;

  return (
    <div className="space-y-6">
      <div className="h-[400px] rounded-md border p-4">
        <div className="flex h-full flex-col justify-between">
          <div className="flex h-full items-end gap-8">
            <div className="flex h-full flex-col justify-end">
              <div className="text-xs text-gray-500">100%</div>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">75%</div>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">50%</div>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">25%</div>
              <div className="flex-1"></div>
              <div className="text-xs text-gray-500">0%</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end gap-1">
              <div className="relative flex flex-1 flex-col justify-end">
                <div className="absolute bottom-0 w-full border-b border-dashed border-gray-200"></div>
                <div className="absolute bottom-[25%] w-full border-b border-dashed border-gray-200"></div>
                <div className="absolute bottom-[50%] w-full border-b border-dashed border-gray-200"></div>
                <div className="absolute bottom-[75%] w-full border-b border-dashed border-gray-200"></div>
                <div className="absolute bottom-[100%] w-full border-b border-dashed border-gray-200"></div>

                <div className="flex h-full w-full items-end">
                  <div className="flex w-full gap-4">
                    {chartData.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-1 flex-col items-center"
                      >
                        <div className="flex w-full gap-1">
                          <div
                            className="h-[0%] flex-1 rounded-t-md bg-green-500"
                            style={{ height: `${item.earlyPercentage}%` }}
                          ></div>
                          <div
                            className="h-[0%] flex-1 rounded-t-md bg-red-500"
                            style={{ height: `${item.latePercentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {item.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-sm">Early Melanoma Detection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-sm">Late Melanoma Detection</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md bg-gray-100 p-4 text-center">
          <div className="text-sm font-medium text-gray-500">
            Average Early Detection
          </div>
          <div className="text-2xl font-bold text-green-600">
            {avgEarlyDetection}%
          </div>
          <div className="text-xs text-green-600">
            ↑ {improvement}% from last period
          </div>
        </div>
        <div className="rounded-md bg-gray-100 p-4 text-center">
          <div className="text-sm font-medium text-gray-500">
            Average Late Detection
          </div>
          <div className="text-2xl font-bold text-red-600">
            {avgLateDetection}%
          </div>
          <div className="text-xs text-green-600">
            ↓ {improvement}% from last period
          </div>
        </div>
        <div className="rounded-md bg-gray-100 p-4 text-center">
          <div className="text-sm font-medium text-gray-500">
            Survival Rate Improvement
          </div>
          <div className="text-2xl font-bold text-blue-600">+7.6%</div>
          <div className="text-xs text-blue-600">Year over year</div>
        </div>
      </div>
    </div>
  );
}
