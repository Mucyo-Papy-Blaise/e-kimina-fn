export const userFinanceKeys = {
  all: ["user-finance"] as const,
  userLoans: () => ["user-finance", "loans"] as const,
  summary: () => [...userFinanceKeys.all, "summary"] as const,
  history: (page: number, pageSize: number) =>
    [...userFinanceKeys.all, "history", page, pageSize] as const,
  upcoming: () => [...userFinanceKeys.all, "upcoming"] as const,
};
