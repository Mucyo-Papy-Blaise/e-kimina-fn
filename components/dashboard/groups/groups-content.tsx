"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { CreateGroupDialog } from "@/components/dashboard/groups/create-group-dialog";
import { GroupListCard } from "@/components/dashboard/groups/group-list-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useGroupsQuery,
  useJoinGroupMutation,
} from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import { cn } from "@/utils/cn";
import type { Group } from "@/types/group";
import type { ReactNode } from "react";

type MainTab = "mine" | "discover";
type MineSegment = "all" | "pending" | "verified";

function filterMine(groups: Group[] | undefined, seg: MineSegment): Group[] {
  if (!groups?.length) return [];
  if (seg === "pending") return groups.filter((g) => !g.isVerified);
  if (seg === "verified") return groups.filter((g) => g.isVerified);
  return groups;
}

function isUserMember(g: Group, userId: string | undefined, memberships: { groupId: string }[]) {
  if (!userId) return false;
  if (g.createdById === userId) return true;
  return memberships.some((m) => m.groupId === g.id);
}

export function GroupsContent() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("mine");
  const [mineSeg, setMineSeg] = useState<MineSegment>("all");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const mineQuery = useGroupsQuery("mine", { enabled: mainTab === "mine" });
  const discoverQuery = useGroupsQuery("discover", { enabled: mainTab === "discover" });
  const joinMutation = useJoinGroupMutation();

  const activeQuery = mainTab === "mine" ? mineQuery : discoverQuery;
  const { isLoading, isError, error, refetch } = activeQuery;

  const mineFiltered = useMemo(
    () => filterMine(mineQuery.data, mineSeg),
    [mineQuery.data, mineSeg],
  );

  const memberships = user?.groupMemberships ?? [];

  const handleJoin = async (g: Group) => {
    setJoiningId(g.id);
    try {
      await joinMutation.mutateAsync(g.id);
      toast.success("Joined group", {
        description: `You are now a member of ${g.name}.`,
      });
    } catch (e) {
      toast.error(
        e instanceof ApiError || e instanceof Error ? getApiErrorMessage(e) : "Could not join",
      );
    } finally {
      setJoiningId(null);
    }
  };

  const mineCounts = useMemo(() => {
    const list = mineQuery.data ?? [];
    return {
      all: list.length,
      pending: list.filter((g) => !g.isVerified).length,
      verified: list.filter((g) => g.isVerified).length,
    };
  }, [mineQuery.data]);

  const segmentBtn =
    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-[var(--transition)] sm:text-sm";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Groups"
          description="Manage groups you created, or discover public groups from other organizers."
          className="mb-0 sm:mb-0"
        />
        <Button
          type="button"
          className="shrink-0 gap-2 self-start shadow-[var(--shadow-md)]"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          Create group
        </Button>
      </div>

      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as MainTab)}
        className="w-full"
      >
        <TabsList
          className={cn(
            "grid h-auto w-full grid-cols-2 gap-1 rounded-[var(--radius)] border border-border bg-secondary p-1 sm:inline-flex sm:w-auto",
          )}
        >
          <TabsTrigger
            value="mine"
            className="gap-2 rounded-[var(--radius-sm)] data-[state=active]:bg-bg data-[state=active]:text-text data-[state=active]:shadow-sm"
          >
            <Users className="size-4 text-primary" />
            My groups
          </TabsTrigger>
          <TabsTrigger
            value="discover"
            className="gap-2 rounded-[var(--radius-sm)] data-[state=active]:bg-bg data-[state=active]:text-text data-[state=active]:shadow-sm"
          >
            <Search className="size-4 text-primary" />
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-6 space-y-5 focus-visible:outline-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Groups you created. Verification is required before loan tools unlock.
            </p>
            <div
              className="inline-flex flex-wrap gap-1 rounded-[var(--radius-sm)] border border-border bg-bg p-1"
              role="group"
              aria-label="Filter my groups"
            >
              {(
                [
                  ["all", "All", mineCounts.all],
                  ["pending", "Pending", mineCounts.pending],
                  ["verified", "Verified", mineCounts.verified],
                ] as const
              ).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMineSeg(key)}
                  className={cn(
                    segmentBtn,
                    mineSeg === key
                      ? "bg-primary text-bg shadow-sm"
                      : "text-text-muted hover:bg-secondary hover:text-text",
                  )}
                >
                  {label}
                  <span className="ml-1.5 tabular-nums opacity-80">({count})</span>
                </button>
              ))}
            </div>
          </div>

          {mineQuery.isLoading ? (
            <ul className="space-y-3">
              {[1, 2].map((i) => (
                <li
                  key={i}
                  className="h-28 animate-pulse rounded-[var(--radius)] border border-border bg-secondary/60"
                />
              ))}
            </ul>
          ) : null}

          {mineQuery.isError ? (
            <ErrorPanel message={mineQuery.error?.message} onRetry={() => mineQuery.refetch()} />
          ) : null}

          {!mineQuery.isLoading &&
          !mineQuery.isError &&
          mineFiltered.length === 0 ? (
            <EmptyPanel
              title="No groups here"
              hint={
                mineSeg === "all"
                  ? "Create a group to get started."
                  : mineSeg === "pending"
                    ? "No groups awaiting verification."
                    : "No verified groups yet."
              }
            />
          ) : null}

          {!mineQuery.isLoading && mineFiltered.length > 0 ? (
            <ul className="space-y-3">
              {mineFiltered.map((g) => (
                <GroupListCard
                  key={g.id}
                  group={g}
                  action={<Badge variant="secondary">You&apos;re admin</Badge>}
                />
              ))}
            </ul>
          ) : null}
        </TabsContent>

        <TabsContent value="discover" className="mt-6 space-y-4 focus-visible:outline-none">
          <p className="text-sm text-text-muted">
            Public groups created by others. Join as a member when there is capacity.
          </p>

          {isLoading ? (
            <ul className="space-y-3">
              {[1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="h-28 animate-pulse rounded-[var(--radius)] border border-border bg-secondary/60"
                />
              ))}
            </ul>
          ) : null}

          {isError ? <ErrorPanel message={error?.message} onRetry={() => refetch()} /> : null}

          {!isLoading && !isError && discoverQuery.data?.length === 0 ? (
            <EmptyPanel
              title="Nothing to discover yet"
              hint="When others publish public groups, they will appear here."
            />
          ) : null}

          {!isLoading && discoverQuery.data && discoverQuery.data.length > 0 ? (
            <ul className="space-y-3">
              {discoverQuery.data.map((g) => {
                const member = isUserMember(g, user?.id, memberships);
                const full = (g.memberCount ?? 0) >= g.maxMembers;
                const joining = joiningId === g.id;

                let action: React.ReactNode;
                if (member) {
                  action = <Badge variant="outline">Member</Badge>;
                } else if (full) {
                  action = <span className="text-xs text-text-muted">Full</span>;
                } else {
                  action = (
                    <Button
                      type="button"
                      size="sm"
                      disabled={joining}
                      onClick={() => void handleJoin(g)}
                    >
                      {joining ? <Loader2 className="size-4 animate-spin" /> : "Join"}
                    </Button>
                  );
                }

                return <GroupListCard key={g.id} group={g} action={action} />;
              })}
            </ul>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="rounded-[var(--radius)] border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-text">
      <p className="font-medium text-destructive">Could not load groups</p>
      {message ? <p className="mt-1 text-text-muted">{message}</p> : null}
      <Button type="button" variant="outline" className="mt-3 border-border" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function EmptyPanel({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-border bg-secondary/50 px-6 py-12 text-center">
      <p className="font-medium text-text">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}
