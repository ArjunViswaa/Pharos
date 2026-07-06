const API_BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "pharos.token";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

function buildHeaders(extra = {}) {
    const headers = { ...extra };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

async function handle(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data?.error || `Request failed with ${res.status}`);
        err.status = res.status;
        err.body = data;
        throw err;
    }
    return data;
}

export async function apiGet(path) {
    const res = await fetch(API_BASE + path, { headers: buildHeaders() });
    return handle(res);
}

export async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, {
        method: "POST",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
    });
    return handle(res);
}

export async function apiPatch(path, body) {
    const res = await fetch(API_BASE + path, {
        method: "PATCH",
        headers: buildHeaders(body ? { "Content-Type": "application/json" } : {}),
        body: body ? JSON.stringify(body) : undefined,
    });
    return handle(res);
}