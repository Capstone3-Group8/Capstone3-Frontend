import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../api/accounts";

// This page shows the full CRUD loop against the backend:
// read the list, create a accounts, toggle it done, and delete it.
export default function AccountsPage() {
  const [account, setAccount] = useState({
    name: "",
    type: "",
    balance: "",
    bank_name: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the accounts once, when the page first appears.
  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Create an account on the server, then add the returned row to the list on screen.
  async function handleCreate(e) {
    e.preventDefault(); // stop the browser from reloading on submit
    try {
      const newAccount = await createAccount({
        name: account.name,
        type: account.type,
        balance: account.balance,
        bank_name: account.bank_name,
      });
      setAccounts([newAccount, ...accounts]);
      setAccount({ name: "", type: "", balance: "", bank_name: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete on the server, then remove it from the list.
  async function handleDelete(id) {
    try {
      await deleteAccount(id);
      setAccounts(accounts.filter((a) => a.id !== id));
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) return <p>Loading accounts…</p>;

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">Accounts</h1>

      {/* Show any error instead of failing silently. */}
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500">
          {error}
        </p>
      )}

      {/* Add-an-account form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={account.name}
          onChange={(e) => setAccount({ ...account, name: e.target.value })}
          placeholder="Name"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={account.type}
          onChange={(e) => setAccount({ ...account, type: e.target.value })}
          placeholder="Type"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={account.balance}
          onChange={(e) => setAccount({ ...account, balance: e.target.value })}
          placeholder="Balance"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <input
          value={account.bank_name}
          onChange={(e) =>
            setAccount({ ...account, bank_name: e.target.value })
          }
          placeholder="Bank Name"
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
      {accounts.length === 0 ? (
        <p>No accounts yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex items-center gap-3 rounded-md border border-(--border) px-4 py-3"
            >
              <Link to={`/accounts/${account.id}`} className="flex-1">
                {account.name} — {account.type} — ${account.balance}
              </Link>

              <button
                onClick={() => handleDelete(account.id)}
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
