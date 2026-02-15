import { Skeleton } from "@/components/ui/skeleton";

export default function PortraitLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
