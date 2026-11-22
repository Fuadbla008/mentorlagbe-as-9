import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { searchTuitions } from "@/lib/data";
import TuitionsBrowser from "./TuitionsBrowser";

// searchParams is a request-time API: await it inside a Suspense-wrapped child
// so the surrounding shell can stay prerenderable under cacheComponents.
const first = (value) => (Array.isArray(value) ? value[0] : value) || "";

function BrowserSkeleton() {
  return (
    <div className="container-x py-10">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <Skeleton className="mt-8 h-16 w-full rounded-2xl" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function TuitionsPage({ searchParams }) {
  return (
    <Suspense fallback={<BrowserSkeleton />}>
      <TuitionsResults searchParams={searchParams} />
    </Suspense>
  );
}

async function TuitionsResults({ searchParams }) {
  const params = await searchParams;
  const filters = {
    q: String(first(params.q)),
    subject: String(first(params.subject)),
    classLevel: String(first(params.classLevel)),
    mode: String(first(params.mode)),
    sort: String(first(params.sort) || "newest"),
    page: String(first(params.page) || "1"),
  };

  const results = await searchTuitions({
    q: filters.q,
    subject: filters.subject,
    classLevel: filters.classLevel,
    mode: filters.mode,
    sort: filters.sort,
    page: Number(filters.page) || 1,
  });

  return <TuitionsBrowser results={results} filters={filters} />;
}
