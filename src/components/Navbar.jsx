"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import Logo from "./Logo";
import { Avatar, Badge, Button, cn } from "./ui";
import { useApp } from "@/lib/store";
import { useTheme } from "./Providers";

const links = [
  { href: "/", label: "Home" },
  { href: "/tuitions", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How It Works" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, signOut } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const dashboardHref = user
    ? user.role === "admin"
      ? "/dashboard/admin"
      : user.role === "tutor"
        ? "/dashboard/tutor"
        : "/dashboard/student"
    : "/sign-in";

  const handleSignOut = async () => {
    const result = await signOut();
    toast.success(result.message);
    router.push("/");
    router.refresh();
  };

  const isActive = (href) => (href === "/" ? pathname === "/" : href.startsWith("/#") ? false : pathname.startsWith(href));

  return (
    <header className="glass sticky top-0 z-50 border-b border-line/80 shadow-[0_4px_24px_rgba(16,24,40,0.04)]">
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                setMenuOpen(false);
                setProfileOpen(false);
              }}
              className={cn(
                "relative rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:text-brand",
                isActive(link.href)
                  ? "bg-brand/10 font-semibold text-brand shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand)_18%,transparent)]"
                  : "text-muted hover:bg-surface-2",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-xl p-2.5 text-muted transition hover:bg-surface-2 hover:text-brand"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl border border-line bg-surface py-1.5 pl-1.5 pr-2.5 transition hover:border-brand/50"
              >
                <Avatar src={user.image} name={user.name} className="h-8 w-8" />
                <span className="hidden max-w-28 truncate text-left text-sm font-semibold text-ink xl:block">
                  {user.name.split(" ")[0]}
                </span>
                <Badge tone={user.role === "admin" ? "brand" : user.role === "tutor" ? "accent" : "neutral"} className="hidden xl:inline-flex">
                  {user.role}
                </Badge>
                <ChevronDown size={14} className="text-muted" />
              </button>
              {profileOpen && (
                <div className="animate-scale-in absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-line bg-surface p-2 shadow-2xl ring-glow">
                  <div className="border-b border-line px-3 py-3">
                    <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge tone={user.role === "admin" ? "brand" : user.role === "tutor" ? "accent" : "neutral"}>
                        {user.role}
                      </Badge>
                      <Badge tone={user.plan === "pro" ? "brand" : "neutral"}>{user.plan} plan</Badge>
                    </div>
                  </div>
                  <Link href={dashboardHref} onClick={() => setProfileOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-surface-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-surface-2">
                    <UserRound size={16} /> Update Profile
                  </Link>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-danger hover:bg-danger/10">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="btn-ghost">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-xl p-2 text-ink md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-surface px-4 py-4 md:hidden">
          <nav className="grid gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {user ? (
              <>
                <Link href={dashboardHref} className="btn-primary flex-1">
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" className="btn-outline flex-1">
                  Profile
                </Link>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut size={16} /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="btn-outline flex-1">
                  Sign In
                </Link>
                <Link href="/sign-up" className="btn-primary flex-1">
                  Sign Up
                </Link>
              </>
            )}
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} Theme
            </Button>
          </div>
          {ready && user && <p className="mt-3 px-1 text-xs text-muted">Signed in as {user.name} · {user.role}</p>}
        </div>
      )}
    </header>
  );
}
