import { Link } from "react-router";

export default function HomePage() {
  return (
    <section className="text-center">
      <h1 className="text-7xl">Personal Finance Tracker</h1>
      <p className="mb-6">
        Your Personal Finance Tracker, to help you manage your budgets
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/accounts"
          className="inline-flex  min-w-40 max-w-48 items-center justify-center whitespace-nowrap rounded-md bg-(--accent) px-5 py-2.5 font-medium text-white hover:bg-(--accent-border)"
        >
          View Accounts →
        </Link>
        <Link
          to="/link-bank"
          className="inline-flex  min-w-40 max-w-48 items-center justify-center whitespace-nowrap rounded-md bg-(--accent) px-5 py-2.5 font-medium text-white hover:bg-(--accent-border)"
          >
            Link Bank Account →
        </Link>
        <Link
          to="/transactions"
          className="inline-flex  min-w-40 max-w-48 items-center justify-center whitespace-nowrap rounded-md bg-(--accent) px-5 py-2.5 font-medium text-white hover:bg-(--accent-border)"
        >
          View Transactions →
        </Link>
         <Link
          to="/categories"
          className="inline-flex  min-w-40 max-w-48 items-center justify-center whitespace-nowrap rounded-md bg-(--accent) px-5 py-2.5 font-medium text-white hover:bg-(--accent-border)"
        >
          View Categories →
        </Link>
        <Link
          to="/protected"
          className="inline-flex  min-w-40 max-w-48 items-center justify-center whitespace-nowrap rounded-md bg-(--accent) px-5 py-2.5 font-medium text-white hover:bg-(--accent-border)"
        >
          Protected page →
        </Link>
      </div>
    </section>
  );
}
