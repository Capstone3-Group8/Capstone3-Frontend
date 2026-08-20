import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactions";
import { getCategories } from "../api/categories";
import CashFlowChart from "../components/CashFlowChart";
import ExpensesByCategoryChart from "../components/ExpensesByCategoryChart";

export default function DashboardPage() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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
      .filter((transaction) => transaction.type.toLowerCase() === "deposit")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const totalExpenses = filteredTransactions
      .filter((transaction) => transaction.type.toLowerCase() === "withdrawal")
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
      .filter((transaction) => transaction.type.toLowerCase() === "withdrawal")
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
        Overview
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
        <div className="rounded-lg border border-(--border) bg-(--panel) p-5">
          <p className="text-sm font-medium !text-(--muted)">Total Income</p>
          <p className="mt-2 text-3xl font-bold !text-green-600">
            ${totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg border border-(--border) bg-(--panel) p-5">
          <p className="text-sm font-medium !text-(--muted)">Total Expenses</p>
          <p className="mt-2 text-3xl font-bold !text-red-500">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg border border-(--border) bg-(--panel) p-5">
          <p className="text-sm font-medium !text-(--muted)">Current Balance</p>
          <p
            className={`mt-2 text-3xl font-bold ${
              currentBalance < 0 ? "!text-red-500" : "!text-(--text-h)"
            }`}
          >
            ${currentBalance.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg border border-(--border) bg-(--panel) p-5">
          <p className="text-sm font-medium !text-(--muted)">
            Average Transaction
          </p>
          <p className="mt-2 text-3xl font-bold !text-(--text-h)">
            ${averageTransaction.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CashFlowChart data={chartData} />
        <ExpensesByCategoryChart data={coloredExpenses} />
      </div>
    </section>
  );
}
