"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Lock, Search, ShieldCheck, UserRound, UsersRound, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  Input,
  Select,
  Skeleton,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { formatDate } from "@/lib/data";
import { useApp } from "@/lib/store";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "tutor", label: "Tutor" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsersPage() {
  const { ready, user, users, updateUserRole } = useApp();
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: users.length,
      admin: users.filter((item) => item.role === "admin").length,
      tutor: users.filter((item) => item.role === "tutor").length,
      student: users.filter((item) => item.role === "student").length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((item) =>
      [item.name, item.email, item.role, item.plan].some((value) =>
        String(value || "").toLowerCase().includes(needle),
      ),
    );
  }, [users, query]);

  const changeRole = async (target, nextRole) => {
    if (!nextRole || nextRole === target.role) return;
    const isSelf = target._id === user?._id;
    const isLastAdmin = target.role === "admin" && counts.admin <= 1;
    if (isSelf || isLastAdmin) {
      toast.error(isSelf ? "You can't change your own role." : "At least one administrator must remain.");
      return;
    }
    const result = await updateUserRole(target._id, nextRole);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(`${target.name} is now a ${nextRole}.`);
  };

  if (!ready) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const summary = [
    { label: "All users", value: counts.all, icon: UsersRound, tone: "brand" },
    { label: "Administrators", value: counts.admin, icon: ShieldCheck, tone: "warning" },
    { label: "Tutors", value: counts.tutor, icon: GraduationCap, tone: "accent" },
    { label: "Students", value: counts.student, icon: UserRound, tone: "success" },
  ];

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <span className="eyebrow">
          <UsersRound size={13} /> People
        </span>
        <h2 className="section-title">User management</h2>
        <p className="section-subtitle">
          Browse every member and assign roles. Role changes take effect across the dashboard immediately.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="User counts by role">
        {summary.map((item) => (
          <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} tone={item.tone} />
        ))}
      </section>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 sm:p-6">
          <div>
            <h3 className="text-base font-bold text-ink">All members</h3>
            <p className="mt-1 text-xs text-muted">
              Showing {filtered.length} of {users.length} users
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email or role"
              aria-label="Search users"
              className="pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-surface-2/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Change role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((item) => {
                  const isSelf = item._id === user?._id;
                  const isLastAdmin = item.role === "admin" && counts.admin <= 1;
                  const locked = isSelf || isLastAdmin;
                  const lockHint = isSelf ? "Your account" : "Last admin";
                  return (
                    <tr key={item._id} className="transition hover:bg-surface-2/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={item.image} name={item.name} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {item.name}
                              {isSelf && <span className="ml-1.5 text-xs font-normal text-brand">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-muted">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={item.role} /></td>
                      <td className="px-5 py-3">
                        <Badge tone={item.plan === "pro" ? "brand" : "neutral"}>
                          {item.plan === "pro" ? "Pro" : "Free"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-3">
                        <Select
                          value={item.role}
                          aria-label={`Role for ${item.name}`}
                          onChange={(event) => changeRole(item, event.target.value)}
                          disabled={locked}
                          title={locked ? (isSelf ? "You cannot change your own role" : "At least one admin must remain") : undefined}
                          className="min-w-[120px] py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={locked && option.value !== item.role}
                            >
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        {locked && (
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                            <Lock size={10} /> {lockHint} — role locked
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={Search}
              title="No users found"
              description="Try a different name, email address or role."
              action={
                <button type="button" className="btn-outline btn-sm" onClick={() => setQuery("")}>
                  Clear search
                </button>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
