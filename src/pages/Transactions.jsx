import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../api/transactions";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transaction, setTransaction] = useState({
    user_id: "",
    account_id: "",
    category_id: "",
    amount: "",
    type: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    if (!transaction.user_id || !transaction.account_id || !transaction.amount || !transaction.type || !transaction.date || !transaction.description) {
      setError("Please fill in all required transaction fields.");
      return;
    }

    try {
      const newTransaction = await createTransaction({
        user_id: transaction.user_id,
        account_id: Number(transaction.account_id),
        category_id: transaction.category_id ? Number(transaction.category_id) : null,
        amount: Number(transaction.amount),
        type: transaction.type,
        date: transaction.date,
        description: transaction.description,
      });

      setTransactions((current) => [newTransaction, ...current]);
      setTransaction({
        user_id: "",
        account_id: "",
        category_id: "",
        amount: "",
        type: "",
        date: "",
        description: "",
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTransaction(id);
      setTransactions((current) => current.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading transactions…</p>;

  return (
      <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">Transactions</h1>

      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500">
          {error}
        </p>
      )}

<<<<<<< HEAD
      {/* Add-an-account form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={transaction.amount}
          onChange={(e) => setTransaction({ ...transaction, name: e.target.value })}
          placeholder="Name"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.type}
          onChange={(e) => setAccount({ ...transaction, type: e.target.value })}
          placeholder="Type"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.date}
          onChange={(e) => setAccount({ ...transaction, date: e.target.value })}
          placeholder="Balance"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.description}
          onChange={(e) =>
            setAccount({ ...transaction, description: e.target.value })
          }
          placeholder="Bank Name"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
=======
      <form onSubmit={handleCreate} className="mb-6 grid gap-3 md:grid-cols-2">
        <input
          value={transaction.user_id}
          onChange={(e) => setTransaction({ ...transaction, user_id: e.target.value })}
          placeholder="User ID"
          className="rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.account_id}
          onChange={(e) => setTransaction({ ...transaction, account_id: e.target.value })}
          placeholder="Account ID"
          className="rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.category_id}
          onChange={(e) => setTransaction({ ...transaction, category_id: e.target.value })}
          placeholder="Category ID"
          className="rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.amount}
          onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
          placeholder="Amount"
          type="number"
          step="0.01"
          className="rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.type}
          onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
          placeholder="Type (deposit or withdrawal)"
          className="rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.date}
          onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
          placeholder="Date"
          type="date"
          className="rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.description}
          onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
          placeholder="Description"
          className="rounded-md border border-(--border) bg-transparent px-3 py-2 md:col-span-2"
>>>>>>> 5fdb433ee5401888632650e1fc1ffbd99a252bfc
        />
        <button
          type="submit"
          className="rounded-md bg-(--accent) px-4 py-2 font-medium text-white md:col-span-2"
        >
          Add Transaction
        </button>
      </form>

<<<<<<< HEAD
      {/* Empty state vs. the list */}
=======
>>>>>>> 5fdb433ee5401888632650e1fc1ffbd99a252bfc
      {transactions.length === 0 ? (
        <p>No transactions yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
<<<<<<< HEAD
          {transactions.map((transaction) => (
=======
          {transactions.map((item) => (
>>>>>>> 5fdb433ee5401888632650e1fc1ffbd99a252bfc
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-(--border) px-4 py-3"
            >
<<<<<<< HEAD
              <Link to={`/transactions/${transaction.id}`} className="flex-1">
                {transaction.amount} — {transaction.type} — ${transaction.date} - {transaction.description}
=======
              <Link to={`/transactions/${item.id}`} className="flex-1">
                {item.description} — {item.type} — ${Number(item.amount).toFixed(2)}
>>>>>>> 5fdb433ee5401888632650e1fc1ffbd99a252bfc
              </Link>

              <button
<<<<<<< HEAD
                onClick={() => handleDelete(account.id)}
=======
                onClick={() => handleDelete(item.id)}
>>>>>>> 5fdb433ee5401888632650e1fc1ffbd99a252bfc
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
