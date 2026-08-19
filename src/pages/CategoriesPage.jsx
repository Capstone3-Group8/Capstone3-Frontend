import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";

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

  // Load the categories once, when the page first appears.
  useEffect(() => {
    getCategories()
      .then(setCategories)
      setLoading(false);
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
      <h1 className="mb-6 text-3xl font-semibold text-(--text-h)">Categories</h1>

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

    </section>
  );
}
