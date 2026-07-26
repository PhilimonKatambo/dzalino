import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { readToken } from "./auth/storage";

// All four read endpoints (and the four POSTs in the input forms) are
// protected by the JWT the user received on login. The axios request
// interceptor installed by `installAxiosAuth` (see src/index.js) attaches
// `Authorization: Bearer <jwt>` to every outgoing request automatically,
// so we do NOT set a static `authorization` header here. We still bail
// out early if the user is signed out so the rest of the app does not
// have to handle "anonymous request" surprises.

const EXPENSE_URL = `${process.env.REACT_APP_BACKEND_URI}/expense/data`;
const TAKEN_URL   = `${process.env.REACT_APP_BACKEND_URI}/taken/data`;
const DRUMS_URL   = `${process.env.REACT_APP_BACKEND_URI}/drums/data`;
const PRODUCED_URL= `${process.env.REACT_APP_BACKEND_URI}/dailyProduce/data`;

function requireAuth() {
    if (!readToken()) {
        const err = new Error(
            "You are signed out. Please sign in again to load data."
        );
        err.code = "AUTH_REQUIRED";
        throw err;
    }
}

export const fetchExpenses = createAsyncThunk(
    "expenses/fetchExpenses",
    async () => {
        requireAuth();
        const response = await axios.get(EXPENSE_URL);
        return response.data;
    }
);

export const fetchTaken = createAsyncThunk(
    "taken/fetchExpenses",
    async () => {
        requireAuth();
        const response = await axios.get(TAKEN_URL);
        return response.data;
    }
);

export const fetchDrums = createAsyncThunk(
    "drums/fetchExpenses",
    async () => {
        requireAuth();
        const response = await axios.get(DRUMS_URL);
        return response.data;
    }
);

export const fetchProduced = createAsyncThunk(
    "produced/fetchExpenses",
    async () => {
        requireAuth();
        const response = await axios.get(PRODUCED_URL);
        return response.data;
    }
);

const expenseSlice = createSlice({
    name: "expenses",
    initialState: {
        expenses: [],
        taken: [],
        drums: [],
        produced: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error && action.error.message;
            })

            // taken
            .addCase(fetchTaken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTaken.fulfilled, (state, action) => {
                state.loading = false;
                state.taken = action.payload;
            })
            .addCase(fetchTaken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error && action.error.message;
            })

            // Drums
            .addCase(fetchDrums.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDrums.fulfilled, (state, action) => {
                state.loading = false;
                state.drums = action.payload;
            })
            .addCase(fetchDrums.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error && action.error.message;
            })

            // Produced
            .addCase(fetchProduced.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProduced.fulfilled, (state, action) => {
                state.loading = false;
                state.produced = action.payload;
            })
            .addCase(fetchProduced.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error && action.error.message;
            });
    },
});

export default expenseSlice.reducer;
