import { useDispatch, useSelector } from "react-redux";
import {
    logoutUser,
    selectAuth,
    selectIsAuthenticated,
} from "../../auth/authSlice";
import Login from "../Login/login";

// AuthGate renders the dashboard (children) when the user is signed in,
// otherwise it shows the Login page. It also wires a logout button into the
// dashboard so the user can clear the JWT and cookie.
export default function AuthGate({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { user } = useSelector(selectAuth);
    const dispatch = useDispatch();

    if (!isAuthenticated) {
        return <Login />;
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
                <button
                    type="button"
                    className="authgate-logout"
                    onClick={() => dispatch(logoutUser())}
                >
                    Sign out
                </button>
            </header>
            <main className="authgate-main">{children}</main>
        </div>
    );
}