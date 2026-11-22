"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Card, Skeleton } from "@/components/ui";
import { API_BASE_URL } from "@/lib/api";

function ReturnSkeleton() {
  return (
    <div className="container-x flex max-w-lg flex-col items-center py-24">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="mt-6 h-8 w-64" />
      <Skeleton className="mt-3 h-5 w-80 max-w-full" />
    </div>
  );
}

function ReturnHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      router.replace("/payment/cancel");
      return;
    }

    let active = true;
    const verify = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/payments/return?session_id=${encodeURIComponent(sessionId)}`,
          { redirect: "follow" },
        );

        // The backend may confirm the session and redirect to the success page itself.
        if (response.redirected && response.url) {
          const finalUrl = new URL(response.url);
          if (finalUrl.pathname.endsWith("/payment/success") || finalUrl.pathname.endsWith("/payments/return")) {
            window.location.assign(finalUrl.toString());
            return;
          }
        }

        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || "We couldn't verify this payment.");

        const plan = body.plan || body.planName || "Pro";
        const amount = body.amount ?? body.amountTotal ?? "";
        router.replace(
          `/payment/success?plan=${encodeURIComponent(plan)}&amount=${encodeURIComponent(String(amount))}`,
        );
      } catch (caught) {
        if (active) setError(caught?.message || "We couldn't verify this payment. Please contact support.");
      }
    };

    void verify();
    return () => {
      active = false;
    };
  }, [router, sessionId]);

  if (error) {
    return (
      <div className="container-x flex justify-center py-20">
        <Card className="w-full max-w-lg p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-warning/12 text-warning">
            <AlertTriangle size={26} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-ink">Payment not confirmed</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{error}</p>
          <p className="mt-3 text-xs leading-5 text-muted">
            If you completed checkout, your plan will be activated automatically once the payment webhook is processed.
            You can safely refresh your dashboard in a minute.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
            <Link href="/pricing" className="btn-outline"><ArrowLeft size={15} /> Back to Pricing</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-x flex max-w-lg flex-col items-center py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-brand">
        <Loader2 size={30} className="animate-spin" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Confirming your payment…</h1>
      <p className="mt-3 flex items-center gap-2 text-sm text-muted">
        <CheckCircle2 size={15} className="text-success" /> This only takes a moment.
      </p>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<ReturnSkeleton />}>
      <ReturnHandler />
    </Suspense>
  );
}
