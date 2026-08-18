export async function getBudgetSummary() {
  const res = await fetch("/api/budgets/summary", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load budget summary");
  return res.json();
}
