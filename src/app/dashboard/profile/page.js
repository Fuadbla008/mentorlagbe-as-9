"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Crown, ImagePlus, Save, UserRound } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { formatDate } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Avatar, Badge, Button, Card, Field, Input, StatusBadge, Textarea } from "@/components/ui";

export default function ProfilePage() {
  const { user, updateProfile } = useApp();
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    image: user?.image || "",
  }));
  const [uploading, setUploading] = useState(false);
  const [useUrlFallback, setUseUrlFallback] = useState(false);
  const fileRef = useRef(null);

  if (!user) return null;

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (!url) throw new Error("Upload did not return an image URL.");
      setForm((prev) => ({ ...prev, image: url }));
      setUseUrlFallback(false);
      toast.success("Photo uploaded — save changes to update your profile.");
    } catch (error) {
      setUseUrlFallback(true);
      toast.error(error?.message || "Upload failed. Paste an image URL below instead.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSave = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    const result = await updateProfile({
      name: form.name.trim(),
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      image: form.image.trim(),
    });
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="animate-fade-up">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">
            <UserRound size={13} /> Account settings
          </span>
          <h2 className="section-title">Update your profile</h2>
          <p className="section-subtitle">
            Keep your details current so mentors and students can recognise you across MentorLagbe.
          </p>
        </div>
        <Badge tone={user.role === "admin" ? "brand" : user.role === "tutor" ? "accent" : "neutral"} className="capitalize px-3 py-1.5">
          {user.role} account
        </Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="h-full p-5 sm:p-6">
          <form onSubmit={onSave} className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand/15 bg-gradient-to-r from-brand/8 via-surface to-accent/8 p-4">
              <Avatar
                src={form.image || user.image}
                name={form.name || user.name}
                className="h-20 w-20 text-xl ring-4 ring-brand/20"
              />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-ink">{form.name || user.name}</p>
                <p className="truncate text-sm text-muted">{user.email}</p>
                <p className="mt-1 text-xs text-muted">Member since {formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={form.name} onChange={setField("name")} placeholder="Your full name" autoComplete="name" />
              </Field>
              <Field label="Phone number">
                <Input value={form.phone} onChange={setField("phone")} placeholder="+880 1XXX-XXXXXX" autoComplete="tel" />
              </Field>
            </div>

            <Field label="Bio" hint="A short introduction shown on your profile.">
              <Textarea
                value={form.bio}
                onChange={setField("bio")}
                placeholder="Tell the community about your goals, experience or teaching style..."
                rows={4}
              />
            </Field>

            <div className="grid gap-5 rounded-2xl border border-dashed border-line p-4 sm:grid-cols-2">
              <Field label="Email address" hint="Your email address can't be changed here.">
                <Input value={user.email} readOnly disabled className="cursor-not-allowed opacity-70" />
              </Field>
              <Field label="Account role" hint="Roles are managed by platform administrators.">
                <Input value={user.role} readOnly disabled className="cursor-not-allowed capitalize opacity-70" />
              </Field>
            </div>

            <div className="rounded-2xl border border-line p-4 sm:p-5">
              <p className="text-sm font-semibold text-ink">Profile picture</p>
              <p className="mb-4 mt-1 text-xs text-muted">Upload an image, or paste a direct image URL below.</p>
              <input
                ref={fileRef}
                id="profile-image-file"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <ImagePlus size={16} /> {uploading ? "Uploading..." : "Choose image"}
                </Button>
                <span className="text-xs text-muted">PNG, JPG or WEBP</span>
              </div>
              <div className="mt-4">
                <Field
                  label="Or paste an image URL"
                  hint={
                    useUrlFallback
                      ? "Automatic upload isn't available — paste a direct image URL instead."
                      : "Use a direct link to an image (https://...)."
                  }
                >
                  <Input
                    value={form.image}
                    onChange={setField("image")}
                    placeholder="https://example.com/photo.jpg"
                    inputMode="url"
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <p className="text-xs text-muted">Changes are saved to your MentorLagbe account.</p>
              <Button type="submit">
                <Save size={16} /> Save changes
              </Button>
            </div>
          </form>
        </Card>

        <div className="grid content-start gap-6">
          <Card className="relative overflow-hidden border-brand/25 bg-gradient-to-br from-brand/12 via-surface to-accent/12 p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
                <Crown size={22} />
              </span>
              <StatusBadge status={user.plan} />
            </div>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Current plan</p>
            <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
              {user.plan === "pro" ? "Pro member" : "Free member"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {user.plan === "pro"
                ? "You have unlimited listings, bookmarks and priority visibility."
                : "Upgrade for unlimited listings, saved tuitions and a verified badge."}
            </p>
            <Link href="/pricing" className="btn-primary mt-6 w-full">
              {user.plan === "pro" ? "Compare plans" : "Upgrade plan"} <ArrowRight size={15} />
            </Link>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-bold text-ink">Account details</h3>
            <dl className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Email</dt>
                <dd className="max-w-[65%] truncate font-medium text-ink" title={user.email}>{user.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Role</dt>
                <dd><StatusBadge status={user.role} /></dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Plan</dt>
                <dd><StatusBadge status={user.plan} /></dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Joined</dt>
                <dd className="font-medium text-ink">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
