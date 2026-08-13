import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getTransaction } from "../api/transactions";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    getTransaction(id)
      .then((data) => isActive && setTransaction(data))
      .catch((err) => isActive && setError(err.message));

    return () => {
      isActive = false;
    };
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!transaction) return <p>Loading...</p>;

  return (
    <section>
      <Link to="/transactions" className="text-sm text-(--accent)">
        ← Back to transactions
      </Link>

      <h1 className="mt-4 text-3xl font-semibold text-(--text-h)">
        Transaction #{transaction.id}
      </h1>

      <div className="mt-4 space-y-2 text-sm">
        <p>Account ID: {transaction.account_id}</p>
        <p>Category ID: {transaction.category_id ?? "N/A"}</p>
        <p>Type: {transaction.type}</p>
        <p>Amount: ${Number(transaction.amount).toFixed(2)}</p>
        <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
        <p>Description: {transaction.description}</p>
      </div>
    </section>
  );
}