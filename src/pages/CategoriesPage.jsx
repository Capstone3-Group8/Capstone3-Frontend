import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getCategories, updateCategory, deleteCategory } from "../api/categories";
import { getBudgetAnalysis } from "../api/budgetAnalysis";
import { askFinancialQuestion } from "../api/financialInsights";
// Category rows are created from the Transactions page (via AI suggestion or
// the default list), not here — this page is only for setting budgets and
// reviewing spend against them.
export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState([]);
  const [aiExplanations, setAiExplanations] = useState({});
  const [explainingCategoryId, setExplainingCategoryId] = useState(null);
  // Load the categories once, when the page first appears.
  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    getBudgetAnalysis(1).then(setBudgetAnalysis);
  }, [categories]);

  // Delete on the server, then remove it from the list.
  async function handleDelete(id) {
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleExplainBudget(item) {
    setExplainingCategoryId(item.category_id);
    setError(null);

    try {
      const result = await askFinancialQuestion(
        `Explain my ${item.category_name} budget in simple language. I spent $${Number(
          item.total_spent_for_period,
        ).toFixed(2)} and my allowed budget was $${Number(
          item.total_budget_for_period,
        ).toFixed(2)}. State clearly whether I stayed within or exceeded my budget.`,
        {
          dateRange: { start: "the selected period", end: "today" },
          totalIncome: 0,
          totalExpenses: item.total_spent_for_period,
          currentBalance:
            item.total_budget_for_period - item.total_spent_for_period,
          averageTransaction: item.total_spent_for_period,
          expensesByCategory: [
            { name: item.category_name, amount: item.total_spent_for_period },
          ],
        },
      );

      setAiExplanations((current) => ({
        ...current,
        [item.category_id]: result.answer,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setExplainingCategoryId(null);
    }
  }

  if (loading) {
    return (
      <p className="mx-auto w-full max-w-5xl p-4 text-(--text)">
        Loading categories…
      </p>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-h)">Categories & Budgets</h1>
        <p className="mt-1 text-(--text)">
          Set monthly spending goals for the categories your transactions use
        </p>
      </div>

      {/* Show any error instead of failing silently. */}
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500">
          {error}
        </p>
      )}

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-(--text-h)">Monthly budgets</h2>
        <p className="mt-1 text-sm text-(--text)">
          Update a budget, then click outside the field to save it.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-(--border) p-8 text-center">
          <p className="font-semibold text-(--text-h)">No categories yet</p>
          <p className="mt-1 text-sm text-(--text)">
            Categories show up here once you add a transaction and pick or
            AI-suggest a category for it on the Transactions page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categories.map((cat) => {
            const isIncome = cat.type === "Income";

            return (
              <article
                key={cat.id}
                className="rounded-xl border border-(--border) bg-(--panel) p-5 transition hover:border-(--primary)"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      to={`/categories/${cat.id}`}
                      className="truncate text-lg font-semibold text-(--text-h) hover:text-(--primary)"
                    >
                      {cat.name}
                    </Link>
                    <select
                      aria-label={`Type for ${cat.name}`}
                      value={cat.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        updateCategory(cat.id, { type: newType })
                          .then(() => getCategories())
                          .then(setCategories)
                          .catch((err) => setError(err.message));
                      }}
                      className={`mt-1 rounded border-none bg-transparent text-sm font-medium outline-none ${
                        isIncome ? "text-green-500" : "text-red-400"
                      }`}
                    >
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    className="shrink-0 text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>

                <label
                  htmlFor={`budget-${cat.id}`}
                  className="text-sm text-(--text)"
                >
                  Monthly budget
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text)">
                    $
                  </span>
                  <input
                    id={`budget-${cat.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={cat.budget}
                    onBlur={(e) => {
                      const newBudget = Number(e.target.value);
                      updateCategory(cat.id, { budget: newBudget })
                        .then(() => getCategories())
                        .then(setCategories)
                        .catch((err) => setError(err.message));
                    }}
                    className="w-full rounded-lg border border-(--border) bg-(--bg) py-2 pr-3 pl-7 outline-none focus:border-(--primary)"
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-10 mb-4">
        <h2 className="text-2xl font-bold text-(--text-h)">Budget analysis</h2>
        <p className="mt-1 text-sm text-(--text)">
          Compare your expense-category spending with your planned budgets.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <span>Analyze last</span>
        <select
          onChange={(e) => {
            const months = Number(e.target.value);
            getBudgetAnalysis(months).then(setBudgetAnalysis);
          }}
          className="rounded-md border border-(--border) bg-(--panel) px-3 py-2"
        >
          <option value="1">1 month</option>
          <option value="3">3 months</option>
          <option value="6">6 months</option>
          <option value="12">12 months</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {budgetAnalysis.map((item) => (
          <div
            key={item.category_id}
            className="rounded-xl border border-(--border) bg-(--panel) p-5"
          >
            <p className="font-semibold text-(--text-h)">
              {item.category_name}
            </p>

            <p className="mt-3 text-sm text-(--text)">
              Total Spent: ${item.total_spent_for_period.toFixed(2)}
            </p>

            <p className="text-sm text-(--text)">
              Allowed Budget: ${item.total_budget_for_period.toFixed(2)}
            </p>

            <p
              className={`mt-2 font-semibold ${
                item.stayed_within_budget ? "text-green-400" : "text-red-400"
              }`}
            >
              {item.stayed_within_budget
                ? "Stayed within budget"
                : "Exceeded budget"}
            </p>

            <button
              type="button"
              onClick={() => handleExplainBudget(item)}
              disabled={explainingCategoryId === item.category_id}
              className="mt-3 text-sm text-(--primary) hover:underline disabled:opacity-50"
            >
              {explainingCategoryId === item.category_id
                ? "Asking AI..."
                : "Explain with AI"}
            </button>

            {aiExplanations[item.category_id] && (
              <p className="mt-3 rounded-md bg-(--primary-soft) px-3 py-2 text-sm">
                {aiExplanations[item.category_id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
