import { Link } from "react-router";

export default function HomePage() {
  return (
    <section className="text-center">
      <h1 className="text-7xl">Personal Finance Tracker</h1>
      <p className="mb-6">
        Your Personal Finance Tracker, to help you manage your budgets
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/accounts"
          className="inline-block rounded-md bg-(--accent) px-5 py-2.5 font-medium text-white hover:bg-(--accent-border)"
        >
          View Accounts →
        </Link>
        <Link
          to="/transactions"
          className="inline-block rounded-md bg-(--accent) px-5 py-2.5 font-medium text-white hover:bg-(--accent-border)"
        >
          View Transactions →
        </Link>
        <Link
          to="/protected"
          className="inline-block rounded-md border border-(--border) px-5 py-2.5 font-medium hover:text-(--text-h)"
        >
          Protected page →
        </Link>
      </div>
    </section>
  );
}
