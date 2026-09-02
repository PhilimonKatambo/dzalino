import "./App.css";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
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
import { ArrowBigLeft, X } from "lucide-react";
import $ from "jquery";
import "jquery-ui-dist/jquery-ui";
import BalanceInput from "./componets/BalanceInput";
import TripInput from "./componets/tripInput";

function Dashboard() {
    const dispatch = useDispatch();
    const [showInputs, setShowInputs] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        if (showInputs && inputRef.current) {
            // Use a small timeout to ensure DOM is fully painted and jQuery UI is attached
            const timer = setTimeout(() => {
                if (inputRef.current && $.fn && $.fn.draggable) {
                    $(inputRef.current).draggable({
                        handle: ".eiHeader",
                        containment: "window"
                    });
                } else {
                    console.error("jQuery UI draggable not loaded yet");
                }
            }, 50);
            return () => clearTimeout(timer);
        }
        dispatch(fetchExpenses());
        dispatch(fetchTaken());
        dispatch(fetchDrums());
        dispatch(fetchProduced());
        dispatch(fetchBalances());
        dispatch(fetchTrips());
        dispatch(fetchReturns());

    }, [dispatch, showInputs]);

    return (
        <div id="home">
            <button id="float" onClick={() => {
                setShowInputs(prev => !prev)
            }}>
                {
                    showInputs ? <X /> : <ArrowBigLeft />
                }
                {/* <div>Input</div> */}
            </button>
             
            <Cards />
            <BalanceInput />
            {
                showInputs && <div id="expenses" style={{}} ref={inputRef}>
                    <ExpenseInput />
                    <TakenInput />
                    <DrumsInput />
                    <ProducedInput />
                    <ReturnInput />
                    <TripInput />
                </div>
            }
            <Calculations />
            <div id="downExp">
                <AllExpense />
                <AllSold />
                <AllProduced />
                <AllDrums />
                <AllBalances />
                <AllTrips />
                <AllReturn />
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
