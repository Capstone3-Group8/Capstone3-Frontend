import{ useEffect, useState } from "react";
import{ getTransactions } from "../api/transactions";

export default function DashboardPage() {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        getTransactions()
            .then(setTransactions)
            .catch((err) => setError(err.message));
    }, []);

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">
        Dashboard
      </h1>

      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500">
            {error}
        </p>
       )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-(--border) p-5">
          <p className="text-sm">Total Income</p>
          <p className="mt-2 text-3xl font-semibold text-green-400">
            $0.00
          </p>
        </div>

        <div className="rounded-lg border border-(--border) p-5">
          <p className="text-sm">Total Expenses</p>
          <p className="mt-2 text-3xl font-semibold text-red-400">
            $0.00
          </p>
        </div>

        <div className="rounded-lg border border-(--border) p-5">
          <p className="text-sm">Current Balance</p>
          <p className="mt-2 text-3xl font-semibold text-(--text-h)">
            $0.00
          </p>
        </div>

        <div className="rounded-lg border border-(--border) p-5">
          <p className="text-sm">Average Transaction</p>
          <p className="mt-2 text-3xl font-semibold text-(--text-h)">
            $0.00
          </p>
        </div>
      </div>
    </section>
  );
}