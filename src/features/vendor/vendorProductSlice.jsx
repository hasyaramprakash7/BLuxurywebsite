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
            return res.data.products;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Add product
export const addProduct = createAsyncThunk(
    "vendorProducts/addProduct",
    async (formData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("vendorToken");
            const res = await axios.post(`${API_BASE}/add`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data.product;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Update product
export const updateProduct = createAsyncThunk(
    "vendorProducts/updateProduct",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("vendorToken");
            const res = await axios.put(`${API_BASE}/update/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
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
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// --- Redux Slice ---

const vendorProductSlice = createSlice({
    name: "vendorProducts",
    initialState: {
        myProducts: [],
        allProducts: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
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
                state.myProducts = action.payload.map(product => ({
                    ...product,
                    images: product.images || [],
                    documents: product.documents || [], // Add this line
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
                state.allProducts = action.payload.map(product => ({
                    ...product,
                    images: product.images || [],
                    documents: product.documents || [], // Add this line
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
                const newProduct = {
                    ...action.payload,
                    images: action.payload.images || [],
                    documents: action.payload.documents || [], // Add this line
                };
                state.myProducts.unshift(newProduct);
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
                const updatedProduct = {
                    ...action.payload,
                    images: action.payload.images || [],
                    documents: action.payload.documents || [], // Add this line
                };

                const myProductIndex = state.myProducts.findIndex(p => p._id === updatedProduct._id);
                if (myProductIndex !== -1) {
                    state.myProducts[myProductIndex] = updatedProduct;
                }

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
                state.myProducts = state.myProducts.filter(p => p._id !== action.payload);
                state.allProducts = state.allProducts.filter(p => p._id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearMyProducts } = vendorProductSlice.actions;
export default vendorProductSlice.reducer;