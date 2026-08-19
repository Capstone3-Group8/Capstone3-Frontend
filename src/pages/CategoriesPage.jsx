import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";
import { getBudgetAnalysis } from "../api/budgetAnalysis";
// This page shows the full CRUD loop against the backend:
// read the list, create a category, and delete it.
export default function CategoryPage() {
  const [category, setCategory] = useState({
    name: "",
    type: "",
    budget: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState([]);
  // Load the categories once, when the page first appears.
  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    getBudgetAnalysis(12).then(setBudgetAnalysis);
  }, []);

  // Create a category on the server, then add the returned row to the list on screen.
  async function handleCreate(e) {
    e.preventDefault(); // stop the browser from reloading on submit
    try {
      const newCategory = await createCategory({
        name: category.name,
        type: category.type,
        budget: category.budget,
      });
      setCategories([newCategory, ...categories]);
      setCategory({ name: "", type: "", budget: "" });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete on the server, then remove it from the list.
  async function handleDelete(id) {
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) return <p>Loading categories…</p>;

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">
        Categories
      </h1>

      {/* Show any error instead of failing silently. */}
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-red-500">
          {error}
        </p>
      )}

      {/* Add-an-account form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={category.name}
          onChange={(e) => setCategory({ ...category, name: e.target.value })}
          placeholder="Name"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <select
          value={category.type}
          onChange={(e) => setCategory({ ...category, type: e.target.value })}
          className="flex-1 rounded-md border border-(--border) bg-(--bg) px-3 py-2"
        >
          <option value="">Select type</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <input
          value={category.budget}
          onChange={(e) => setCategory({ ...category, budget: e.target.value })}
          placeholder="Budget"
          className="flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md btn-purple px-4 py-2 font-medium text-white"
        >
          Add
        </button>
      </form>

      {/* Empty state vs. the list */}
      {categories.length === 0 ? (
        <p>No categories yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-3 rounded-md border border-(--border) px-4 py-3"
            >
              <Link to={`/categories/${category.id}`} className="flex-1">
                {category.name} — {category.type} — ${category.budget}
              </Link>

              <button
                onClick={() => handleDelete(category.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-10 mb-4 text-2xl font-semibold">
        Set Category Budgets
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-lg border border-(--border) p-5">
            <p className="text-sm">{cat.name}</p>

            <input
              type="number"
              placeholder="Enter monthly budget"
              defaultValue={cat.budget}
              onBlur={(e) => {
                const newBudget = Number(e.target.value);
                updateCategory(cat.id, { budget: newBudget })
                  .then(() => {
                    getCategories().then(setCategories);
                  })
                  .catch(console.error);
              }}
              className="mt-2 w-full rounded-md border border-(--border) bg-transparent px-3 py-2"
            />
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-semibold">Budget Analysis</h2>

      <div className="flex items-center gap-4 mb-4">
        <span>Analyze last</span>
        <select
          onChange={(e) => {
            const months = Number(e.target.value);
            getBudgetAnalysis(months).then(setBudgetAnalysis);
          }}
          className="rounded-md border border-(--border) bg-transparent px-3 py-2"
        >
          <option value="1">1 month</option>
          <option value="3">3 months</option>
          <option value="6">6 months</option>
          <option value="12">12 months</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {budgetAnalysis.map((item) => (
          <div
            key={item.category_id}
            className="rounded-lg border border-(--border) p-5"
          >
            <p className="text-sm">{item.category_name}</p>

            <p className="mt-2">
              Total Spent: ${item.total_spent_for_period.toFixed(2)}
            </p>

            <p>Allowed Budget: ${item.total_budget_for_period.toFixed(2)}</p>

            <p
              className={`mt-2 font-semibold ${
                item.stayed_within_budget ? "text-green-400" : "text-red-400"
              }`}
            >
              {item.stayed_within_budget
                ? "Stayed within budget"
                : "Exceeded budget"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
