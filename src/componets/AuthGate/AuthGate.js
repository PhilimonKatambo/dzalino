import { useDispatch, useSelector } from "react-redux";
import {
    logoutUser,
    selectAuth,
    selectIsAuthenticated,
} from "../../auth/authSlice";
import "./AuthGate.css";
import { NavLink, useNavigate } from "react-router-dom";

// AuthGate is the layout that wraps the dashboard once the user is signed
// in. Routing is handled by react-router-dom in App.js: when the visitor is
// unauthenticated the router renders <Login /> or <Register /> directly,
// so AuthGate only ever sees authenticated users. We still keep a defensive
// redirect to /login just in case the redux state is cleared while the
// dashboard is mounted.
export default function AuthGate({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { user } = useSelector(selectAuth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        navigate("/login", { replace: true });
        return null;
    }

    return (
        <div className="authgate-shell">
            <header className="authgate-header">
                <NavLink className="authgate-brand" to="/" aria-label="Dzalino dashboard">
                    <span className="authgate-brand-mark">D</span>
                    <span className="authgate-brand-copy">
                        <strong>Dzalino</strong>
                        <span>Operations</span>
                    </span>
                </NavLink>

                <nav className="authgate-nav" aria-label="Main navigation">
                    <NavLink to="/" end>Overview</NavLink>
                    <NavLink to="/transactions">Transactions</NavLink>
                    <NavLink to="/analytics">Analytics</NavLink>
                </nav>

                <div className="authgate-account">
                    <div className="authgate-user">
                        <span className="authgate-avatar" aria-hidden="true">
                            {(user && user.username ? user.username : "U").slice(0, 1).toUpperCase()}
                        </span>
                        <span className="authgate-user-details">
                            <span className="authgate-user-name">
                                {user && user.username ? user.username : "Signed in"}
                            </span>
                            {user && user.role ? (
                                <span className="authgate-user-role">{user.role}</span>
                            ) : null}
                        </span>
                    </div>
                    <div id="butts">
                        <button
                            type="button"
                            className="authgate-logout authgate-add-user"
                            onClick={() => navigate("/register")}
                        >
                            Add user
                        </button>
                        <button
                            type="button"
                            className="authgate-logout"
                            onClick={() => dispatch(logoutUser())}
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>
            <main className="authgate-main">{children}</main>
        </div>
    );
}
