"use client";

import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import type { Group } from "@/types/group";
import type { ReactNode } from "react";

type GroupListCardProps = {
  group: Group;
  /** Right column: join button, badges, etc. */
  action?: ReactNode;
  className?: string;
};

export function GroupListCard({ group: g, action, className }: GroupListCardProps) {
  return (
    <li
      className={cn(
        "rounded-[var(--radius)] border border-border bg-secondary p-4 shadow-[var(--shadow-md)] transition-shadow duration-[var(--transition)] hover:shadow-md",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-text">{g.name}</h3>
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
          </div>
          {g.description ? (
            <p className="mt-1 line-clamp-3 text-sm text-text-muted">{g.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-text-muted">
            {g.memberCount ?? 0} / {g.maxMembers} members · Created{" "}
            {format(parseISO(g.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        {action ? (
          <div className="flex shrink-0 flex-col items-end justify-start gap-2">{action}</div>
        ) : null}
      </div>
    </li>
  );
}
