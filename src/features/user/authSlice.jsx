import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- Async Thunks for API Interaction ---

// Handles user login by sending identifier (email/phone) and password.
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ identifier, password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`https://bluxurybackend.onrender.com/api/auth/login`, { identifier, password });
            const token = res.data.token;
            localStorage.setItem('token', token); // Use localStorage

            const profileRes = await axios.get(`https://bluxurybackend.onrender.com/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const user = { ...profileRes.data.user, token };
            localStorage.setItem('user', JSON.stringify(user)); // Use localStorage
            return user;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            return rejectWithValue(errorMessage);
        }
    }
);

// Fetches user profile if a token exists in storage (for session persistence).
export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token'); // Use localStorage
            if (!token) return rejectWithValue('No token found, please log in.');

            const res = await axios.get(`https://bluxurybackend.onrender.com/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const user = { ...res.data.user, token };
            localStorage.setItem('user', JSON.stringify(user)); // Use localStorage
            return user;
        } catch (err) {
            localStorage.removeItem('user'); // Use localStorage
            localStorage.removeItem('token'); // Use localStorage
            return rejectWithValue(err.response?.data?.message || 'Session expired. Please log in again.');
        }
    }
);

// Updates the user's profile data on the server.
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (formData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.user?.token;
            if (!token) return rejectWithValue('Authentication token not found.');

            const res = await axios.put(`https://bluxurybackend.onrender.com/api/auth/update`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const updatedUser = { ...res.data.user, token };
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Use localStorage
            return updatedUser;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Update failed.');
        }
    }
);


// --- Initial State ---
const initialState = {
    user: null,
    loading: false,
    error: null,
};


// --- Auth Slice Definition ---
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.error = null;
            state.loading = false;
            localStorage.removeItem('user'); // Use localStorage
            localStorage.removeItem('token'); // Use localStorage
        },
    },
    extraReducers: (builder) => {
        builder
            // Login Lifecycle
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Profile Lifecycle (for app startup)
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.user = null;
            })
            // Update Profile Lifecycle
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
