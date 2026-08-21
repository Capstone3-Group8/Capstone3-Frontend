import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getPlaidAccounts, getPlaidTransactions, getSuggestedCategories, syncTransactions } from '../api/plaid';
import { createCategory, getCategories } from '../api/categories';

export default function LinkedAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingCategory, setAddingCategory] = useState(null); // tracks which suggestion is mid-save

  async function loadData() {
    const [accountsData, transactionsData, suggestionsData, categoriesData] = await Promise.all([
      getPlaidAccounts(),
      getPlaidTransactions(),
      getSuggestedCategories(),
      getCategories(),
    ]);
    setAccounts(accountsData);
    setTransactions(transactionsData);
    setSuggestions(suggestionsData.suggestions);
    setCategories(categoriesData);
    if (accountsData.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accountsData[0].account_id);
    }
  }

  useEffect(() => {
    let isActive = true;
    loadData()
      .catch((err) => isActive && setError(err.message))
      .finally(() => isActive && setLoading(false));
    return () => {
      isActive = false;
    };
  }, []);

  async function handleAddCategory(suggestion) {
    setAddingCategory(suggestion.name);
    try {
      await createCategory({
        name: suggestion.name,
        type: suggestion.type,
        budget: suggestion.budget,
      });
      // A new category exists now — re-sync so these transactions get matched to it.
      await syncTransactions();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingCategory(null);
    }
  }

  function getCategoryName(categoryId) {
    const match = categories.find((c) => c.id === categoryId);
    return match ? match.name : null;
  }

  if (loading) return <p>Loading linked accounts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const filteredTransactions = transactions.filter(
    (transaction) => transaction.account_id === selectedAccountId,
  );

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-(--text-h)">
            Linked Bank Accounts
          </h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            Data pulled directly from your linked bank via Plaid.
          </p>
        </div>
        <Link
          to="/link-bank"
          className="inline-block whitespace-nowrap rounded-md bg-(--accent) px-4 py-2 font-medium text-white"
        >
          + Link another account
        </Link>
      </div>

      {suggestions.length > 0 && (
        <div className="mb-8 rounded-lg border border-(--border) p-5">
          <h2 className="mb-3 text-lg font-semibold text-(--text-h)">
            Suggested categories
          </h2>
          <p className="mb-4 text-sm text-(--text-muted)">
            We noticed some transactions that might need a new category.
          </p>
          <ul className="flex flex-col gap-3">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.name}
                className="flex items-center justify-between rounded-md border border-(--border) px-4 py-3"
              >
                <div>
                  <p className="font-medium">{suggestion.name}</p>
                  <p className="text-sm text-(--text-muted)">
                    {suggestion.type} · ~${suggestion.budget}/mo ·{' '}
                    {suggestion.transaction_ids.length} transactions
                  </p>
                </div>
                <button
                  onClick={() => handleAddCategory(suggestion)}
                  disabled={addingCategory === suggestion.name}
                  className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  {addingCategory === suggestion.name ? 'Adding...' : 'Add category'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {accounts.length === 0 ? (
        <p className="text-sm text-(--text-muted)">No linked accounts yet.</p>
      ) : (
        <>
          <label className="mb-2 block text-sm font-medium text-(--text-muted)">
            Select an account
          </label>
          <select
            value={selectedAccountId || ''}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="mb-8 w-full rounded-md border border-(--border) bg-transparent px-3 py-2"
          >
            {accounts.map((account) => (
              <option key={account.account_id} value={account.account_id}>
                {account.name} ({account.subtype}) — ****{account.mask} — $
                {account.current_balance}
              </option>
            ))}
          </select>

          <h2 className="mb-4 text-xl font-semibold text-(--text-h)">
            Transactions
          </h2>
          {filteredTransactions.length === 0 ? (
            <p className="text-sm text-(--text-muted)">
              No transactions for this account.
            </p>
          ) : (
            <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {filteredTransactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-(--border) px-5 py-3"
                >
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-sm text-(--text-muted)">
                      {getCategoryName(transaction.category_id) || transaction.category || 'Uncategorized'}
                      {' · '}
                      {transaction.date}
                    </p>
                  </div>
                  <span className="font-semibold">${transaction.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}