"use client";

import { useMemo, useState } from "react";
import { GraduationCap, ReceiptText, Search, UserRound, Wallet, X } from "lucide-react";
import {
  Badge,
  Card,
  EmptyState,
  Input,
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

export default function AdminTransactionsPage() {
  const { ready, payments } = useApp();
  const [query, setQuery] = useState("");

  const totals = useMemo(() => {
    const sumBy = (predicate) =>
      payments.filter(predicate).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      revenue: payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      tutor: sumBy((item) => item.userRole === "tutor" || /tutor/i.test(item.planName || "")),
      student: sumBy((item) => item.userRole === "student" || /student/i.test(item.planName || "")),
    };
  }, [payments]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = [...payments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    if (!needle) return rows;
    return rows.filter((item) =>
      [item.userName, item.userEmail, item.transactionId].some((value) =>
        String(value || "").toLowerCase().includes(needle),
      ),
    );
  }, [payments, query]);

  if (!ready) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <span className="eyebrow">
          <ReceiptText size={13} /> Billing
        </span>
        <h2 className="section-title">Transaction management</h2>
        <p className="section-subtitle">
          Every Pro plan purchase recorded on MentorLagbe, with revenue broken down by member type.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Payment totals">
        <StatCard icon={Wallet} label="Total revenue" value={usd(totals.revenue)} hint={`${payments.length} transactions`} tone="success" />
        <StatCard icon={GraduationCap} label="Tutor plan sales" value={usd(totals.tutor)} hint="Pro Tutor subscriptions" tone="brand" />
        <StatCard icon={UserRound} label="Student plan sales" value={usd(totals.student)} hint="Pro Student subscriptions" tone="accent" />
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 sm:p-6">
          <div>
            <h3 className="text-base font-bold text-ink">Payment history</h3>
            <p className="mt-1 text-xs text-muted">
              Showing {visible.length} of {payments.length} transactions
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or transaction ID"
              aria-label="Search transactions"
              className="pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-surface-2/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">User name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Transaction ID</th>
                  <th className="px-5 py-3 font-semibold">Payment date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((payment) => (
                  <tr key={payment._id} className="transition hover:bg-surface-2/40">
                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-ink">{payment.userName}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">{payment.userEmail}</td>
                    <td className="px-5 py-3"><StatusBadge status={payment.userRole} /></td>
                    <td className="px-5 py-3">
                      <Badge tone={payment.planName?.includes("Tutor") ? "accent" : "brand"}>
                        {payment.planName}
                      </Badge>
                    </td>
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
            <EmptyState
              icon={Search}
              title="No transactions found"
              description="Try another customer name, email address or transaction ID."
              action={
                <button type="button" className="btn-outline btn-sm" onClick={() => setQuery("")}>
                  Clear search
                </button>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
