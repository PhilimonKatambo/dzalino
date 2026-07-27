import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    loginUser,
    clearAuthErrors,
    setFieldError,
    selectAuth,
    selectIsAuthenticated,
} from "../../auth/authSlice";
import {
    validateUsername,
    validatePassword,
    USERNAME_MIN,
    PASSWORD_MIN,
} from "../../auth/validateInput";
import "./login.css";

// Standalone sign-in page. No longer renders <Register /> itself; navigation
// to the registration page is handled by react-router-dom. When the user is
// already signed in we redirect them to the dashboard so refreshing the
// /login route is safe.
export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { loading, errors, fieldErrors } = useSelector(selectAuth);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const usernameRef = useRef(null);

    useEffect(() => {
        dispatch(clearAuthErrors());
        usernameRef.current && usernameRef.current.focus();
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            const redirectTo = (location.state && location.state.from) || "/";
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, location.state, navigate]);

    const handlePaste = (field, event) => {
        const text = event.clipboardData && event.clipboardData.getData("text");
        if (!text) return;
        const validator = field === "username" ? validateUsername : validatePassword;
        const result = validator(text);
        if (!result.ok) {
            event.preventDefault();
            dispatch(setFieldError({ field, message: result.errors[0] }));
        }
    };

    const onUsernameChange = (e) => {
        const next = e.target.value;
        setUsername(next);
        if (fieldErrors.username) {
            dispatch(setFieldError({ field: "username", message: null }));
        }
    };

    const onPasswordChange = (e) => {
        const next = e.target.value;
        setPassword(next);
        if (fieldErrors.password) {
            dispatch(setFieldError({ field: "password", message: null }));
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (loading) return;
        const u = validateUsername(username);
        const p = validatePassword(password);
        if (!u.ok) dispatch(setFieldError({ field: "username", message: u.errors[0] }));
        if (!p.ok) dispatch(setFieldError({ field: "password", message: p.errors[0] }));
        if (!u.ok || !p.ok) return;
        dispatch(loginUser({ username: u.value, password: p.value }));
    };

    const submitDisabled = useMemo(
        () => loading || username.length === 0 || password.length === 0,
        [loading, username, password]
    );

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={onSubmit} noValidate autoComplete="on">
                <h1 className="login-title">Sign in</h1>
                <p className="login-subtitle">
                    Use your dzalino credentials to access the dashboard.
                </p>

                <label className="login-label" htmlFor="login-username">
                    Username
                </label>
                <input
                    id="login-username"
                    ref={usernameRef}
                    className="login-input"
                    type="text"
                    name="username"
                    autoComplete="username"
                    inputMode="text"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    required
                    minLength={USERNAME_MIN}
                    maxLength={32}
                    value={username}
                    onChange={onUsernameChange}
                    onPaste={(e) => handlePaste("username", e)}
                    onBlur={() => {
                        const u = validateUsername(username);
                        if (!u.ok) dispatch(setFieldError({ field: "username", message: u.errors[0] }));
                    }}
                    aria-invalid={Boolean(fieldErrors.username)}
                    aria-describedby="login-username-error"
                />
                <div id="login-username-error" className="login-error" role="alert">
                    {fieldErrors.username || ""}
                </div>

                <label className="login-label" htmlFor="login-password">
                    Password
                </label>
                <div className="login-password-row">
                    <input
                        id="login-password"
                        className="login-input"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        required
                        minLength={PASSWORD_MIN}
                        maxLength={128}
                        value={password}
                        onChange={onPasswordChange}
                        onPaste={(e) => handlePaste("password", e)}
                        onBlur={() => {
                            const p = validatePassword(password);
                            if (!p.ok) dispatch(setFieldError({ field: "password", message: p.errors[0] }));
                        }}
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby="login-password-error"
                    />
                    <button
                        type="button"
                        className="login-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                <div id="login-password-error" className="login-error" role="alert">
                    {fieldErrors.password || ""}
                </div>

                {fieldErrors.form ? (
                    <div className="login-form-error" role="alert">
                        {fieldErrors.form}
                    </div>
                ) : null}

                {errors && errors.length && !fieldErrors.form ? (
                    <div className="login-form-error" role="alert">
                        {errors.join(" ")}
                    </div>
                ) : null}

                <button
                    type="submit"
                    className="login-submit"
                    disabled={submitDisabled}
                    aria-busy={loading}
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                {/* <div className="login-switch">
                    New to dzalino?{" "}
                    <Link to="/register" className="login-switch-link">
                        Create an account
                    </Link>
                </div> */}

                <ul className="login-hints" aria-live="polite">
                    <li>
                        Username: {USERNAME_MIN}-32 characters, letters, digits, dot,
                        underscore, hyphen, or @.
                    </li>
                    <li>
                        Password: at least {PASSWORD_MIN} characters. Emoji and SQL
                        meta-characters are not allowed.
                    </li>
                </ul>
            </form>
        </div>
    );
}
