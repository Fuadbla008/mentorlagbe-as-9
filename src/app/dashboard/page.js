"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Skeleton } from "@/components/ui";

export default function DashboardIndex() {
  const router = useRouter();
  const { user, ready } = useApp();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/sign-in?next=/dashboard");
      return;
    }
    const target =
      user.role === "admin"
        ? "/dashboard/admin"
        : user.role === "tutor"
          ? "/dashboard/tutor"
          : "/dashboard/student";
    router.replace(target);
  }, [ready, user, router]);

  return (
    <div className="container-x grid gap-5 py-10">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-72" />
    </div>
  );
}
