import { Link } from "react-router";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-page__hero">
        <h1 className="home-page__title">Personal Finance Tracker</h1>
        <p className="home-page__subtitle">
          Your Personal Finance Tracker, to help you manage your budgets
        </p>
      </div>

      <div className="home-page__actions">
        <Link to="/accounts" className="home-cta">
          View Accounts →
        </Link>
        <Link to="/link-bank" className="home-cta home-cta--secondary">
          Link Bank Account →
        </Link>
        <Link to="/transactions" className="home-cta">
          View Transactions →
        </Link>
        <Link to="/categories" className="home-cta home-cta--secondary">
          View Categories →
        </Link>
        {/* <Link to="/protected" className="home-cta home-cta--ghost">
          Protected page →
        </Link> */}
      </div>
    </section>
  );
}
