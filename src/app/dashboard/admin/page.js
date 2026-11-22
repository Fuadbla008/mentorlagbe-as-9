"use client";

import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Inbox, ShieldCheck, UsersRound, Wallet, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ImageWithFallback,
  Skeleton,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { formatDate } from "@/lib/data";
import { useApp } from "@/lib/store";

const usd = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AdminOverviewPage() {
  const { ready, users, tuitions, payments, moderateTuition } = useApp();

  const stats = useMemo(() => {
    const count = (status) => tuitions.filter((item) => item.approvalStatus === status).length;
    const approved = count("approved");
    const pending = count("pending");
    const rejected = count("rejected");
    return {
      tutors: users.filter((item) => item.role === "tutor").length,
      students: users.filter((item) => item.role === "student").length,
      approved,
      pending,
      rejected,
      approvalRate: Math.round((approved / (tuitions.length || 1)) * 100),
      revenue: payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    };
  }, [users, tuitions, payments]);

  const pendingQueue = useMemo(
    () =>
      tuitions
        .filter((item) => item.approvalStatus === "pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [tuitions],
  );

  const recentPayments = useMemo(
    () => [...payments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)).slice(0, 5),
    [payments],
  );

  const decide = async (id, decision) => {
    const result = await moderateTuition(id, decision);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(decision === "approved" ? "Tuition approved — it is now live." : "Tuition rejected.");
  };

  if (!ready) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={13} /> Admin control center
          </span>
          <h2 className="section-title">Platform overview</h2>
          <p className="section-subtitle">
            A live snapshot of members, tuition moderation and Stripe revenue across MentorLagbe.
          </p>
        </div>
        <Badge tone="success" className="px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live data
        </Badge>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform statistics">
        <StatCard icon={UsersRound} label="Total users" value={users.length} hint={`${stats.students} students registered`} tone="brand" />
        <StatCard icon={ShieldCheck} label="Total tutors" value={stats.tutors} hint="Mentors on the platform" tone="accent" />
        <StatCard
          icon={Inbox}
          label="Tuition approvals"
          value={`${stats.approved} / ${stats.pending}`}
          hint="Approved / pending listings"
          tone="warning"
        />
        <StatCard
          icon={Wallet}
          label="Total Stripe revenue"
          value={usd(stats.revenue)}
          hint={`${payments.length} successful payments`}
          tone="success"
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="flex h-full flex-col p-5 sm:p-6 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">Pending approval queue</h3>
              <p className="mt-1 text-xs text-muted">Newest tuition submissions waiting for a decision</p>
            </div>
            <Badge tone="warning">{stats.pending} waiting</Badge>
          </div>

          {pendingQueue.length ? (
            <div className="divide-y divide-line">
              {pendingQueue.map((tuition) => (
                <div key={tuition._id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <ImageWithFallback
                    src={tuition.bannerImage}
                    alt={tuition.title}
                    fallbackText={tuition.subject}
                    className="h-12 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{tuition.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {tuition.tutorName} · {tuition.subject} · {formatDate(tuition.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-success/40 text-success hover:border-success hover:bg-success/10"
                      onClick={() => decide(tuition._id, "approved")}
                    >
                      <Check size={14} /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => decide(tuition._id, "rejected")}
                    >
                      <X size={14} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="All caught up"
              description="There are no tuitions waiting for approval right now."
            />
          )}

          <Link
            href="/dashboard/admin/tuitions"
            className="btn-ghost mt-auto pt-5 text-brand hover:text-brand-strong"
          >
            Review all tuitions <ArrowRight size={15} />
          </Link>
        </Card>

        <Card className="flex h-full flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">Approval rate</h3>
              <p className="mt-1 text-xs text-muted">Share of submitted tuitions that are live</p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/12 text-success">
              <ShieldCheck size={19} />
            </span>
          </div>

          <p className="mt-7 text-4xl font-extrabold tracking-tight text-ink">
            {stats.approvalRate}
            <span className="ml-1 text-xl font-bold text-muted">%</span>
          </p>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500"
              style={{ width: `${stats.approvalRate}%` }}
              role="progressbar"
              aria-valuenow={stats.approvalRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Tuition approval rate"
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-center">
            <div>
              <p className="text-lg font-bold text-success">{stats.approved}</p>
              <p className="text-[11px] text-muted">Approved</p>
            </div>
            <div>
              <p className="text-lg font-bold text-warning">{stats.pending}</p>
              <p className="text-[11px] text-muted">Pending</p>
            </div>
            <div>
              <p className="text-lg font-bold text-danger">{stats.rejected}</p>
              <p className="text-[11px] text-muted">Rejected</p>
            </div>
          </div>
          <Link href="/dashboard/admin/tuitions" className="btn-ghost mt-auto pt-5 text-brand hover:text-brand-strong">
            Manage queue <ArrowRight size={15} />
          </Link>
        </Card>
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 sm:p-6">
          <div>
            <h3 className="text-base font-bold text-ink">Recent payments</h3>
            <p className="mt-1 text-xs text-muted">Latest Stripe transactions across the platform</p>
          </div>
          <Link href="/dashboard/admin/transactions" className="btn-outline btn-sm">
            All transactions <ArrowRight size={14} />
          </Link>
        </div>

        {recentPayments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-surface-2/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Transaction</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentPayments.map((payment) => (
                  <tr key={payment._id} className="transition hover:bg-surface-2/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={payment.userImage} name={payment.userName} className="h-8 w-8" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{payment.userName}</p>
                          <p className="truncate text-xs text-muted">{payment.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{payment.planName}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-bold text-ink">{usd(payment.amount)}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">{payment.transactionId}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">{formatDate(payment.paidAt)}</td>
                    <td className="px-5 py-3"><StatusBadge status={payment.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState icon={Wallet} title="No payments yet" description="Plan purchases will appear here as soon as they happen." />
          </div>
        )}
      </Card>
    </div>
  );
}
