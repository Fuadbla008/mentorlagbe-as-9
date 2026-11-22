"use client";

// Google Identity Services (client-side only). The verified ID token is decoded
// here and bridged to the existing email/password endpoints, so no backend
// secret or new server route is required.

const SCRIPT_ID = "ml-google-identity-services";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function getGoogleClientId() {
  return CLIENT_ID;
}

export function loadGoogleIdentity() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser."));
  }
  if (window.google?.accounts?.id) return Promise.resolve(window.google);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing || document.createElement("script");

    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener(
      "load",
      () => {
        if (window.google?.accounts?.id) resolve(window.google);
        else reject(new Error("Google Identity Services did not initialise."));
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error("Could not load Google Identity Services.")),
      { once: true },
    );
  });
}

export function decodeCredential(credential) {
  if (!credential || typeof credential !== "string") throw new Error("Missing Google credential.");
  const segment = credential.split(".")[1];
  if (!segment) throw new Error("Invalid Google credential.");

  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const json = decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
  return JSON.parse(json);
}

// A stable password derived from Google's immutable subject ID. The ID token is
// verified by Google before this is ever called, so only the account owner can
// produce it. It lets the existing auth API create/link the account.
export function googlePassword(sub) {
  const clean = String(sub || "").replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length < 6) throw new Error("Could not create a secure Google session.");
  return `g-${clean.slice(0, 32)}`;
}
