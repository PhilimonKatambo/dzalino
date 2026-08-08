import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { readToken } from "./auth/storage";


const EXPENSE_URL = `${process.env.REACT_APP_BACKEND_URI}/expense/data`;
const TAKEN_URL   = `${process.env.REACT_APP_BACKEND_URI}/taken/data`;
const DRUMS_URL   = `${process.env.REACT_APP_BACKEND_URI}/drums/data`;
const PRODUCED_URL= `${process.env.REACT_APP_BACKEND_URI}/dailyProduce/data`;
const TRIP_URL    = `${process.env.REACT_APP_BACKEND_URI}/trip/data`;

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

export const fetchTrips = createAsyncThunk(
    "trips/fetchExpenses",
    async () => {
        requireAuth();
        const response = await axios.get(TRIP_URL);
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
        trips: [],
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
            })

            // Trips
            .addCase(fetchTrips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.trips = action.payload;
            })
            .addCase(fetchTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error && action.error.message;
            });
    },
});

export default expenseSlice.reducer;
