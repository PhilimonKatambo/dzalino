import { configureStore } from "@reduxjs/toolkit";
import expenseReducer from "./expenseSlice";
import authReducer from "./auth/authSlice";

export const store = configureStore({
    reducer: {
        expenses: expenseReducer,
        auth: authReducer,
    },
});