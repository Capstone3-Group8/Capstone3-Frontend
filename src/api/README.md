# src/api — talking to the backend

Every function that touches the network lives in this folder, one file per
resource:

- `auth.js` — signup, login, logout, and "who am I?"
- `tasks.js` — the CRUD calls for tasks (copy this one for your own resources)

Components never call `fetch` directly. They import a function from here. That
way a page like `TasksPage.jsx` reads as "load the tasks, then render them" and
never has URLs or headers mixed into the JSX.

## Every function has the same five steps

Read one and you've read them all. Only the URL, the method, and the body change.

```js
export async function getTasks() {
  // 1. call the URL
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    // 2. send our login cookie
    credentials: 'include',
    // 3. say what kind of data we're sending
    headers: { 'Content-Type': 'application/json' },
  });

  // 4. check for an error ourselves — fetch will NOT throw on a 404 or 500
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load tasks (${res.status})`);
  }

  // 5. parse the JSON body and hand it back
  return res.json();
}
```

The code is intentionally repeated across functions instead of being pulled into
a shared helper. While you're learning, being able to read one function top to
bottom beats saving a few lines. Once the shape feels obvious, factoring out the
common parts into a single `request()` function is a genuinely good exercise —
that's what most real codebases do.

## The three things that trip everyone up

**1. `credentials: 'include'`**
Our login token lives in an httpOnly cookie, which JavaScript cannot read. By
default `fetch` does not send cookies to a different origin — and
`localhost:5173` → `localhost:8080` counts as different. Without this line the
server never sees the cookie and every protected request 401s. The backend has
to agree, which is why `app.js` sets `cors({ credentials: true })`.

Forgetting this is the #1 reason a login appears to work but the very next
request fails.

**2. `if (!res.ok)`**
`fetch` only rejects on a *network* failure — server down, DNS, CORS. A 401, a
404, and a 500 are all "successful" fetches as far as `fetch` is concerned. If
you don't check `res.ok` yourself, your `catch` block never runs and you end up
rendering an error object as if it were data.

**3. `JSON.stringify(body)`**
`fetch` does not convert objects to JSON for you. Two things have to agree: the
body must be stringified, and the `Content-Type: application/json` header must
be present. Miss either and the Express `express.json()` middleware hands your
route an empty `req.body`.

## Side note: the same thing with axios

We use `fetch` because it's built into every browser — nothing to install, and
it's the API you'll see in documentation everywhere. `axios` is a popular
library that wraps the same idea with friendlier defaults. You'll meet it in
plenty of codebases, so here's the comparison.

```
npm install axios
```

```js
import axios from 'axios';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // = credentials: 'include'
  headers: { 'Content-Type': 'application/json' },
});
```

The same login call, both ways:

```js
// fetch — stringify the body yourself, then parse the response yourself
const res = await fetch(`${BASE_URL}/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier, password }),
});
if (!res.ok) throw new Error('Login failed');
const user = await res.json();

// axios — a plain object is fine, and the parsed body is on .data
const { data: user } = await api.post('/auth/login', { identifier, password });
```

The four differences worth knowing:

| | fetch | axios |
| --- | --- | --- |
| **JSON in** | `JSON.stringify(body)` + `Content-Type` header | both done for you from a plain object |
| **JSON out** | gives you a `Response`; call `await res.json()` | already-parsed body on `res.data` |
| **Errors** | *resolves* on 401/404/500 — you must check `res.ok` | *rejects* on those, so `try/catch` is enough; the server's message is at `err.response.data.error` |
| **Cookies** | `credentials: 'include'` | `withCredentials: true` |

Both cookie options are **off** by default. Forgetting either one is the most
common cause of a login that seems to succeed and then immediately 401s.
