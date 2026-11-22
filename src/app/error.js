"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function Error({ reset }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <p className="text-7xl font-extrabold tracking-tight text-danger">Oops</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
          We hit an unexpected error while loading this page. Try again — your data is safe.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            <RotateCcw size={16} /> Try Again
          </button>
          <Link href="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
