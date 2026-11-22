"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, LayoutDashboard, Search } from "lucide-react";
import { Badge, Card, Skeleton } from "@/components/ui";

function SuccessSkeleton() {
  return (
    <div className="container-x flex max-w-xl flex-col items-center py-20">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="mt-6 h-9 w-72" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <Skeleton className="mt-8 h-12 w-full" />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<SuccessSkeleton />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "Pro";
  const amount = searchParams.get("amount") || "";

  return (
    <div className="container-x flex justify-center py-14 sm:py-20">
      <Card className="animate-scale-in w-full max-w-xl overflow-hidden text-center">
        <div className="relative bg-gradient-to-br from-success/15 via-surface to-accent/10 px-6 py-10">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-success via-accent to-brand" />
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-success to-emerald-700 text-white shadow-lg shadow-success/30 ring-glow">
            <CheckCircle2 size={44} />
          </div>
          <h1 className="gradient-text mt-6 text-3xl font-extrabold tracking-tight">Payment successful!</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Your subscription is active. Thank you for investing in your growth with MentorLagbe.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Badge tone="success" className="text-sm">{plan} plan</Badge>
            {amount && <Badge tone="brand" className="text-sm">${amount} / month</Badge>}
          </div>
        </div>

        <div className="space-y-3 p-6 sm:p-8">
          <Link href="/dashboard" className="btn-primary w-full">
            <LayoutDashboard size={17} /> Go to Dashboard
          </Link>
          <Link href="/tuitions" className="btn-outline w-full">
            <Search size={17} /> Browse Tuitions <ArrowRight size={15} />
          </Link>

          <p className="pt-2 text-xs text-muted">
            A confirmation has been recorded in your account. Need help? Contact our support team anytime.
          </p>
        </div>
      </Card>
    </div>
  );
}
