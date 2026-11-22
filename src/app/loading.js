import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="container-x grid gap-6 py-12">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <Skeleton key={key} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
