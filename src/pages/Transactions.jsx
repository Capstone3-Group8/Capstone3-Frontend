import { useEffect, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../api/transactions";
import { createAccount, deleteAccount, getAccounts } from "../api/accounts";
import { getCategories } from "../api/categories";
import { categorizeTransactions } from "../api/financialInsights";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCategorizing, setIsCategorizing] = useState(false);

  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "",
    balance: "",
    bank_name: "",
  });

  const [form, setForm] = useState({
    account_id: "",
    category_id: "",
    amount: "",
    type: "withdrawal",
    date: "",
    description: "",
  });

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function getCategoryName(categoryId) {
    const category = categories.find(
      (cat) => Number(cat.id) === Number(categoryId),
    );

    return category?.name || "Uncategorized";
  }

  function getAccountName(accountId) {
    const account = accounts.find(
      (item) => Number(item.id) === Number(accountId),
    );

    return account?.name || "Unknown account";
  }

  async function handleCreateAccount(e) {
    e.preventDefault();
    setError("");

    try {
      const newAccount = await createAccount({
        name: accountForm.name,
        type: accountForm.type,
        balance: Number(accountForm.balance),
        bank_name: accountForm.bank_name,
      });

      setAccounts((currentAccounts) => [newAccount, ...currentAccounts]);
      setAccountForm({
        name: "",
        type: "",
        balance: "",
        bank_name: "",
      });
      setIsAccountModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not create account");
    }
  }

  async function handleDeleteAccount(accountId) {
    try {
      setError("");
      await deleteAccount(accountId);
      setAccounts((currentAccounts) =>
        currentAccounts.filter((account) => account.id !== accountId),
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not delete account");
    }
  }

  async function handleDeleteTransaction(transactionId) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!shouldDelete) return;

    try {
      setError("");
      await deleteTransaction(transactionId);
      setTransactions((currentTransactions) =>
        currentTransactions.filter(
          (transaction) => transaction.id !== transactionId,
        ),
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not delete transaction");
    }
  }

  async function handleAutoCategorize() {
    if (transactions.length === 0 || categories.length === 0) return;

    setIsCategorizing(true);
    setError("");

    try {
      const result = await categorizeTransactions(
        transactions.map((transaction) => ({
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
        })),
        categories.map((category) => ({
          name: category.name,
          type: category.type,
        })),
      );

      const categoryByName = new Map(
        categories.map((category) => [category.name.toLowerCase(), category]),
      );

      const updates = result.data
        .map((transaction) => ({
          transaction,
          category: transaction.categoryName
            ? categoryByName.get(transaction.categoryName.toLowerCase())
            : null,
        }))
        .filter(({ category }) => category)
        .map(({ transaction, category }) =>
          updateTransaction(transaction.id, { category_id: category.id }),
        );

      await Promise.all(updates);
      setTransactions(await getTransactions());
    } catch (err) {
      setError(err.message || "Could not categorize transactions");
    } finally {
      setIsCategorizing(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const newTransaction = await createTransaction({
        account_id: Number(form.account_id),
        category_id: Number(form.category_id),
        amount: Number(form.amount),
        type: form.type,
        date: form.date,
        description: form.description,
      });

      setTransactions((currentTransactions) => [
        newTransaction,
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

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredTransactions = transactions.filter((transaction) => {
    if (!normalizedSearchTerm) return true;

    const searchableValues = [
      transaction.description,
      transaction.type,
      transaction.amount,
      getCategoryName(transaction.category_id),
      getAccountName(transaction.account_id),
    ];

    return searchableValues.some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(normalizedSearchTerm),
    );
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const groupedTransactions = sortedTransactions.reduce(
    (groups, transaction) => {
      const dateKey = String(transaction.date).split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(transaction);
      return groups;
    },
    {},
  );

  function isLiabilityAccount(account) {
    const accountLabel = `${account.name || ""} ${account.type || ""}`.toLowerCase();
    const liabilityWords = ["credit", "loan", "debt", "mortgage"];

    return liabilityWords.some((word) => accountLabel.includes(word));
  }

  function getCurrentAccountBalance(account) {
    const startingBalance = Math.abs(Number(account.balance || 0));
    const isLiability = isLiabilityAccount(account);

    return transactions.reduce((balance, transaction) => {
      if (Number(transaction.account_id) !== Number(account.id)) {
        return balance;
      }

      const amount = Math.abs(Number(transaction.amount || 0));
      const isDeposit = transaction.type?.toLowerCase() === "deposit";

      if (isLiability) {
        return isDeposit ? balance - amount : balance + amount;
      }

      return isDeposit ? balance + amount : balance - amount;
    }, startingBalance);
  }

  const totalAssets = accounts.reduce(
    (total, account) =>
      isLiabilityAccount(account)
        ? total
        : total + getCurrentAccountBalance(account),
    0,
  );

  const totalDebt = accounts.reduce(
    (total, account) =>
      isLiabilityAccount(account)
        ? total + Math.max(0, getCurrentAccountBalance(account))
        : total,
    0,
  );

  const netWorth = totalAssets - totalDebt;

  return (
    <section className="mx-auto w-full max-w-5xl p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Accounts & Transactions</h1>
        <p className="mt-1 text-(--text)">
          Manage your accounts, income, and expenses in one place
        </p>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Accounts</h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <p className="font-semibold !text-(--text-h)">
                Net worth: ${netWorth.toFixed(2)}
              </p>
              <p className="font-medium !text-green-600">
                Assets: ${totalAssets.toFixed(2)}
              </p>
              <p className="font-medium !text-red-500">
                Owed: ${totalDebt.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAccountModalOpen(true)}
            className="primary-btn shrink-0"
          >
            + Add account
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-xl border border-(--border) bg-(--panel) p-6 text-center">
            <p className="font-semibold text-(--text-h)">No accounts yet</p>
            <p className="mt-1 text-sm">Add an account before recording transactions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {accounts.map((account) => (
              <article
                key={account.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-(--border) bg-(--panel) p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold !text-(--text-h)">
                    {account.name}
                  </p>
                  <p className="text-sm capitalize !text-(--muted)">
                    {[account.bank_name, account.type].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-2 text-xl font-bold !text-(--text-h)">
                    ${getCurrentAccountBalance(account).toFixed(2)}
                  </p>
                  <p className="text-xs !text-(--muted)">
                    {isLiabilityAccount(account) ? "Amount owed" : "Current balance"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAccount(account.id)}
                  className="shrink-0 text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="mt-1 text-(--text)">
            Every income and expense in one place
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="primary-btn shrink-0"
        >
          + Add transaction
        </button>

        <button
          type="button"
          onClick={handleAutoCategorize}
          disabled={isCategorizing || transactions.length === 0}
          className="primary-btn shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCategorizing ? "Categorizing..." : "Auto-categorize"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 p-3 font-semibold text-red-500">
          {error}
        </p>
      )}

      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-xl border border-(--border) bg-(--bg) p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Add an account</h2>
                <p className="mt-1 text-(--text)">
                  Create an account for your transactions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="text-2xl text-(--text) hover:text-(--text-h)"
                aria-label="Close account form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="flex flex-col gap-3">
              <input
                value={accountForm.name}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, name: e.target.value })
                }
                placeholder="Account name"
                className="rounded border border-(--border) bg-(--bg) p-2"
                required
              />

              <select
                value={accountForm.type}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, type: e.target.value })
                }
                className="rounded border border-(--border) bg-(--bg) p-2"
                required
              >
                <option value="">Account type</option>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="cash">Cash</option>
                <option value="investment">Investment</option>
                <option value="credit">Credit card</option>
                <option value="loan">Loan</option>
              </select>

              <input
                type="number"
                step="0.01"
                value={accountForm.balance}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, balance: e.target.value })
                }
                placeholder="Starting balance"
                className="rounded border border-(--border) bg-(--bg) p-2"
                required
              />

              <input
                value={accountForm.bank_name}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, bank_name: e.target.value })
                }
                placeholder="Bank name (optional)"
                className="rounded border border-(--border) bg-(--bg) p-2"
              />

              <button
                type="submit"
                className="primary-btn"
              >
                Add Account
              </button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-xl border border-(--border) bg-(--bg) p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Add a transaction</h2>
                <p className="mt-1 text-(--text)">
                  Record income or an expense.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-2xl text-(--text) hover:text-(--text-h)"
                aria-label="Close transaction form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select
                name="account_id"
                value={form.account_id}
                onChange={handleChange}
                className="rounded border border-(--border) bg-(--bg) p-2"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="rounded border border-(--border) bg-(--bg) p-2"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Amount"
                min="0.01"
                step="0.01"
                className="rounded border border-(--border) bg-(--bg) p-2"
                required
              />

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="rounded border border-(--border) bg-(--bg) p-2"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="rounded border border-(--border) bg-(--bg) p-2"
                required
              />

              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="rounded border border-(--border) bg-(--bg) p-2"
              />

              <button
                type="submit"
                className="primary-btn"
              >
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mb-4">
          <label htmlFor="transaction-search" className="sr-only">
            Search transactions
          </label>
          <input
            id="transaction-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search category, account, amount, type, or note..."
            className="w-full rounded-xl border border-(--border) bg-(--panel) px-4 py-3 text-(--text-h) outline-none transition focus:border-(--primary)"
          />
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-(--border) bg-(--panel) p-8 text-center">
          <p className="font-semibold text-(--text-h)">No transactions yet</p>
          <p className="mt-1 text-sm">Add your first transaction to get started.</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="rounded-xl border border-(--border) bg-(--panel) p-8 text-center">
          <p className="font-semibold text-(--text-h)">No matching transactions</p>
          <p className="mt-1 text-sm text-(--text)">
            Try a different category, account, amount, type, or note.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-(--border) bg-(--panel)">
          {Object.entries(groupedTransactions).map(([date, dateTransactions]) => {
            const dailyTotal = dateTransactions.reduce((total, tx) => {
              const amount = Number(tx.amount);
              return tx.type?.toLowerCase() === "deposit"
                ? total + amount
                : total - amount;
            }, 0);

            return (
              <div key={date}>
                <div className="flex items-center justify-between bg-(--code-bg) px-4 py-2 text-sm font-semibold">
                  <span>
                    {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className={dailyTotal >= 0 ? "text-green-500" : "text-red-400"}>
                    {dailyTotal >= 0 ? "+" : "−"}${Math.abs(dailyTotal).toFixed(2)}
                  </span>
                </div>

                <ul className="divide-y divide-(--border)">
                  {dateTransactions.map((tx) => {
                    const isDeposit = tx.type?.toLowerCase() === "deposit";

                    return (
                      <li
                        key={tx.id}
                        className="flex items-center justify-between gap-4 px-4 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                              isDeposit
                                ? "bg-green-500/15 text-green-500"
                                : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {isDeposit ? "+" : "−"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold !text-(--text-h)">
                              {tx.description || tx.type}
                            </p>
                            <p className="text-sm !text-(--muted)">
                              {getCategoryName(tx.category_id)} ·{" "}
                              {getAccountName(tx.account_id)}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-4">
                          <p
                            className={`font-semibold ${
                              isDeposit ? "!text-green-600" : "!text-red-500"
                            }`}
                          >
                            {isDeposit ? "+" : "−"}$
                            {Math.abs(Number(tx.amount)).toFixed(2)}
                          </p>

                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-(--muted) hover:bg-red-500/10 hover:text-red-500"
                            aria-label={`Delete ${tx.description || "transaction"}`}
                            title="Delete transaction"
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v5M14 11v5" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
