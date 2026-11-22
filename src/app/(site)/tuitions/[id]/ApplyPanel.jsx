"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Info, LockKeyhole, Send, ShieldAlert } from "lucide-react";
import { Button, Field, Input, Modal, Skeleton, StatusBadge, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function ApplyPanel({ tuition }) {
  const { ready, user, applications, applyToTuition } = useApp();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [schedule, setSchedule] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const application = applications.find(
    (item) => item.tuitionId === tuition._id && item.studentEmail === user?.email,
  );

  const openModal = () => {
    setPhone(user?.phone || "");
    setSchedule("");
    setNote("");
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!schedule.trim()) {
      toast.error("Please share your preferred schedule.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await applyToTuition({
        ...tuition,
        application: {
          studentPhone: phone.trim(),
          preferredSchedule: schedule.trim(),
          studentNote: note.trim(),
        },
      });
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error?.message || "Unable to submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`/tuitions/${tuition._id}`);
    return (
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-ink">
          <LockKeyhole size={16} className="text-brand" /> Want to join this batch?
        </p>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          Sign in as a student to apply and talk to the tutor.
        </p>
        <Link href={`/sign-in?next=${next}`} className="btn-primary mt-4 w-full">
          Sign in to apply
        </Link>
      </div>
    );
  }

  if (user.role !== "student") {
    return (
      <div className="rounded-xl border border-line bg-surface-2 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldAlert size={17} className="text-warning" /> {user.role === "admin" ? "Admin view" : "Tutor account"}
        </p>
        <p className="mt-2 text-xs leading-6 text-muted">
          {user.role === "admin"
            ? "Administrators manage listings and do not apply to tuitions."
            : "Only students can apply for tuitions. Switch to a student account to send an application."}
        </p>
      </div>
    );
  }

  if (application) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-success/12 text-success">
          <CheckCircle2 size={22} />
        </div>
        <p className="mt-3 text-sm font-bold text-ink">Application submitted</p>
        <div className="mt-2 flex justify-center">
          <StatusBadge status={application.status} />
        </div>
        <p className="mt-2 text-xs leading-5 text-muted">
          Applied on {formatDate(application.appliedAt)}. The tutor will review it shortly.
        </p>
        {application.status === "pending" && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <Info size={13} /> You will be notified once a decision is made.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <Button onClick={openModal} className="w-full">
        <Send size={16} /> Apply for Tuition
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] leading-5 text-muted">
        <CheckCircle2 size={13} className="text-success" /> Free to apply · No commitment
      </p>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Apply for this tuition"
        subtitle={tuition.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="apply-form" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </>
        }
      >
        <form id="apply-form" onSubmit={submit} className="space-y-4">
          <Field label="Phone number" hint="The tutor can reach you at this number.">
            <Input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              autoComplete="tel"
            />
          </Field>
          <Field label="Preferred schedule">
            <Input
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
              placeholder="e.g. Evening, 6–8 PM"
            />
          </Field>
          <Field label="Learning note" hint="Tell the tutor what you want to focus on (optional).">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="I need extra practice with..."
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
