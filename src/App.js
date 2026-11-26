import "./App.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
    Outlet,
} from "react-router-dom";
import {
    fetchExpenses,
    fetchTaken,
    fetchDrums,
    fetchProduced,
    fetchTrips,
    fetchReturns
} from "./expenseSlice";
import { fetchBalances } from "./balancesSlice";
import Cards from "./componets/cards";
import Charts from "./componets/charts";
import ExpenseInput from "./componets/expenseInput";
import TakenInput from "./componets/takenInput";
import ReturnInput from "./componets/returncls";
import DrumsInput from "./componets/drumsInput";
import ProducedInput from "./componets/producedInput";
import Calculations from "./componets/Calculations";
import AllExpense from "./allExpense";
import AllSold from "./allSold";
import AllProduced from "./allProduced";
import AllDrums from "./allDrums";
import AllBalances from "./AllBalances";
import AllTrips from "./AllTrips";
import AllReturn from "./allReturn";
import AuthGate from "./componets/AuthGate/AuthGate";
import Login from "./componets/Login/login";
import Register from "./componets/Register/register";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./auth/authSlice";
import { Plus, X } from "lucide-react";
import BalanceInput from "./componets/BalanceInput";
import TripInput from "./componets/tripInput";

function Dashboard({ page }) {
    const [showInputs, setShowInputs] = useState(false);

    useEffect(() => {
        if (!showInputs) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") setShowInputs(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showInputs]);

    const pageDetails = {
        overview: { eyebrow: "OPERATIONS OVERVIEW", title: "Inventory overview" },
        transactions: { eyebrow: "RECORDS MANAGEMENT", title: "Transaction records" },
        analytics: { eyebrow: "REPORTING", title: "Expense analytics" }
    }[page];

    return (
        <div id="home">
            <section className="dashboard-intro">
                <div className="dashboard-intro-copy">
                    <div className="section-eyebrow">{pageDetails.eyebrow}</div>
                    <h1 id="page-title">{pageDetails.title}</h1>
                </div>
                <div className="dashboard-intro-actions">
                    <span className="dashboard-date">
                        {new Date().toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}
                    </span>
                    <button
                        type="button"
                        className="primary-action"
                        onClick={() => setShowInputs(true)}
                    >
                        <Plus size={18} />
                        New transaction
                    </button>
                </div>
            </section>

            {page === "overview" && (
                <>
                    <section className="dashboard-section" aria-labelledby="overview-title">
                        <div className="section-heading">
                            <div>
                                <h2 id="overview-title">Business snapshot</h2>
                            </div>
                        </div>
                        <Cards />
                    </section>
                    <section className="dashboard-section" aria-labelledby="overview-production-title">
                        <div className="section-heading">
                            <div>
                                <h2 id="overview-production-title">Production cost model</h2>
                            </div>
                        </div>
                        <Calculations />
                    </section>
                </>
            )}


            {page === "transactions" && (
                <section className="dashboard-section" aria-label="Transaction records">
                    <div id="downExp">
                        <AllBalances />
                        <AllExpense />
                        <AllSold />
                        <AllProduced />
                        <AllDrums />
                        <AllTrips />
                        <AllReturn />
                    </div>
                </section>
            )}

            {page === "analytics" && (
                <section className="dashboard-section" aria-label="Analytics">
                    <Charts />
                </section>
            )}

            {showInputs && (
                <div
                    className="entry-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setShowInputs(false);
                    }}
                >
                    <section
                        id="expenses"
                        className="entry-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="entry-modal-title"
                    >
                        <div className="entry-modal-header">
                            <div>
                                <div className="section-eyebrow">QUICK ENTRY</div>
                                <h2 id="entry-modal-title">Add a transaction</h2>
                                <p>Choose a record type to expand its entry form.</p>
                            </div>
                            <button
                                type="button"
                                className="icon-button"
                                aria-label="Close transaction entry"
                                onClick={() => setShowInputs(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="entry-modal-content">
                            <ExpenseInput />
                            <TakenInput />
                            <DrumsInput />
                            <ProducedInput />
                            <ReturnInput />
                            <TripInput />
                            <BalanceInput />
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

// Wrapper that protects the dashboard: unauthenticated visitors are
// redirected to /login while keeping the originally requested URL so we
// can return them there after they sign in.
function ProtectedDashboard() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) return;
        dispatch(fetchExpenses());
        dispatch(fetchTaken());
        dispatch(fetchDrums());
        dispatch(fetchProduced());
        dispatch(fetchBalances());
        dispatch(fetchTrips());
        dispatch(fetchReturns());
    }, [dispatch, isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
        <AuthGate>
            <Outlet />
        </AuthGate>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedDashboard />}>
                    <Route index element={<Dashboard page="overview" />} />
                    <Route path="transactions" element={<Dashboard page="transactions" />} />
                    <Route path="analytics" element={<Dashboard page="analytics" />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
