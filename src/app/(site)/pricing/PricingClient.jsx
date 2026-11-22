"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { PLANS } from "@/lib/seed";
import { useApp } from "@/lib/store";

export default function PricingClient() {
  const router = useRouter();
  const { ready, user, upgradePlan } = useApp();
  const [roleOverride, setRoleOverride] = useState(null);
  const [busyPlan, setBusyPlan] = useState(null);
  const role = roleOverride || (user?.role === "tutor" ? "tutor" : "student");

  const plans = PLANS.filter((plan) => plan.role === role);
  const freePlan = plans.find((plan) => plan.price === 0);
  const proPlan = plans.find((plan) => plan.price > 0);

  const handleSelect = async (plan) => {
    if (!ready) return;

    if (!user) {
      router.push("/sign-in?next=/pricing");
      return;
    }

    if (plan.price === 0) {
      if (user.plan === "pro") {
        toast.info("You are already enjoying Pro benefits.");
      } else {
        toast.success("You are on the Free plan. Explore your dashboard to get started.");
      }
      router.push("/dashboard");
      return;
    }

    const isCurrentPlan = user.plan === "pro" && user.role === plan.role;
    if (isCurrentPlan) {
      toast.info(`${plan.name} is already your active plan.`);
      return;
    }

    // The role tabs are for browsing only; checkout always uses the signed-in role.
    if (user.role !== plan.role) {
      toast.error(`Please sign in with a ${plan.role} account to buy this plan.`);
      return;
    }

    setBusyPlan(plan.id);
    try {
      // The server decides the price from the authenticated user's role.
      const result = await upgradePlan(plan.name);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    } catch (error) {
      toast.error(error?.message || "Could not start checkout. Please try again.");
    } finally {
      setBusyPlan(null);
    }
  };

  if (!ready) {
    return (
      <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Role toggle */}
      <div className="glass mx-auto mb-10 flex w-fit rounded-2xl p-1.5 shadow-sm">
        {[
          { value: "student", label: "For Students" },
          { value: "tutor", label: "For Tutors" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRoleOverride(tab.value)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
              role === tab.value
                ? "bg-gradient-to-r from-brand to-brand-strong text-white shadow-md shadow-brand/25"
                : "text-muted hover:bg-surface-2 hover:text-brand"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plan cards */}
      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = user?.plan === "pro" && user?.role === plan.role && plan.price > 0;
          const isBusy = busyPlan === plan.id;
          return (
            <Card
              key={plan.id}
              className={`animate-fade-up relative flex h-full flex-col overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular ? "border-brand/50 ring-glow" : "hover:border-brand/40 hover:shadow-hover"
              }`}
            >
              {plan.popular && (
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-violet-500 to-accent" />
              )}
              {plan.popular && (
                <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-white shadow">
                  <Sparkles size={12} /> Most popular
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-ink">{plan.name}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{plan.description}</p>
                </div>
                {isCurrent && <Badge tone="success">Current</Badge>}
              </div>

              <p className="gradient-text mt-6 text-4xl font-black tracking-tight">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
                {plan.price > 0 && <span className="text-sm font-medium text-muted"> / month</span>}
              </p>

              <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink/85">
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                        plan.popular ? "bg-brand/15 text-brand" : "bg-success/12 text-success"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "primary" : "outline"}
                className="mt-7 w-full"
                disabled={isBusy || isCurrent}
                onClick={() => handleSelect(plan)}
              >
                {isBusy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Redirecting…
                  </>
                ) : isCurrent ? (
                  "Your current plan"
                ) : (
                  plan.cta
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Comparison */}
      <div className="mx-auto mt-14 max-w-3xl">
        <h3 className="text-center text-lg font-bold text-ink">Compare Free vs Pro</h3>
        <div className="card mt-5 overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_100px] border-b border-line bg-surface-2 px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center text-brand">Pro</span>
          </div>
          {[...new Set([...(freePlan?.features || []), ...(proPlan?.features || [])])].map((feature) => {
            const inFree = freePlan?.features.includes(feature);
            const inPro = proPlan?.features.includes(feature);
            return (
              <div
                key={feature}
                className="grid grid-cols-[1fr_100px_100px] items-center border-b border-line px-5 py-3 text-sm last:border-0"
              >
                <span className="text-ink/85">{feature}</span>
                <span className="text-center">
                  {inFree ? <CheckCircle2 size={17} className="mx-auto text-success" /> : <span className="text-muted">—</span>}
                </span>
                <span className="text-center">
                  {inPro ? <CheckCircle2 size={17} className="mx-auto text-brand" /> : <span className="text-muted">—</span>}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Prices are billed monthly in USD. Tuition fees on MentorLagbe are set by individual tutors in BDT.
        </p>
      </div>
    </div>
  );
}
