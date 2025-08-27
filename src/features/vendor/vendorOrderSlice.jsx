// src/features/vendor/vendorOrderSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL for orders
const API = "/api/orders";

// Helper function to get the vendor token from localStorage
const getVendorToken = () => localStorage.getItem("vendorToken");

/**
 * @asyncThunk fetchVendorOrders
 * @desc Fetches all orders that contain products from a specific vendor.
 * The backend is responsible for filtering the order items to only include
 * those belonging to the given vendor.
 * @param {string} vendorId - The ID of the vendor whose orders are to be fetched.
 */
export const fetchVendorOrders = createAsyncThunk(
    "vendorOrders/fetchVendorOrders",
    async (vendorId, { rejectWithValue }) => {
        try {
            const token = getVendorToken();
            if (!token) {
                return rejectWithValue({ message: "Authentication token not found. Please log in as a vendor." });
            }

            const res = await axios.get(`${API}/vendor/${vendorId}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Authorize the request with the vendor's token
                },
            });

            // The backend should return orders with items already filtered for this vendor
            return res.data.orders;
        } catch (err) {
            console.error("Failed to fetch vendor orders:", err);
            // Return a more user-friendly error message
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch vendor orders");
        }
    }
);

/**
 * @asyncThunk updateVendorOrderStatus
 * @desc Updates the overall status of a specific order.
 * @param {object} params
 * @param {string} params.orderId - The ID of the order to update.
 * @param {string} params.newStatus - The new status for the order.
 */
export const updateVendorOrderStatus = createAsyncThunk(
    "vendorOrders/updateVendorOrderStatus",
    async ({ orderId, newStatus }, { rejectWithValue }) => {
        try {
            const token = getVendorToken();
            if (!token) {
                return rejectWithValue({ message: "Authentication token not found. Please log in as a vendor to update orders." });
            }

            const res = await axios.put(`${API}/${orderId}/status`, { status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // The backend should return the updated order
            return res.data.order;
        } catch (err) {
            console.error(`Failed to update status for order ${orderId}:`, err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to update order status");
        }
    }
);

const vendorOrderSlice = createSlice({
    name: "vendorOrders",
    initialState: {
        orders: [],      // Stores the list of orders for the vendor
        loading: false,  // Indicates if an async operation is in progress
        error: null,     // Stores any error messages
    },
    reducers: {
        // Reducer to clear any errors, useful for UI feedback
        clearVendorOrderError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Handlers for fetchVendorOrders ---
            .addCase(fetchVendorOrders.pending, (state) => {
                state.loading = true;
                state.error = null; // Clear previous errors
            })
            .addCase(fetchVendorOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload; // Set orders with the fetched data
            })
            .addCase(fetchVendorOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store the error message
            })

            // --- Handlers for updateVendorOrderStatus ---
            .addCase(updateVendorOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVendorOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                // Find the updated order in the current state and replace it
                const index = state.orders.findIndex(order => order._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(updateVendorOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Export the action creator for clearing errors
export const { clearVendorOrderError } = vendorOrderSlice.actions;

// Export the reducer to be combined in the Redux store
export default vendorOrderSlice.reducer;