import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getProtected } from '../api/auth';

// A page to TEST the protected backend endpoint. ProtectedRoute makes sure you
// can only get here when logged in; the button then calls /api/protected and
// shows what came back.
//
// This is the one place where the two kinds of login look different in the
// frontend, so it's worth reading closely:
//
//   password user -> the JWT is in an httpOnly cookie. We send NOTHING extra;
//                    the browser attaches the cookie by itself.
//   Auth0 user    -> the token lives inside Auth0's SDK, so we have to fetch
//                    it and send it in an Authorization header.
//
// The backend's requireAuth accepts either, which is why ONE endpoint serves
// both. Look at `via` in the response to see which door you came through.
export default function ProtectedPage({ user }) {
  const { isAuthenticated: isAuth0User, getAccessTokenSilently } = useAuth0();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleTest() {
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      // Only ask Auth0 for a token if the session actually CAME from Auth0.
      // Calling this for a password user throws "Login required".
      const token = isAuth0User ? await getAccessTokenSilently() : undefined;

      const data = await getProtected(token);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <h1 className='mb-6 text-3xl font-semibold text-(--text-h)'>Protected</h1>

      <p className='mb-2'>
        You can only see this page while logged in
        {user?.username ? `, ${user.username}` : ''}.
      </p>
      <p className='mb-4 text-sm'>
        Signed in with{' '}
        <code>{isAuth0User ? 'an Auth0 token' : 'our own JWT cookie'}</code>.
      </p>

      <button
        onClick={handleTest}
        disabled={isLoading}
        className='rounded-md bg-(--accent) px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60'
      >
        {isLoading ? 'Calling…' : 'Call /api/protected'}
      </button>

      {error && <p className='mt-4 text-red-500'>{error}</p>}

      {result && (
        <pre className='mt-4 overflow-x-auto rounded-md border border-(--border) p-4 text-left text-sm'>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}
