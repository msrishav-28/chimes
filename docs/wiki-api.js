/**
 * Talks to /api/* when the backend is live.
 * Falls back to localStorage so the UI is reviewable without Neon.
 * Unpublished drafts never become public Guide pages.
 */

import { slugify } from "./wiki-merge.js";

const PENDING_KEY = "chimes-pending";
const ROLE_KEY = "chimes-role";
const SESSION_KEY = "chimes-session";

const publishedBySlug = new Map();
let apiReachable = false;

export function isApiReachable() {
  return apiReachable;
}

export function getPublishedCache(slug) {
  return publishedBySlug.get(slug) || null;
}

export function listPublishedCommunity() {
  return [...publishedBySlug.values()].filter((row) => row.origin === "community");
}

export function getRole() {
  try {
    return localStorage.getItem(ROLE_KEY) || "visitor";
  } catch {
    return "visitor";
  }
}

export function setRole(role) {
  const next = ["visitor", "contributor", "admin"].includes(role)
    ? role
    : "visitor";
  try {
    localStorage.setItem(ROLE_KEY, next);
  } catch {
    /* ignore */
  }
  return next;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  try {
    if (!session) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

function loadPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePending(list) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(0, 80)));
  } catch {
    /* ignore */
  }
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    let payload = null;
    try {
      payload = JSON.parse(await res.text());
    } catch {
      payload = null;
    }
    const err = new Error(payload?.error?.message || `api ${res.status}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function rememberPublished(articles) {
  publishedBySlug.clear();
  for (const row of articles || []) {
    if (!row?.slug) continue;
    publishedBySlug.set(row.slug, row);
  }
}

export async function fetchPublishedArticles() {
  try {
    const data = await api("/api/articles");
    apiReachable = true;
    const articles = Array.isArray(data.articles) ? data.articles : [];
    rememberPublished(articles);
    return articles;
  } catch {
    return [...publishedBySlug.values()];
  }
}

export async function fetchArticle(slug) {
  try {
    const data = await api(`/api/articles/${encodeURIComponent(slug)}`);
    apiReachable = true;
    if (data?.slug) publishedBySlug.set(data.slug, data);
    return data;
  } catch (err) {
    if (err.status === 404) return null;
    return getPublishedCache(slug);
  }
}

export async function hydrateSession() {
  try {
    const me = await api("/api/auth/me");
    apiReachable = true;
    if (me?.role && me.role !== "visitor") {
      setSession(me);
      setRole(me.role);
    } else if (me && me.role === "visitor") {
      const existing = getSession();
      if (existing?.email) {
        setSession(null);
        setRole("visitor");
      }
    }
    return me;
  } catch {
    return getSession();
  }
}

export async function submitPending(payload) {
  const row = {
    id: `local-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    ...payload
  };
  try {
    const data = await api("/api/pending", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    apiReachable = true;
    return { ...row, ...data, via: "api" };
  } catch (err) {
    if (err.status && err.status < 500 && err.status !== 404) throw err;
    const list = loadPending();
    list.unshift(row);
    savePending(list);
    return { ...row, via: "local" };
  }
}

export async function listPending() {
  try {
    const data = await api("/api/pending");
    apiReachable = true;
    if (Array.isArray(data.pending)) return data.pending;
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      const fail = new Error("admin required");
      fail.status = err.status;
      throw fail;
    }
  }
  return loadPending();
}

export async function publishPending(id) {
  try {
    const data = await api("/api/publish", {
      method: "POST",
      body: JSON.stringify({ pendingId: id })
    });
    apiReachable = true;
    return data;
  } catch (err) {
    if (apiReachable || (err.status && err.status !== 404)) throw err;
    const list = loadPending().map((row) =>
      row.id === id ? { ...row, status: "published" } : row
    );
    savePending(list);
    return { id, status: "published", via: "local" };
  }
}

export async function rejectPending(id) {
  try {
    const data = await api("/api/reject", {
      method: "POST",
      body: JSON.stringify({ pendingId: id })
    });
    apiReachable = true;
    return data;
  } catch (err) {
    if (apiReachable || (err.status && err.status !== 404)) throw err;
    const list = loadPending().map((row) =>
      row.id === id ? { ...row, status: "rejected" } : row
    );
    savePending(list);
    return { id, status: "rejected", via: "local" };
  }
}

export async function uploadRoof(file) {
  const body = new FormData();
  body.append("file", file);
  try {
    const data = await api("/api/upload", { method: "POST", body });
    apiReachable = true;
    return data;
  } catch (err) {
    if (err.status && err.status !== 404) throw err;
    return {
      publicId: null,
      url: URL.createObjectURL(file),
      via: "local-blob",
      note: "Queued as a local preview until /api/upload exists."
    };
  }
}

export async function login(email, password) {
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    apiReachable = true;
    setSession(data);
    if (data.role) setRole(data.role);
    return data;
  } catch (err) {
    return {
      ok: false,
      error:
        err.payload?.error?.message ||
        "Auth is not connected yet. Use preview roles until the database is configured."
    };
  }
}

export async function logout() {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  setSession(null);
  setRole("visitor");
}

function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length > 2);
}

export function askLocal(question, slug, getGuide, countryOrder, countries) {
  const q = tokens(question);
  if (!q.length) {
    return {
      answer: "Ask about a roof type, a climate, or a country in the guide.",
      citations: [],
      stub: true
    };
  }
  const scored = [];
  for (const id of countryOrder) {
    const g = getGuide(id);
    const c = countries[id];
    const blob = [
      c?.name,
      g.typology,
      g.setting,
      g.lead,
      ...(g.sections || []).flatMap((s) => [s.heading, ...(s.paragraphs || [])])
    ].join(" ");
    const hay = tokens(blob);
    let n = 0;
    for (const w of q) if (hay.includes(w)) n += 1;
    if (id === slug) n += 2;
    if (n) scored.push({ id, name: c?.name || id, n, guide: g });
  }
  scored.sort((a, b) => b.n - a.n);
  const top = scored.slice(0, 2);
  if (!top.length) {
    return {
      answer:
        "That is not in the seed guide yet. Improve this page or add a page, and it can be published into the wiki.",
      citations: [],
      stub: true
    };
  }
  const lines = top.map((hit) => {
    const first = hit.guide.sections?.[0]?.paragraphs?.[0] || hit.guide.lead;
    return `${hit.name}. ${first}`;
  });
  return {
    answer: `${lines.join(" ")}\n\n(Local stub. The Ask API will replace this once /api/ask is reachable.)`,
    citations: top.map((hit) => ({ slug: hit.id, title: hit.name })),
    stub: true
  };
}

export async function askGuide(question, slug, ctx) {
  try {
    const data = await api("/api/ask", {
      method: "POST",
      body: JSON.stringify({ question, slug })
    });
    apiReachable = true;
    return { ...data, stub: false };
  } catch {
    return askLocal(
      question,
      slug,
      ctx.getGuide,
      ctx.countryOrder,
      ctx.countries
    );
  }
}

/** Local published community pages only. Pending drafts stay in the inbox. */
export function communityFromPending() {
  return loadPending().filter(
    (row) => row.type === "page" && row.status === "published" && slugify(row.title)
  );
}

export function listLocalDrafts() {
  return loadPending();
}
