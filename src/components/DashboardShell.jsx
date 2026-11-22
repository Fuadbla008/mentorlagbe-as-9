"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BadgeCheck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  ShieldCheck,
  Sun,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import Logo from "./Logo";
import { Avatar, Badge, Button, Skeleton, cn } from "./ui";
import { useApp } from "@/lib/store";
import { useTheme } from "./Providers";

const navigation = {
  student: [
    { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/student/my-applications", label: "My Applications", icon: ClipboardList },
    { href: "/dashboard/student/saved", label: "Saved Tuitions", icon: Bookmark },
  ],
  tutor: [
    { href: "/dashboard/tutor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/tutor/post-tuition", label: "Post a Tuition", icon: PlusCircle },
    { href: "/dashboard/tutor/my-tuitions", label: "My Tuitions", icon: GraduationCap },
    { href: "/dashboard/tutor/applicants", label: "Applicants", icon: UsersRound },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "User Management", icon: UsersRound },
    { href: "/dashboard/admin/tuitions", label: "Tuition Approval", icon: ShieldCheck },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: Wallet },
  ],
};

const shared = [{ href: "/dashboard/profile", label: "Update Profile", icon: UserRound }];

const dashboardRoot = (role) =>
  role === "admin" ? "/dashboard/admin" : role === "tutor" ? "/dashboard/tutor" : "/dashboard/student";

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, signOut } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const requiredRole = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/tutor")
      ? "tutor"
      : pathname.startsWith("/dashboard/student")
        ? "student"
        : null;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      toast.error(`This area is for ${requiredRole}s only.`);
      router.replace(dashboardRoot(user.role));
    }
  }, [ready, user, requiredRole, pathname, router]);

  const items = useMemo(() => [...(user ? navigation[user.role] || [] : []), ...shared], [user]);

  const pageTitle = items.find((item) => item.href === pathname)?.label || "Dashboard";

  if (!ready || !user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="container-x grid gap-5 py-10">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const handleSignOut = async () => {
    const result = await signOut();
    toast.success(result.message);
    router.push("/");
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-[72px] items-center border-b border-line px-4", collapsed && "justify-center px-2")}>
        <Logo compact={collapsed} />
      </div>

      <div className="px-3 py-4">
        {!collapsed && (
          <div className="mb-4 rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/8 via-surface to-accent/8 p-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Avatar src={user.image} name={user.name} className="h-9 w-9" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge tone={user.role === "admin" ? "brand" : user.role === "tutor" ? "accent" : "neutral"}>
                {user.role}
              </Badge>
              <Badge tone={user.plan === "pro" ? "brand" : "neutral"}>
                {user.plan === "pro" ? <><BadgeCheck size={12} /> Pro plan</> : "Free plan"}
              </Badge>
            </div>
          </div>
        )}
        <p className={cn("mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted", collapsed && "hidden")}>
          Menu
        </p>
        <nav className="grid gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-gradient-to-r from-brand to-brand-strong font-semibold text-white shadow-lg shadow-brand/25"
                    : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-line p-3">
        {!collapsed && (
          <Link href="/pricing" className="mb-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand/10 to-accent/10 px-3 py-2.5 text-xs font-medium text-brand">
            <CreditCard size={15} /> {user.plan === "pro" ? "Pro plan active" : "Upgrade to Pro"}
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut size={18} /> {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-page">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden border-r border-line bg-gradient-to-b from-surface via-surface to-surface-2/60 transition-all duration-300 lg:block",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button aria-label="Close sidebar" className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-64 border-r border-line bg-surface">{sidebar}</aside>
        </div>
      )}

      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <header className="glass sticky top-0 z-40 flex h-[72px] items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-muted hover:bg-surface-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">
              <Menu size={20} />
            </button>
            <button
              className="hidden rounded-lg p-2 text-muted hover:bg-surface-2 lg:block"
              onClick={() => setCollapsed((value) => !value)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <div>
              <h1 className="text-lg font-bold text-ink">{pageTitle}</h1>
              <p className="hidden text-xs text-muted sm:block">MentorLagbe dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/tuitions" className="btn-ghost hidden sm:inline-flex">Browse site</Link>
            <button onClick={toggleTheme} className="rounded-xl p-2.5 text-muted hover:bg-surface-2 hover:text-brand" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-xl border border-line py-1 pl-1 pr-2.5 hover:border-brand/50">
              <Avatar src={user.image} name={user.name} className="h-8 w-8" />
              <span className="hidden text-sm font-semibold text-ink md:block">{user.name.split(" ")[0]}</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
