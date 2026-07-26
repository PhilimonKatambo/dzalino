# Dzalino — Authentication Logic (Backend Build Spec)

This document describes **exactly** how authentication works in the Dzalino frontend, so another AI can build a backend that is 100% compatible with the existing React app.

The frontend is a **React 19 + Redux Toolkit** single-page application. Auth lives in `src/auth/*` and is wired into the app via `src/index.js` and `src/componets/AuthGate/AuthGate.js`. Read sections 1–4 before you write any code; sections 5–8 are the concrete API contract; sections 9–10 are the recommended production hardening steps.

---

## 1. The four auth files you'll be matching

| File | Purpose |
| --- | --- |
| `src/auth/validateInput.js` | Pure functions for client-side validation + sanitization of username/password. |
| `src/auth/authSlice.js` | Redux slice. Holds `loginUser` and `logoutUser` async thunks and the `auth` state shape. |
| `src/auth/axiosAuth.js` | Installs an **axios request interceptor** that attaches the JWT as a Bearer token on **every** outgoing HTTP request. |
| `src/auth/storage.js` | Wrappers around `localStorage` + a `SameSite=Strict` cookie (`dzalino_session`) for the JWT and user object. |

Auxiliary files:

| File | Purpose |
| --- | --- |
| `src/index.js` | Calls `installAxiosAuth()` once at startup, before React mounts. |
| `src/componets/AuthGate/AuthGate.js` | If `token` is present in Redux state, renders the dashboard; otherwise renders the `<Login />` page. Also renders a "Sign out" button that dispatches `logoutUser`. |
| `src/componets/Login/login.js` | The login form. Uses `validateUsername` / `validatePassword`, then dispatches `loginUser({ username, password })`. |
| `src/store.js` | Combines the reducers: `{ expenses: expenseReducer, auth: authReducer }`. |
| `.env` | Sets `REACT_APP_BACKEND_URI=https://musicdb-50nd.onrender.com` (the base URL all requests are sent to). |

---

## 2. State machine

The Redux `auth` slice has this shape (see `authSlice.js`):

```js
{
  user: null | { id, username, role, email, ... }, // whatever the backend returns
  token: null | string,                            // JWT string
  loading: boolean,                               // true while loginUser is in flight
  fieldErrors: { username: null | string,
                 password: null | string,
                 form: null | string },
  errors: [],                                      // array of human-readable error strings
}
```

Selectors exposed:

- `selectAuth(state)         → state.auth`
- `selectIsAuthenticated(s)  → Boolean(s.auth && s.auth.token)`
- `selectCurrentUser(s)      → (s.auth && s.auth.user) || null`

`AuthGate` only reads `token` to decide whether to show the dashboard. **As long as `token` is non-null, the user is considered authenticated.** There is no expiry check on the client — that is the backend's job (and the reason `expiresIn` is mirrored into the cookie).

---

## 3. Login flow (step by step)

1. User submits the `<Login />` form.
2. The form runs `validateUsername` and `validatePassword` on the raw input. If either fails, the error is dispatched into `fieldErrors` and **no network request is made**.
3. The clean values are passed to `loginUser({ username, password })` (Redux thunk).
4. The thunk **re-validates** the inputs using `validateCredentials` (defense-in-depth against a tampered DOM). If anything fails it returns `rejectWithValue({ kind: "client-validation", errors: [...] })`. The form shows those errors inline.
5. The thunk POSTs to `${REACT_APP_BACKEND_URI}/auth/login` with a 15-second timeout:

   ```http
   POST /auth/login
   Content-Type: application/json

   { "username": "<sanitized>", "password": "<sanitized>" }
   ```

6. **Expected response body**:

   ```json
   {
     "token": "<jwt>",
     "user":  { "id": "<string>", "username": "<string>", "role": "<string>", "email": "<string>" },
     "expiresIn": 28800
   }
   ```

   - `token` **must** be a non-empty string.
   - `user` **must** be a non-null object. The frontend does not enumerate its fields; whatever shape you return is what gets stored and shown in the header. **You must include `username`** because `AuthGate` renders `user.username` in the badge.
   - `expiresIn` is **optional**. It is the lifetime in seconds. If omitted, the storage layer defaults to `60 * 60 * 8` (8 hours).

7. If the response shape is wrong (no `token`, no `user`), the thunk returns `rejectWithValue({ kind: "server-shape", errors: ["Server returned an unexpected response."] })`.
8. On success the thunk calls `persistAuth({ token, user, expiresInSeconds })` which:
   - writes `dzalino.jwt` → `token` in `localStorage`,
   - writes `dzalino.user` → `JSON.stringify(user)` in `localStorage`,
   - writes a `SameSite=Strict` (and `Secure` on HTTPS) cookie `dzalino_session` containing base64-encoded `JSON.stringify(user)` (or `{"hasToken":true}` if no user is provided).
   - `Max-Age` is set to `expiresInSeconds` (default 28800).
9. The slice's `fulfilled` reducer stores `{ token, user }` in Redux state. `AuthGate` re-renders the dashboard.

### Error responses the backend should return

| HTTP status | Where used | Frontend behavior |
| --- | --- | --- |
| `400` | Bad input (e.g. malformed JSON) | `kind: "network"`, generic message |
| `401` | Wrong username/password | `kind: "unauthorized"`, shown as form-level error |
| `403` | Account locked / disabled | `kind: "network"` (same as above) |
| `429` | Rate-limited | `kind: "network"` |
| `5xx` | Server fault | `kind: "network"` |
| `200` but `!token \|\| !user` | Backend bug | `kind: "server-shape"` |

For any non-`401` failure the frontend reads `response.data.message` (or `response.data.error`) and shows it. **Returning `{ "message": "Invalid credentials" }` with a 401 status is the canonical error shape.**

---

## 4. Logout flow

- The Sign-out button dispatches `logoutUser()`, which is a thin thunk that calls `clearAuth()` and resolves.
- `clearAuth()` removes `dzalino.jwt`, `dzalino.user`, and the `dzalino_session` cookie.
- The slice's `fulfilled` reducer sets `token` and `user` to `null`. `AuthGate` flips back to the login screen.

There is **no backend logout endpoint** in the current code. Adding one is optional; if you do, the frontend will not call it unless you wire the dispatch yourself.

---

## 5. The auto-injected Bearer token

`installAxiosAuth()` (called from `src/index.js` before React mounts) registers an axios request interceptor:

```js
axios.interceptors.request.use((config) => {
  const token = readToken();            // localStorage.getItem("dzalino.jwt")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Important consequences for your backend**:

- **Every** axios call — including `GET /expense/data`, `POST /expense/insert`, etc. — will carry `Authorization: Bearer <jwt>` once the user is logged in.
- The four `*Input.js` forms currently still also send a hard-coded `authorization: "jsy7392#9%$ya$D!2@£$34"` header, but the interceptor runs **after** the per-request headers are set, so it **overwrites** that header with the Bearer token. That means the legacy static key is effectively dead code as long as the user is logged in.
- The frontend never sends cookies to the backend — the cookie is for SSR / server-side rendering. Authenticated requests rely entirely on the `Authorization` header.

---

## 6. The exact auth endpoint contract

### `POST /auth/login`

**Request**

```http
POST /auth/login HTTP/1.1
Host: <BACKEND_URI>
Content-Type: application/json
Content-Length: <n>

{
  "username": "alice",
  "password": "correct horse battery staple"
}
```

**Validation you must perform on the backend (matches the frontend's `validateInput.js`)**

`username`:

- trimmed, length 3–32
- regex: `^[A-Za-z0-9._@-]+$`
- reject: control chars (`\u0000`-`\u001F`, `\u007F`), zero-width / bidi control chars (`\u200B`-`\u200F`, `\u202A`-`\u202E`, `\u2066`-`\u2069`), emoji (`\p{Extended_Pictographic}` and the supplementary blocks `\u{1F300}`-`\u{1FAFF}`, `\u{2600}`-`\u{27BF}`)
- reject anything matching `/["`'\`;\\]|--|\/\*|\*\/|\b(?:OR|AND)\b\s*\d+\s*=\s*\d+/i` (SQL meta chars + common SQL injection gadget patterns)

`password`:

- length 8–128
- reject the same control / emoji / SQL-meta chars as above
- reject `\r`, `\n`, `\t`

**Always** store/compare passwords with a slow KDF — `bcrypt` (cost ≥ 12), `argon2id`, or `scrypt`. The frontend sends the password in plaintext over HTTPS, so TLS is mandatory.

**Successful response (HTTP 200)**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.",
  "user": {
    "id": "65f0a1b2c3d4e5f6a7b8c9d0",
    "username": "alice",
    "role": "admin",
    "email": "alice@example.com"
  },
  "expiresIn": 28800
}
```

**Failure response (HTTP 401 for any bad credentials)**

```json
{
  "message": "Invalid credentials"
}
```

For validation errors (HTTP 400) return:

```json
{
  "message": "Username must be 3-32 characters.",
  "errors": ["Username must be 3-32 characters."]   // optional, shown if present
}
```

The frontend prefers `message` and falls back to `error`.

---

## 7. JWT requirements

The frontend does **not** decode the JWT — it only stores it and forwards it. But the backend must accept and validate it on every protected route.

| Property | Required value |
| --- | --- |
| Algorithm | `HS256` (symmetric) is fine, or `RS256` if you prefer. |
| Signing secret | Long, random, stored in an env var (e.g. `JWT_SECRET`). **Never** hard-code it. |
| `iss` (issuer) | Optional. Set to your service name (e.g. `"dzalino"`). |
| `aud` (audience) | Optional. Set to `"dzalino-web"` if you want to lock it to the SPA. |
| `exp` (expiration) | Must be set. Mirror `expiresIn` (default 28800s = 8h). |
| `iat` (issued-at) | Set automatically. |
| `sub` (subject) | The user''s `id`. |
| Custom claims | `username`, `role` are useful for quick role checks. |

**Validation rules on the backend**:

1. Verify the signature with `JWT_SECRET`.
2. Reject if `exp` is in the past (HTTP 401).
3. Reject if `aud` is present and doesn''t match.
4. Reject if the user referenced by `sub` no longer exists or is disabled.
5. **Do not** look the user up by `username` claim — use `sub` (the id) as the canonical key.

---

## 8. The Bearer-token middleware sketch

This is the pattern the frontend assumes every protected route follows. Add it to any route that should require a login (recommended for everything except `/auth/login` and `/health`):

```
// Pseudocode — pick whichever language/framework you''re using
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or malformed Authorization header." });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { audience: "dzalino-web" });
    req.user = { id: payload.sub, username: payload.username, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
```

Apply it to the four data route families in `src/expenseSlice.js` and `src/componets/*Input.js`:

| Method | Path | Source |
| --- | --- | --- |
| `GET` | `/expense/data` | `fetchExpenses` thunk |
| `GET` | `/taken/data` | `fetchTaken` thunk |
| `GET` | `/drums/data` | `fetchDrums` thunk |
| `GET` | `/dailyProduce/data` | `fetchProduced` thunk |
| `POST` | `/expense/insert` | `ExpenseInput.js` |
| `POST` | `/taken/insert` | `TakenInput.js` |
| `POST` | `/drums/insert` | `DrumsInput.js` |
| `POST` | `/dailyProduce/insert` | `ProducedInput.js` |

Each row record has the following shape (the frontend reads these property names exactly):

| Resource | Fields |
| --- | --- |
| `expense` | `_id`, `Date` (string), `Description`, `Category`, `Qty` (number), `Unit_Price` **or** `UnitPrice` (number — the frontend accepts both), `Total` (number) |
| `taken` | `_id`, `Date`, `Qty`, `Category` (`Nips` / `Bigs_papers` / `Bigs_cartons`), `Receiver` |
| `drums` | `_id`, `Date`, `Qty` |
| `dailyProduce` | `_id`, `Date`, `Qty`, `Category` (`Nips` / `Bigs_papers` / `Bigs_cartons`) |

---

## 9. Security checklist (recommended)

These are not strictly required for the app to work, but they are what the comments in the codebase imply the backend should do:

- **HTTPS only.** The frontend stores the JWT in `localStorage`, which is XSS-readable. Anything you can do to reduce the XSS blast radius (CSP, no `innerHTML`, sanitized Markdown) is worth it.
- **Hash passwords** with bcrypt (cost ≥ 12) or argon2id. **Never** store or log plaintext.
- **Rate-limit** `/auth/login` — 5 attempts / 15 minutes / IP, then a hard lockout. Return `429` with `{ "message": "Too many attempts. Try again later." }`.
- **Constant-time response.** Whether the user exists or not, the login should take ~the same time and return the same `401` message. Don''t say "user not found" vs "wrong password".
- **Lock out / disable** accounts after N failed attempts. The frontend will show whatever `message` you put in the `401` body, so use it for guidance.
- **Rotate `JWT_SECRET`** periodically. Keep a list of previous secrets during the rotation window so in-flight tokens still verify.
- **Issue a new JWT on every successful login** (don''t reuse old ones).
- **CORS.** Allow the frontend''s origin (e.g. `https://dzalino.onrender.com`) and **always** allow the `Authorization` header.
- **No JWT in URLs.** Only via the `Authorization` header.
- **Audit log** every login (success + failure) with timestamp, IP, and user-agent.

---

## 10. End-to-end smoke test (works against any compliant backend)

Once you implement the above, you can verify the integration with `curl` from the frontend''s `.env` URL:

```bash
# 1. log in
curl -sS -X POST \
  -H ''Content-Type: application/json'' \
  -d ''{"username":"alice","password":"correct horse battery staple"}'' \
  https://musicdb-50nd.onrender.com/auth/login

# expected: {
#   "token": "eyJhbGciOi....",
#   "user":  { ... },
#   "expiresIn": 28800
# }

# 2. call a protected route with the Bearer token
curl -sS \
  -H ''Authorization: Bearer <paste the token here>'' \
  https://musicdb-50nd.onrender.com/expense/data

# expected: an array of expense records (or [])

# 3. confirm the wrong password is rejected
curl -sS -o /dev/null -w ''%{http_code}\n'' \
  -X POST -H ''Content-Type: application/json'' \
  -d ''{"username":"alice","password":"wrong"}'' \
  https://musicdb-50nd.onrender.com/auth/login

# expected: 401
```

If all three return the expected output, the React app will log in, store the JWT via `persistAuth`, mount the dashboard through `AuthGate`, and successfully read & write data through the axios interceptor.

---

## 11. Quick reference — file-to-behavior map

| Behavior | Frontend file | Backend requirement |
| --- | --- | --- |
| Validate username/password before POST | `src/auth/validateInput.js` | Re-validate identically on the server. |
| POST `/auth/login` w/ `Content-Type: application/json` | `src/auth/authSlice.js` (`loginUser`) | Implement matching endpoint. |
| Read `response.data.token` & `response.data.user` | `src/auth/authSlice.js` | Return both keys (and optional `expiresIn`). |
| Persist JWT in localStorage | `src/auth/storage.js` (`persistAuth`) | None — purely client-side. |
| Attach `Authorization: Bearer <jwt>` to every axios call | `src/auth/axiosAuth.js` (`installAxiosAuth`) | Validate Bearer on every protected route. |
| Show dashboard when `token` is truthy | `src/componets/AuthGate/AuthGate.js` | None on the backend. |
| Render `user.username` and `user.role` in the header | `src/componets/AuthGate/AuthGate.js` | Include both fields in the `user` object. |
| Render form-level error from `response.data.message` | `src/auth/authSlice.js` (`loginUser.rejected`) | Return `message` on errors. |
| Clear state on logout | `src/auth/authSlice.js` (`logoutUser`) + `clearAuth()` | None required (no `/auth/logout` call). |

