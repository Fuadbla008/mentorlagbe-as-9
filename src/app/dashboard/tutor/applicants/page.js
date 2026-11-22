"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Mail,
  Phone,
  UsersRound,
  X,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  StatCard,
  StatusBadge,
  cn,
} from "@/components/ui";
import { formatDate, formatFee } from "@/lib/data";
import { useApp } from "@/lib/store";

const filters = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

export default function ApplicantsPage() {
  const { user, tuitions, applications, updateApplicationStatus } = useApp();
  const [filter, setFilter] = useState("all");

  const myTuitions = tuitions.filter((item) => item.tutorEmail === user?.email);
  const myIds = new Set(myTuitions.map((item) => item._id));

  const all = applications
    .filter((item) => myIds.has(item.tuitionId))
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

  const counts = {
    all: all.length,
    pending: all.filter((item) => item.status === "pending").length,
    accepted: all.filter((item) => item.status === "accepted").length,
    rejected: all.filter((item) => item.status === "rejected").length,
  };

  const shown = filter === "all" ? all : all.filter((item) => item.status === filter);

  const decide = async (application, status) => {
    const result = await updateApplicationStatus(application._id, status);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Student requests</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Applicants</h2>
          <p className="mt-2 text-sm text-muted">
            Review student profiles, notes and schedules — then accept or reject each request.
          </p>
        </div>
        <Link href="/dashboard/tutor/my-tuitions" className="btn-outline">My tuitions</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UsersRound} label="Total Applicants" value={counts.all} hint="Across all your batches" tone="brand" />
        <StatCard icon={Clock3} label="Pending Review" value={counts.pending} hint="Need your decision" tone="warning" />
        <StatCard icon={CheckCircle2} label="Accepted" value={counts.accepted} hint="Ready to welcome" tone="success" />
        <StatCard icon={ClipboardList} label="Rejected" value={counts.rejected} hint="Closed requests" tone="accent" />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition",
              filter === item.id
                ? "border-brand bg-brand text-white shadow-lg shadow-brand/20"
                : "border-line bg-surface text-muted hover:border-brand/40 hover:text-brand",
            )}
          >
            {item.label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              filter === item.id ? "bg-white/20 text-white" : "bg-surface-2 text-muted",
            )}>
              {counts[item.id]}
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={all.length === 0 ? "No applicants yet" : `No ${filter} applicants`}
          description={
            all.length === 0
              ? "When students apply to your tuitions, their details and notes will appear here."
              : "Switch filters to see applicants with other statuses."
          }
          action={
            all.length > 0 && (
              <Button variant="outline" onClick={() => setFilter("all")}>Show all applicants</Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {shown.map((item) => (
            <Card key={item._id} className="card-hover flex h-full flex-col p-5">
              <div className="flex items-start gap-3">
                <Avatar src={item.studentImage} name={item.studentName} className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="truncate font-bold text-ink">{item.studentName}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">
                    <Mail size={12} className="shrink-0" /> {item.studentEmail}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-brand" /> {item.studentPhone || "Not provided"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={13} className="text-brand" /> Applied {formatDate(item.appliedAt)}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-brand/15 bg-brand/5 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Applied for</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/tuitions/${item.tuitionId}`} className="text-sm font-bold text-ink hover:text-brand">
                    {item.tuitionTitle}
                  </Link>
                  <Badge tone="brand">{formatFee(item.monthlyFee)}/mo</Badge>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-2/70 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Preferred schedule</p>
                  <p className="mt-1 text-sm font-medium text-ink">{item.preferredSchedule || "Not specified"}</p>
                </div>
                <div className="rounded-xl bg-surface-2/70 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Note from student</p>
                  <p className="mt-1 line-clamp-3 text-sm leading-5 text-ink">
                    {item.studentNote || "No note provided."}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-5">
                {item.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => decide(item, "accepted")}>
                      <Check size={15} /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-danger/30 text-danger hover:border-danger hover:bg-danger/5 hover:text-danger"
                      onClick={() => decide(item, "rejected")}
                    >
                      <X size={15} /> Reject
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2/50 px-4 py-3">
                    <span className="text-xs text-muted">
                      {item.status === "accepted"
                        ? "You accepted this application."
                        : "This application was rejected."}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
