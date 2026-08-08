// api/accounts.js — every call for the "accounts" resource.
// Copy this file for your own resources (posts, events, ...) and swap the paths.
//
// Each function is written out in full — one fetch, one error check, one return
// — so you never have to jump to another file to see what a call actually does.
// Read one function and you've read them all; the only things that change are
// the URL, the method, and whether there's a body.
//
// This is CRUD, the five things you do with data:
//   Create  ->  POST    /api/accounts         createAccount
//   Read    ->  GET     /api/accounts         getAccounts    (all)
//               GET     /api/accounts/:id     getAccount     (one)
//   Update  ->  PATCH   /api/accounts/:id     updateAccount
//   Delete  ->  DELETE  /api/accounts/:id     deleteAccount

// In dev this is your local Express server. In production, set VITE_API_URL to
// your deployed backend URL. Vite only exposes env vars starting with VITE_.
const BASE_URL = /*import.meta.env.VITE_API_URL ||*/ "http://localhost:8080";

// READ ALL — GET /api/account. Returns an array of accounts.
export async function getAccounts() {
  const res = await fetch(`${BASE_URL}/accounts`, {
    // Send our login cookie along. Off by default in fetch, and needed the
    // moment an endpoint requires you to be logged in.
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  // fetch only rejects on a NETWORK failure (server down, DNS, CORS). A 404 or
  // a 500 is still a "successful" fetch, so we check res.ok ourselves. This is
  // the single biggest gotcha in fetch.
  if (!res.ok) {
    // Our backend sends errors as { error: "..." }. Fall back if it didn't.
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not load accounts (${res.status})`);
  }

  // res.json() reads the response body and parses it. It's async too — the
  // body may still be arriving when the headers have landed.
  return res.json();
}

// READ ONE — GET /api/accounts/:id. Returns a single account, or throws on 404.
export async function getAccount(id) {
  const res = await fetch(`${BASE_URL}/accounts/${id}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not load account ${id} (${res.status})`,
    );
  }

  return res.json();
}

// CREATE — POST /api/accounts. Returns the account the server created (with its new
// id and timestamps), which is why we use the response instead of the object
// we sent.
// data = { name, type, balance, bank_name }
export async function createAccount(data) {
  const res = await fetch(`${BASE_URL}/accounts`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    // fetch will not turn an object into JSON for you. Two things have to
    // agree here: JSON.stringify on the body, and the Content-Type header.
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not create account (${res.status})`);
  }

  return res.json();
}

// UPDATE — PATCH /api/accounts/:id. Returns the updated account.
// PATCH changes only the fields you send
// (PUT is the other option: it replaces the whole record, so you
// have to send every field.)
export async function updateAccount(id, data) {
  const res = await fetch(`${BASE_URL}/accounts/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not update account ${id} (${res.status})`,
    );
  }

  return res.json();
}

// DELETE — DELETE /api/accounts/:id.
export async function deleteAccount(id) {
  const res = await fetch(`${BASE_URL}/accounts/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not delete account ${id} (${res.status})`,
    );
  }

  // No res.json() here. The backend replies 204 No Content — there is no body
  // to parse, and calling res.json() on an empty body would throw. Nothing
  // useful to hand back, so we return null.
  return null;
}
