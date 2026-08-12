import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/tasks";

// This page shows the full CRUD loop against the backend:
// read the list, create a task, toggle it done, and delete it.
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [transaction, settransaction] = useState({
    account_id: "",
    category_id: "",
    amount: "",
    type: "",
    date: "",
    description: "",
  }); // controlled input for the new-task form

  // Load the tasks once, when the page first appears.
  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Create a task on the server, then add the returned row to the list on screen.
  async function handleCreate(e) {
    e.preventDefault(); // stop the browser from reloading on submit
     if (!title.trim()) return;

    try {
      const newTransaction = await createTransaction({
        Account_id: transaction.account_id,
        Category_id: transaction.category_id,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        description: transaction.description,
      });
      setTransactions([newTransaction, ...transactions]);
      setTitle('');
      setTransaction({
        Account_id: "",
        Category_id: "",
        amount: "",
        type: "",
        date: "",
        description: "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete on the server, then remove it from the list.
  async function handleDelete(id) {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading transactions…</p>;

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">Transactions</h1>

      {/* Show any error instead of failing silently. */}
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500">
          {error}
        </p>
      )}

      {/* Add-a-transaction form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='New task title…'
          className='flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2'
        />
        <input
          value={transaction.account_id}
          onChange={(e) => setTransaction({ ...transaction, account_id: e.target.value })}
          placeholder="Account Id#"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.category_id}
          onChange={(e) => setAccount({ ...transaction, category_id: e.target.value })}
          placeholder="Category_id"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.type}
          onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
          placeholder="Type"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.date}
          onChange={(e) =>
            setAccount({ ...transaction, date: e.target.value })
          }
          placeholder="Date"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={transaction.description}
          onChange={(e) =>
            setAccount({ ...transaction, description: e.target.value })
          }
          placeholder="Description"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-(--accent) px-4 py-2 font-medium text-white"
        >
          Add
        </button>
      </form>

      {/* Empty state vs. the list */}
      {tasks.length === 0 ? (
        <p>No tasks yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center gap-3 rounded-md border border-(--border) px-4 py-3"
            >
              {/* Click the title to open the detail page for that transaction. */}
              <Link
                to={`/transactions/${transaction.id}`}
                className="flex-1 line-through opacity-60" 
              >
                {transaction.title}
              </Link>
              <button
                onClick={() => handleDelete(transaction.id)}
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
