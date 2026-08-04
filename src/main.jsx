import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App.jsx';

const authConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: 'openid profile email',
  },
};

const root = createRoot(document.getElementById('root'));

// Check the Auth0 env vars before we render anything. Auth0Provider would
// otherwise fail somewhere deep inside its own code, long after the mistake.
//
// Note we RENDER the problem rather than `throw`ing it. A throw up here kills
// the render and leaves a blank white page — the message only shows up if you
// happen to open the console. Missing .env is the single most likely reason
// this app doesn't start, so the fix belongs on screen where you'll see it.
const missing = [
  ['VITE_AUTH0_DOMAIN', authConfig.domain],
  ['VITE_AUTH0_CLIENT_ID', authConfig.clientId],
  ['VITE_AUTH0_AUDIENCE', authConfig.authorizationParams.audience],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  root.render(
    <div className='mx-auto max-w-lg p-8 text-left'>
      <h1 className='mb-3 text-2xl font-semibold'>Missing Auth0 settings</h1>
      <p className='mb-4'>
        This app can't start until these are set in a <code>.env</code> file at
        the project root:
      </p>
      <ul className='mb-4 list-disc pl-6'>
        {missing.map((name) => (
          <li key={name}>
            <code>{name}</code>
          </li>
        ))}
      </ul>
      <p>
        Run <code>cp .env.example .env</code>, fill in the values from your Auth0
        dashboard, then restart <code>npm run dev</code> — Vite only reads{' '}
        <code>.env</code> at startup.
      </p>
    </div>,
  );
} else {
  // The nesting order matters — a component can only use what is ABOVE it:
  //
  //   Auth0Provider   supplies the OAuth session, so App can call useAuth0()
  //     BrowserRouter turns on client-side routing, so moving between pages doesn't reload the browser
  //       App         owns the `user` state and passes it down as props
  //   you can create your own context so that you don't have to rely on prop-drilling
  root.render(
    <StrictMode>
      <Auth0Provider {...authConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Provider>
    </StrictMode>,
  );
}
