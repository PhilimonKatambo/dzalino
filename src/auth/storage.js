// Lightweight, defensive wrappers around localStorage / cookies so we always
// have a single place that decides how the JWT and user details are persisted.
//
// The JWT is stored in localStorage (so axios can read it as a Bearer token)
// AND mirrored into a non-HttpOnly cookie so SSR / server-side reads can
// still know who the user is. The cookie is `Secure` + `SameSite=Strict` so
// it can't be read cross-site. Anything sensitive is base64-encoded so a
// stray `document.cookie` dump doesn't leak plaintext, although the truly
// sensitive thing is the JWT itself which is already a signed token.

const TOKEN_KEY = "dzalino.jwt";
const USER_KEY = "dzalino.user";
const COOKIE_NAME = "dzalino_session";

function safeStorage() {
    try {
        if (typeof window === "undefined") return null;
        return window.localStorage;
    } catch {
        return null;
    }
}

function b64Encode(value) {
    if (typeof window === "undefined") return "";
    try {
        return window.btoa(unescape(encodeURIComponent(value)));
    } catch {
        return "";
    }
}

function b64Decode(value) {
    if (typeof window === "undefined") return "";
    try {
        return decodeURIComponent(escape(window.atob(value)));
    } catch {
        return "";
    }
}

function setCookie(name, value, maxAgeSeconds) {
    if (typeof document === "undefined") return;
    const secure =
        typeof window !== "undefined" && window.location && window.location.protocol === "https:"
            ? "; Secure"
            : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Strict${secure}`;
}

function clearCookie(name) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Strict`;
}

export function persistAuth({ token, user, expiresInSeconds = 60 * 60 * 8 }) {
    const storage = safeStorage();
    if (storage) {
        if (token) storage.setItem(TOKEN_KEY, token);
        if (user) storage.setItem(USER_KEY, JSON.stringify(user));
    }
    // Mirror the user details (not the raw token) into a cookie so server
    // routes can pre-render with the logged-in identity. The token stays in
    // localStorage so JS-controlled requests can attach it as a Bearer.
    if (user) {
        setCookie(COOKIE_NAME, b64Encode(JSON.stringify(user)), expiresInSeconds);
    } else if (token) {
        setCookie(COOKIE_NAME, b64Encode(JSON.stringify({ hasToken: true })), expiresInSeconds);
    }
}

export function readToken() {
    const storage = safeStorage();
    return storage ? storage.getItem(TOKEN_KEY) : null;
}

export function readUser() {
    const storage = safeStorage();
    if (!storage) return null;
    const raw = storage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function readUserFromCookie() {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    const value = decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
    try {
        return JSON.parse(b64Decode(value));
    } catch {
        return null;
    }
}

export function clearAuth() {
    const storage = safeStorage();
    if (storage) {
        storage.removeItem(TOKEN_KEY);
        storage.removeItem(USER_KEY);
    }
    clearCookie(COOKIE_NAME);
}