"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ClipboardList, ExternalLink, Mail, Trash2 } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
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

export default function MyApplicationsPage() {
  const { user, applications, users, tuitions, cancelApplication } = useApp();
  const [filter, setFilter] = useState("all");
  const [target, setTarget] = useState(null);

  const mine = applications
    .filter((item) => item.studentEmail === user?.email)
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

  const counts = {
    all: mine.length,
    pending: mine.filter((item) => item.status === "pending").length,
    accepted: mine.filter((item) => item.status === "accepted").length,
    rejected: mine.filter((item) => item.status === "rejected").length,
  };

  const shown = filter === "all" ? mine : mine.filter((item) => item.status === filter);

  const tutorFor = (application) => {
    const account = users.find((item) => item.email === application.tutorEmail);
    const tuition = tuitions.find((item) => item._id === application.tuitionId);
    return {
      name: account?.name || application.tutorName || tuition?.tutorName || "Tutor",
      email: application.tutorEmail || account?.email || "—",
      image: account?.image || tuition?.tutorImage,
    };
  };

  const confirmCancel = async () => {
    if (!target) return;
    const result = await cancelApplication(target._id);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
    setTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">My learning</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">My applications</h2>
          <p className="mt-2 text-sm text-muted">
            Review the batches you&apos;ve applied to and track each tutor&apos;s decision.
          </p>
        </div>
        <Link href="/tuitions" className="btn-primary">
          Find more tuitions <ExternalLink size={16} />
        </Link>
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
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                filter === item.id ? "bg-white/20 text-white" : "bg-surface-2 text-muted",
              )}
            >
              {counts[item.id]}
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={mine.length === 0 ? "No applications yet" : `No ${filter} applications`}
          description={
            mine.length === 0
              ? "Browse approved tuitions and send your first application — it only takes a moment."
              : "Try a different status filter to see your other applications."
          }
          action={
            mine.length === 0 ? (
              <Link href="/tuitions" className="btn-primary">Browse tuitions</Link>
            ) : (
              <Button variant="outline" onClick={() => setFilter("all")}>Show all applications</Button>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-semibold">Tuition title</th>
                  <th className="px-5 py-3 font-semibold">Tutor</th>
                  <th className="px-5 py-3 font-semibold">Monthly fee</th>
                  <th className="px-5 py-3 font-semibold">Applied date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((item) => {
                  const tutor = tutorFor(item);
                  return (
                    <tr key={item._id} className="border-b border-line/70 transition last:border-0 hover:bg-surface-2/50">
                      <td className="max-w-[260px] px-5 py-4">
                        <Link href={`/tuitions/${item.tuitionId}`} className="font-bold text-ink hover:text-brand">
                          {item.tuitionTitle}
                        </Link>
                        {item.subject && <p className="mt-1 text-xs text-muted">{item.subject}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={tutor.image} name={tutor.name} className="h-8 w-8" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{tutor.name}</p>
                            <p className="flex items-center gap-1 truncate text-xs text-muted">
                              <Mail size={11} className="shrink-0" /> {tutor.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-brand">{formatFee(item.monthlyFee)}</td>
                      <td className="px-5 py-4 text-muted">{formatDate(item.appliedAt)}</td>
                      <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                      <td className="px-5 py-4 text-right">
                        {item.status === "pending" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-danger/30 text-danger hover:border-danger hover:bg-danger/5 hover:text-danger"
                            onClick={() => setTarget(item)}
                          >
                            <Trash2 size={14} /> Cancel
                          </Button>
                        ) : (
                          <Badge tone="neutral">Locked</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line px-5 py-3 text-xs text-muted">
            Showing {shown.length} of {mine.length} applications. Only pending applications can be cancelled.
          </div>
        </Card>
      )}

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Cancel this application?"
        subtitle="This action cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setTarget(null)}>Keep application</Button>
            <Button variant="danger" onClick={confirmCancel}><Trash2 size={15} /> Yes, cancel it</Button>
          </>
        }
      >
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-4">
          <p className="text-sm font-semibold text-ink">{target?.tuitionTitle}</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            You will be removed from this tutor&apos;s applicant list. You can always apply again later if the
            batch is still open.
          </p>
        </div>
      </Modal>
    </div>
  );
}
