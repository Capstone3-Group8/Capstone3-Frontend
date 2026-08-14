const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function getFinancialInsights(financialData) {
  const response = await fetch(
    `${BASE_URL}/api/financial-insights`,
    {
      method: "POST",
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(financialData),
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));

    throw new Error(
      body.error ||
        `Could not generate financial insights (${response.status})`,
    );
  }

  return response.json();
}