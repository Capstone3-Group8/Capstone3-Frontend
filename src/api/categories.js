// api/categories.js — every call for the "categories" resource.
// Copy this file for your own resources (posts, events, ...) and swap the paths.
//
// Each function is written out in full — one fetch, one error check, one return
// — so you never have to jump to another file to see what a call actually does.
// Read one function and you've read them all; the only things that change are
// the URL, the method, and whether there's a body.
//
// This is CRUD, the five things you do with data:
//   Create  ->  POST    /api/categories         createCategory
//   Read    ->  GET     /api/categories         getCategories    (all)
//               GET     /api/categories/:id     getCategory     (one)
//   Update  ->  PATCH   /api/categories/:id     updateCategory
//   Delete  ->  DELETE  /api/categories/:id     deleteCategory

// In dev this is your local Express server. In production, set VITE_API_URL to
// your deployed backend URL. Vite only exposes env vars starting with VITE_.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// READ ALL — GET /categories. Returns an array of categories.
export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories`, {
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
    throw new Error(body.error || `Could not load categories (${res.status})`);
  }

  // res.json() reads the response body and parses it. It's async too — the
  // body may still be arriving when the headers have landed.
  return res.json();
}

// READ ONE — GET /categories/:id. Returns a single category, or throws on 404.
export async function getCategory(id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not load category ${id} (${res.status})`,
    );
  }

  return res.json();
}

// CREATE — POST /categories. Returns the category the server created (with its new
// id and timestamps), which is why we use the response instead of the object
// we sent.
// data = { name, budget }
export async function createCategory(data) {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    // fetch will not turn an object into JSON for you. Two things have to
    // agree here: JSON.stringify on the body, and the Content-Type header.
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Could not create category (${res.status})`);
  }

  return res.json();
}

// UPDATE — PATCH /categories/:id. Returns the updated category.
// PATCH changes only the fields you send
// (PUT is the other option: it replaces the whole record, so you
// have to send every field.)
export async function updateCategory(id, data) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not update category ${id} (${res.status})`,
    );
  }

  return res.json();
}

// DELETE — DELETE /categories/:id.
export async function deleteCategory(id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || `Could not delete category ${id} (${res.status})`,
    );
  }

  // No res.json() here. The backend replies 204 No Content — there is no body
  // to parse, and calling res.json() on an empty body would throw. Nothing
  // useful to hand back, so we return null.
  return null;
}
