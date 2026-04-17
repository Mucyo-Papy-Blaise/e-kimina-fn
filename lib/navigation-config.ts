import {
  BarChart3,
  CheckSquare,
  LayoutDashboard,
  Settings,
  Users,
  Users2,
} from "lucide-react";
import { ROLE } from "@/types/enum";
import type { NavigationConfig } from "@/types/navigation";

export const navigationConfig: NavigationConfig = [
  {
    id: "main",
    label: "Main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: [],
      },
      {
        id: "groups",
        label: "Groups",
        href: "/dashboard/groups",
        icon: Users2,
        roles: [ROLE.USER, ROLE.MEMBER, ROLE.GROUP_ADMIN, ROLE.TREASURER],
      },
      {
        id: "applications",
        label: "Applications",
        href: "/dashboard/applications",
        icon: CheckSquare,
        roles: [ROLE.MEMBER, ROLE.GROUP_ADMIN, ROLE.TREASURER],
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        id: "reports",
        label: "Reports",
        href: "/dashboard/financial",
        icon: BarChart3,
        roles: [ROLE.GROUP_ADMIN, ROLE.TREASURER, ROLE.SUPER_ADMIN],
      },
      {
        id: "users",
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
        roles: [ROLE.GROUP_ADMIN, ROLE.SUPER_ADMIN],
      },
      {
        id: "learners",
        label: "Learners",
        href: "/dashboard/learners",
        icon: Users,
        roles: [ROLE.GROUP_ADMIN, ROLE.TREASURER],
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        id: "settings",
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        roles: [],
      },
    ],
  },
];
