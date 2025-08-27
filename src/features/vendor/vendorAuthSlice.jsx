import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ API base URL
const API_BASE = "/api/vendors";

// ✅ Utility to get token safely from localStorage
const getVendorToken = () => {
    const token = localStorage.getItem("vendorToken");
    return token && token !== "null" ? token : null;
};

// --- ASYNC THUNKS ---

// ✅ Register Vendor
export const registerVendor = createAsyncThunk(
    "vendor/registerVendor",
    async (formData, { rejectWithValue }) => {
        try {
            console.log("[registerVendor] Sending formData:", formData);
            const res = await axios.post(`${API_BASE}/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("[registerVendor] Response:", res.data);

            const token = res.data.token;
            localStorage.setItem("vendorToken", token);

            const vendor = { ...res.data.vendor, token };
            localStorage.setItem("vendor", JSON.stringify(vendor));

            return vendor;
        } catch (err) {
            console.error("[registerVendor] Error:", err);
            return rejectWithValue(err.response?.data?.message || "Registration failed");
        }
    }
);

// ✅ Login Vendor
export const loginVendor = createAsyncThunk(
    "vendor/loginVendor",
    async (credentials, { rejectWithValue }) => {
        try {
            console.log("[loginVendor] Credentials:", credentials);

            const res = await axios.post(`${API_BASE}/login`, credentials);

            console.log("[loginVendor] Login response:", res.data);

            const token = res.data.token;
            localStorage.setItem("vendorToken", token);

            const vendor = { ...res.data.vendor, token };
            localStorage.setItem("vendor", JSON.stringify(vendor));

            console.log("[loginVendor] Vendor profile fetched and saved:", vendor);

            return vendor;
        } catch (err) {
            console.error("[loginVendor] Error:", err);
            return rejectWithValue(err.response?.data?.message || "Login failed");
        }
    }
);

// ✅ Logout Vendor (Updated to call API)
export const logoutVendorAsync = createAsyncThunk(
    "vendor/logoutVendorAsync",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = getVendorToken();
            if (token) {
                await axios.post(`${API_BASE}/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("[logoutVendorAsync] Backend logout successful.");
            } else {
                console.warn("[logoutVendorAsync] No token found for backend logout.");
            }
            dispatch(vendorAuthSlice.actions.logoutVendor());
            return true;
        } catch (err) {
            console.error("[logoutVendorAsync] Error during logout API call:", err);
            dispatch(vendorAuthSlice.actions.logoutVendor());
            return rejectWithValue(err.response?.data?.message || "Logout failed on server, but local state cleared.");
        }
    }
);

// ✅ Fetch Vendor Profile
export const fetchVendorProfile = createAsyncThunk(
    "vendor/fetchVendorProfile",
    async (_, { rejectWithValue }) => {
        try {
            const token = getVendorToken();
            console.log("[fetchVendorProfile] Token:", token);
            if (!token) throw new Error("No valid token found");

            const res = await axios.get(`${API_BASE}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("[fetchVendorProfile] Profile fetched:", res.data.vendor);
            const vendor = { ...res.data.vendor, token };
            localStorage.setItem("vendor", JSON.stringify(vendor));
            return vendor;
        } catch (err) {
            console.error("[fetchVendorProfile] Error:", err);
            return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
        }
    }
);

// ✅ Update Vendor Profile
export const updateVendorProfile = createAsyncThunk(
    "vendor/updateVendorProfile",
    async (updatedData, { rejectWithValue }) => {
        try {
            const token = getVendorToken();
            if (!token) throw new Error("No valid token");

            const formData = new FormData();
            for (const key in updatedData) {
                if (key === "address" && updatedData[key]) {
                    for (const addressKey in updatedData.address) {
                        formData.append(`address.${addressKey}`, updatedData.address[addressKey]);
                    }
                } else if (key === "shopImageFile" && updatedData.shopImageFile) {
                    formData.append("shopImage", updatedData.shopImageFile);
                }
                else if (updatedData[key] !== undefined && key !== "shopImageFile") {
                    formData.append(key, updatedData[key]);
                }
            }

            console.log("[updateVendorProfile] Payload (formData might not log directly):", updatedData);

            const res = await axios.put(`${API_BASE}/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("[updateVendorProfile] Response:", res.data);
            const updatedVendor = { ...res.data.vendor, token: token };
            localStorage.setItem("vendor", JSON.stringify(updatedVendor));
            return updatedVendor;
        } catch (err) {
            console.error("[updateVendorProfile] Error:", err);
            return rejectWithValue(err.response?.data?.message || "Failed to update profile");
        }
    }
);

// ✅ Toggle Vendor Status
export const toggleVendorStatus = createAsyncThunk(
    "vendor/toggleVendorStatus",
    async (newIsOnline, { getState, rejectWithValue }) => {
        try {
            const token = getVendorToken();
            if (!token) throw new Error("No valid token found");

            if (typeof newIsOnline !== 'boolean') {
                return rejectWithValue("Invalid status provided. Must be a boolean (true/false).");
            }

            console.log(`[toggleVendorStatus] Attempting to set isOnline to: ${newIsOnline}`);

            const res = await axios.put(`${API_BASE}/status`, { isOnline: newIsOnline }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("[toggleVendorStatus] API Response:", res.data);
            return { newIsOnline: res.data.currentStatus };
        } catch (err) {
            console.error("[toggleVendorStatus] Error:", err);
            return rejectWithValue(err.response?.data?.message || "Failed to update vendor status");
        }
    }
);

// ✅ Fetch All Vendors
export const fetchAllVendors = createAsyncThunk(
    "vendor/fetchAllVendors",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_BASE}/all`);
            console.log("[fetchAllVendors] Response:", res.data);
            return res.data;
        } catch (err) {
            console.error("[fetchAllVendors] Error:", err);
            return rejectWithValue(err.response?.data?.message || "Failed to fetch vendors");
        }
    }
);

// ✅ Initial State
const initialState = {
    vendor: JSON.parse(localStorage.getItem("vendor")) || null,
    loading: false,
    error: null,
    allVendors: [],
};

// ✅ Slice
const vendorAuthSlice = createSlice({
    name: "vendorAuth",
    initialState,
    reducers: {
        setVendor: (state, action) => {
            state.vendor = action.payload;
            localStorage.setItem("vendor", JSON.stringify(action.payload));
            localStorage.setItem("vendorToken", action.payload.token);
            console.log("[setVendor] State updated:", action.payload);
        },
        logoutVendor: (state) => {
            state.vendor = null;
            state.error = null;
            localStorage.removeItem("vendor");
            localStorage.removeItem("vendorToken");
            console.log("[logoutVendor] Local state cleared.");
        },
        setVendorIsOnline: (state, action) => {
            if (state.vendor) {
                state.vendor.isOnline = action.payload;
                localStorage.setItem("vendor", JSON.stringify(state.vendor));
                console.log(`[setVendorIsOnline] Vendor isOnline locally updated to: ${action.payload}`);
            }
        },
        updateVendorField: (state, action) => {
            const { field, value } = action.payload;
            if (state.vendor && state.vendor.hasOwnProperty(field)) {
                state.vendor[field] = value;
                localStorage.setItem("vendor", JSON.stringify(state.vendor));
                console.log(`[updateVendorField] Vendor ${field} locally updated to: ${value}`);
            } else {
                console.warn(`[updateVendorField] Field "${field}" not found or vendor not set.`);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // REGISTER
            .addCase(registerVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerVendor.fulfilled, (state, action) => {
                state.vendor = action.payload;
                state.loading = false;
            })
            .addCase(registerVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // LOGIN
            .addCase(loginVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginVendor.fulfilled, (state, action) => {
                state.vendor = action.payload;
                state.loading = false;
            })
            .addCase(loginVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // LOGOUT ASYNC
            .addCase(logoutVendorAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutVendorAsync.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(logoutVendorAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH PROFILE
            .addCase(fetchVendorProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorProfile.fulfilled, (state, action) => {
                state.vendor = action.payload;
                state.loading = false;
                localStorage.setItem("vendor", JSON.stringify(action.payload));
            })
            .addCase(fetchVendorProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.vendor = null;
                localStorage.removeItem("vendor");
                localStorage.removeItem("vendorToken");
            })

            // UPDATE PROFILE
            .addCase(updateVendorProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVendorProfile.fulfilled, (state, action) => {
                state.vendor = action.payload;
                state.loading = false;
            })
            .addCase(updateVendorProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // TOGGLE VENDOR STATUS
            .addCase(toggleVendorStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleVendorStatus.fulfilled, (state, action) => {
                state.loading = false;
                if (state.vendor) {
                    state.vendor.isOnline = action.payload.newIsOnline;
                    localStorage.setItem("vendor", JSON.stringify(state.vendor));
                    console.log(`[toggleVendorStatus.fulfilled] Vendor isOnline in state and localStorage updated to: ${state.vendor.isOnline}`);
                }
            })
            .addCase(toggleVendorStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error("[toggleVendorStatus.rejected] Failed to update status:", action.payload);
            })

            // FETCH ALL VENDORS
            .addCase(fetchAllVendors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllVendors.fulfilled, (state, action) => {
                state.loading = false;
                state.allVendors = action.payload.vendors;
            })
            .addCase(fetchAllVendors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setVendor, logoutVendor, setVendorIsOnline, updateVendorField } = vendorAuthSlice.actions;
export default vendorAuthSlice.reducer;