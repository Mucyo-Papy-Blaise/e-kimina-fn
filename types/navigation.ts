import type { LucideIcon } from "lucide-react";
import type { Role } from "./enum";

/** Single nav entry; `roles: []` means any authenticated user. */
export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  /** If empty, visible to all authenticated users. */
  readonly roles: readonly Role[];
  readonly badgeCount?: number;
  readonly children?: readonly NavItem[];
}

export interface NavSection {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavItem[];
}

export type NavigationConfig = readonly NavSection[];
