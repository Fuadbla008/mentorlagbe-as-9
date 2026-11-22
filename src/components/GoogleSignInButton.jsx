"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { decodeCredential, getGoogleClientId, loadGoogleIdentity } from "@/lib/google";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-4 w-4">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.6.27-3.14.78-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const containerRef = useRef(null);
  const [state, setState] = useState(getGoogleClientId() ? "loading" : "unconfigured");

  useEffect(() => {
    if (!getGoogleClientId()) return undefined;
    let active = true;

    loadGoogleIdentity()
      .then((google) => {
        if (!active || !containerRef.current) return;
        google.accounts.id.initialize({
          client_id: getGoogleClientId(),
          ux_mode: "popup",
          callback: ({ credential }) => {
            if (!credential) return;
            try {
              onCredential(decodeCredential(credential));
            } catch (error) {
              toast.error(error?.message || "Google sign-in failed. Please try again.");
            }
          },
        });
        containerRef.current.innerHTML = "";
        google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
        });
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });

    return () => {
      active = false;
    };
  }, [onCredential]);

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full [&>div]:!w-full" />
      {state !== "ready" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            toast.info("Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local to enable Google sign-in.")
          }
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/50 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleIcon /> Continue with Google
        </button>
      )}
    </div>
  );
}
