
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { readToken } from './auth/storage';

const BALANCE_URL = `${process.env.REACT_APP_BACKEND_URI}/balance/data`;

function requireAuth() {
    if (!readToken()) {
        const err = new Error(
            'You are signed out. Please sign in again to load data.'
        );
        err.code = 'AUTH_REQUIRED';
        throw err;
    }
}

export const fetchBalances = createAsyncThunk(
    'balances/fetchBalances',
    async () => {
        requireAuth();
        const response = await axios.get(BALANCE_URL);
        return response.data;
    }
);

const balancesSlice = createSlice({
    name: 'balances',
    initialState: {
        balances: [],
        loading: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBalances.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(fetchBalances.fulfilled, (state, action) => {
                state.loading = 'idle';
                state.balances = action.payload;
            })
            .addCase(fetchBalances.rejected, (state, action) => {
                state.loading = 'idle';
                state.error = action.error.message;
            });
    },
});

export const selectAllBalances = (state) => state.balances.balances;
export const selectBalancesLoading = (state) => state.balances.loading;
export const selectBalancesError = (state) => state.balances.error;

export default balancesSlice.reducer;

