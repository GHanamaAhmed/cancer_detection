import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentCalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="py-2 text-sm font-medium text-gray-500">
            <Skeleton className="h-4 w-4" />
          </div>
        ))}

        {Array.from({ length: 42 }).map((_, index) => (
          <div key={index} className="relative min-h-[100px] p-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="mt-1 space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
