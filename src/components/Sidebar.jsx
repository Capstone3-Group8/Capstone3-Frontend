import { NavLink } from 'react-router';

// NavLink is like an <a> tag but for client-side routing: it navigates without
// a full page reload, and it tells us when its route is active so we can style it.
//
// Sidebar takes `user` and `onLogout` as props from App. It doesn't fetch
// anything or know how you logged in — it just renders what it's handed. A
// component this simple is easy to reason about and easy to reuse.
export default function Sidebar({ user, onLogout }) {
  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive
        ? 'bg-(--primary-soft) !text-(--primary)'
        : 'hover:bg-(--primary-soft) hover:text-(--text-h)'
    }`;

  const authLinkClass = ({ isActive }) =>
    `block w-full rounded-md px-3 py-2 text-center text-sm font-medium ${
      isActive
        ? 'bg-(--primary-soft) !text-(--primary) ring-1 ring-(--primary)'
        : 'hover:bg-(--primary-soft) hover:text-(--text-h)'
    }`;

  return (
    <aside className='flex h-screen w-56 shrink-0 flex-col border-r border-(--border) px-3 py-4'>
      <NavLink
        to='/'
        end
        className='mb-4 px-3 text-lg font-semibold text-(--text-h)'
      >
        Home
      </NavLink>

      <nav className='flex flex-1 flex-col gap-1'>
        <NavLink to="/dashboard" className={linkClass}>
          Overview
        </NavLink>
        <NavLink to='/transactions' className={linkClass}>
          Accounts & Transactions
        </NavLink>
        <NavLink to='/categories' className={linkClass}>
          Categories
        </NavLink>
        <NavLink to='/ai-insights' className={linkClass}>
          AI Insights
        </NavLink>
        <NavLink to='/linked-accounts' className={linkClass}>
          Linked Accounts
        </NavLink>
        {/* Only show the protected link once someone is logged in. */}
        {/* {user && (
          <NavLink to='/protected' className={linkClass}>
            Protected
          </NavLink>
        )} */}
      </nav>

      {/* Auth controls: your name + Log out, or the Log in / Sign up pair. */}
      <div className='flex flex-col gap-1 border-t border-(--border) pt-3'>
        {user ? (
          <>
            <span className='truncate px-3 text-sm'>
              {/* Our own users always have a username; Auth0 users may also
                  have a name or email worth falling back to. */}
              {user.username || user.name || user.email}
            </span>
            <button
              onClick={onLogout}
              className='rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-(--primary-soft) hover:text-(--text-h)'
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to='/login' className={authLinkClass}>
              Log in
            </NavLink>
            <NavLink
              to='/signup'
              className='block w-full rounded-md bg-(--primary) px-3 py-2 text-center text-sm font-semibold !text-white hover:opacity-90'
            >
              Sign up
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
}
