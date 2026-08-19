const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function getBudgetAnalysis(months) {
  const res = await fetch(`${BASE_URL}/api/budget-analysis/${months}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load budget analysis");
  }

  return res.json();
}
