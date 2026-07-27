import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    registerUser,
    clearAuthErrors,
    clearRegistrationSuccess,
    setFieldError,
    selectAuth,
    selectIsAuthenticated,
    validateEmail,
    validateRegistration,
} from "../../auth/authSlice";
import {
    validateUsername,
    validatePassword,
    USERNAME_MIN,
    PASSWORD_MIN,
} from "../../auth/validateInput";
import "./register.css";

export default function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { loading, busy, errors, fieldErrors, registrationSuccess } =
        useSelector(selectAuth);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const usernameRef = useRef(null);

    useEffect(() => {
        dispatch(clearAuthErrors());
        dispatch(clearRegistrationSuccess());
        usernameRef.current && usernameRef.current.focus();
    }, [dispatch]);

    // If the user is already authenticated, send them straight to the
    // // dashboard rather than letting them create another account.
    // useEffect(() => {
    //     if (isAuthenticated) {
    //         const redirectTo = (location.state && location.state.from) || "/";
    //         navigate(redirectTo, { replace: true });
    //     }
    // }, [isAuthenticated, location.state, navigate]);

    // Once the account is created without an auto-sign-in, route the user
    // back to the login page so they can authenticate with their new
    // credentials.
    useEffect(() => {
        if (registrationSuccess) {
            navigate("/login", { replace: true });
        }
    }, [registrationSuccess, navigate]);

    const onUsernameChange = (e) => {
        const next = e.target.value;
        setUsername(next);
        if (fieldErrors.username) {
            dispatch(setFieldError({ field: "username", message: null }));
        }
    };

    const onEmailChange = (e) => {
        const next = e.target.value;
        setEmail(next);
        if (fieldErrors.email) {
            dispatch(setFieldError({ field: "email", message: null }));
        }
    };

    const onPasswordChange = (e) => {
        const next = e.target.value;
        setPassword(next);
        if (fieldErrors.password) {
            dispatch(setFieldError({ field: "password", message: null }));
        }
        if (confirmPassword && next !== confirmPassword && fieldErrors.confirmPassword) {
            dispatch(setFieldError({ field: "confirmPassword", message: null }));
        }
    };

    const onConfirmChange = (e) => {
        const next = e.target.value;
        setConfirmPassword(next);
        if (fieldErrors.confirmPassword) {
            dispatch(setFieldError({ field: "confirmPassword", message: null }));
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (loading) return;

        const u = validateUsername(username);
        const em = validateEmail(email);
        const p = validatePassword(password);
        if (!u.ok) dispatch(setFieldError({ field: "username", message: u.errors[0] }));
        if (!em.ok) dispatch(setFieldError({ field: "email", message: em.errors[0] }));
        if (!p.ok) dispatch(setFieldError({ field: "password", message: p.errors[0] }));
        if (!confirmPassword) {
            dispatch(setFieldError({ field: "confirmPassword", message: "Please confirm your password." }));
        } else if (p.value !== confirmPassword) {
            dispatch(setFieldError({ field: "confirmPassword", message: "Passwords do not match." }));
        }
        if (!u.ok || !em.ok || !p.ok || !confirmPassword || p.value !== confirmPassword) return;

        const combined = validateRegistration({ username, email, password, confirmPassword });
        if (!combined.ok) return;

        dispatch(
            registerUser({
                username: u.value,
                email: em.value,
                password: p.value,
                confirmPassword,
            })
        );
    };

    const submitDisabled = useMemo(
        () =>
            loading ||
            username.length === 0 ||
            email.length === 0 ||
            password.length === 0 ||
            confirmPassword.length === 0,
        [loading, username, email, password, confirmPassword]
    );

    const registering = busy === "register";

    return (
        <div className="register-page">
            <form className="register-card" onSubmit={onSubmit} noValidate autoComplete="on">
                <h1 className="register-title">Create your account</h1>
                <p className="register-subtitle">
                    Register a dzalino account so you can sign in from any device.
                </p>

                <label className="register-label" htmlFor="register-username">
                    Username
                </label>
                <input
                    id="register-username"
                    ref={usernameRef}
                    className="register-input"
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
                    onBlur={() => {
                        const u = validateUsername(username);
                        if (!u.ok) dispatch(setFieldError({ field: "username", message: u.errors[0] }));
                    }}
                    aria-invalid={Boolean(fieldErrors.username)}
                    aria-describedby="register-username-error"
                />
                <div id="register-username-error" className="register-error" role="alert">
                    {fieldErrors.username || ""}
                </div>

                <label className="register-label" htmlFor="register-email">
                    Email
                </label>
                <input
                    id="register-email"
                    className="register-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    required
                    maxLength={254}
                    value={email}
                    onChange={onEmailChange}
                    onBlur={() => {
                        const em = validateEmail(email);
                        if (!em.ok) dispatch(setFieldError({ field: "email", message: em.errors[0] }));
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby="register-email-error"
                />
                <div id="register-email-error" className="register-error" role="alert">
                    {fieldErrors.email || ""}
                </div>

                <label className="register-label" htmlFor="register-password">
                    Password
                </label>
                <div className="register-password-row">
                    <input
                        id="register-password"
                        className="register-input"
                        type={showPassword ? "text" : "password"}
                        name="new-password"
                        autoComplete="new-password"
                        required
                        minLength={PASSWORD_MIN}
                        maxLength={128}
                        value={password}
                        onChange={onPasswordChange}
                        onBlur={() => {
                            const p = validatePassword(password);
                            if (!p.ok) dispatch(setFieldError({ field: "password", message: p.errors[0] }));
                        }}
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby="register-password-error"
                    />
                    <button
                        type="button"
                        className="register-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                <div id="register-password-error" className="register-error" role="alert">
                    {fieldErrors.password || ""}
                </div>

                <label className="register-label" htmlFor="register-confirm">
                    Confirm password
                </label>
                <input
                    id="register-confirm"
                    className="register-input"
                    type={showPassword ? "text" : "password"}
                    name="confirm-password"
                    autoComplete="new-password"
                    required
                    minLength={PASSWORD_MIN}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={onConfirmChange}
                    onBlur={() => {
                        if (!confirmPassword) {
                            dispatch(setFieldError({ field: "confirmPassword", message: "Please confirm your password." }));
                        } else if (password !== confirmPassword) {
                            dispatch(setFieldError({ field: "confirmPassword", message: "Passwords do not match." }));
                        }
                    }}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby="register-confirm-error"
                />
                <div id="register-confirm-error" className="register-error" role="alert">
                    {fieldErrors.confirmPassword || ""}
                </div>

                {fieldErrors.form ? (
                    <div className="register-form-error" role="alert">
                        {fieldErrors.form}
                    </div>
                ) : null}

                {errors && errors.length && !fieldErrors.form ? (
                    <div className="register-form-error" role="alert">
                        {errors.join(" ")}
                    </div>
                ) : null}

                <button
                    type="submit"
                    className="register-submit"
                    disabled={submitDisabled}
                    aria-busy={registering}
                >
                    {registering ? "Creating account..." : "Create account"}
                </button>

                <div className="register-switch">
                    Already have an account?{" "}
                    <Link to="/login" className="register-switch-link">
                        Sign in
                    </Link>
                </div>

                <ul className="register-hints" aria-live="polite">
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
