import "./App.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import { fetchExpenses, fetchTaken, fetchDrums, fetchProduced } from "./expenseSlice";
import Cards from "./componets/cards";
import Charts from "./componets/charts";
import ExpenseInput from "./componets/expenseInput";
import TakenInput from "./componets/takenInput";
import DrumsInput from "./componets/drumsInput";
import ProducedInput from "./componets/producedInput";
import Calculations from "./componets/Calculations";
import AllExpense from "./allExpense";
import AllSold from "./allSold";
import AllProduced from "./allProduced";
import AllDrums from "./allDrums";
import AuthGate from "./componets/AuthGate/AuthGate";
import Login from "./componets/Login/login";
import Register from "./componets/Register/register";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./auth/authSlice";

function Dashboard() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchExpenses());
        dispatch(fetchTaken());
        dispatch(fetchDrums());
        dispatch(fetchProduced());
    }, [dispatch]);

    return (
        <div id="home">
            <Cards />
            <div id="expenses">
                <ExpenseInput />
                <TakenInput />
                <DrumsInput />
                <ProducedInput />
            </div>
            <Calculations />
            <div id="downExp">
                <AllExpense />
                <AllSold />
                <AllProduced />
                <AllDrums />
                <Charts />
            </div>
        </div>
    );
}

// Wrapper that protects the dashboard: unauthenticated visitors are
// redirected to /login while keeping the originally requested URL so we
// can return them there after they sign in.
function ProtectedDashboard() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return (
        <AuthGate>
            <Dashboard />
        </AuthGate>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
