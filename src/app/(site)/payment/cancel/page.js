import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { Card } from "@/components/ui";

export default function PaymentCancelPage() {
  return (
    <div className="container-x flex justify-center py-14 sm:py-20">
      <Card className="w-full max-w-xl overflow-hidden text-center">
        <div className="bg-gradient-to-br from-danger/10 to-warning/10 px-6 py-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-danger/15 text-danger">
            <XCircle size={44} />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">Payment cancelled</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            No charges were made. Your account is unchanged and you can keep exploring MentorLagbe for free.
          </p>
        </div>

        <div className="space-y-3 p-6 sm:p-8">
          <Link href="/pricing" className="btn-primary w-full">
            <RotateCcw size={17} /> Retry checkout
          </Link>
          <Link href="/" className="btn-outline w-full">
            <Home size={17} /> Back to home
          </Link>

          <div className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-left text-xs leading-5 text-muted">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-success" />
            <span>
              Changed your mind about Pro? You can continue with the Free plan at any time — all
              approved tuitions remain open to browse and apply.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm">
            <Link href="/tuitions" className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
              <ArrowLeft size={14} /> Browse tuitions
            </Link>
            <Link href="/pricing#faq" className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
              View plans <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
