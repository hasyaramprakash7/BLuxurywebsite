// features/cart/cartSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/cart";

// 📦 Fetch user's cart
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.user?.token;
            // Handle case where user is not logged in gracefully
            if (!token) {
                return []; // Return empty array if no token
            }
            const res = await axios.get(`${API}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data.items; // must be populated from backend
        } catch (err) {
            // If 401 Unauthorized, clear user state (example)
            if (err.response && err.response.status === 401) {
                // You might dispatch an action here to clear auth state
                // e.g., dispatch(logoutUser());
                console.error("Authentication expired or invalid. Please log in again.");
                return rejectWithValue("Authentication required. Please log in.");
            }
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ➕ Add or update item, then re-fetch full cart
export const addOrUpdateItem = createAsyncThunk(
    "cart/addOrUpdateItem",
    async (item, { dispatch, getState, rejectWithValue }) => {
        try {
            const token = getState().auth.user?.token;
            if (!token) {
                return rejectWithValue("Authentication required to add/update cart items.");
            }
            await axios.post(`${API}/items`, item, { // Assuming this endpoint handles both adding and updating quantity
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Re-fetch full cart after add/update
            const refreshed = await dispatch(fetchCart()).unwrap();
            return refreshed;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ❌ Remove item, then re-fetch full cart
export const removeItem = createAsyncThunk(
    "cart/removeItem",
    async (productId, { dispatch, getState, rejectWithValue }) => {
        try {
            const token = getState().auth.user?.token;
            if (!token) {
                return rejectWithValue("Authentication required to remove cart items.");
            }
            await axios.delete(`${API}/items/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Re-fetch full cart after removal
            const refreshed = await dispatch(fetchCart()).unwrap();
            return refreshed;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 🧹 Clear entire cart, then re-fetch
export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const token = getState().auth.user?.token;
            if (!token) {
                return rejectWithValue("Authentication required to clear cart.");
            }
            await axios.delete(`${API}/clear`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const refreshed = await dispatch(fetchCart()).unwrap();
            return refreshed;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.items = []; // Clear items on rejection (e.g., unauthorized)
            })

            // Add or Update (already uses fetchCart)
            .addCase(addOrUpdateItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addOrUpdateItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload; // Payload is the refreshed cart from fetchCart
            })
            .addCase(addOrUpdateItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Remove (already uses fetchCart)
            .addCase(removeItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload; // Payload is the refreshed cart from fetchCart
            })
            .addCase(removeItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Clear (already uses fetchCart)
            .addCase(clearCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload; // Payload is the refreshed cart from fetchCart (should be empty)
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default cartSlice.reducer;