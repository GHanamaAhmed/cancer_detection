import { Skeleton } from "@/components/ui/skeleton";

export function ChatWindowSkeleton() {
  return (
    <div className="flex h-[500px] flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div className="flex max-w-[80%] gap-2">
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              <div>
                <Skeleton
                  className={`h-16 w-64 rounded-lg ${
                    i % 2 === 0 ? "bg-gray-200" : "bg-blue-200"
                  }`}
                />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
