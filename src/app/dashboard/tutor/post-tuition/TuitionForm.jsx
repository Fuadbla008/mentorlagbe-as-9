"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  Crown,
  ImagePlus,
  Info,
  Link2,
  Loader2,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Badge, Button, Card, Field, ImageWithFallback, Input, Select, Textarea, cn } from "@/components/ui";
import { uploadImage } from "@/lib/api";
import { CLASS_LEVELS, MODES, SUBJECTS } from "@/lib/seed";
import { useApp } from "@/lib/store";

const emptyForm = {
  title: "",
  subject: SUBJECTS[0],
  classLevel: "HSC",
  mode: MODES[0],
  location: "",
  monthlyFee: "",
  daysPerWeek: "3",
  description: "",
  bannerImage: "",
};

export default function TuitionForm() {
  const router = useRouter();
  const { user, tuitions, createTuition, upgradePlan } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isPro = user?.plan === "pro";
  const owned = tuitions.filter((item) => item.tutorEmail === user?.email).length;
  const remaining = Math.max(0, 2 - owned);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onFileChange = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (!url) throw new Error("Upload did not return an image URL.");
      update("bannerImage", url);
      toast.success("Banner image uploaded successfully.");
    } catch (error) {
      toast.error(error?.message || "Upload failed — paste an image URL instead.");
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 6) next.title = "Use at least 6 characters for the title.";
    if (!form.subject) next.subject = "Choose a subject.";
    if (!form.classLevel) next.classLevel = "Choose a class level.";
    if (!form.mode) next.mode = "Choose a mode.";
    if (!form.location.trim()) next.location = "Add a location or meeting platform.";

    const fee = Number(form.monthlyFee);
    if (!form.monthlyFee || !Number.isFinite(fee) || fee <= 0) next.monthlyFee = "Enter a monthly fee greater than 0.";

    const days = Number(form.daysPerWeek);
    if (!form.daysPerWeek || !Number.isInteger(days) || days < 1 || days > 7) {
      next.daysPerWeek = "Choose between 1 and 7 days per week.";
    }

    if (form.description.trim().length < 20) next.description = "Describe your batch in at least 20 characters.";
    if (!form.bannerImage.trim()) next.bannerImage = "Upload a banner or paste an image URL.";

    setErrors(next);
    const firstError = Object.values(next)[0];
    if (firstError) toast.error(firstError);
    return !firstError;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    try {
      const result = await createTuition({
        title: form.title.trim(),
        subject: form.subject,
        classLevel: form.classLevel,
        mode: form.mode,
        location: form.location.trim(),
        monthlyFee: Number(form.monthlyFee),
        daysPerWeek: Number(form.daysPerWeek),
        description: form.description.trim(),
        bannerImage: form.bannerImage.trim(),
      });
      if (result.ok) {
        toast.success(result.message);
        router.push("/dashboard/tutor/my-tuitions");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error?.message || "Unable to create the tuition right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpgrade = async () => {
    const result = await upgradePlan("Pro Tutor");
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/tutor/my-tuitions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-brand">
          <ArrowLeft size={16} /> Back to my tuitions
        </Link>
        <div className="mt-4">
          <span className="eyebrow">Grow your batch</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Post a new tuition</h2>
          <p className="mt-2 text-sm text-muted">
            Tell students what you&apos;ll teach, when and how much it costs. Admin approval is required before it
            appears in search.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="font-bold text-ink">The basics</h3>
                <p className="text-xs text-muted">Help students understand what this batch is about.</p>
              </div>
            </div>

            <div className="space-y-5">
              <Field label="Tuition title" error={errors.title} hint="A clear, specific title gets more applications.">
                <Input
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="e.g. HSC Mathematics Mastery Batch"
                  disabled={submitting}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Subject" error={errors.subject}>
                  <Select value={form.subject} onChange={(event) => update("subject", event.target.value)} disabled={submitting}>
                    {SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                  </Select>
                </Field>
                <Field label="Class level" error={errors.classLevel}>
                  <Select value={form.classLevel} onChange={(event) => update("classLevel", event.target.value)} disabled={submitting}>
                    {CLASS_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Mode" error={errors.mode}>
                  <Select value={form.mode} onChange={(event) => update("mode", event.target.value)} disabled={submitting}>
                    {MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                  </Select>
                </Field>
                <Field label="Location / platform" error={errors.location} hint="E.g. Mirpur, Dhaka or Online — Zoom.">
                  <Input
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="Where will classes happen?"
                    disabled={submitting}
                  />
                </Field>
              </div>

              <Field label="Description" error={errors.description} hint="Syllabus, teaching approach, mock tests, support — the more detail, the better.">
                <Textarea
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  placeholder="What will students learn and how will you teach it?"
                  rows={6}
                  disabled={submitting}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent">
                <PlusCircle size={18} />
              </span>
              <div>
                <h3 className="font-bold text-ink">Schedule &amp; pricing</h3>
                <p className="text-xs text-muted">Set expectations upfront to attract the right students.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Monthly fee (৳)" error={errors.monthlyFee}>
                <Input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={form.monthlyFee}
                  onChange={(event) => update("monthlyFee", event.target.value)}
                  placeholder="e.g. 3500"
                  disabled={submitting}
                />
              </Field>
              <Field label="Days per week" error={errors.daysPerWeek}>
                <Select value={form.daysPerWeek} onChange={(event) => update("daysPerWeek", event.target.value)} disabled={submitting}>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <option key={day} value={day}>{day} {day === 1 ? "day" : "days"} / week</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
                <ImagePlus size={18} />
              </span>
              <div>
                <h3 className="font-bold text-ink">Banner image</h3>
                <p className="text-xs text-muted">A bright, relevant image makes your listing stand out.</p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-4">
                <Field label="Upload an image">
                  <label
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-surface-2/40 px-4 py-8 text-center transition hover:border-brand/60 hover:bg-brand/5",
                      uploading && "pointer-events-none opacity-70",
                    )}
                  >
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" disabled={submitting} />
                    {uploading ? <Loader2 size={26} className="animate-spin text-brand" /> : <UploadCloud size={26} className="text-brand" />}
                    <span className="mt-2 text-sm font-semibold text-ink">
                      {uploading ? "Uploading your image…" : "Click to choose an image"}
                    </span>
                    <span className="mt-1 text-xs text-muted">PNG, JPG or WEBP — uploaded to ImgBB when configured</span>
                  </label>
                </Field>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">or paste a URL</span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                <Field label="Image URL" error={errors.bannerImage} hint="Use this if image upload isn't configured.">
                  <div className="relative">
                    <Link2 size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <Input
                      value={form.bannerImage}
                      onChange={(event) => update("bannerImage", event.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="pl-10"
                      disabled={submitting}
                    />
                  </div>
                </Field>
              </div>

              <div>
                <p className="label">Preview</p>
                <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
                  <ImageWithFallback
                    src={form.bannerImage}
                    alt="Banner preview"
                    fallbackText="Your banner"
                    className="h-40 w-full object-cover"
                  />
                  <p className="px-3 py-2 text-xs text-muted">Suggested size: 1200 × 600px or wider.</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-3 pb-4">
            <Link href="/dashboard/tutor/my-tuitions" className="btn-ghost">Cancel</Link>
            <Button type="submit" disabled={submitting || uploading}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
              {submitting ? "Publishing…" : "Submit for approval"}
            </Button>
          </div>
        </form>

        <aside className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold text-ink">Posting quota</h3>
            <p className="mt-1 text-xs text-muted">Free tutors can publish up to 2 batches.</p>
            <div className="mt-4 rounded-2xl border border-brand/20 bg-brand/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{isPro ? "Pro Tutor" : "Free Tutor"}</span>
                <Badge tone={isPro ? "brand" : "neutral"}>{isPro ? <><Crown size={12} /> Pro</> : "Free"}</Badge>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-brand">
                {isPro ? "Unlimited" : `${remaining} left`}
              </p>
              <p className="mt-1 text-xs text-muted">
                {isPro ? "Post as many batches as you like." : `${owned} of 2 free posts used.`}
              </p>
            </div>
            {!isPro && remaining === 0 && (
              <Button className="mt-4 w-full" onClick={handleUpgrade}><Crown size={15} /> Upgrade to post more</Button>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-ink">What happens next?</h3>
            <ol className="mt-4 space-y-4">
              {[
                { icon: ShieldCheck, title: "Admin review", text: "We check accuracy and quality before publishing." },
                { icon: BadgeCheck, title: "Go live", text: "Approved batches appear in student search results." },
                { icon: Sparkles, title: "Get applications", text: "Review and accept students from your dashboard." },
              ].map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                      <Icon size={15} />
                    </span>
                    {index < 2 && <span className="mt-1 h-6 w-px bg-line" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="flex gap-3 rounded-2xl border border-line bg-surface/70 p-4 text-xs leading-5 text-muted">
            <Info size={16} className="mt-0.5 shrink-0 text-brand" />
            Image uploads are enabled. You can also paste any public image URL.
          </div>
        </aside>
      </div>
    </div>
  );
}
