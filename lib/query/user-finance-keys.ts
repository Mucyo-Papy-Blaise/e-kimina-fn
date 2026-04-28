export const userFinanceKeys = {
  all: ["user-finance"] as const,
  /** In-app user notifications (server); optional audience/group filters in query hash */
  userNotifications: (filters?: { audience?: string; groupId?: string }) =>
    [
      "user-finance",
      "notifications",
      filters?.audience ?? "all",
      filters?.groupId ?? "all",
    ] as const,
  userNotificationUnread: (filters?: { audience?: string; groupId?: string }) =>
    [
      "user-finance",
      "notifications",
      "unread",
      filters?.audience ?? "all",
      filters?.groupId ?? "all",
    ] as const,
  userLoans: () => ["user-finance", "loans"] as const,
  summary: () => [...userFinanceKeys.all, "summary"] as const,
  history: (page: number, pageSize: number) =>
    [...userFinanceKeys.all, "history", page, pageSize] as const,
  upcoming: () => [...userFinanceKeys.all, "upcoming"] as const,
};
