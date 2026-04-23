"use client";

import { UserMinus, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE } from "@/types/enum";
import type { GroupMemberRow } from "@/types/group";
import { cn } from "@/utils/cn";

type MemberAction = "remove" | "suspend";

type MembersTableProps = {
  members: GroupMemberRow[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isAdmin: boolean;
  currentUserId?: string;
  createdById: string;
  reactivatePending: boolean;
  onSuspend: (member: GroupMemberRow) => void;
  onRemove: (member: GroupMemberRow) => void;
  onReactivate: (member: GroupMemberRow) => void;
};

export function MembersTable({
  members,
  isLoading,
  isError,
  errorMessage,
  isAdmin,
  currentUserId,
  createdById,
  reactivatePending,
  onSuspend,
  onRemove,
  onReactivate,
}: MembersTableProps) {
  if (isLoading)
    return <p className="text-sm text-text-muted">Loading members…</p>;
  if (isError)
    return <p className="text-sm text-destructive">{errorMessage}</p>;

  return (
    <div className="overflow-x-auto rounded-(--radius) border border-border">
      <table className="w-full min-w-lg text-left text-sm">
        <thead className="border-b border-border bg-secondary/80">
          <tr>
            <th className="px-4 py-3 font-medium text-text">Name</th>
            <th className="px-4 py-3 font-medium text-text">Email</th>
            <th className="px-4 py-3 font-medium text-text">Role</th>
            <th className="px-4 py-3 font-medium text-text">Status</th>
            {isAdmin ? (
              <th className="px-4 py-3 font-medium text-text">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const isCreator = m.userId === createdById;
            const isSelf = m.userId === currentUserId;
            const canManage =
              isAdmin && !isCreator && !isSelf && m.role !== ROLE.GROUP_ADMIN;

            return (
              <tr
                key={m.userId}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 text-text">{m.fullName}</td>
                <td className="px-4 py-3 text-text-muted">{m.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{m.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      m.membershipStatus === "SUSPENDED"
                        ? "text-destructive"
                        : "text-text-muted",
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
                            disabled={reactivatePending}
                            onClick={() => onReactivate(m)}
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
                              onClick={() => onSuspend(m)}
                            >
                              <UserX className="size-3.5" />
                              Suspend
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 border-destructive/40 text-destructive"
                              onClick={() => onRemove(m)}
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
  );
}
