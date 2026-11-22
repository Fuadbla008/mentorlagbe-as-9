"use client";

import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Info,
  Star,
  UsersRound,
  X,
} from "lucide-react";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const variants = {
  primary: "btn-primary",
  accent: "btn-accent",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }) {
  return (
    <button
      type={type}
      className={cn(variants[variant] || variants.primary, size === "sm" && "btn-sm", className)}
      {...props}
    />
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("card", className)} {...props}>
      {children}
    </div>
  );
}

const badgeTones = {
  brand: "bg-brand/10 text-brand",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/12 text-danger",
  neutral: "bg-surface-2 text-muted",
};

export function Badge({ tone = "neutral", className, children }) {
  return <span className={cn("badge", badgeTones[tone] || badgeTones.neutral, className)}>{children}</span>;
}

export function Field({ label, hint, error, children, className }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input(props) {
  return <input {...props} className={cn("input", props.className)} />;
}

export function Textarea(props) {
  return <textarea {...props} className={cn("input min-h-28 resize-y", props.className)} />;
}

export function Select(props) {
  return <select {...props} className={cn("input cursor-pointer", props.className)} />;
}

export function ImageWithFallback({ src, alt, className, fallbackText }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;
  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-brand/25 via-violet-400/20 to-accent/25 text-sm font-bold text-brand",
          className,
        )}
      >
        {fallbackText || alt || "MentorLagbe"}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailedSrc(src)} />
  );
}

export function Avatar({ src, name = "", className }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <ImageWithFallback
      src={src}
      alt={name}
      fallbackText={initials || "ML"}
      className={cn("h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-brand/20 ring-offset-2 ring-offset-surface", className)}
    />
  );
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button aria-label="Close dialog" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "animate-scale-in relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl ring-glow",
          size === "lg" ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-xl font-bold text-ink">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

const statIcons = {
  users: UsersRound,
  graduation: GraduationCap,
  book: BookOpenCheck,
  calendar: CalendarCheck2,
  days: CalendarDays,
  star: Star,
};

export function StatCard({ icon, label, value, hint, tone = "brand" }) {
  const Icon = typeof icon === "string" ? statIcons[icon] : icon;
  const tones = {
    brand: "bg-brand/10 text-brand",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning",
  };
  return (
    <Card className="card-hover relative flex items-start gap-4 overflow-hidden p-5">
      <span className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-brand/8 blur-2xl" />
      {Icon && (
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl shadow-sm", tones[tone] || tones.brand)}>
          <Icon size={20} />
        </span>
      )}
      <div className="relative min-w-0">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-ink">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
    </Card>
  );
}

export function EmptyState({ icon: Icon = Info, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Icon size={26} />
      </span>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(0, page - 3) + 5,
  );
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={15} /> Previous
      </Button>
      {pages.map((item) => (
        <Button
          key={item}
          variant={item === page ? "primary" : "outline"}
          size="sm"
          className="w-9 px-0"
          onClick={() => onChange(item)}
        >
          {item}
        </Button>
      ))}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight size={15} />
      </Button>
    </nav>
  );
}

export function SectionHeading({ eyebrow, title, description, center = false, action }) {
  return (
    <div className={cn("mb-10 flex flex-wrap items-end justify-between gap-6", center && "flex-col items-center text-center")}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-title">{title}</h2>
        {description && <p className={cn("section-subtitle", center && "mx-auto")}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const tone = {
    approved: "success",
    accepted: "success",
    paid: "success",
    active: "success",
    pending: "warning",
    rejected: "danger",
    closed: "neutral",
    admin: "brand",
    tutor: "accent",
    student: "neutral",
    pro: "brand",
    free: "neutral",
  }[status] || "neutral";
  return <Badge tone={tone}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}</Badge>;
}

export function ToastHint({ message }) {
  return (
    <p className="flex items-center gap-2 text-xs text-muted">
      <CheckCircle2 size={14} className="text-success" /> {message}
    </p>
  );
}
