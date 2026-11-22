"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Eye, Inbox, ShieldCheck, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ImageWithFallback,
  Modal,
  Skeleton,
  StatusBadge,
  cn,
} from "@/components/ui";
import { formatDate, formatFee } from "@/lib/data";
import { useApp } from "@/lib/store";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminTuitionsPage() {
  const { ready, tuitions, moderateTuition } = useApp();
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState(null);

  const counts = useMemo(
    () => ({
      all: tuitions.length,
      pending: tuitions.filter((item) => item.approvalStatus === "pending").length,
      approved: tuitions.filter((item) => item.approvalStatus === "approved").length,
      rejected: tuitions.filter((item) => item.approvalStatus === "rejected").length,
    }),
    [tuitions],
  );

  const visible = useMemo(
    () =>
      tuitions
        .filter((item) => filter === "all" || item.approvalStatus === filter)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [tuitions, filter],
  );

  const decide = async (id, decision) => {
    const result = await moderateTuition(id, decision);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(decision === "approved" ? "Tuition approved — it is now live." : "Tuition rejected.");
    if (preview?._id === id) setPreview(null);
  };

  if (!ready) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <span className="eyebrow">
          <ShieldCheck size={13} /> Moderation
        </span>
        <h2 className="section-title">Tuition approval flow</h2>
        <p className="section-subtitle">
          Review submitted batches, inspect the details and publish or reject them with one click.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter tuitions by status">
        {TABS.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-brand bg-brand text-white shadow-lg shadow-brand/20"
                  : "border-line bg-surface text-muted hover:border-brand/50 hover:text-ink",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  active ? "bg-white/20 text-white" : "bg-surface-2 text-muted",
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        {visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-surface-2/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tuition</th>
                  <th className="px-5 py-3 font-semibold">Tutor</th>
                  <th className="px-5 py-3 font-semibold">Mode</th>
                  <th className="px-5 py-3 font-semibold">Fee</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((tuition) => (
                  <tr key={tuition._id} className="transition hover:bg-surface-2/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={tuition.bannerImage}
                          alt={tuition.title}
                          fallbackText={tuition.subject}
                          className="h-11 w-16 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate font-semibold text-ink" title={tuition.title}>
                            {tuition.title}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <Badge tone="brand">{tuition.subject}</Badge>
                            <Badge>{tuition.classLevel}</Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={tuition.tutorImage} name={tuition.tutorName} className="h-8 w-8" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-ink">{tuition.tutorName}</p>
                          <p className="max-w-[170px] truncate text-[11px] text-muted">{tuition.tutorEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{tuition.mode}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-bold text-ink">{formatFee(tuition.monthlyFee)}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">{formatDate(tuition.createdAt)}</td>
                    <td className="px-5 py-3"><StatusBadge status={tuition.approvalStatus} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="ghost" className="px-2" onClick={() => setPreview(tuition)} aria-label={`Preview ${tuition.title}`}>
                          <Eye size={14} /> Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={tuition.approvalStatus === "approved"}
                          className={tuition.approvalStatus === "approved" ? "" : "border-success/40 text-success hover:border-success hover:bg-success/10"}
                          onClick={() => decide(tuition._id, "approved")}
                        >
                          <Check size={14} /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={tuition.approvalStatus === "rejected"}
                          className="text-danger hover:bg-danger/10"
                          onClick={() => decide(tuition._id, "rejected")}
                        >
                          <X size={14} /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={Inbox}
              title="Nothing to show"
              description={`No ${filter === "all" ? "" : `${filter} `}tuitions found in this view.`}
            />
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title || "Tuition preview"}
        subtitle={preview ? `${preview.subject} · ${preview.classLevel} · ${preview.mode}` : undefined}
        size="lg"
        footer={
          preview ? (
            <>
              <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
              <Button
                variant="outline"
                disabled={preview.approvalStatus === "rejected"}
                className="border-success/40 text-success hover:border-success hover:bg-success/10"
                onClick={() => decide(preview._id, "approved")}
              >
                <Check size={15} /> Approve
              </Button>
              <Button
                variant="danger"
                disabled={preview.approvalStatus === "rejected"}
                onClick={() => decide(preview._id, "rejected")}
              >
                <X size={15} /> Reject
              </Button>
            </>
          ) : null
        }
      >
        {preview && (
          <div className="space-y-5">
            <ImageWithFallback
              src={preview.bannerImage}
              alt={preview.title}
              fallbackText={preview.subject}
              className="h-52 w-full rounded-xl object-cover"
            />
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={preview.approvalStatus} />
              <Badge tone="brand">{preview.subject}</Badge>
              <Badge>{preview.classLevel}</Badge>
              <Badge tone={preview.mode === "Online" ? "accent" : "brand"}>{preview.mode}</Badge>
            </div>
            <p className="text-sm leading-7 text-muted">{preview.description}</p>
            <div className="grid gap-4 rounded-xl border border-line bg-surface-2/50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted">Tutor</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Avatar src={preview.tutorImage} name={preview.tutorName} className="h-8 w-8" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{preview.tutorName}</p>
                    <p className="truncate text-xs text-muted">{preview.tutorEmail}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted">Monthly fee</p>
                  <p className="font-bold text-ink">{formatFee(preview.monthlyFee)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Days / week</p>
                  <p className="font-bold text-ink">{preview.daysPerWeek}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Location</p>
                  <p className="truncate font-semibold text-ink">{preview.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Submitted</p>
                  <p className="font-semibold text-ink">{formatDate(preview.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
