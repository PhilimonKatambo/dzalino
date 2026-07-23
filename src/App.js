import { useDispatch } from "react-redux";
import "./App.css";
import { useEffect } from "react";
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


function App() {

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

export default App;

