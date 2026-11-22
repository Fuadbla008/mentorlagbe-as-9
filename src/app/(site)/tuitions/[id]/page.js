import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Globe2,
  MapPin,
  Star,
  UsersRound,
} from "lucide-react";
import { Badge, Card, ImageWithFallback, SectionHeading, Skeleton, StatCard } from "@/components/ui";
import TuitionCard from "@/components/TuitionCard";
import { formatDate, formatFee, getFeaturedTuitions, getTuitionById } from "@/lib/data";
import ApplyPanel from "./ApplyPanel";

function DetailsSkeleton() {
  return (
    <div className="container-x py-10">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function TuitionDetailsPage({ params }) {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <TuitionDetails params={params} />
    </Suspense>
  );
}

async function TuitionDetails({ params }) {
  const { id } = await params;
  const tuition = await getTuitionById(id);
  if (!tuition) notFound();

  const featured = await getFeaturedTuitions(6);
  const related = featured.filter((item) => item._id !== tuition._id).slice(0, 3);

  return (
    <div className="container-x py-8 sm:py-10">
      <Link href="/tuitions" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-brand">
        <ArrowLeft size={16} /> Back to all tuitions
      </Link>

      {/* Banner */}
      <div className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-lg">
        <ImageWithFallback
          src={tuition.bannerImage}
          alt={tuition.title}
          fallbackText={tuition.subject}
          className="h-56 w-full object-cover sm:h-72 lg:h-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-8 sm:right-8">
          <div className="flex flex-wrap gap-2">
            <Badge tone={tuition.mode === "Online" ? "accent" : "brand"} className="bg-surface/90 backdrop-blur">
              {tuition.mode}
            </Badge>
            <Badge className="bg-surface/90 backdrop-blur">{tuition.subject}</Badge>
            <Badge className="bg-surface/90 backdrop-blur">{tuition.classLevel}</Badge>
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl lg:text-4xl">
            {tuition.title}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main content */}
        <div className="space-y-6">
          <Card className="p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Star size={16} fill="currentColor" className="text-warning" />
                <strong className="text-ink">{tuition.rating || "New"}</strong> rating
              </span>
              <span className="flex items-center gap-1.5">
                <UsersRound size={16} className="text-brand" />
                <strong className="text-ink">{tuition.totalStudents || 0}</strong> students
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={16} className="text-brand" /> Posted {formatDate(tuition.createdAt)}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-brand">
                  {tuition.mode === "Online" ? <Globe2 size={17} /> : <MapPin size={17} />}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Location</p>
                  <p className="text-sm font-semibold text-ink">{tuition.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent">
                  <Clock3 size={17} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Commitment</p>
                  <p className="text-sm font-semibold text-ink">{tuition.daysPerWeek} days / week</p>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-line pt-6">
              <h2 className="text-lg font-bold text-ink">About this tuition</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{tuition.description}</p>
            </div>
          </Card>

          {/* Tutor profile */}
          <Card className="p-6 sm:p-7">
            <h2 className="text-lg font-bold text-ink">Meet your tutor</h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ImageWithFallback
                src={tuition.tutorImage}
                alt={tuition.tutorName}
                fallbackText={tuition.tutorName?.slice(0, 1)}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-brand/20"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-ink">{tuition.tutorName}</h3>
                  <BadgeCheck size={17} className="text-brand" aria-label="Verified tutor" />
                </div>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {tuition.subject} mentor · {tuition.daysPerWeek} sessions per week
                </p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <div className="rounded-xl bg-surface-2 px-4 py-2 text-center">
                  <p className="text-lg font-extrabold text-ink">{tuition.rating || "—"}</p>
                  <p className="text-[11px] text-muted">Rating</p>
                </div>
                <div className="rounded-xl bg-surface-2 px-4 py-2 text-center">
                  <p className="text-lg font-extrabold text-ink">{tuition.totalStudents || 0}</p>
                  <p className="text-[11px] text-muted">Students</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard icon="users" label="Students" value={tuition.totalStudents || 0} tone="brand" />
            <StatCard icon="star" label="Rating" value={tuition.rating || "New"} tone="warning" />
            <StatCard icon="days" label="Days / week" value={tuition.daysPerWeek} tone="success" />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-brand to-violet-600 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Monthly fee</p>
              <p className="mt-1 text-4xl font-black tracking-tight">
                {formatFee(tuition.monthlyFee)}
                <span className="text-base font-medium text-white/75">/mo</span>
              </p>
              <p className="mt-2 text-xs text-white/80">Small batch · Personal attention</p>
            </div>
            <div className="p-5">
              <ApplyPanel tuition={tuition} />
            </div>
          </Card>
        </aside>
      </div>

      {/* Related tuitions */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            eyebrow="Keep exploring"
            title="Similar Tuitions"
            action={
              <Link href="/tuitions" className="btn-ghost">
                View all <ArrowLeft size={16} className="rotate-180" />
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <TuitionCard key={item._id} tuition={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
