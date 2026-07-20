import { useSelector, useDispatch } from "react-redux";
import "./App.css";
import { useEffect } from "react";
import { fetchExpenses, fetchTaken,fetchDrums, fetchProduced } from "./expenseSlice";
import Cards from "./componets/cards";
import Charts from "./componets/charts";
import ExpenseInput from "./componets/expenseInput";
import TakenInput from "./componets/takenInput";
import AllExpense from "./allExpense";
import DrumsInput from "./componets/drumsInput";
import ProducedInput from "./componets/producedInput";
import Calculations from "./componets/Calculations";


function App() {

  const dispatch = useDispatch();

  const expenses = useSelector(
    (state) => state.expenses.expenses
  );


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
        <Charts />
      </div>
    </div>
  );
}

export default App;
