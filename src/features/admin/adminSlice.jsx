// File: src/features/admin/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = '/api/admin';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Async Thunks for CRUD Operations

// Login Admin
export const loginAdmin = createAsyncThunk('admin/login', async (credentials, thunkAPI) => {
    try {
        const res = await axios.post(`${API}/login`, credentials);
        localStorage.setItem('adminToken', res.data.token);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// Register Admin
export const registerAdmin = createAsyncThunk('admin/register', async (data, thunkAPI) => {
    try {
        const res = await axios.post(`${API}/register`, data);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// Fetch Admin Profile (current logged-in admin)
export const fetchAdminProfile = createAsyncThunk('admin/profile', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/profile`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// Fetch All Admins (requires authorization, e.g., superadmin)
export const fetchAllAdmins = createAsyncThunk('admin/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// Fetch a Single Admin by ID (requires authorization, e.g., superadmin)
export const fetchAdminById = createAsyncThunk('admin/fetchById', async (adminId, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/${adminId}`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// Update Admin Profile (current logged-in admin)
// Note: This is for the logged-in admin to update their OWN profile.
// For superadmin updating ANY admin, use updateAdminById.
export const updateAdminProfile = createAsyncThunk('admin/updateProfile', async (profileData, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/profile`, profileData, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// Update an Admin by ID (requires authorization, e.g., superadmin)
export const updateAdminById = createAsyncThunk('admin/updateById', async ({ id, data }, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/${id}`, data, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// Delete an Admin by ID (requires authorization, e.g., superadmin)
export const deleteAdmin = createAsyncThunk('admin/delete', async (adminId, thunkAPI) => {
    try {
        await axios.delete(`${API}/${adminId}`, getAuthHeaders());
        return adminId; // Return the ID of the deleted admin for state update
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// New: Toggle Admin Status (for superadmin to activate/deactivate other admins)
export const toggleAdminStatus = createAsyncThunk(
    'admin/toggleStatus',
    async ({ adminId, isActive }, thunkAPI) => {
        try {
            const res = await axios.put(`${API}/${adminId}`, { isActive }, getAuthHeaders());
            return res.data; // Should return the updated admin object
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
);


const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        admin: null, // Stores the currently logged-in admin's profile
        admins: [],  // Stores a list of all admins (for superadmin view)
        token: localStorage.getItem('adminToken') || null,
        loading: false,
        error: null,
        selectedAdmin: null, // For viewing/editing a specific admin by ID
    },
    reducers: {
        logoutAdmin(state) {
            state.admin = null;
            state.token = null;
            state.admins = [];
            state.selectedAdmin = null;
            localStorage.removeItem('adminToken');
        },
        clearAdminError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login Admin
            .addCase(loginAdmin.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.admin = action.payload.admin;
                state.token = action.payload.token;
                state.loading = false;
                state.error = null;
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Login failed.";
            })

            // Register Admin
            .addCase(registerAdmin.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerAdmin.fulfilled, (state, action) => {
                // Depending on your flow, you might want to log in the registered admin
                // or just add them to the list if a superadmin registered them.
                state.loading = false;
                state.error = null;
                // Example: if a superadmin registers, add to admins list
                if (action.payload.admin) {
                    state.admins.push(action.payload.admin);
                }
            })
            .addCase(registerAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Registration failed.";
            })

            // Fetch Admin Profile
            .addCase(fetchAdminProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAdminProfile.fulfilled, (state, action) => {
                state.admin = action.payload.admin; // Assuming payload has { message, admin }
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAdminProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch profile.";
                state.admin = null; // Clear admin if profile fetch fails (e.g., token expired)
                state.token = null;
                localStorage.removeItem('adminToken');
            })

            // Fetch All Admins
            .addCase(fetchAllAdmins.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllAdmins.fulfilled, (state, action) => {
                state.admins = action.payload.admins; // Assuming payload has { message, admins }
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAllAdmins.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch all admins.";
            })

            // Fetch Admin By ID
            .addCase(fetchAdminById.pending, (state) => { state.loading = true; state.error = null; state.selectedAdmin = null; })
            .addCase(fetchAdminById.fulfilled, (state, action) => {
                state.selectedAdmin = action.payload.admin; // Assuming payload has { message, admin }
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAdminById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch admin by ID.";
                state.selectedAdmin = null;
            })

            // Update Admin Profile (for logged-in admin)
            .addCase(updateAdminProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateAdminProfile.fulfilled, (state, action) => {
                state.admin = action.payload.admin; // Update the logged-in admin's profile
                state.loading = false;
                state.error = null;
            })
            .addCase(updateAdminProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update profile.";
            })

            // Update Admin By ID (for superadmin)
            .addCase(updateAdminById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateAdminById.fulfilled, (state, action) => {
                // Find and update the specific admin in the 'admins' array
                const index = state.admins.findIndex(admin => admin._id === action.payload.admin._id);
                if (index !== -1) {
                    state.admins[index] = action.payload.admin;
                }
                // If the updated admin is the currently selected one, update it too
                if (state.selectedAdmin && state.selectedAdmin._id === action.payload.admin._id) {
                    state.selectedAdmin = action.payload.admin;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(updateAdminById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update admin by ID.";
            })

            // Delete Admin
            .addCase(deleteAdmin.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteAdmin.fulfilled, (state, action) => {
                // Remove the deleted admin from the 'admins' array
                state.admins = state.admins.filter(admin => admin._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete admin.";
            })

            // Toggle Admin Status (New)
            .addCase(toggleAdminStatus.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(toggleAdminStatus.fulfilled, (state, action) => {
                // Update the admin in the 'admins' list
                const index = state.admins.findIndex(admin => admin._id === action.payload.admin._id);
                if (index !== -1) {
                    state.admins[index] = action.payload.admin;
                }
                // If the toggled admin is the currently selected one, update it too
                if (state.selectedAdmin && state.selectedAdmin._id === action.payload.admin._id) {
                    state.selectedAdmin = action.payload.admin;
                }
                // If the toggled admin is the logged-in admin, update their status
                if (state.admin && state.admin._id === action.payload.admin._id) {
                    state.admin.isActive = action.payload.admin.isActive;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(toggleAdminStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to toggle admin status.";
            });
    },
});

export const { logoutAdmin, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
