import { useEffect, useState } from "react";
import { getTransactions } from "../api/transactions";
import { getCategories } from "../api/categories";
import AIFinancialInsights from "../components/AIFinancialInsights";
import FinanceAssistant from "../components/FinanceAssistant";

export default function AIInsightsPage({ user }) {
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

    const financialData = {
        dateRange: {
            start: startDate || "all time",
            end: endDate || "today",
        },

        totalIncome,
        totalExpenses,
        currentBalance,
        averageTransaction,

        expensesByCategory: expensesByCategory.map((category) => ({
            name: category.name,
            amount: category.value,
        })),
    };

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">
        AI Insights
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
            className="rounded-md btn-purple px-4 py-2 font-medium text-white sm:col-span-2"
        >
            Clear
        </button>
        </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <AIFinancialInsights
            userId={user?.id}
            financialData={financialData}
            hasTransactions={filteredTransactions.length > 0}
        />

        <FinanceAssistant
            userId={user?.id}
            financialData={financialData}
            hasTransactions={filteredTransactions.length > 0}
        />
        </div>
    </section>
  );
}
