"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Crown,
  GraduationCap,
  PlusCircle,
  Sparkles,
  UsersRound,
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
import { formatDate, formatFee } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function TutorOverviewPage() {
  const { user, tuitions, applications, upgradePlan } = useApp();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const mine = tuitions.filter((item) => item.tutorEmail === user?.email);
  const myIds = new Set(mine.map((item) => item._id));
  const received = applications.filter((item) => myIds.has(item.tuitionId));
  const approvedActive = mine.filter((item) => item.approvalStatus === "approved" && item.isActive).length;
  const pendingApproval = mine.filter((item) => item.approvalStatus === "pending").length;
  const pendingApplicants = received.filter((item) => item.status === "pending").length;

  const recentTuitions = [...mine]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentApplicants = [...received]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 4);

  const confirmUpgrade = async () => {
    const result = await upgradePlan("Pro Tutor");
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
    setUpgradeOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Tutor dashboard</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="mt-2 text-sm text-muted">
            Manage your batches and respond to students who want to learn with you.
          </p>
        </div>
        <Link href="/dashboard/tutor/post-tuition" className="btn-primary">
          <PlusCircle size={16} /> Post a tuition
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GraduationCap} label="Total Tuitions Posted" value={mine.length} hint="All time" tone="brand" />
        <StatCard
          icon={BadgeCheck}
          label="Active / Approved Tuitions"
          value={approvedActive}
          hint={pendingApproval ? `${pendingApproval} awaiting admin review` : "All reviews complete"}
          tone="success"
        />
        <StatCard
          icon={UsersRound}
          label="Total Applicants Received"
          value={received.length}
          hint={pendingApplicants ? `${pendingApplicants} need a decision` : "You're all caught up"}
          tone="accent"
        />
        <StatCard
          icon={user?.plan === "pro" ? BadgeCheck : Crown}
          label="Current Plan"
          value={user?.plan === "pro" ? "Pro" : "Free"}
          hint={user?.plan === "pro" ? "Unlimited posts enabled" : "2 posts allowed"}
          tone={user?.plan === "pro" ? "success" : "warning"}
        />
      </div>

      {user?.plan === "free" ? (
        <Card className="relative overflow-hidden border-brand/20 bg-gradient-to-r from-brand/10 via-violet-500/10 to-accent/10 p-6">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-brand/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand">
                <Sparkles size={22} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink">Reach more students with Pro Tutor</h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
                  Free tutors can publish up to 2 batches. Upgrade for unlimited listings, a verified badge and
                  priority placement in search results.
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
              <p className="font-bold text-ink">Pro Tutor plan is active</p>
              <p className="text-sm text-muted">Unlimited batches and priority listing are enabled.</p>
            </div>
          </div>
          <Link href="/dashboard/tutor/post-tuition" className="btn-outline">
            Post a new batch <ArrowUpRight size={15} />
          </Link>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                <GraduationCap size={18} className="text-brand" /> Your tuitions
              </h3>
              <p className="mt-0.5 text-xs text-muted">Approval status and current visibility</p>
            </div>
            <Link href="/dashboard/tutor/my-tuitions" className="text-sm font-bold text-brand hover:underline">
              Manage all <ArrowUpRight size={14} className="inline" />
            </Link>
          </div>

          {recentTuitions.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={GraduationCap}
                title="No tuitions posted yet"
                description="Create your first batch and students will be able to discover and apply to it."
                action={<Link href="/dashboard/tutor/post-tuition" className="btn-primary btn-sm">Post a tuition</Link>}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-2/60 text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-semibold">Tuition</th>
                    <th className="px-5 py-3 font-semibold">Fee</th>
                    <th className="px-5 py-3 font-semibold">Approval</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Applicants</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTuitions.map((item) => (
                    <tr key={item._id} className="border-b border-line/70 transition last:border-0 hover:bg-surface-2/50">
                      <td className="max-w-[240px] px-5 py-4">
                        <Link href="/dashboard/tutor/my-tuitions" className="font-semibold text-ink hover:text-brand">
                          {item.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">{item.subject} · {item.classLevel}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-brand">{formatFee(item.monthlyFee)}</td>
                      <td className="px-5 py-4"><StatusBadge status={item.approvalStatus} /></td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.isActive ? "active" : "closed"} />
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone="neutral">{received.filter((app) => app.tuitionId === item._id).length}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                <UsersRound size={18} className="text-brand" /> Recent applicants
              </h3>
              <p className="mt-0.5 text-xs text-muted">Students who raised their hand</p>
            </div>
            <Link href="/dashboard/tutor/applicants" className="text-sm font-bold text-brand hover:underline">
              View all <ArrowUpRight size={14} className="inline" />
            </Link>
          </div>

          {recentApplicants.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={UsersRound}
                title="No applicants yet"
                description="Once students apply to your batches, you'll see them here first."
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {recentApplicants.map((item) => (
                <div key={item._id} className="flex items-start gap-3 px-5 py-4">
                  <Avatar src={item.studentImage} name={item.studentName} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-ink">{item.studentName}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="truncate text-xs text-muted">{item.tuitionTitle}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                      {item.status === "pending" ? <Clock3 size={12} className="text-warning" /> : <CheckCircle2 size={12} className="text-success" />}
                      Applied {formatDate(item.appliedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Upgrade to Pro Tutor"
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
              <p className="font-bold text-ink">Pro Tutor</p>
              <p className="text-sm text-muted">Grow your teaching business without limits</p>
            </div>
            <Badge tone="brand">$15 once</Badge>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {[
              "Unlimited tuition posts",
              "Verified Pro tutor badge",
              "Priority listing in search results",
            ].map((item) => (
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
