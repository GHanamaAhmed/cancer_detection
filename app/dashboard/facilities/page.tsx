import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FacilitiesMap } from "@/components/facilities-map";
import { FacilitiesList } from "@/components/facilities-list";
import { requireAuth } from "@/lib/auth";
import { Suspense } from "react";
import { NewFacilityDialog } from "@/components/new-facility-dialog";
 
export default async function FacilitiesPage({
  searchParams:p,
}: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  await requireAuth();
  const searchParams = await p;
  const search = searchParams.search || "";
  const facilityType = searchParams.type || "ALL";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Affiliated Dermatology Centers
          </h2>
          <p className="text-gray-500">
            View and manage partner dermatology clinics and cancer centers
          </p>
        </div>
        <NewFacilityDialog />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dermatology Centers Map</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <form action="/dashboard/facilities" method="GET">
                  <Input
                    type="search"
                    name="search"
                    placeholder="Search locations..."
                    className="pl-8 w-[200px] md:w-[300px]"
                    defaultValue={search}
                  />
                </form>
              </div>
            </div>
            <CardDescription>
              Interactive map of partner dermatology clinics and cancer centers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-[500px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              }
            >
              <FacilitiesMap search={search} facilityType={facilityType} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dermatology Center List</CardTitle>
            <CardDescription>
              All affiliated skin cancer facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="h-[500px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              }
            >
              <FacilitiesList search={search} facilityType={facilityType} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
