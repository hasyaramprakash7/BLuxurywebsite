import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "/api/deliveryboy";

// ✅ Utility
const getDeliveryBoyToken = () => {
    const token = localStorage.getItem("deliveryBoyToken");
    return token && token !== "null" ? token : null;
};

// ✅ Register
export const registerDeliveryBoy = createAsyncThunk(
    "deliveryBoy/registerDeliveryBoy",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const token = res.data.token;
            localStorage.setItem("deliveryBoyToken", token);

            const profileRes = await axios.get(`${API_BASE}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return {
                deliveryBoy: profileRes.data.deliveryBoy,
                token,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Registration failed");
        }
    }
);

// ✅ Login
export const loginDeliveryBoy = createAsyncThunk(
    "deliveryBoy/loginDeliveryBoy",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/login`, { email, password });

            const token = res.data.token;
            localStorage.setItem("deliveryBoyToken", token);

            const profileRes = await axios.get(`${API_BASE}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return {
                deliveryBoy: profileRes.data.deliveryBoy,
                token,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Login failed");
        }
    }
);

// ✅ Fetch Profile
export const fetchDeliveryBoyProfile = createAsyncThunk(
    "deliveryBoy/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const token = getDeliveryBoyToken();
            if (!token) throw new Error("No valid token");

            const res = await axios.get(`${API_BASE}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return {
                deliveryBoy: res.data.deliveryBoy,
                token,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
        }
    }
);



// ✅ Update Profile
export const updateDeliveryBoyProfile = createAsyncThunk(
    "deliveryBoy/updateProfile",
    async (updatedData, { rejectWithValue }) => {
        try {
            const token = getDeliveryBoyToken();
            if (!token) throw new Error("No valid token");

            const formData = new FormData();
            for (const key in updatedData) {
                if (key === "address") {
                    formData.append("address", JSON.stringify(updatedData.address));
                } else if (key === "shopImageFile" && updatedData.shopImageFile) {
                    formData.append("shopImage", updatedData.shopImageFile);
                } else if (key !== "shopImage") {
                    formData.append(key, updatedData[key]);
                }
            }

            const res = await axios.put(`${API_BASE}/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            return {
                deliveryBoy: res.data.deliveryBoy,
                token,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Update failed");
        }
    }
);

// ✅ Fetch All
export const fetchAllDeliveryBoys = createAsyncThunk(
    "deliveryBoy/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_BASE}/all`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch delivery boys");
        }
    }
);

// ✅ Toggle Availability
export const toggleAvailability = createAsyncThunk(
    "deliveryBoy/toggleAvailability",
    async (_, { rejectWithValue }) => {
        try {
            const token = getDeliveryBoyToken();
            if (!token) throw new Error("No valid token");

            const res = await axios.patch(`${API_BASE}/toggle-availability`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return res.data.isAvailable;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to toggle availability");
        }
    }
);

export const assignDeliveryBoy = createAsyncThunk(
    "orders/assignDeliveryBoy",
    async ({ orderId, deliveryBoyId }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`/api/orders/${orderId}/assign`, {
                deliveryBoyId,
            });
            console.log(res);

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to assign delivery boy");
        }
    }
);

// ✅ Initial State
const initialState = {
    deliveryBoy: null,
    token: getDeliveryBoyToken(),
    loading: false,
    error: null,
    allDeliveryBoys: [],
};

// ✅ Slice
const deliveryBoyAuthSlice = createSlice({
    name: "deliveryBoyAuth",
    initialState,
    reducers: {
        setDeliveryBoy: (state, action) => {
            state.deliveryBoy = action.payload.deliveryBoy;
            state.token = action.payload.token;
            localStorage.setItem("deliveryBoyToken", action.payload.token);
        },
        logoutDeliveryBoy: (state) => {
            state.deliveryBoy = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem("deliveryBoyToken");
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerDeliveryBoy.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerDeliveryBoy.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryBoy = action.payload.deliveryBoy;
                state.token = action.payload.token;
            })
            .addCase(registerDeliveryBoy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Login
            .addCase(loginDeliveryBoy.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginDeliveryBoy.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryBoy = action.payload.deliveryBoy;
                state.token = action.payload.token;
            })
            .addCase(loginDeliveryBoy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Profile
            .addCase(fetchDeliveryBoyProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeliveryBoyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryBoy = action.payload.deliveryBoy;
                state.token = action.payload.token;
            })
            .addCase(fetchDeliveryBoyProfile.rejected, (state, action) => {
                state.loading = false;
                state.deliveryBoy = null;
                state.token = null;
                state.error = action.payload;
            })

            // Update Profile
            .addCase(updateDeliveryBoyProfile.fulfilled, (state, action) => {
                state.deliveryBoy = action.payload.deliveryBoy;
                state.token = action.payload.token;
            })
            .addCase(updateDeliveryBoyProfile.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Fetch All
            .addCase(fetchAllDeliveryBoys.fulfilled, (state, action) => {
                state.allDeliveryBoys = action.payload;
            })
            .addCase(fetchAllDeliveryBoys.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Toggle Availability
            .addCase(toggleAvailability.fulfilled, (state, action) => {
                if (state.deliveryBoy) {
                    state.deliveryBoy.isAvailable = action.payload;
                }
            })
            .addCase(toggleAvailability.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setDeliveryBoy, logoutDeliveryBoy } = deliveryBoyAuthSlice.actions;
export default deliveryBoyAuthSlice.reducer;
