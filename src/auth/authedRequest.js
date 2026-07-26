import axios from "axios";
import { readToken } from "./storage";

// Wrapper for backend POSTs that always carries the stored JWT as a Bearer
// token. Going through `axios.post` (not `fetch`) is what guarantees the
// request interceptor installed by `installAxiosAuth` actually runs and
// attaches `Authorization: Bearer <jwt>` to the outgoing request.
//
// Every form in the app should use this helper instead of `fetch()` so
// that:
//   * the JWT is always forwarded on writes (parity with the GETs),
//   * the legacy static `authorization: "jsy7392#9%$ya$D!2@£$34"` header
//     that used to live on every form is removed entirely,
//   * failed responses are surfaced in a uniform
//     `{ ok, status, data, error }` shape so the form code stays small.
//
// The backend contract for these endpoints is described in AUTH.md
// (Section 8). A 2xx with a JSON body is success; anything else is a
// failure whose `message` (or `error`) field is shown to the user.

function pickMessage(data, fallback) {
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof data.error === "string" && data.error) return data.error;
    if (Array.isArray(data.errors) && data.errors.length) {
        const first = data.errors.find((e) => typeof e === "string" && e);
        if (first) return first;
    }
    return fallback;
}

export async function authedPost(url, payload, { timeoutMs = 15000 } = {}) {
    const token = readToken();
    if (!token) {
        return {
            ok: false,
            status: 0,
            data: null,
            error:
                "You are signed out. Please sign in again before saving data.",
        };
    }

    try {
        const response = await axios.post(url, payload, {
            // The interceptor in axiosAuth.js attaches / overwrites
            // `Authorization`. We deliberately do NOT set a static
            // `authorization` header so there is exactly one source of
            // truth for auth on every request.
            headers: { "Content-Type": "application/json" },
            timeout: timeoutMs,
            // Surface 4xx as resolved promises so the caller can branch
            // on `result.ok` instead of wrapping every call in try/catch.
            validateStatus: (s) => s >= 200 && s < 500,
        });

        const status = response.status;
        const data = response.data;
        if (status >= 200 && status < 300) {
            return { ok: true, status, data, error: null };
        }

        return {
            ok: false,
            status,
            data,
            error: pickMessage(data, `Request failed with status ${status}.`),
        };
    } catch (err) {
        // Network errors, timeouts, CORS, etc. surface here.
        const status = (err && err.response && err.response.status) || 0;
        return {
            ok: false,
            status,
            data: err && err.response ? err.response.data : null,
            error: pickMessage(
                err && err.response ? err.response.data : null,
                (err && err.message) || "Network error. Please try again."
            ),
        };
    }
}

// Convenience helper for GETs that always forward the JWT. The slice
// thunks can call this too if we ever want a single chokepoint, but the
// existing `axios.get` calls already pick up the interceptor as long as
// they don't set a conflicting `Authorization` header themselves.
export async function authedGet(url, config = {}) {
    const token = readToken();
    if (!token) {
        return {
            ok: false,
            status: 0,
            data: null,
            error: "You are signed out. Please sign in again.",
        };
    }
    try {
        const response = await axios.get(url, {
            ...config,
            validateStatus: (s) => s >= 200 && s < 500,
        });
        const status = response.status;
        const data = response.data;
        if (status >= 200 && status < 300) {
            return { ok: true, status, data, error: null };
        }
        return {
            ok: false,
            status,
            data,
            error: pickMessage(data, `Request failed with status ${status}.`),
        };
    } catch (err) {
        const status = (err && err.response && err.response.status) || 0;
        return {
            ok: false,
            status,
            data: err && err.response ? err.response.data : null,
            error: pickMessage(
                err && err.response ? err.response.data : null,
                (err && err.message) || "Network error. Please try again."
            ),
        };
    }
}
