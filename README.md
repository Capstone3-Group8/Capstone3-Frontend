# Frontend Boilerplate — PERN Capstone

A React + Vite frontend for your capstone, wired to the Express/Postgres
backend. It ships with a working example — the **Tasks** pages do full CRUD
against `/api/tasks` — and a complete login flow with **two ways in**: email +
password, and social login via Auth0. Copy the example shape for your own
resources, then delete it.

Stack: **React 19** (with the React Compiler) · **React Router v7** ·
**Tailwind CSS v4** · **Auth0** · **Vite**.

## Getting started

```bash
npm install
cp .env.example .env    # then fill in your VITE_ values (see below)
npm run dev             # http://localhost:5173
```

```
VITE_API_URL=http://localhost:8080
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://capstone-api   # must match the backend's AUTH0_AUDIENCE
```

If any of the `VITE_AUTH0_*` values are missing the app says so on screen
instead of starting. Vite reads `.env` once at startup, so **restart the dev
server** after changing it.

The backend must be running too — this app has no data of its own:

**→ [ttp-backend-api-setup (`auth0` branch)](https://github.com/aghaffar570/ttp-backend-api-setup/tree/auth0)**

Start it first, on port 8080, before `npm run dev` here.

## Structure

```
src/
  main.jsx            wraps the app in <Auth0Provider> + <BrowserRouter>
  App.jsx             the route table + owns the logged-in `user` state
  api/
    client.js         fetch wrapper: base URL, cookies, shared error handling
    tasks.js          the calls for the "tasks" resource
    auth.js           signup / login / logout / me
  components/
    Layout.jsx        shared frame (navbar + page slot)
    Navbar.jsx        top navigation; shows who's logged in
    FormField.jsx     one labelled input + its error message
    ProtectedRoute.jsx  route guard: redirects to /login when not logged in
  pages/
    HomePage.jsx
    Login.jsx         email/password form + "Continue with Auth0"
    Signup.jsx        create an account + "Continue with Auth0"
    TasksPage.jsx     list + create + toggle + delete  (the CRUD example)
    TaskDetailPage.jsx
    ProtectedPage.jsx tests the protected backend endpoint
    NotFoundPage.jsx  the 404 (catch-all route)
```

## How data flows

A page calls a function in `api/tasks.js` → which calls `request()` in
`api/client.js` → which `fetch`es the backend at `VITE_API_URL` → the JSON comes
back and the page stores it in state and renders it.

Funnelling every call through one `request()` means the base URL, the
`Content-Type` header, cookie handling, and error handling are written once
instead of in every component.

## Authentication

### Two ways to log in

**Email + password.** `Login`/`Signup` post to our own backend, which replies
with an **httpOnly cookie** holding a JWT. Notice what's missing from this
codebase: any code that stores or reads a token. JavaScript *can't* read an
httpOnly cookie — that's the point, an XSS bug can't steal it — and it doesn't
need to. `client.js` sends `credentials: 'include'` on every request, so the
browser attaches the cookie automatically.

> `credentials: 'include'` is not the default. Forgetting it is the number one
> reason a login appears to work and the very next request comes back 401.

**Auth0 (social login).** The "Continue with Auth0" button calls
`loginWithRedirect()`. Auth0 handles the credential and hands us an access
token, which lives in the Auth0 SDK's memory — not in a cookie we control — so
here we *do* pass it explicitly, as `Authorization: Bearer <token>`.
`ProtectedPage.jsx` shows both paths side by side.

### The two "user" objects

Easy to mix up, so be deliberate about which one you mean:

- **`auth0User`** — the profile Auth0 gives us (`nickname`, `picture`, …).
  Only exists for social logins.
- **`user`** — the row from **our own database**. This is the one the app uses
  everywhere: the Navbar, `ProtectedRoute`, every page.

On an Auth0 login, `App.jsx` calls `syncUser()` once so the person exists in our
database, then stores that row as `user`. Password users get their row straight
back from `/auth/login`.

### Staying logged in across a refresh

React state doesn't survive a page reload, but the cookie does. So on every
load `App.jsx` asks the server `GET /auth/me`. A 401 there is the normal
"nobody's logged in" answer, not a bug.

`ProtectedRoute` must not redirect while that's still in flight, or a logged-in
user gets kicked to `/login` on every refresh. `App.jsx` computes `isLoading`
from three things: our cookie check, Auth0's SDK restoring its own session,
and — for Auth0 users — fetching their row from our database. Read the comment
above `isLoading` in `App.jsx`; the third one is the easy one to miss.

> `ProtectedRoute` is a **convenience, not security**. It only decides what to
> *render*. Anyone can edit it away in devtools — what actually protects the
> data is `requireAuth` on the server.

## Add your own resource

1. **API** — copy `api/tasks.js` to `api/posts.js`, swap the paths.
2. **Pages** — copy the `pages/Tasks*` files for your resource.
3. **Routes** — add `<Route>`s for them in `App.jsx`.
4. **Nav** — add a `<NavLink>` in `Navbar.jsx`.

## Deploy

- `npm run build` outputs a static site to `dist/`.
- Set `VITE_API_URL` and the `VITE_AUTH0_*` vars to your **deployed** values.
  Vite bakes env vars in at build time, so **rebuild** after changing them.
- In the Auth0 dashboard, add your deployed URL to **Allowed Callback URLs**,
  **Logout URLs**, and **Web Origins** — otherwise login fails in production.
- The backend needs `NODE_ENV=production` set, or the login cookie won't be
  sent once the frontend and API are on different domains.
- `vercel.json` already sends every path to `index.html` so React Router's
  client-side routes work on refresh. On other hosts (Netlify, etc.) add the
  equivalent SPA/rewrite rule.

## Common issues

| Symptom | Fix |
|---|---|
| "Missing Auth0 settings" on screen | Copy `.env.example` to `.env`, fill it in, restart the dev server. |
| Login works, then requests 401 | `VITE_AUTH0_AUDIENCE` must match the backend's `AUTH0_AUDIENCE` exactly. |
| CORS error in the console | The backend's `FRONTEND_URL` must match where this app is running (`http://localhost:5173`). |
| Changed `.env`, nothing happened | Restart `npm run dev` — Vite only reads it at startup. |
| Auth0 login redirects to an error page | Add `http://localhost:5173` to Allowed Callback URLs, Logout URLs, and Web Origins in the Auth0 dashboard. |
