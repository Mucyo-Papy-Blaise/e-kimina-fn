import type { UserResponse } from "@/types/auth";
import { ROLE, type Role } from "@/types/enum";
import type { NavItem, NavSection, NavigationConfig } from "@/types/navigation";

export function collectEffectiveRoles(user: UserResponse): ReadonlySet<Role> {
  const set = new Set<Role>();
  set.add(user.platformRole);
  for (const m of user.groupMemberships) {
    set.add(m.role);
  }
  return set;
}

function isPlatformSuperAdmin(user: UserResponse): boolean {
  return user.platformRole === ROLE.SUPER_ADMIN;
}

function navItemVisible(
  item: NavItem,
  effective: ReadonlySet<Role>,
  user: UserResponse,
): boolean {
  if (isPlatformSuperAdmin(user)) {
    return true;
  }
  if (item.roles.length === 0) {
    return true;
  }
  return item.roles.some((r) => effective.has(r));
}

function filterNavItem(
  item: NavItem,
  effective: ReadonlySet<Role>,
  user: UserResponse,
): NavItem | null {
  if (!navItemVisible(item, effective, user)) {
    return null;
  }
  const children = item.children;
  if (children === undefined || children.length === 0) {
    return item;
  }
  const filteredChildren = children
    .map((c) => filterNavItem(c, effective, user))
    .filter((c): c is NavItem => c !== null);
  if (filteredChildren.length === 0) {
    return null;
  }
  return { ...item, children: filteredChildren };
}

export function filterNavigationByAccess(
  config: NavigationConfig,
  user: UserResponse,
): readonly NavSection[] {
  const effective = collectEffectiveRoles(user);
  return config
    .map((section) => {
      const items = section.items
        .map((item) => filterNavItem(item, effective, user))
        .filter((item): item is NavItem => item !== null);
      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
}
