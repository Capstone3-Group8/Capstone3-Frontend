import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactions";
import { getCategories } from "../api/categories";
import CashFlowChart from "../components/CashFlowChart";
import ExpensesByCategoryChart from "../components/ExpensesByCategoryChart";
import { getBudgetAnalysis } from "../api/budgetAnalysis";

export default function DashboardPage() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budgetAnalysis, setBudgetAnalysis] = useState([]);

    useEffect(() => {
        Promise.all([getTransactions(), getCategories()])
            .then(([transactionData, categoryData]) => {
              setTransactions(transactionData);
              setCategories(categoryData);
            })
            .catch((err) => setError(err.message));
    }, []);

    const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    const isAfterStart =
        !startDate || transactionDate >= new Date(`${startDate}T00:00:00`);

    const isBeforeEnd =
        !endDate || transactionDate <= new Date(`${endDate}T23:59:59`);

    return isAfterStart && isBeforeEnd;
    });

    const totalIncome = filteredTransactions
        .filter((transaction) => transaction.type === "deposit")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const totalExpenses = filteredTransactions
        .filter((transaction) => transaction.type === "withdrawal")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const currentBalance = totalIncome - totalExpenses;

    const averageTransaction =
        filteredTransactions.length > 0
            ? (totalIncome + totalExpenses) / filteredTransactions.length
            : 0;

    const chartData = [
      {
        name: "Income",
        amount: totalIncome,
        fill: "#4ade80",
      },
      {
        name: "Expenses",
        amount: totalExpenses,
        fill: "#f87171",
      },
    ];

    const categoryNames = new Map(
        categories.map((category) => [category.id, category.name]),
    );

    const expensesByCategory = filteredTransactions
        .filter((transaction) => transaction.type === "withdrawal")
        .reduce((result, transaction) => {
            const categoryName =
            categoryNames.get(transaction.category_id) || "Uncategorized";

            const existingCategory = result.find(
            (item) => item.name === categoryName,
            );

            if (existingCategory) {
            existingCategory.value += Number(transaction.amount);
            } else {
            result.push({
                name: categoryName,
                value: Number(transaction.amount),
            });
            }

            return result;
    }, []);

    const categoryColors = [
    "#c084fc",
    "#f87171",
    "#60a5fa",
    "#fbbf24",
    "#4ade80",
    ];

    const coloredExpenses = expensesByCategory.map((item, index) => ({
        ...item,
        fill: categoryColors[index % categoryColors.length],
    }));

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">
        Reports
      </h1>

      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500">
            {error}
        </p>
       )}

       <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
            <span>From</span>
            <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-(--border) bg-transparent px-3 py-2"
            />
        </label>

        <label className="flex items-center gap-2">
            <span>To</span>
            <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-(--border) bg-transparent px-3 py-2"
            />
        </label>

        <button
            type="button"
            onClick={() => {
            setStartDate("");
            setEndDate("");
            }}
            className="rounded-md border border-(--border) px-3 py-2"
        >
            Clear
        </button>
        </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-(--border) p-5">
          <p className="text-sm">Total Income</p>
          <p className="mt-2 text-3xl font-semibold text-green-400">
            ${totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg border border-(--border) p-5">
          <p className="text-sm">Total Expenses</p>
          <p className="mt-2 text-3xl font-semibold text-red-400">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg border border-(--border) p-5">
          <p className="text-sm">Current Balance</p>
          <p className="mt-2 text-3xl font-semibold text-(--text-h)">
            ${currentBalance.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg border border-(--border) p-5">
          <p className="text-sm">Average Transaction</p>
          <p className="mt-2 text-3xl font-semibold text-(--text-h)">
            ${averageTransaction.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CashFlowChart data={chartData} />
        <ExpensesByCategoryChart data={coloredExpenses} />
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-semibold">Set Category Budgets</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-lg border border-(--border) p-5"
          >
            <p className="text-sm">{cat.name}</p>

            <input
              type="number"
              placeholder="Enter monthly budget"
              defaultValue={cat.budget}
              onBlur={(e) => {
                const newBudget = Number(e.target.value);

                fetch(`/api/categories/${cat.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ budget: newBudget }),
                })
                  .then(() => {
                    getCategories().then(setCategories);
                  })
                  .catch(console.error);
              }}
              className="mt-2 w-full rounded-md border border-(--border) bg-transparent px-3 py-2"
            />
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-semibold">Budget Analysis</h2>

      <div className="flex items-center gap-4 mb-4">
        <span>Analyze last</span>
        <select
          onChange={(e) => {
            const months = Number(e.target.value);
            getBudgetAnalysis(months).then(setBudgetAnalysis);
          }}
          className="rounded-md border border-(--border) bg-transparent px-3 py-2"
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
            className="rounded-lg border border-(--border) p-5"
          >
            <p className="text-sm">{item.category_name}</p>

            <p className="mt-2">
              Total Spent: ${item.total_spent_for_period.toFixed(2)}
            </p>

            <p>
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
          </div>
        ))}
      </div>

    </section>
  );
}
