import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  GraduationCap,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { Badge, Card, ImageWithFallback, SectionHeading, StatCard } from "@/components/ui";
import TuitionCard from "@/components/TuitionCard";
import { getFeaturedTuitions, getPlatformStats } from "@/lib/data";
import { PLANS, SUBJECTS, TESTIMONIALS } from "@/lib/seed";

// Unsplash photo ids reused from the seed data so imagery stays consistent.
const img = (id, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const HERO_IMAGE = img("photo-1509062522246-3755977927d7");
const HERO_IMAGE_SMALL = img("photo-1523050854058-8df90110c9f1", 640);
const TUTOR_IMAGE = img("photo-1580489944761-15a19d654956", 320);

const STEPS = [
  {
    icon: Search,
    title: "Search & compare",
    description:
      "Filter by subject, class level, mode and budget to find a batch that fits your goal.",
  },
  {
    icon: CalendarCheck2,
    title: "Apply in one click",
    description:
      "Send your schedule and a short note to the tutor. No lengthy calls or paperwork.",
  },
  {
    icon: MessageSquareText,
    title: "Connect with your tutor",
    description:
      "Once accepted, chat with your tutor, clear doubts and get a personal study plan.",
  },
  {
    icon: TrendingUp,
    title: "Learn & grow",
    description:
      "Attend live classes, track progress and build the confidence to ace your exams.",
  },
];

const SUBJECT_ICONS = ["∑", "⚛", "⚗", "🧬", "</>", "Aa", "IELTS", "σ", "↗", "ع"];

export default async function HomePage() {
  const [stats, featured] = await Promise.all([getPlatformStats(), getFeaturedTuitions(6)]);
  const proStudent = PLANS.find((plan) => plan.id === "pro-student");
  const proTutor = PLANS.find((plan) => plan.id === "pro-tutor");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line/70 bg-gradient-to-b from-brand/[0.07] via-surface to-page">
        <div className="pointer-events-none absolute inset-0 grid-dots opacity-70" />
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="container-x relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="eyebrow">
              <Sparkles size={13} /> Learn from the best, anytime
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Find Your Ideal <span className="gradient-text">Tutor</span> or Mentorship Batch Today
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
              From HSC maths to full-stack development, discover trusted tutors and small
              mentorship batches that help you learn faster — online or near you.
            </p>

            <form
              action="/tuitions"
              method="get"
              className="glass mt-8 flex w-full max-w-xl flex-col gap-2 rounded-2xl p-2 shadow-xl shadow-brand/10 transition focus-within:ring-4 focus-within:ring-brand/12 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-2 px-2">
                <Search size={19} className="shrink-0 text-muted" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search a subject, e.g. Mathematics"
                  aria-label="Search tuitions"
                  className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-muted/70"
                />
              </div>
              <button type="submit" className="btn-primary shrink-0">
                Search tuitions <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-ink">Popular:</span>
              {["Mathematics", "Physics", "IELTS", "Programming"].map((subject) => (
                <Link
                  key={subject}
                  href={`/tuitions?subject=${encodeURIComponent(subject)}`}
                  className="rounded-full border border-line bg-surface px-3 py-1 font-medium transition hover:border-brand hover:text-brand"
                >
                  {subject}
                </Link>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[HERO_IMAGE_SMALL, TUTOR_IMAGE, img("photo-1573496359142-b8d87734a5a2", 320)].map(
                    (src, index) => (
                      <ImageWithFallback
                        key={index}
                        src={src}
                        alt="MentorLagbe learner"
                        className="h-9 w-9 rounded-full border-2 border-surface object-cover"
                      />
                    ),
                  )}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-0.5 text-warning">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                    <span className="ml-1 font-bold text-ink">4.9/5</span>
                  </div>
                  <p className="mt-0.5 text-muted">Loved by 1,000+ learners</p>
                </div>
              </div>
              <span className="hidden h-8 w-px bg-line sm:block" />
              <div className="flex items-center gap-2 text-xs font-medium text-muted">
                <ShieldCheck size={18} className="text-success" /> Verified tutors · Secure payments
              </div>
            </div>
          </div>

          {/* Hero imagery */}
          <div className="relative mx-auto w-full max-w-lg animate-fade-up lg:mx-0">
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface shadow-2xl shadow-brand/20">
              <ImageWithFallback
                src={HERO_IMAGE}
                alt="Students learning together in a classroom"
                fallbackText="Learn together"
                className="h-[300px] w-full object-cover sm:h-[380px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white">
                <div>
                  <Badge className="bg-white/20 text-white backdrop-blur">Live mentorship batches</Badge>
                  <p className="mt-2 text-lg font-bold">Small groups. Big results.</p>
                </div>
              </div>
            </div>

            <div className="animate-scale-in absolute -bottom-6 -left-3 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 pr-4 shadow-xl ring-glow sm:-left-8">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-success/12 text-success">
                <GraduationCap size={22} />
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none text-ink">{stats.students}+</p>
                <p className="mt-1 text-[11px] font-medium text-muted">Active students</p>
              </div>
            </div>

            <div className="animate-float absolute -right-2 -top-5 w-48 rounded-2xl border border-line bg-surface p-3 shadow-xl sm:-right-6">
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={TUTOR_IMAGE}
                  alt="Top rated tutor"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">Sadia Karim</p>
                  <p className="text-[10px] text-muted">Top-rated tutor</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-xs">
                <span className="flex items-center gap-1 font-bold text-ink">
                  <Star size={12} fill="currentColor" className="text-warning" /> 4.9
                </span>
                <span className="text-muted">128 students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="container-x -mt-1 py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon="users" label="Expert tutors" value={`${stats.tutors}+`} hint="Verified profiles" tone="brand" />
          <StatCard icon="graduation" label="Active students" value={`${stats.students}+`} hint="Learning with us" tone="accent" />
          <StatCard icon="book" label="Live batches" value={`${stats.tuitions}+`} hint="Across 10 subjects" tone="success" />
          <StatCard icon="calendar" label="Applications" value={`${stats.applications}+`} hint="Matched this month" tone="warning" />
        </div>
      </section>

      {/* Featured tuitions */}
      <section className="container-x py-12 sm:py-16">
        <SectionHeading
          eyebrow="Handpicked for you"
          title="Featured Tuitions"
          description="Explore some of the most loved batches on MentorLagbe, taught by verified tutors."
          action={
            <Link href="/tuitions" className="btn-outline">
              Browse all tuitions <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tuition) => (
            <TuitionCard key={tuition._id} tuition={tuition} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 border-y border-line/70 bg-surface/60 py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Simple by design"
            title="How MentorLagbe Works"
            description="Going from searching to your first live class takes just a few minutes."
            center
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <Card key={step.title} className={`card-hover animate-fade-up animate-delay-${(index % 3) + 1} relative flex h-full flex-col p-6`}>
                <span className="gradient-text absolute right-5 top-4 text-4xl font-black opacity-30">
                  0{index + 1}
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                  <step.icon size={22} />
                </span>
                <h3 className="mt-5 text-base font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="container-x py-16 sm:py-20">
        <SectionHeading
          eyebrow="Explore by subject"
          title="Find Your Focus"
          description="From school subjects to career skills, there is a mentor for almost everything."
          action={
            <Link href="/tuitions" className="btn-ghost">
              See all subjects <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {SUBJECTS.map((subject, index) => (
            <Link
              key={subject}
              href={`/tuitions?subject=${encodeURIComponent(subject)}`}
              className="card-hover group flex h-full flex-col items-start gap-3 p-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand/15 to-accent/15 text-sm font-bold text-brand">
                {SUBJECT_ICONS[index] || "✦"}
              </span>
              <span className="text-sm font-bold text-ink transition group-hover:text-brand">{subject}</span>
              <span className="mt-auto flex items-center gap-1 text-[11px] font-medium text-muted">
                Explore batches <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-line/70 bg-surface/60 py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow="Real stories"
            title="What Learners Say"
            description="A few words from students who found their breakthrough on MentorLagbe."
            center
          />
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <Card key={item.name} className="card-hover flex h-full flex-col p-6">
                <div className="flex items-center gap-0.5 text-warning">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-7 text-ink/85">“{item.quote}”</p>
                <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-ink">{item.name}</p>
                    <p className="text-xs text-muted">{item.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="container-x py-16 sm:py-20">
        <SectionHeading
          eyebrow="Simple pricing"
          title="Start Free. Upgrade When You're Ready."
          description="Transparent plans for both learners and tutors — no hidden fees, cancel anytime."
          action={
            <Link href="/pricing" className="btn-outline">
              Compare all plans <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="flex h-full flex-col p-7">
            <Badge tone="accent" className="w-fit">For students</Badge>
            <h3 className="mt-4 text-2xl font-extrabold text-ink">Pro Student</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{proStudent.description}</p>
            <p className="mt-5 text-4xl font-black tracking-tight text-ink">
              ${proStudent.price}
              <span className="text-sm font-medium text-muted"> / month</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink/80">
              {proStudent.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-success" /> {feature}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="btn-outline mt-auto w-full pt-2.5">
              See student plans
            </Link>
          </Card>
          <Card className="relative flex h-full flex-col overflow-hidden border-brand/40 bg-gradient-to-br from-brand/[0.06] to-accent/[0.06] p-7">
            <span className="absolute right-5 top-5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-white">
              Most popular
            </span>
            <Badge tone="brand" className="w-fit">For tutors</Badge>
            <h3 className="mt-4 text-2xl font-extrabold text-ink">Pro Tutor</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{proTutor.description}</p>
            <p className="mt-5 text-4xl font-black tracking-tight text-ink">
              ${proTutor.price}
              <span className="text-sm font-medium text-muted"> / month</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink/80">
              {proTutor.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-success" /> {feature}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="btn-primary mt-auto w-full pt-2.5">
              See tutor plans <ArrowRight size={16} />
            </Link>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-x pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-violet-600 to-accent px-6 py-14 text-center text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 grid-dots opacity-30" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your next breakthrough starts here
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/85 sm:text-base">
              Join thousands of students learning from tutors who care. Find your perfect
              batch today — it&apos;s free to get started.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/tuitions" className="btn bg-white text-brand shadow-lg hover:bg-white/90">
                Browse tuitions <ArrowRight size={16} />
              </Link>
              <Link href="/sign-up" className="btn border border-white/50 text-white hover:bg-white/10">
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
