"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Bookmark, Crown, Sparkles } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import TuitionCard from "@/components/TuitionCard";
import { useApp } from "@/lib/store";

export default function SavedTuitionsPage() {
  const { user, bookmarks, upgradePlan } = useApp();

  // /bookmarks/mine returns tuition objects, not bookmark join records.
  const items = bookmarks;

  const handleUpgrade = async () => {
    const result = await upgradePlan("Pro Student");
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">My learning</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Saved tuitions</h2>
          <p className="mt-2 text-sm text-muted">
            A shortlist of the batches you want to come back to. Tap the bookmark on any tuition to add or remove it.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="brand">{items.length} saved</Badge>
          <Link href="/tuitions" className="btn-primary">Browse tuitions</Link>
        </div>
      </div>

      {user?.plan === "free" && items.length >= 4 && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-warning/20 bg-warning/5 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-warning/15 text-warning">
              <Sparkles size={19} />
            </span>
            <div>
              <p className="font-bold text-ink">You&apos;ve used {items.length} of 5 free saves</p>
              <p className="text-sm text-muted">Upgrade to Pro to save unlimited tuitions.</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleUpgrade}><Crown size={15} /> Upgrade to Pro</Button>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved just yet"
          description="Bookmark tuitions while browsing and they'll appear here, ready when you are."
          action={<Link href="/tuitions" className="btn-primary">Explore approved tuitions</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((tuition) => (
            <TuitionCard key={tuition._id} tuition={tuition} />
          ))}
        </div>
      )}
    </div>
  );
}
