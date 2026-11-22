import { Skeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-96" />
    </div>
  );
}
