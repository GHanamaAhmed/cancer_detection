import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { PatientCasesList } from "@/components/patient-cases-list";
import { requireAuth } from "@/lib/auth";
import { Suspense } from "react";
import { PatientListSkeleton } from "@/components/patient-list-skeleton";
import { PatientFilters } from "@/components/patient-filters";

export default async function PatientsPage({
  searchParams: searchParamsePromise,
}: {
  searchParams: Promise<{
    search?: string;
    risk?: string;
    sort?: string;
    page?: string;
    connection?: string;
  }>;
}) {
  await requireAuth();
  const searchParams = await searchParamsePromise;
  const search = searchParams.search || "";
  const risk = searchParams.risk || "all";
  const sort = searchParams.sort || "newest";
  const connection = searchParams.connection || "all";
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Skin Lesion Cases
          </h2>
          <p className="text-gray-500">
            View and manage your skin cancer patient cases
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Patients</CardTitle>
              <CardDescription>
                A list of all your patients and their skin lesion details
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <form action="/dashboard/patients" className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search patients..."
                  className="pl-8 w-[200px] md:w-[300px]"
                  defaultValue={search}
                />
              </form>
              <PatientFilters
                currentRisk={risk}
                currentSort={sort}
                currentConnection={connection}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PatientListSkeleton />}>
            <PatientCasesList
              search={search}
              risk={risk}
              sort={sort}
              connection={connection}
              page={page}
              pageSize={pageSize}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
