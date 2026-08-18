export async function getBudgetAnalysis(months) {
  const res = await fetch(`/api/budget-analysis/${months}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load budget analysis");
  }

  return res.json();
}
