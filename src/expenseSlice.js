import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const Expense_URL = `${process.env.REACT_APP_BACKEND_URI}/expense/data`;
const Taken_URL = `${process.env.REACT_APP_BACKEND_URI}/taken/data`;
const Drums_URL = `${process.env.REACT_APP_BACKEND_URI}/drums/data`;
const Produced_URL = `${process.env.REACT_APP_BACKEND_URI}/dailyProduce/data`;

export const fetchExpenses = createAsyncThunk(
    "expenses/fetchExpenses",
    async () => {
        const response = await axios.get(
            Expense_URL,
            {
                headers:{
                    authorization: "jsy7392#9%$ya$D!2@£$34",
                }
            }
        );
        return response.data;
    }
);

export const fetchTaken = createAsyncThunk(
    "taken/fetchExpenses",
    async () => {
        const response = await axios.get(Taken_URL,{
                headers:{
                    authorization: "jsy7392#9%$ya$D!2@£$34",
                }
            });
        return response.data;
    }
);
export const fetchDrums = createAsyncThunk(
    "drums/fetchExpenses",
    async () => {
        const response = await axios.get(Drums_URL,
            {
                headers:{
                    authorization: "jsy7392#9%$ya$D!2@£$34",
                }
            }
        );
        return response.data;
    }
);
export const fetchProduced = createAsyncThunk(
    "produced/fetchExpenses",
    async () => {
        const response = await axios.get(Produced_URL,{
                headers:{
                    authorization: "jsy7392#9%$ya$D!2@£$34",
                }
            });
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
        error: null
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

            //Drums
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

            //Sold
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
    }
});

export default expenseSlice.reducer;
