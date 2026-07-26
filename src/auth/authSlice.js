import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
    persistAuth,
    readToken,
    readUser,
    clearAuth,
} from "./storage";
import { validateCredentials } from "./validateInput";

const LOGIN_URL = `${process.env.REACT_APP_BACKEND_URI}/auth/login`;
const REGISTER_URL = `${process.env.REACT_APP_BACKEND_URI}/auth/register`;

const initialUser = readUser();
const initialToken = readToken();

// Basic email sanity check. The backend MUST still validate; this is only
// a defense-in-depth layer so the form can short-circuit obvious mistakes
// before we hit the network. We intentionally keep it permissive: a real
// RFC-5322 regex is enormous and we'd rather reject a few odd-but-valid
// addresses than ship a half-correct regex.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_REGEX = /[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/;

export function validateEmail(raw) {
    if (raw == null || String(raw).trim().length === 0) {
        return { ok: false, value: "", errors: ["Email is required."] };
    }
    const value = String(raw).trim();
    const errors = [];
    if (value.length > 254) {
        errors.push("Email must be at most 254 characters.");
    }
    if (CONTROL_REGEX.test(value)) {
        errors.push("Email contains invalid control characters.");
    }
    if (!EMAIL_REGEX.test(value)) {
        errors.push("Enter a valid email address.");
    }
    return { ok: errors.length === 0, value, errors };
}

export function validateRegistration({ username, email, password, confirmPassword }) {
    const sanitized = validateCredentials(username, password);
    const emailCheck = validateEmail(email);
    const errors = [...sanitized.errors, ...emailCheck.errors];

    if (confirmPassword != null && String(confirmPassword).length > 0) {
        if (sanitized.password !== String(confirmPassword)) {
            errors.push("Passwords do not match.");
        }
    } else {
        errors.push("Please confirm your password.");
    }

    return {
        ok: sanitized.ok && emailCheck.ok && errors.length === sanitized.errors.length + emailCheck.errors.length,
        username: sanitized.username,
        email: emailCheck.value,
        password: sanitized.password,
        errors,
    };
}

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ username, password }, { rejectWithValue }) => {
        const sanitized = validateCredentials(username, password);
        if (!sanitized.ok) {
            return rejectWithValue({
                kind: "client-validation",
                errors: sanitized.errors,
            });
        }

        try {
            const response = await axios.post(
                LOGIN_URL,
                {
                    username: sanitized.username,
                    password: sanitized.password,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: 15000,
                }
            );

            const { token, user, expiresIn } = response.data || {};
            if (!token || !user) {
                return rejectWithValue({
                    kind: "server-shape",
                    errors: ["Server returned an unexpected response."],
                });
            }

            persistAuth({ token, user, expiresInSeconds: expiresIn });
            return { token, user };
        } catch (err) {
            const status = err && err.response && err.response.status;
            const serverMsg =
                (err && err.response && err.response.data && err.response.data.message) ||
                err.message ||
                "Network error. Please try again.";
            return rejectWithValue({
                kind: status === 401 ? "unauthorized" : "network",
                errors: [serverMsg],
            });
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async ({ username, email, password, confirmPassword }, { rejectWithValue }) => {
        const sanitized = validateRegistration({ username, email, password, confirmPassword });
        if (!sanitized.ok) {
            return rejectWithValue({
                kind: "client-validation",
                errors: sanitized.errors,
            });
        }

        try {
            const response = await axios.post(
                REGISTER_URL,
                {
                    username: sanitized.username,
                    email: sanitized.email,
                    password: sanitized.password,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: 15000,
                }
            );

            const { token, user, expiresIn } = response.data || {};
            if (token && user) {
                persistAuth({ token, user, expiresInSeconds: expiresIn });
                return { token, user, autoSignedIn: true };
            }
            return { token: null, user: null, autoSignedIn: false };
        } catch (err) {
            const status = err && err.response && err.response.status;
            const serverMsg =
                (err && err.response && err.response.data && err.response.data.message) ||
                err.message ||
                "Network error. Please try again.";
            return rejectWithValue({
                kind:
                    status === 409
                        ? "conflict"
                        : status === 401
                        ? "unauthorized"
                        : "network",
                errors: [serverMsg],
            });
        }
    }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    clearAuth();
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: initialUser || null,
        token: initialToken || null,
        loading: false,
        busy: null,
        fieldErrors: {
            username: null,
            email: null,
            password: null,
            confirmPassword: null,
            form: null,
        },
        errors: [],
        registrationSuccess: false,
    },
    reducers: {
        clearAuthErrors(state) {
            state.errors = [];
            state.fieldErrors = {
                username: null,
                email: null,
                password: null,
                confirmPassword: null,
                form: null,
            };
        },
        clearRegistrationSuccess(state) {
            state.registrationSuccess = false;
        },
        setFieldError(state, action) {
            const { field, message } = action.payload || {};
            if (field && field in state.fieldErrors) {
                state.fieldErrors[field] = message || null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.busy = "login";
                state.errors = [];
                state.fieldErrors = {
                    username: null,
                    email: null,
                    password: null,
                    confirmPassword: null,
                    form: null,
                };
                state.registrationSuccess = false;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.busy = null;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.errors = [];
                state.fieldErrors = {
                    username: null,
                    email: null,
                    password: null,
                    confirmPassword: null,
                    form: null,
                };
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.busy = null;
                state.token = null;
                state.user = null;
                const payload = action.payload || {};
                state.errors = payload.errors || ["Login failed."];
                state.fieldErrors = {
                    username:
                        payload.kind === "client-validation"
                            ? state.fieldErrors.username
                            : null,
                    email: null,
                    password:
                        payload.kind === "client-validation"
                            ? state.fieldErrors.password
                            : null,
                    confirmPassword: null,
                    form:
                        payload.kind && payload.kind !== "client-validation"
                            ? (payload.errors || ["Login failed."]).join(" ")
                            : null,
                };
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.busy = "register";
                state.errors = [];
                state.fieldErrors = {
                    username: null,
                    email: null,
                    password: null,
                    confirmPassword: null,
                    form: null,
                };
                state.registrationSuccess = false;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.busy = null;
                if (action.payload && action.payload.autoSignedIn) {
                    state.token = action.payload.token;
                    state.user = action.payload.user;
                } else {
                    state.token = null;
                    state.user = null;
                }
                state.errors = [];
                state.fieldErrors = {
                    username: null,
                    email: null,
                    password: null,
                    confirmPassword: null,
                    form: null,
                };
                state.registrationSuccess = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.busy = null;
                state.token = null;
                state.user = null;
                const payload = action.payload || {};
                state.errors = payload.errors || ["Registration failed."];
                state.fieldErrors = {
                    username:
                        payload.kind === "client-validation"
                            ? state.fieldErrors.username
                            : null,
                    email:
                        payload.kind === "client-validation"
                            ? state.fieldErrors.email
                            : null,
                    password:
                        payload.kind === "client-validation"
                            ? state.fieldErrors.password
                            : null,
                    confirmPassword:
                        payload.kind === "client-validation"
                            ? state.fieldErrors.confirmPassword
                            : null,
                    form:
                        payload.kind && payload.kind !== "client-validation"
                            ? (payload.errors || ["Registration failed."]).join(" ")
                            : null,
                };
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                state.errors = [];
                state.fieldErrors = {
                    username: null,
                    email: null,
                    password: null,
                    confirmPassword: null,
                    form: null,
                };
                state.registrationSuccess = false;
            });
    },
});

export const { clearAuthErrors, clearRegistrationSuccess, setFieldError } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => Boolean(state.auth && state.auth.token);
export const selectCurrentUser = (state) => (state.auth && state.auth.user) || null;