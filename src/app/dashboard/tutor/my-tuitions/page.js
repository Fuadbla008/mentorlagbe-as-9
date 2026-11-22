"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  ImageIcon,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
  UsersRound,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  ImageWithFallback,
  Input,
  Modal,
  Select,
  StatusBadge,
  Textarea,
  cn,
} from "@/components/ui";
import { formatFee } from "@/lib/data";
import { CLASS_LEVELS, MODES, SUBJECTS } from "@/lib/seed";
import { useApp } from "@/lib/store";

const filters = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Pending" },
  { id: "rejected", label: "Rejected" },
];

export default function MyTuitionsPage() {
  const { user, tuitions, applications, updateTuition, deleteTuition, toggleTuitionStatus } = useApp();
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const mine = tuitions
    .filter((item) => item.tutorEmail === user?.email)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const counts = {
    all: mine.length,
    approved: mine.filter((item) => item.approvalStatus === "approved").length,
    pending: mine.filter((item) => item.approvalStatus === "pending").length,
    rejected: mine.filter((item) => item.approvalStatus === "rejected").length,
  };

  const shown = filter === "all" ? mine : mine.filter((item) => item.approvalStatus === filter);

  const applicantCount = (tuitionId) => applications.filter((item) => item.tuitionId === tuitionId).length;

  const openEdit = (tuition) => {
    setEditingId(tuition._id);
    setDraft({
      title: tuition.title || "",
      subject: tuition.subject || SUBJECTS[0],
      classLevel: tuition.classLevel || CLASS_LEVELS[0],
      mode: tuition.mode || MODES[0],
      location: tuition.location || "",
      monthlyFee: String(tuition.monthlyFee ?? ""),
      daysPerWeek: String(tuition.daysPerWeek ?? 1),
      bannerImage: tuition.bannerImage || "",
      description: tuition.description || "",
    });
  };

  const updateDraft = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const saveEdit = async () => {
    if (!draft || !editingId) return;
    if (draft.title.trim().length < 6) {
      toast.error("Title must be at least 6 characters.");
      return;
    }
    const fee = Number(draft.monthlyFee);
    if (!Number.isFinite(fee) || fee <= 0) {
      toast.error("Enter a valid monthly fee.");
      return;
    }
    const days = Number(draft.daysPerWeek);
    if (!Number.isInteger(days) || days < 1 || days > 7) {
      toast.error("Days per week must be between 1 and 7.");
      return;
    }

    setSaving(true);
    const result = await updateTuition(editingId, {
      ...draft,
      title: draft.title.trim(),
      location: draft.location.trim(),
      bannerImage: draft.bannerImage.trim(),
      description: draft.description.trim(),
      monthlyFee: fee,
      daysPerWeek: days,
    });
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
    setSaving(false);
    setEditingId(null);
    setDraft(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const result = await deleteTuition(deleting._id);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
    setDeleting(null);
  };

  const toggleStatus = async (tuition) => {
    const result = await toggleTuitionStatus(tuition._id);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">My batches</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">My tuitions</h2>
          <p className="mt-2 text-sm text-muted">
            Edit your listings, manage visibility and keep your batches up to date.
          </p>
        </div>
        <Link href="/dashboard/tutor/post-tuition" className="btn-primary">
          <PlusCircle size={16} /> Post a tuition
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
          icon={GraduationCap}
          title={mine.length === 0 ? "No tuitions posted yet" : `No ${filter} tuitions`}
          description={
            mine.length === 0
              ? "Create your first batch to start receiving applications from students."
              : "Try another filter to see your other batches."
          }
          action={
            mine.length === 0 ? (
              <Link href="/dashboard/tutor/post-tuition" className="btn-primary">Post a tuition</Link>
            ) : (
              <Button variant="outline" onClick={() => setFilter("all")}>Show all tuitions</Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {shown.map((tuition) => (
            <Card key={tuition._id} className="card-hover overflow-hidden">
              <div className="relative h-36 overflow-hidden">
                <ImageWithFallback
                  src={tuition.bannerImage}
                  alt={tuition.title}
                  fallbackText={tuition.subject}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <StatusBadge status={tuition.approvalStatus} />
                </div>
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                  <StatusBadge status={tuition.isActive ? "active" : "closed"} />
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="brand">{tuition.subject}</Badge>
                  <Badge>{tuition.classLevel}</Badge>
                  <Badge tone="accent">{tuition.mode}</Badge>
                </div>
                <h3 className="mt-3 line-clamp-2 text-base font-bold leading-6 text-ink">{tuition.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{tuition.description}</p>

                {tuition.approvalStatus === "pending" && (
                  <p className="mt-3 rounded-xl bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
                    Awaiting admin approval — hidden from student search until approved.
                  </p>
                )}
                {tuition.approvalStatus === "rejected" && (
                  <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                    This batch was not approved. Update the details and resubmit if needed.
                  </p>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-2/70 p-3 text-center">
                  <div>
                    <Wallet size={14} className="mx-auto text-brand" />
                    <p className="mt-1 text-xs font-bold text-ink">{formatFee(tuition.monthlyFee)}</p>
                    <p className="text-[10px] text-muted">per month</p>
                  </div>
                  <div className="border-x border-line">
                    <CalendarDays size={14} className="mx-auto text-brand" />
                    <p className="mt-1 text-xs font-bold text-ink">{tuition.daysPerWeek} days</p>
                    <p className="text-[10px] text-muted">per week</p>
                  </div>
                  <div>
                    <UsersRound size={14} className="mx-auto text-brand" />
                    <p className="mt-1 text-xs font-bold text-ink">{applicantCount(tuition._id)}</p>
                    <p className="text-[10px] text-muted">applicants</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(tuition)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(tuition)}>
                    <Clock3 size={14} /> {tuition.isActive ? "Close" : "Reopen"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-danger/30 text-danger hover:border-danger hover:bg-danger/5 hover:text-danger"
                    onClick={() => setDeleting(tuition)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editingId && draft)}
        onClose={() => { setEditingId(null); setDraft(null); }}
        title="Edit tuition"
        subtitle="Changes are saved instantly to your listing."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setEditingId(null); setDraft(null); }}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : null} Save changes
            </Button>
          </>
        }
      >
        {draft && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <Input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
            </Field>
            <Field label="Subject">
              <Select value={draft.subject} onChange={(event) => updateDraft("subject", event.target.value)}>
                {SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="Class level">
              <Select value={draft.classLevel} onChange={(event) => updateDraft("classLevel", event.target.value)}>
                {CLASS_LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="Mode">
              <Select value={draft.mode} onChange={(event) => updateDraft("mode", event.target.value)}>
                {MODES.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="Location / platform">
              <Input value={draft.location} onChange={(event) => updateDraft("location", event.target.value)} />
            </Field>
            <Field label="Monthly fee (৳)">
              <Input type="number" min="1" value={draft.monthlyFee} onChange={(event) => updateDraft("monthlyFee", event.target.value)} />
            </Field>
            <Field label="Days per week">
              <Select value={draft.daysPerWeek} onChange={(event) => updateDraft("daysPerWeek", event.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{day} days / week</option>)}
              </Select>
            </Field>
            <Field label="Banner image URL" className="sm:col-span-2" hint="Paste a public image URL for the listing banner.">
              <div className="flex items-center gap-2">
                <ImageIcon size={17} className="shrink-0 text-muted" />
                <Input value={draft.bannerImage} onChange={(event) => updateDraft("bannerImage", event.target.value)} placeholder="https://…" />
              </div>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} rows={4} />
            </Field>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this tuition?"
        subtitle="This will also remove its applications."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(null)}>Keep it</Button>
            <Button variant="danger" onClick={confirmDelete}><Trash2 size={15} /> Delete tuition</Button>
          </>
        }
      >
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-4">
          <p className="font-bold text-ink">{deleting?.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            The listing and every application attached to it will be permanently removed from your dashboard.
          </p>
        </div>
      </Modal>
    </div>
  );
}
