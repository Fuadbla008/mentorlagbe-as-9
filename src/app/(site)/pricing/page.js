import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import PricingClient from "./PricingClient";

const FAQS = [
  {
    question: "Can I use MentorLagbe for free?",
    answer:
      "Yes. Free accounts can browse every approved tuition and apply without limits. Tutors can post up to two tuitions and students can save five bookmarks on the free plan.",
  },
  {
    question: "What happens when I upgrade to Pro?",
    answer:
      "Your Pro perks unlock immediately: unlimited tuition posts for tutors, unlimited bookmarks and priority booking for students, plus a verified Pro badge on your profile.",
  },
  {
    question: "How does the checkout work?",
    answer:
      "When a payment backend is connected you are taken to a secure Stripe Checkout page. In the demo environment, checkout is simulated and your Pro plan is activated instantly so you can explore every feature.",
  },
  {
    question: "Can I cancel my Pro subscription?",
    answer:
      "You can stop renewing at any time from your dashboard. Your Pro benefits remain available until the end of the current billing period.",
  },
  {
    question: "Is there a refund if I am not satisfied?",
    answer:
      "If something is not working as expected, contact support within 14 days of your payment and we will review your request and issue a refund where applicable.",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="container-x py-12 sm:py-16">
        <SectionHeading
          eyebrow="Plans & pricing"
          title="Choose the Plan That Fits Your Journey"
          description="Start free, upgrade when you need more. Simple monthly pricing for students and tutors — no surprises."
          center
        />
        <PricingClient />
      </section>

      <section id="faq" className="scroll-mt-24 border-y border-line/70 bg-surface/60 py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Good to know"
            title="Frequently Asked Questions"
            description="Everything you might want to know about plans and payments."
            center
          />
          <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group card p-5 open:border-brand/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink marker:hidden">
                  {faq.question}
                  <span className="text-lg font-normal text-brand transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 sm:py-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-gradient-to-br from-brand to-violet-600 px-6 py-12 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Still exploring?</h2>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              Browse hundreds of approved tuitions and find a mentor before you decide on a plan.
            </p>
          </div>
          <Link href="/tuitions" className="btn shrink-0 bg-white text-brand hover:bg-white/90">
            Browse tuitions <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <div className="container-x pb-14 text-center">
        <p className="flex items-center justify-center gap-2 text-xs text-muted">
          <CheckCircle2 size={14} className="text-success" /> Secure checkout · Cancel anytime · Demo mode supported
        </p>
      </div>
    </>
  );
}
