// src/features/vendor/vendorProductSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "/api/vendor-products";

// --- Async Thunks ---

// Fetch logged-in vendor's products
export const fetchMyProducts = createAsyncThunk(
    "vendorProducts/fetchMyProducts",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("vendorToken");
            const res = await axios.get(`${API_BASE}/my-products`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // The backend returns an array of products, each with all its fields (including brandName, bulk pricing, images)
            return res.data.products;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch all vendor products (public route)
export const fetchAllVendorProducts = createAsyncThunk(
    "vendorProducts/fetchAllVendorProducts",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${API_BASE}/all`);
            // The backend returns an array of products, each with all its fields
            return res.data.products;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Add product
// formData should be created in the component, e.g., new FormData()
// and append fields like: formData.append('name', name); formData.append('images', fileInput.files[0]);
export const addProduct = createAsyncThunk(
    "vendorProducts/addProduct",
    async (formData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("vendorToken");
            const res = await axios.post(`${API_BASE}/add`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // When using FormData, axios automatically sets Content-Type to multipart/form-data
                    // You can explicitly set it, but it's often not strictly necessary if FormData is used correctly.
                    // "Content-Type": "multipart/form-data",
                },
            });
            // The backend should return the full product object, including its image URLs (as an array)
            // and all new fields like brandName, bulk pricing, etc.
            return res.data.product;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Update product
// formData should be created in the component, similar to addProduct
export const updateProduct = createAsyncThunk(
    "vendorProducts/updateProduct",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("vendorToken");
            const res = await axios.put(`${API_BASE}/update/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // "Content-Type": "multipart/form-data", // Auto-set by axios for FormData
                },
            });
            // The backend should return the full product object, including its updated image URLs (as an array)
            // and all new fields like brandName, bulk pricing, etc.
            return res.data.product;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Delete product
export const deleteProduct = createAsyncThunk(
    "vendorProducts/deleteProduct",
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("vendorToken");
            await axios.delete(`${API_BASE}/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return id; // Return the ID to filter it out from the state
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// --- Redux Slice ---

const vendorProductSlice = createSlice({
    name: "vendorProducts",
    initialState: {
        myProducts: [], // For products belonging to the logged-in vendor
        allProducts: [], // For all publicly visible products
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        // You might consider adding a reducer to clear products if a vendor logs out, for instance
        clearMyProducts: (state) => {
            state.myProducts = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch my products ---
            .addCase(fetchMyProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyProducts.fulfilled, (state, action) => {
                // Action.payload contains products with all schema fields, including new ones
                // No explicit mapping needed here as backend already provides all fields.
                // The `|| []` for images ensures that even if backend sends `images: null` (unlikely if schema is followed),
                // it defaults to an empty array for safer client-side rendering.
                state.myProducts = action.payload.map(product => ({
                    ...product,
                    images: product.images || []
                })) || [];
                state.loading = false;
            })
            .addCase(fetchMyProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Fetch all vendor products ---
            .addCase(fetchAllVendorProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllVendorProducts.fulfilled, (state, action) => {
                // Same logic as fetchMyProducts, ensuring images array is present
                state.allProducts = action.payload.map(product => ({
                    ...product,
                    images: product.images || []
                })) || [];
                state.loading = false;
            })
            .addCase(fetchAllVendorProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Add product ---
            .addCase(addProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                // action.payload is the newly created product with all its fields.
                // Prepend to myProducts list.
                state.myProducts.unshift({ ...action.payload, images: action.payload.images || [] });
                // If you also want to update allProducts immediately for public view, you'd add it there too:
                // state.allProducts.unshift({ ...action.payload, images: action.payload.images || [] });
                state.loading = false;
            })
            .addCase(addProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Update product ---
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                // action.payload is the updated product with all its new/existing fields.
                const updatedProduct = { ...action.payload, images: action.payload.images || [] };

                // Update in myProducts
                const myProductIndex = state.myProducts.findIndex(p => p._id === updatedProduct._id);
                if (myProductIndex !== -1) {
                    state.myProducts[myProductIndex] = updatedProduct;
                }

                // Update in allProducts (if you're keeping it synchronized)
                const allProductIndex = state.allProducts.findIndex(p => p._id === updatedProduct._id);
                if (allProductIndex !== -1) {
                    state.allProducts[allProductIndex] = updatedProduct;
                }
                state.loading = false;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Delete product ---
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                // action.payload is the ID of the deleted product.
                state.myProducts = state.myProducts.filter(p => p._id !== action.payload);
                // Also remove from allProducts if it's there
                state.allProducts = state.allProducts.filter(p => p._id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearMyProducts } = vendorProductSlice.actions; // Export new action
export default vendorProductSlice.reducer;