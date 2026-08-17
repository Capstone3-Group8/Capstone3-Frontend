import { useEffect, useState } from "react";
import { getFinancialInsights } from "../api/financialInsights";

export default function AIFinancialInsights({
  financialData,
  hasTransactions,
}) {
  const [insights, setInsights] = useState(() => {
  try {
    const savedInsights = sessionStorage.getItem(
      "financialInsights",
    );

    return savedInsights ? JSON.parse(savedInsights) : null;
  } catch {
    return null;
  }
});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  if (insights) {
    sessionStorage.setItem(
      "financialInsights",
      JSON.stringify(insights),
    );
  }
}, [insights]);

  async function handleGenerateInsights() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getFinancialInsights(financialData);
      setInsights(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-(--border) p-5 lg:h-[560px] lg:overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-(--text-h)">
            AI analysis
          </h2>

          <p className="mt-1 text-sm">
            Automated insights from your recent activity
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateInsights}
          disabled={isLoading || !hasTransactions}
          className="rounded-md bg-(--accent) px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Analyzing…" : "Analyze My Spending"}
        </button>
      </div>

      {!hasTransactions && (
        <p className="mt-4 text-sm">
          Add transactions or select a date range containing transactions.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500"
        >
          {error}
        </p>
      )}

      {insights && (
        <div className="mt-6 space-y-5">
          <div>
            <h3 className="font-semibold text-(--text-h)">
              Summary
            </h3>
            <p className="mt-1">{insights.summary}</p>
          </div>

          {insights.trends.length > 0 && (
            <div>
              <h3 className="font-semibold text-(--text-h)">
                Spending Trends
              </h3>

              <ul className="mt-2 list-disc space-y-1 pl-5">
                {insights.trends.map((trend, index) => (
                  <li key={`${trend}-${index}`}>{trend}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold text-(--text-h)">
                Suggestions
              </h3>

              <ul className="mt-2 list-disc space-y-1 pl-5">
                {insights.suggestions.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.warning && (
            <p className="rounded-md bg-yellow-500/10 px-3 py-2 text-sm text-yellow-500">
              {insights.warning}
            </p>
          )}
        </div>
      )}

      <p className="mt-5 text-xs opacity-70">
        AI-generated educational budgeting suggestions. Verify important
        financial decisions independently.
      </p>
    </section>
  );
}