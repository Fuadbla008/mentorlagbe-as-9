"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  Clock3,
  Crown,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import TuitionCard from "@/components/TuitionCard";
import { formatDate, formatFee } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function StudentOverviewPage() {
  const { user, applications, tuitions, bookmarks, upgradePlan } = useApp();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const mine = applications.filter((item) => item.studentEmail === user?.email);
  const accepted = mine.filter((item) => item.status === "accepted").length;
  const pending = mine.filter((item) => item.status === "pending").length;
  const appliedIds = new Set(mine.map((item) => item.tuitionId));
  const savedCount = bookmarks.length;

  const recent = [...mine]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 5);

  const recommended = tuitions
    .filter((item) => item.approvalStatus === "approved" && item.isActive && !appliedIds.has(item._id))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  const confirmUpgrade = async () => {
    const result = await upgradePlan("Pro Student");
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
    setUpgradeOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Student dashboard</span>
          <h2 className="gradient-text text-2xl font-extrabold tracking-tight sm:text-3xl">
            Assalamu Alaikum, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="mt-2 text-sm text-muted">
            Track your progress and find the next batch that fits your goals.
          </p>
        </div>
        <Link href="/tuitions" className="btn-primary">
          Browse tuitions <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Send} label="Total Applied Tuitions" value={mine.length} hint="Across all subjects" tone="brand" />
        <StatCard icon={CheckCircle2} label="Accepted Applications" value={accepted} hint="Tutors said yes" tone="success" />
        <StatCard icon={Clock3} label="Pending Applications" value={pending} hint="Awaiting a decision" tone="warning" />
        <StatCard
          icon={user?.plan === "pro" ? BadgeCheck : Crown}
          label="Current Plan"
          value={user?.plan === "pro" ? "Pro" : "Free"}
          hint={user?.plan === "pro" ? "Unlimited saves unlocked" : `${savedCount}/5 saved tuitions used`}
          tone={user?.plan === "pro" ? "success" : "accent"}
        />
      </div>

      {user?.plan === "free" ? (
        <Card className="animate-fade-up relative overflow-hidden border-brand/20 bg-gradient-to-r from-brand/10 via-violet-500/10 to-accent/10 p-6">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-violet-500 to-accent" />
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-brand/15 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand">
                <Sparkles size={22} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink">Save every tuition you love with Pro</h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
                  Free students can bookmark 5 tuitions. Upgrade to Pro for unlimited bookmarks and priority
                  booking on popular batches.
                </p>
              </div>
            </div>
            <Button onClick={() => setUpgradeOpen(true)} className="shrink-0">
              <Crown size={16} /> Upgrade to Pro
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-success/20 bg-success/5 p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-success/15 text-success">
              <BadgeCheck size={21} />
            </span>
            <div>
              <p className="font-bold text-ink">Pro Student plan is active</p>
              <p className="text-sm text-muted">Unlimited bookmarks and priority booking are enabled.</p>
            </div>
          </div>
          <Link href="/tuitions" className="btn-outline">
            Explore tuitions <ArrowUpRight size={15} />
          </Link>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-ink">
              <TrendingUp size={18} className="text-brand" /> Recent applications
            </h3>
            <p className="mt-0.5 text-xs text-muted">Your latest activity at a glance</p>
          </div>
          <Link href="/dashboard/student/my-applications" className="text-sm font-bold text-brand hover:underline">
            View all <ArrowUpRight size={14} className="inline" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Send}
              title="No applications yet"
              description="Once you apply to a tuition, it will show up here with its current status."
              action={
                <Link href="/tuitions" className="btn-primary btn-sm">
                  Find a tuition
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-semibold">Tuition</th>
                  <th className="px-5 py-3 font-semibold">Tutor</th>
                  <th className="px-5 py-3 font-semibold">Fee</th>
                  <th className="px-5 py-3 font-semibold">Applied</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item._id} className="border-b border-line/70 transition last:border-0 hover:bg-surface-2/50">
                    <td className="px-5 py-4">
                      <Link href={`/tuitions/${item.tuitionId}`} className="font-semibold text-ink hover:text-brand">
                        {item.tuitionTitle}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">{item.subject}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={item.tutorImage} name={item.tutorName} className="h-7 w-7" />
                        <span className="text-muted">{item.tutorName || "Tutor"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-brand">{formatFee(item.monthlyFee)}</td>
                    <td className="px-5 py-4 text-muted">{formatDate(item.appliedAt)}</td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">Handpicked for you</span>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-ink">Recommended tuitions</h3>
            <p className="mt-1 text-sm text-muted">Popular approved batches you haven&apos;t applied to yet.</p>
          </div>
          <Link href="/tuitions" className="btn-ghost btn-sm">
            See all tuitions <ArrowUpRight size={15} />
          </Link>
        </div>

        {recommended.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="You've explored them all"
            description="New approved batches will appear here as soon as they're published."
            action={<Link href="/tuitions" className="btn-outline btn-sm">Browse tuitions</Link>}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map((tuition) => (
              <TuitionCard key={tuition._id} tuition={tuition} />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Upgrade to Pro Student"
        subtitle="A one-time demo payment unlocks these benefits instantly."
        footer={
          <>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>Not now</Button>
            <Button onClick={confirmUpgrade}><Crown size={16} /> Confirm upgrade</Button>
          </>
        }
      >
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-ink">Pro Student</p>
              <p className="text-sm text-muted">Everything you need to learn without limits</p>
            </div>
            <Badge tone="brand">$10 once</Badge>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {["Unlimited saved tuitions", "Priority booking on batches", "Pro badge on your profile"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-success" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
}
