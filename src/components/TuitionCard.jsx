"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Bookmark, CalendarDays, MapPin, Star, UsersRound } from "lucide-react";
import { Badge, ImageWithFallback, cn } from "./ui";
import { formatFee } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function TuitionCard({ tuition, className }) {
  const { user, isBookmarked, toggleBookmark } = useApp();
  const saved = Boolean(user && isBookmarked(tuition._id));

  const onBookmark = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const result = await toggleBookmark(tuition._id);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <article className={cn("card-hover group flex h-full flex-col overflow-hidden", className)}>
      <div className="relative h-44 overflow-hidden">
        <ImageWithFallback
          src={tuition.bannerImage}
          alt={tuition.title}
          fallbackText={tuition.subject}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/5 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone={tuition.mode === "Online" ? "accent" : "brand"} className="bg-surface/90 shadow-sm backdrop-blur-md">
            {tuition.mode}
          </Badge>
          {tuition.approvalStatus === "pending" && <Badge tone="warning" className="bg-surface/90 backdrop-blur-md">Pending</Badge>}
        </div>
        {user?.role === "student" && (
          <button
            onClick={onBookmark}
            aria-label={saved ? "Remove bookmark" : "Save tuition"}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/90 text-muted shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 hover:text-brand hover:shadow-lg"
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} className={saved ? "text-brand" : ""} />
          </button>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-bold text-ink shadow-sm backdrop-blur-md">
          <Star size={13} fill="currentColor" className="text-warning" /> {tuition.rating || "New"}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge tone="brand">{tuition.subject}</Badge>
          <Badge>{tuition.classLevel}</Badge>
          {!tuition.isActive && <Badge tone="danger">Closed</Badge>}
        </div>

        <h3 className="line-clamp-2 text-base font-bold leading-6 tracking-tight text-ink transition-colors duration-200 group-hover:text-brand">
          {tuition.title}
        </h3>

        <div className="mt-3 grid gap-1.5 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-brand" />
            <span className="truncate">{tuition.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} className="shrink-0 text-brand" /> {tuition.daysPerWeek} days / week
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
          <ImageWithFallback
            src={tuition.tutorImage}
            alt={tuition.tutorName}
            fallbackText={tuition.tutorName?.slice(0, 1)}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink">{tuition.tutorName}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted">
              <UsersRound size={11} /> {tuition.totalStudents || 0} students
            </p>
          </div>
          <span className="gradient-text text-sm font-extrabold">{formatFee(tuition.monthlyFee)}<span className="text-[10px] font-medium text-muted">/mo</span></span>
        </div>

        <Link href={`/tuitions/${tuition._id}`} className="btn-outline mt-4 w-full group-hover:border-brand group-hover:bg-brand group-hover:text-white">
          View Details
        </Link>
      </div>
    </article>
  );
}
