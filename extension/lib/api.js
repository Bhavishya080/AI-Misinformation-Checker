// Tiny fetch wrapper with timeout + typed errors.
// Change API_BASE to your deployed backend URL when you ship.
const API_BASE = "http://127.0.0.1:8000";
const TIMEOUT_MS = 15_000;

async function check(text) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const detail = await safeJson(res);
      throw new Error(detail?.detail || `Server error (${res.status}).`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Request timed out. Is the backend running?");
    if (err instanceof TypeError) throw new Error("Can't reach the backend. Check the API URL.");
    throw err;
  } finally {
    clearTimeout(t);
  }
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

window.MisinfoAPI = { check, API_BASE };
