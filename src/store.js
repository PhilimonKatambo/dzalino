
import { configureStore } from '@reduxjs/toolkit';
import expenseReducer from './expenseSlice';
import authReducer from './auth/authSlice';
import balancesReducer from './balancesSlice';

export const store = configureStore({
    reducer: {
        expenses: expenseReducer,
        auth: authReducer,
        balances: balancesReducer,
    },
});

