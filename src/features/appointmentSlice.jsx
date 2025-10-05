import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "/api/appointments";

// Helper function to get the user's authentication token
const getToken = () => localStorage.getItem("token");

// --- Async Thunks ---

// Thunk to book a new appointment.
export const bookNewAppointment = createAsyncThunk(
    'appointments/book',
    async (appointmentData, { rejectWithValue }) => {
        try {
            const token = getToken();
            if (!token) {
                return rejectWithValue("Authentication token not found.");
            }
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.post(`${API_BASE_URL}`, appointmentData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to book appointment.");
        }
    }
);

// Thunk to fetch a user's appointments.
// This now uses the new /user/:userId route from your backend.
export const fetchUserAppointments = createAsyncThunk(
    'appointments/fetchUserAppointments',
    async (userId, { rejectWithValue }) => {
        try {
            const token = getToken();
            if (!token) {
                return rejectWithValue("Authentication token not found.");
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get(`${API_BASE_URL}/user/${userId}`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user appointments.");
        }
    }
);

// Thunk to fetch a vendor's appointments.
export const fetchVendorAppointments = createAsyncThunk(
    'appointments/fetchVendorAppointments',
    async (vendorId, { rejectWithValue }) => {
        try {
            const token = getToken();
            if (!token) {
                return rejectWithValue("Authentication token not found.");
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get(`${API_BASE_URL}/vendor/${vendorId}`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch vendor appointments.");
        }
    }
);

// --- Initial State ---
const initialState = {
    userAppointments: [],
    vendorAppointments: [],
    loading: false,
    error: null,
};

// --- Slice Definition ---
const appointmentSlice = createSlice({
    name: "appointments",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle bookNewAppointment
            .addCase(bookNewAppointment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bookNewAppointment.fulfilled, (state, action) => {
                state.loading = false;
                state.userAppointments.push(action.payload);
            })
            .addCase(bookNewAppointment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Handle fetchUserAppointments
            .addCase(fetchUserAppointments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.userAppointments = action.payload;
            })
            .addCase(fetchUserAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Handle fetchVendorAppointments
            .addCase(fetchVendorAppointments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.vendorAppointments = action.payload;
            })
            .addCase(fetchVendorAppointments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer;