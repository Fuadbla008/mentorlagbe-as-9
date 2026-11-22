"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Button, EmptyState, Pagination, Select } from "@/components/ui";
import TuitionCard from "@/components/TuitionCard";
import { CLASS_LEVELS, MODES, SUBJECTS } from "@/lib/seed";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "rating", label: "Highest rated" },
  { value: "fee-low", label: "Fee: low to high" },
  { value: "fee-high", label: "Fee: high to low" },
];

const FILTER_LABELS = {
  q: "Search",
  subject: "Subject",
  classLevel: "Class",
  mode: "Mode",
};

export default function TuitionsBrowser({ results, filters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(filters.q || "");
  const [syncedQuery, setSyncedQuery] = useState(filters.q || "");
  const [isPending, startTransition] = useTransition();

  // Adjust state during render when the URL changes (chip removal, back/forward).
  if (filters.q !== syncedQuery) {
    setSyncedQuery(filters.q);
    setQuery(filters.q || "");
  }

  const navigate = useCallback(
    (mutate) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const queryString = params.toString();
      startTransition(() => {
        router.replace(queryString ? `?${queryString}` : "/tuitions", { scroll: false });
      });
    },
    [router, searchParams],
  );

  const setParam = useCallback(
    (key, value) => {
      navigate((params) => {
        if (value) params.set(key, String(value));
        else params.delete(key);
        if (key !== "page") params.delete("page");
      });
    },
    [navigate],
  );

  // Debounce the search box so filtering stays server-side without a request per keystroke.
  useEffect(() => {
    if (query === (filters.q || "")) return undefined;
    const timer = setTimeout(() => setParam("q", query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query, filters.q, setParam]);

  const activeFilters = Object.entries(FILTER_LABELS).filter(([key]) => filters[key]);
  const hasFilters = activeFilters.length > 0;

  const clearAll = () => {
    setQuery("");
    router.replace("/tuitions", { scroll: false });
  };

  return (
    <div className="container-x py-10 sm:py-12">
      <div className="mb-8">
        <span className="eyebrow">Explore MentorLagbe</span>
        <h1 className="section-title gradient-text">Browse Tuitions</h1>
        <p className="section-subtitle">
          Search approved batches from verified tutors and find the right fit for your goals.
        </p>
      </div>

      {/* Filter bar */}
      <div className="glass mb-6 rounded-2xl p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, subject or keyword"
              aria-label="Search tuitions"
              className="input pl-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[54%]">
            <Select
              value={filters.subject}
              onChange={(event) => setParam("subject", event.target.value)}
              aria-label="Filter by subject"
            >
              <option value="">All subjects</option>
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </Select>
            <Select
              value={filters.classLevel}
              onChange={(event) => setParam("classLevel", event.target.value)}
              aria-label="Filter by class level"
            >
              <option value="">All classes</option>
              {CLASS_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
            <Select
              value={filters.mode}
              onChange={(event) => setParam("mode", event.target.value)}
              aria-label="Filter by mode"
            >
              <option value="">Any mode</option>
              {MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Select>
            <Select
              value={filters.sort}
              onChange={(event) => setParam("sort", event.target.value)}
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <SlidersHorizontal size={14} /> Active filters:
          </span>
          {activeFilters.length === 0 && <span className="text-xs text-muted">None</span>}
          {activeFilters.map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                if (key === "q") setQuery("");
                setParam(key, "");
              }}
              className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand/20"
            >
              {label}: {filters[key]} <X size={12} />
            </button>
          ))}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="ml-auto">
              <RotateCcw size={13} /> Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-bold text-ink">{results.total}</span>{" "}
          {results.total === 1 ? "tuition" : "tuitions"} found
        </p>
        {isPending && <span className="text-xs font-medium text-brand">Updating…</span>}
      </div>

      {/* Results */}
      {results.items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No tuitions match your filters"
          description="Try a different keyword or clear a few filters to see more batches."
          action={
            <Button variant="outline" onClick={clearAll}>
              <RotateCcw size={15} /> Clear filters
            </Button>
          }
        />
      ) : (
        <div
          className={`animate-fade-up grid gap-5 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
            isPending ? "opacity-60" : "opacity-100"
          }`}
        >
          {results.items.map((tuition) => (
            <TuitionCard key={tuition._id} tuition={tuition} />
          ))}
        </div>
      )}

      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        onChange={(page) =>
          navigate((params) => {
            params.set("page", String(page));
          })
        }
      />
    </div>
  );
}
