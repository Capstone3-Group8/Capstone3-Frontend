import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getAccount } from '../api/tasks';

// Shows one account. The id comes from the URL, e.g. /accounts/3 -> id === "3".
export default function TaskDetailPage() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  // Fetch whenever the id in the URL changes. The `active` flag ignores a
  // response that arrives after we've already navigated away.
  useEffect(() => {
    let active = true;
    getAccount(id)
      .then((data) => active && setAccount(data))
      .catch((err) => active && setError(err.message));

    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <p className='text-red-500'>{error}</p>;
  if (!account) return <p>Loading…</p>; // no account yet = still loading

  return (
    <section>
      <Link to='/tasks' className='text-sm text-(--accent)'>
        ← Back to accounts
      </Link>
      <h1 className='mt-4 text-3xl font-semibold text-(--text-h)'>
        {account.name}
      </h1>
      <p className='mt-2'>{task.description || 'No description.'}</p>
      <p className='mt-4 text-sm'>
        Status: {task.completed ? '✅ Done' : '⬜ Not done'}
      </p>
    </section>
  );
}
