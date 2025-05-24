import { prisma } from "@/lib/db";

interface PatientDistributionChartProps {
  period: string;
}

export async function PatientDistributionChart({
  period,
}: PatientDistributionChartProps) {
  // Fetch patient data from the database
  const patients = await prisma.user.findMany({
    where: {
      role: "PATIENT",
    },
    include: {
      profile: true,
    },
  });

  // Calculate age distribution
  const ageGroups = {
    "0-18": 0,
    "19-30": 0,
    "31-45": 0,
    "46-60": 0,
    "61+": 0,
  };

  // Calculate gender distribution
  const genderDistribution = {
    MALE: 0,
    FEMALE: 0,
    OTHER: 0,
    PREFER_NOT_TO_SAY: 0,
  };

  // Calculate geographic distribution
  const geoDistribution = {
    Urban: 0,
    Rural: 0,
  };

  // Process patient data
  patients.forEach((patient) => {
    // Age calculation
    if (patient.profile?.dateOfBirth) {
      const birthDate = new Date(patient.profile.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age <= 18) ageGroups["0-18"]++;
      else if (age <= 30) ageGroups["19-30"]++;
      else if (age <= 45) ageGroups["31-45"]++;
      else if (age <= 60) ageGroups["46-60"]++;
      else ageGroups["61+"]++;
    }

    // Gender calculation
    if (patient.profile?.gender) {
      genderDistribution[patient.profile.gender]++;
    }

    // Geographic calculation (simplified)
    if (patient.profile?.city) {
      // This is a simplification - in a real app, you'd have more sophisticated logic
      const bigCities = [
        "New York",
        "Los Angeles",
        "Chicago",
        "Houston",
        "Phoenix",
      ];
      if (bigCities.some((city) => patient.profile?.city?.includes(city))) {
        geoDistribution.Urban++;
      } else {
        geoDistribution.Rural++;
      }
    }
  });

  // Calculate percentages for display
  const totalPatients = patients.length;
  const malePercentage =
    Math.round((genderDistribution.MALE / totalPatients) * 100) || 0;
  const femalePercentage =
    Math.round((genderDistribution.FEMALE / totalPatients) * 100) || 0;
  const otherPercentage =
    Math.round(
      ((genderDistribution.OTHER + genderDistribution.PREFER_NOT_TO_SAY) /
        totalPatients) *
        100
    ) || 0;

  const urbanPercentage =
    Math.round((geoDistribution.Urban / totalPatients) * 100) || 0;
  const ruralPercentage =
    Math.round((geoDistribution.Rural / totalPatients) * 100) || 0;

  // Calculate height percentages for the age distribution chart
  const maxAgeCount = Math.max(...Object.values(ageGroups));
  const ageHeights = {
    "0-18": maxAgeCount
      ? Math.round((ageGroups["0-18"] / maxAgeCount) * 100)
      : 0,
    "19-30": maxAgeCount
      ? Math.round((ageGroups["19-30"] / maxAgeCount) * 100)
      : 0,
    "31-45": maxAgeCount
      ? Math.round((ageGroups["31-45"] / maxAgeCount) * 100)
      : 0,
    "46-60": maxAgeCount
      ? Math.round((ageGroups["46-60"] / maxAgeCount) * 100)
      : 0,
    "61+": maxAgeCount ? Math.round((ageGroups["61+"] / maxAgeCount) * 100) : 0,
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-medium">Age Distribution</h3>
        <div className="h-[300px]">
          <div className="flex h-full items-end gap-4">
            <div className="flex h-full flex-1 flex-col justify-end">
              <div
                className={`h-[${ageHeights["0-18"]}%] w-full rounded-t-md bg-blue-500`}
              ></div>
              <div className="text-center text-xs text-gray-500">0-18</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div
                className={`h-[${ageHeights["19-30"]}%] w-full rounded-t-md bg-blue-500`}
              ></div>
              <div className="text-center text-xs text-gray-500">19-30</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div
                className={`h-[${ageHeights["31-45"]}%] w-full rounded-t-md bg-blue-500`}
              ></div>
              <div className="text-center text-xs text-gray-500">31-45</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div
                className={`h-[${ageHeights["46-60"]}%] w-full rounded-t-md bg-blue-500`}
              ></div>
              <div className="text-center text-xs text-gray-500">46-60</div>
            </div>
            <div className="flex h-full flex-1 flex-col justify-end">
              <div
                className={`h-[${ageHeights["61+"]}%] w-full rounded-t-md bg-blue-500`}
              ></div>
              <div className="text-center text-xs text-gray-500">61+</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-medium">Gender Distribution</h3>
          <div className="flex h-[200px] items-center justify-center">
            <div className="relative h-[180px] w-[180px] rounded-full">
              <div
                className="absolute inset-0 rounded-full border-[20px] border-blue-500"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${malePercentage}% 0, ${malePercentage}% 100%, 0 100%)`,
                }}
              ></div>
              <div
                className="absolute inset-0 rounded-full border-[20px] border-pink-500"
                style={{
                  clipPath: `polygon(${malePercentage}% 0, ${
                    malePercentage + femalePercentage
                  }% 0, ${
                    malePercentage + femalePercentage
                  }% 100%, ${malePercentage}% 100%)`,
                }}
              ></div>
              <div
                className="absolute inset-0 rounded-full border-[20px] border-purple-500"
                style={{
                  clipPath: `polygon(${
                    malePercentage + femalePercentage
                  }% 0, 100% 0, 100% 100%, ${
                    malePercentage + femalePercentage
                  }% 100%)`,
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium">Total</div>
                  <div className="text-2xl font-bold">{totalPatients}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Male ({malePercentage}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-pink-500"></div>
              <span className="text-sm">Female ({femalePercentage}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <span className="text-sm">Other ({otherPercentage}%)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Geographic Distribution</h3>
          <div className="h-[200px] rounded-md border p-4">
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Map visualization would go here</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-gray-100 p-2 text-center">
              <div className="text-sm font-medium">Urban</div>
              <div className="text-lg font-bold">{urbanPercentage}%</div>
            </div>
            <div className="rounded-md bg-gray-100 p-2 text-center">
              <div className="text-sm font-medium">Rural</div>
              <div className="text-lg font-bold">{ruralPercentage}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
