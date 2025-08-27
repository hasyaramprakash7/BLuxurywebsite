// src/features/order/orderSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL for orders
const API = "/api/orders";

// Helper function to get the user token from localStorage
const getUserToken = () => localStorage.getItem("token");
// Helper function to get the admin/vendor token from localStorage (adjust as needed)
const getAdminToken = () => localStorage.getItem("adminToken"); // Or 'vendorToken' or 'deliveryBoyToken'

// 🛒 Place an order
export const placeOrder = createAsyncThunk(
    "order/placeOrder",
    async (orderData, { rejectWithValue }) => {
        try {
            const token = getUserToken();
            if (!token) {
                return rejectWithValue("Authentication token not found. Please log in.");
            }
            const res = await axios.post(API, orderData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return res.data.order;
        } catch (err) {
            console.error("Failed to place order:", err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to place order");
        }
    }
);

// 📦 Get all orders for a user
export const fetchUserOrders = createAsyncThunk(
    "order/fetchUserOrders",
    async (userId, { rejectWithValue }) => {
        try {
            const token = getUserToken();
            if (!token) {
                return rejectWithValue("Authentication token not found. Please log in.");
            }
            const res = await axios.get(`${API}/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.orders;
        } catch (err) {
            console.error(`Failed to fetch orders for user ${userId}:`, err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch user orders");
        }
    }
);

// 📋 Fetch order by ID
export const fetchOrderById = createAsyncThunk(
    "order/fetchById",
    async (orderId, { rejectWithValue }) => {
        try {
            const token = getUserToken(); // Assuming this is for a user fetching their own order
            if (!token) {
                return rejectWithValue("Authentication token not found. Please log in.");
            }
            const res = await axios.get(`${API}/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.order;
        } catch (err) {
            console.error(`Failed to fetch order ${orderId}:`, err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch order");
        }
    }
);

// 🖼️ Upload order image
export const uploadOrderImage = createAsyncThunk(
    "order/uploadOrderImage",
    async ({ orderId, imageFile }, { rejectWithValue }) => {
        try {
            const token = getUserToken(); // Assuming a user or delivery boy uploads an image
            if (!token) {
                return rejectWithValue("Authentication token not found. Please log in to upload images.");
            }
            const formData = new FormData();
            formData.append("image", imageFile);
            const res = await axios.put(`${API}/${orderId}/upload-image`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // "Content-Type" is automatically set by Axios for FormData
                },
            });
            return res.data.order;
        } catch (err) {
            console.error(`Failed to upload image for order ${orderId}:`, err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to upload order image");
        }
    }
);

// 🔄 Update status
export const updateOrderStatus = createAsyncThunk(
    "order/updateOrderStatus",
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            // This could be a user, vendor, or delivery boy action.
            // Using user token for now, adjust based on who is allowed to change status.
            const token = getUserToken();
            if (!token) {
                return rejectWithValue("Authentication token not found. Please log in to update order status.");
            }
            const res = await axios.put(`${API}/${orderId}/status`, { status }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return res.data.order;
        } catch (err) {
            console.error(`Failed to update status for order ${orderId}:`, err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to update order status");
        }
    }
);

// ❌ Cancel order
export const cancelUserOrder = createAsyncThunk(
    "order/cancelUserOrder",
    async (orderId, { rejectWithValue }) => {
        try {
            const token = getUserToken();
            if (!token) {
                return rejectWithValue("Authentication token not found. Please log in to cancel orders.");
            }
            const res = await axios.patch(`${API}/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.order;
        } catch (err) {
            console.error(`Failed to cancel order ${orderId}:`, err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to cancel order");
        }
    }
);

// 🗑️ Delete order
export const deleteOrder = createAsyncThunk(
    "order/deleteOrder",
    async (orderId, { rejectWithValue }) => {
        try {
            const token = getUserToken(); // Or adminToken if only admins can delete
            if (!token) {
                return rejectWithValue("Authentication token not found. Please log in to delete orders.");
            }
            await axios.delete(`${API}/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return orderId;
        } catch (err) {
            console.error(`Failed to delete order ${orderId}:`, err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to delete order");
        }
    }
);

// 🛵 Assign delivery boy to an order
export const assignDeliveryBoy = createAsyncThunk(
    "orders/assignDeliveryBoy",
    async ({ orderId, deliveryBoyId }, { rejectWithValue }) => {
        try {
            const token = getAdminToken(); // Assuming this is an admin/vendor action
            if (!token) {
                return rejectWithValue("Admin/Vendor authentication token not found. Please log in as an administrator.");
            }
            const res = await axios.post(`${API}/${orderId}/assign`, { deliveryBoyId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return res.data; // { success, message, order }
        } catch (err) {
            console.error("Assignment failed:", err);
            return rejectWithValue(err.response?.data?.message || err.message || "Assignment failed");
        }
    }
);


// 🚚 Get orders assigned to a delivery boy
export const fetchOrdersByDeliveryBoy = createAsyncThunk(
    "order/fetchOrdersByDeliveryBoy",
    async (deliveryBoyId, { rejectWithValue }) => {
        try {
            const token = getAdminToken(); // Assuming an admin fetches this, or getDeliveryBoyToken() for delivery boy
            if (!token) {
                return rejectWithValue("Authentication token not found. Please log in as an administrator or delivery boy.");
            }
            const res = await axios.get(`${API}/delivery-boy/${deliveryBoyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.orders || [];
        } catch (err) {
            console.error("Failed to fetch delivery boy orders:", err);
            return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch delivery boy orders");
        }
    }
);

// 🧾 Initial state shape for a single order
const initialOrder = {
    _id: null,
    userId: null,
    address: {
        fullName: '',
        street: '',
        street2: '',
        landmark: '',
        city: '',
        state: '',
        C: '', // Assuming this was meant to be country, but country already exists. Removed as redundant.
        zipCode: '',
        country: 'India',
        phone: '',
        latitude: null,
        longitude: null,
    },
    items: [],
    total: 0,
    status: 'placed',
    paymentMethod: '',
    orderImage: [], // Corrected to be an array
    createdAt: null,
    updatedAt: null,
    deliveryBoy: null, // Added as it's part of the order now
};

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orders: [], // For user's own orders
        assignedOrders: [], // For delivery boy's assigned orders
        placedOrder: null, // Stores the last successfully placed order
        selectedOrder: initialOrder, // For viewing a single order detail
        loading: false,
        error: null,
    },
    reducers: {
        clearOrderStatus: (state) => {
            state.placedOrder = null;
            state.error = null;
            state.selectedOrder = initialOrder;
        },
    },
    extraReducers: (builder) => {
        builder
            // 📦 Order placing
            .addCase(placeOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.placedOrder = action.payload;
                // You might also want to add this to the orders array if the user immediately sees it
                // state.orders.push(action.payload);
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 📋 Fetch user orders
            .addCase(fetchUserOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 📋 Fetch order by ID (loading/error states for consistency)
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🖼️ Upload order image (loading/error states for consistency)
            .addCase(uploadOrderImage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadOrderImage.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                // Update in the main orders array
                const idx = state.orders.findIndex(o => o._id === updated._id);
                if (idx !== -1) state.orders[idx] = updated;
                // Update selected order if it's the one being viewed
                if (state.selectedOrder._id === updated._id) state.selectedOrder = updated;
            })
            .addCase(uploadOrderImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🔄 Update status (loading/error states for consistency)
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const idx = state.orders.findIndex(o => o._id === updated._id);
                if (idx !== -1) state.orders[idx] = updated;
                if (state.selectedOrder._id === updated._id) state.selectedOrder = updated;
                // Also update in assignedOrders if applicable
                const assignedIdx = state.assignedOrders.findIndex(o => o._id === updated._id);
                if (assignedIdx !== -1) state.assignedOrders[assignedIdx] = updated;
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ❌ Cancel order (loading/error states for consistency)
            .addCase(cancelUserOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelUserOrder.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const idx = state.orders.findIndex(o => o._id === updated._id);
                if (idx !== -1) state.orders[idx] = updated;
                if (state.selectedOrder._id === updated._id) state.selectedOrder = updated;
                // Also update in assignedOrders if applicable
                const assignedIdx = state.assignedOrders.findIndex(o => o._id === updated._id);
                if (assignedIdx !== -1) state.assignedOrders[assignedIdx] = updated;
            })
            .addCase(cancelUserOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🗑️ Delete order (loading/error states for consistency)
            .addCase(deleteOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.loading = false;
                const id = action.payload;
                state.orders = state.orders.filter(o => o._id !== id);
                state.assignedOrders = state.assignedOrders.filter(o => o._id !== id); // Also remove from assigned
                if (state.selectedOrder._id === id) state.selectedOrder = initialOrder;
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🛵 Assign delivery boy
            .addCase(assignDeliveryBoy.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignDeliveryBoy.fulfilled, (state, action) => {
                state.loading = false;
                const assignedOrder = action.payload.order;
                // Ensure order is in main list if it's relevant to the current user's view
                const mainOrderIdx = state.orders.findIndex(o => o._id === assignedOrder._id);
                if (mainOrderIdx !== -1) {
                    state.orders[mainOrderIdx] = assignedOrder;
                } else {
                    // You might push it here if assigning means it should now appear
                    // in the 'orders' list for an admin view, etc.
                    // state.orders.push(assignedOrder);
                }

                // Add/update in assignedOrders specific to delivery boy
                const assignedIdx = state.assignedOrders.findIndex(o => o._id === assignedOrder._id);
                if (assignedIdx !== -1) {
                    state.assignedOrders[assignedIdx] = assignedOrder;
                } else {
                    state.assignedOrders.push(assignedOrder);
                }

                if (state.selectedOrder._id === assignedOrder._id) {
                    state.selectedOrder = assignedOrder;
                }
            })
            .addCase(assignDeliveryBoy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🚚 Fetch orders for delivery boy
            .addCase(fetchOrdersByDeliveryBoy.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrdersByDeliveryBoy.fulfilled, (state, action) => {
                state.loading = false;
                state.assignedOrders = action.payload;
            })
            .addCase(fetchOrdersByDeliveryBoy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;