import { Navigate, useLocation } from 'react-router';

// A route guard. Wrap any <Route>'s element in <ProtectedRoute> to require login.
// - While App is still checking the session, show a loading line.
// - If nobody is logged in, send them to /login.
// - Otherwise render the page (children).
//
// It takes `user` and `isLoading` as props, so it works for BOTH kinds of
// login — App has already figured out who you are by the time it renders.
//
// IMPORTANT: this is a convenience, not security. It only decides what to
// RENDER. The data itself is protected by requireAuth on the server; a user
// could disable this in devtools and still get nothing back from the API.
export default function ProtectedRoute({ user, isLoading, children }) {
  const location = useLocation();

  // Skipping this check would bounce a logged-in user to /login on every page
  // refresh, because `user` is briefly null before the server answers.
  if (isLoading) return <p>Checking your session…</p>;

  // Remember where they were headed so Login can send them back there instead
  // of dropping them on the home page. `replace` keeps the guarded URL out of
  // history, so the back button doesn't bounce them right back here.
  if (!user) {
    return <Navigate to='/login' state={{ from: location.pathname }} replace />;
  }

  return children;
}
