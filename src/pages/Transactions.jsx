import { useEffect, useState } from "react";
import { getTransactions, createTransaction } from "../api/transactions";
import { getAccounts } from "../api/accounts";
import { getCategories } from "../api/categories";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    account_id: "",
    category_id: "",
    amount: "",
    type: "Deposit",
    date: "",
    description: "",
  });

  const [error, setError] = useState("");

  // Load accounts, categories, and transactions
  useEffect(() => {
    async function loadData() {
      try {
        const acc = await getAccounts();
        const cat = await getCategories();
        const tx = await getTransactions();

        setAccounts(acc);
        setCategories(cat);
        setTransactions(tx);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      }
    }

    loadData();
  }, []);

  // Handle form changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Submit new transaction
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const newTx = await createTransaction({
        account_id: Number(form.account_id),
        category_id: Number(form.category_id),
        amount: Number(form.amount),
        type: form.type,
        date: form.date,
        description: form.description,
      });

      setTransactions((currentTransactions) => [
        newTx,
        ...currentTransactions,
      ]);

      
     setForm({
        account_id: "",
        category_id: "",
        amount: "",
        type: "Deposit",
        date: "",
        description: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }
  }

  return (
    <section className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      {error && (
        <p className="text-red-600 font-semibold mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">

        {/* Account Selector */}
        <select
          name="account_id"
          value={form.account_id}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>

        {/* Category Selector */}
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Amount */}
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="border p-2 rounded"
        />

        {/* Type */}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="Deposit">Deposit</option>
          <option value="Withdrawal">Withdrawal</option>
        </select>

        {/* Date */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        {/* Description */}
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          Add Transaction
        </button>
      </form>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <p>No transactions yet. Add one above.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => (
            <li key={tx.id} className="border p-3 rounded">
              <p><strong>{tx.type}</strong> — ${tx.amount}</p>
              <p>{tx.description}</p>
              <p>{new Date(tx.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
