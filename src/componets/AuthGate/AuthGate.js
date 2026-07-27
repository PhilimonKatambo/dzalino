import { useDispatch, useSelector } from "react-redux";
import {
    logoutUser,
    selectAuth,
    selectIsAuthenticated,
} from "../../auth/authSlice";
import "./AuthGate.css";
import { useNavigate } from "react-router-dom";

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
                <div className="authgate-user">
                    {user && user.username ? (
                        <>
                            <span className="authgate-user-name">
                                {user.username}
                            </span>
                            {user.role ? (
                                <span className="authgate-user-role">
                                    {user.role}
                                </span>
                            ) : null}
                        </>
                    ) : (
                        <span className="authgate-user-name">Signed in</span>
                    )}
                </div>
                <div id="butts">
                    <button
                        type="button"
                        className="authgate-logout"
                        onClick={() => navigate("/register")}
                    >
                        Add User
                    </button>
                    <button
                        type="button"
                        className="authgate-logout"
                        onClick={() => dispatch(logoutUser())}
                    >
                        Sign out
                    </button>
                </div>
            </header>
            <main className="authgate-main">{children}</main>
        </div>
    );
}
