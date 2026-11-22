import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <span className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-brand/10 text-brand">
          <Compass size={36} />
        </span>
        <p className="text-7xl font-extrabold tracking-tight gradient-text">404</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">This page took a different route</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          The page you are looking for does not exist or has been moved. Let&apos;s get you back on track.
        </p>
        <Link href="/" className="btn-primary mt-7">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
