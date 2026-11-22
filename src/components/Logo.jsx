import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "./ui";

export default function Logo({ className, compact = false }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="MentorLagbe home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-white shadow-lg shadow-brand/25 transition-transform group-hover:scale-105">
        <GraduationCap size={22} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-ink">
          Mentor<span className="gradient-text">Lagbe</span>
        </span>
      )}
    </Link>
  );
}
