import { configureStore } from "@reduxjs/toolkit";
import expenseReducer from "./expenseSlice";

export const store = configureStore({
    reducer:{
        expenses: expenseReducer,
    }
})