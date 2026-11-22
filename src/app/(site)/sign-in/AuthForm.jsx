"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import Logo from "@/components/Logo";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Avatar, Button, Field, Input, cn } from "@/components/ui";
import { googlePassword } from "@/lib/google";
import { TESTIMONIALS } from "@/lib/seed";
import { useApp } from "@/lib/store";
import { isApiConfigured } from "@/lib/api";

const dashboardFor = (role) =>
  role === "admin" ? "/dashboard/admin" : role === "tutor" ? "/dashboard/tutor" : "/dashboard/student";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roles = [
  { id: "student", label: "Student", hint: "Find and join the right batch", icon: UserRound },
  { id: "tutor", label: "Tutor", hint: "Post batches and grow your reach", icon: GraduationCap },
];

const demos = [
  { role: "student", label: "Student", email: "ayesha@example.com", icon: UserRound, tone: "bg-brand/10 text-brand" },
  { role: "tutor", label: "Tutor", email: "sadia@mentorlagbe.com", icon: GraduationCap, tone: "bg-accent/15 text-accent" },
  { role: "admin", label: "Admin", email: "admin@mentorlagbe.com", icon: ShieldCheck, tone: "bg-warning/15 text-warning" },
];

function BrandPanel() {
  const testimonial = TESTIMONIALS[0];

  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand via-indigo-600 to-accent p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div className="grid-dots pointer-events-none absolute inset-0 opacity-25" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-16 top-1/3 h-40 w-40 animate-float rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm" />

      <div className="relative">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand shadow-lg">
            <GraduationCap size={22} strokeWidth={2.2} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">MentorLagbe</span>
        </div>
        <div className="mt-10 max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur">
            <Sparkles size={13} /> Learn from the best
          </span>
          <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            The right mentor can change <span className="text-cyan-200">everything.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/80">
            Discover verified tutors, compare batches and start learning with confidence — all in one place.
          </p>
        </div>
      </div>

      <div className="relative mt-10 space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: UsersRound, value: "12k+", label: "Learners" },
            { icon: BadgeCheck, value: "850+", label: "Verified tutors" },
            { icon: Star, value: "4.9/5", label: "Avg. rating" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <Icon size={18} className="text-cyan-200" />
              <p className="mt-2 text-2xl font-extrabold">{value}</p>
              <p className="text-xs text-white/70">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
          <Quote size={20} className="text-cyan-200" />
          <p className="mt-2 text-sm leading-6 text-white/90">“{testimonial.quote}”</p>
          <div className="mt-4 flex items-center gap-3">
            <Avatar src={testimonial.image} name={testimonial.name} className="h-9 w-9 ring-white/40" />
            <div>
              <p className="text-sm font-bold">{testimonial.name}</p>
              <p className="text-xs text-white/70">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function AuthForm({ mode = "sign-in" }) {
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, demoLogin } = useApp();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const nextPath = searchParams.get("next");

  const destinationFor = useCallback(
    (role) => {
      if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) return dashboardFor(role);
      // Keep users inside their own dashboard area.
      if (nextPath.startsWith("/dashboard/") && !nextPath.startsWith(`/dashboard/${role}`)) return dashboardFor(role);
      return nextPath;
    },
    [nextPath],
  );

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (isSignUp && form.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    const firstError = Object.values(next)[0];
    if (firstError) toast.error(firstError);
    return !firstError;
  };

  const finish = useCallback(
    (result, fallbackRole) => {
      if (!result?.ok) {
        toast.error(result?.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success(result.message);
      router.replace(destinationFor(result.user?.role || fallbackRole));
    },
    [destinationFor, router],
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    if (busy || !validate()) return;
    setBusy(true);
    try {
      if (isSignUp) {
        const result = await signUp({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
        finish(result, form.role);
      } else {
        const result = await signIn({ email: form.email.trim(), password: form.password });
        finish(result, "student");
      }
    } catch (error) {
      toast.error(error?.message || "Unable to continue right now.");
    } finally {
      setBusy(false);
    }
  };

  const onDemo = async (role) => {
    if (busy) return;
    setBusy(true);
    try {
      finish(await demoLogin(role), role);
    } catch (error) {
      toast.error(error?.message || "Demo sign-in is unavailable right now.");
    } finally {
      setBusy(false);
    }
  };

  const onGoogleCredential = useCallback(
    async (profile) => {
      if (busy || !profile?.email) {
        if (!profile?.email) toast.error("Google didn't share an email address with us.");
        return;
      }
      setBusy(true);
      try {
        const password = googlePassword(profile.sub);
        let result = await signIn({ email: profile.email, password });
        if (!result.ok) {
          result = await signUp({
            name: profile.name || profile.email.split("@")[0],
            email: profile.email,
            password,
            role: "student",
          });
        }
        finish(result, "student");
      } catch (error) {
        toast.error(error?.message || "Google sign-in failed. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, finish, signIn, signUp],
  );

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
      <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12 xl:px-20">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <span className="eyebrow">{isSignUp ? "Join MentorLagbe" : "Welcome back"}</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {isSignUp
              ? "Set up your profile in a minute and start connecting with the right tutors or students."
              : "Pick up where you left off — your applications, batches and saved tuitions are waiting."}
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            {isSignUp && (
              <Field label="Full name" error={errors.name}>
                <div className="relative">
                  <UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <Input
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="e.g. Ayesha Siddika"
                    autoComplete="name"
                    className="pl-10"
                    disabled={busy}
                  />
                </div>
              </Field>
            )}

            <Field label="Email address" error={errors.email}>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-10"
                  disabled={busy}
                />
              </div>
            </Field>

            <Field
              label="Password"
              error={errors.password}
              hint={isSignUp ? "At least 6 characters." : undefined}
            >
              <div className="relative">
                <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder="Enter your password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="pl-10 pr-11"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-brand"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            {isSignUp && (
              <Field label="I want to join as" hint="You can manage your profile later.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {roles.map(({ id, label, hint, icon: Icon }) => {
                    const selected = form.role === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update("role", id)}
                        className={cn(
                          "relative rounded-2xl border p-4 text-left transition",
                          selected
                            ? "border-brand bg-brand/5 ring-2 ring-brand/15"
                            : "border-line bg-surface hover:border-brand/50",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-9 w-9 place-items-center rounded-xl",
                            selected ? "bg-brand text-white" : "bg-surface-2 text-muted",
                          )}
                        >
                          <Icon size={18} />
                        </span>
                        <p className="mt-3 text-sm font-bold text-ink">{label}</p>
                        <p className="mt-0.5 text-xs leading-5 text-muted">{hint}</p>
                        {selected && (
                          <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                            <Check size={13} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
              {!busy && <ArrowRight size={17} />}
            </Button>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">or continue with</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-4">
              <GoogleSignInButton onCredential={onGoogleCredential} disabled={busy} />
            </div>
            <p className="mt-3 text-center text-xs leading-5 text-muted">
              First time here? A free student account is created automatically.
            </p>
          </div>

          {!isSignUp && (
            <div className="mt-6 rounded-2xl border border-line bg-surface-2/60 p-4 text-xs leading-5 text-muted">
              <p className="flex items-center gap-2 font-bold text-ink">
                <ShieldCheck size={15} className="text-brand" /> Admin access
              </p>
              <p className="mt-1.5">
                Administrator accounts are provisioned by the platform owner and are not available through public
                sign-up. Contact your administrator for credentials.
              </p>
            </div>
          )}

          {!isSignUp && !isApiConfigured() && (
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Try a demo account</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {demos.map(({ role, label, email, icon: Icon, tone }) => (
                  <button
                    key={role}
                    type="button"
                    disabled={busy}
                    onClick={() => onDemo(role)}
                    title={email}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 disabled:opacity-50"
                  >
                    <span className={cn("grid h-9 w-9 place-items-center rounded-xl", tone)}>
                      <Icon size={17} />
                    </span>
                    <span className="text-xs font-bold text-ink">{label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted">
                One click — no password needed. Explore each role instantly.
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted">
            {isSignUp ? "Already have an account? " : "New to MentorLagbe? "}
            <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-bold text-brand hover:underline">
              {isSignUp ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-3 text-center">
            <Link href="/" className="text-xs font-medium text-muted hover:text-brand">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>

      <BrandPanel />
    </div>
  );
}
