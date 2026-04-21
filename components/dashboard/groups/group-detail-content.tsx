"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Trash2, UserMinus, UserX } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InviteMemberDialog } from "@/components/dashboard/groups/invite-member-dialog";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useDeleteGroupMutation,
  useGroupMembersQuery,
  useGroupQuery,
  useReactivateGroupMemberMutation,
  useRemoveGroupMemberMutation,
  useSuspendGroupMemberMutation,
  useUpdateGroupMutation,
} from "@/lib/query/groups-queries";
import { ApiError } from "@/lib/query/query-client";
import { ROLE } from "@/types/enum";
import type { GroupMemberRow } from "@/types/group";
import { cn } from "@/utils/cn";

type GroupDetailContentProps = {
  groupId: string;
};

type MemberAction = "remove" | "suspend" | null;

export function GroupDetailContent({ groupId }: GroupDetailContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const groupQuery = useGroupQuery(groupId);
  const membersQuery = useGroupMembersQuery(groupId, groupQuery.isSuccess);
  const updateMutation = useUpdateGroupMutation();
  const deleteMutation = useDeleteGroupMutation();
  const removeMutation = useRemoveGroupMemberMutation();
  const suspendMutation = useSuspendGroupMemberMutation();
  const reactivateMutation = useReactivateGroupMemberMutation();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [memberAction, setMemberAction] = useState<MemberAction>(null);
  const [actionTarget, setActionTarget] = useState<GroupMemberRow | null>(null);
  const [actionReason, setActionReason] = useState("");

  const g = groupQuery.data;
  const isAdmin = g?.isGroupAdmin ?? false;

  const openEdit = () => {
    if (!g) return;
    setEditName(g.name);
    setEditDesc(g.description ?? "");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!g) return;
    try {
      await updateMutation.mutateAsync({
        groupId,
        name: editName.trim(),
        description: editDesc.trim() || null,
      });
      toast.success("Group updated");
      setEditOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? getApiErrorMessage(e) : "Update failed");
    }
  };

  const confirmDeleteGroup = async () => {
    try {
      await deleteMutation.mutateAsync(groupId);
      toast.success("Group deleted");
      router.push("/dashboard/groups");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? getApiErrorMessage(e) : "Could not delete");
    }
  };

  const submitMemberAction = async () => {
    if (!actionTarget || !memberAction) return;
    const reason = actionReason.trim();
    if (reason.length < 3) {
      toast.error("Reason must be at least 3 characters.");
      return;
    }
    try {
      if (memberAction === "remove") {
        await removeMutation.mutateAsync({
          groupId,
          memberUserId: actionTarget.userId,
          reason,
        });
        toast.success("Member removed from the group");
      } else {
        await suspendMutation.mutateAsync({
          groupId,
          memberUserId: actionTarget.userId,
          reason,
        });
        toast.success("Member suspended in this group");
      }
      setMemberAction(null);
      setActionTarget(null);
      setActionReason("");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? getApiErrorMessage(e) : "Action failed");
    }
  };

  const onReactivate = async (m: GroupMemberRow) => {
    try {
      await reactivateMutation.mutateAsync({ groupId, memberUserId: m.userId });
      toast.success("Member reactivated");
    } catch (e) {
      toast.error(e instanceof ApiError || e instanceof Error ? getApiErrorMessage(e) : "Failed");
    }
  };

  if (groupQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-text-muted">
        <Loader2 className="size-5 animate-spin" />
        Loading group…
      </div>
    );
  }

  if (groupQuery.isError) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-secondary px-4 py-8 text-center">
        <p className="font-medium text-text">Could not open this group</p>
        <p className="mt-2 text-sm text-text-muted">
          {groupQuery.error instanceof ApiError && groupQuery.error.status === 403
            ? "You are not a member of this group or your access was suspended."
            : groupQuery.error?.message ?? "Something went wrong."}
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/dashboard/groups">Back to groups</Link>
        </Button>
      </div>
    );
  }

  if (!g) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/groups"
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-text-muted transition hover:text-text"
          >
            <ArrowLeft className="size-4" />
            Groups
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text">{g.name}</h1>
            {g.isVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Pending verification</Badge>
            )}
            {g.isPublic ? (
              <Badge variant="outline" className="border-primary/30 text-primary">
                Public
              </Badge>
            ) : (
              <Badge variant="secondary">Private</Badge>
            )}
            <Badge variant="secondary">Your role: {g.myRole}</Badge>
          </div>
          {g.description ? (
            <p className="mt-2 max-w-2xl text-sm text-text-muted">{g.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-text-muted">
            {g.memberCount ?? 0} / {g.maxMembers} active members · Created{" "}
            {format(parseISO(g.createdAt), "MMM d, yyyy")}
          </p>
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="border-border" onClick={openEdit}>
              Edit group
            </Button>
            <Button type="button" variant="outline" className="border-border" onClick={() => setInviteOpen(true)}>
              Invite member
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete group
            </Button>
          </div>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-text">Members</h2>
        {membersQuery.isLoading ? (
          <p className="text-sm text-text-muted">Loading members…</p>
        ) : membersQuery.isError ? (
          <p className="text-sm text-destructive">{membersQuery.error?.message}</p>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-border bg-secondary/80">
                <tr>
                  <th className="px-4 py-3 font-medium text-text">Name</th>
                  <th className="px-4 py-3 font-medium text-text">Email</th>
                  <th className="px-4 py-3 font-medium text-text">Role</th>
                  <th className="px-4 py-3 font-medium text-text">Status</th>
                  {isAdmin ? <th className="px-4 py-3 font-medium text-text">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {(membersQuery.data ?? []).map((m) => {
                  const isCreator = m.userId === g.createdById;
                  const isSelf = m.userId === user?.id;
                  const canManage =
                    isAdmin && !isCreator && !isSelf && m.role !== ROLE.GROUP_ADMIN;

                  return (
                    <tr key={m.userId} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-text">{m.fullName}</td>
                      <td className="px-4 py-3 text-text-muted">{m.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{m.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            m.membershipStatus === "SUSPENDED" ? "text-destructive" : "text-text-muted",
                          )}
                        >
                          {m.membershipStatus}
                        </span>
                      </td>
                      {isAdmin ? (
                        <td className="px-4 py-3">
                          {canManage ? (
                            <div className="flex flex-wrap gap-1">
                              {m.membershipStatus === "SUSPENDED" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-border"
                                  disabled={reactivateMutation.isPending}
                                  onClick={() => void onReactivate(m)}
                                >
                                  Reactivate
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-border"
                                    onClick={() => {
                                      setActionTarget(m);
                                      setMemberAction("suspend");
                                      setActionReason("");
                                    }}
                                  >
                                    <UserX className="size-3.5" />
                                    Suspend
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-destructive/40 text-destructive"
                                    onClick={() => {
                                      setActionTarget(m);
                                      setMemberAction("remove");
                                      setActionReason("");
                                    }}
                                  >
                                    <UserMinus className="size-3.5" />
                                    Remove
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted">—</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        groupId={groupId}
        groupName={g.name}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-border bg-bg text-text sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="eg-name">Name</Label>
              <Input
                id="eg-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-border bg-secondary-2"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="eg-desc">Description</Label>
              <Textarea
                id="eg-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="min-h-[100px] border-border bg-secondary-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void saveEdit()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-border bg-bg text-text sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this group?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-muted">
            This permanently deletes the group and related data for all members. This cannot be undone.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void confirmDeleteGroup()}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : "Delete group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(memberAction && actionTarget)}
        onOpenChange={(o) => {
          if (!o) {
            setMemberAction(null);
            setActionTarget(null);
            setActionReason("");
          }
        }}
      >
        <DialogContent className="border-border bg-bg text-text sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {memberAction === "remove" ? "Remove member" : "Suspend member in this group"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-muted">
            They will be notified with the reason below. Their platform login is unchanged.
          </p>
          <div className="space-y-1">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Explain why (shown to the member)"
              className="min-h-[100px] border-border bg-secondary-2"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMemberAction(null);
                setActionTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={memberAction === "remove" ? "destructive" : "default"}
              onClick={() => void submitMemberAction()}
              disabled={
                removeMutation.isPending ||
                suspendMutation.isPending ||
                actionReason.trim().length < 3
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
