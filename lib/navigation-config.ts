import {
  BarChart3,
  ArrowLeftRight  ,
  LayoutDashboard,
  Settings,
  Users,
  Users2,
  HandCoins, 
  TrendingUp
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
        id: "transactions",
        label: "Transactions",
        href: "/dashboard/transactions",
        icon: ArrowLeftRight,
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
        roles: [ROLE.GROUP_ADMIN, ROLE.TREASURER],
      },
      {
        id: "loans",
        label: "Loans",
        href: "/dashboard/loans",
        icon: HandCoins ,
        roles: [ROLE.MEMBER, ROLE.GROUP_ADMIN, ROLE.TREASURER],
      },
      {
        id: "loans-management",
        label: "Loans Management",
        href: "/dashboard/loans-management",
        icon: TrendingUp,
        roles: [ROLE.GROUP_ADMIN, ROLE.TREASURER],
      },
      {
        id: "users",
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
        roles: [ROLE.SUPER_ADMIN],
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
