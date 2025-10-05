import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "/api/products";

// Function to get the authentication token from localStorage
const getToken = () => localStorage.getItem("vendorToken");

// --- Async Thunks ---

// Fetch all public insurance products
export const fetchAllInsuranceProducts = createAsyncThunk(
    'insurance/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data.products;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch all insurance products.");
        }
    }
);

// Fetch a single insurance product by ID
export const fetchInsuranceProductById = createAsyncThunk(
    'insurance/fetchById',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${productId}`);
            return response.data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch insurance product.");
        }
    }
);

// Fetch all products for the authenticated vendor (UPDATED)
export const fetchVendorInsuranceProducts = createAsyncThunk(
    'insurance/fetchVendorProducts',
    async (_, { rejectWithValue }) => {
        try {
            const token = getToken();
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            // Now fetching from the secure `/me` endpoint
            const response = await axios.get(`${API_BASE_URL}/me`, config);
            return response.data.products;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch your insurance products.");
        }
    }
);

// Add a new insurance product (Vendor specific)
export const createInsuranceProduct = createAsyncThunk(
    'insurance/createProduct',
    async (formData, { rejectWithValue }) => {
        try {
            const token = getToken();
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.post(API_BASE_URL, formData, config);
            return response.data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create insurance product.");
        }
    }
);

// Update an existing insurance product (Vendor specific)
export const updateInsuranceProduct = createAsyncThunk(
    'insurance/updateProduct',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const token = getToken();
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.put(`${API_BASE_URL}/${id}`, formData, config);
            return response.data.product;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update insurance product.");
        }
    }
);

// Delete an insurance product (Vendor specific)
export const deleteInsuranceProduct = createAsyncThunk(
    'insurance/deleteProduct',
    async (productId, { rejectWithValue }) => {
        try {
            const token = getToken();
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.delete(`${API_BASE_URL}/${productId}`, config);
            return productId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete insurance product.");
        }
    }
);

// --- Initial State ---
const initialState = {
    products: [],
    vendorProducts: [],
    currentProduct: null,
    loading: false,
    error: null,
};

// --- Slice Definition ---
const insuranceSlice = createSlice({
    name: "insurance",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetProductState: (state) => {
            state.products = [];
            state.vendorProducts = [];
            state.currentProduct = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Handlers for fetchAllInsuranceProducts ---
            .addCase(fetchAllInsuranceProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllInsuranceProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchAllInsuranceProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Handlers for fetchInsuranceProductById ---
            .addCase(fetchInsuranceProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInsuranceProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchInsuranceProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Handlers for fetchVendorInsuranceProducts (UPDATED) ---
            .addCase(fetchVendorInsuranceProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorInsuranceProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.vendorProducts = action.payload;
            })
            .addCase(fetchVendorInsuranceProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Handlers for createInsuranceProduct ---
            .addCase(createInsuranceProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createInsuranceProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.vendorProducts.push(action.payload);
            })
            .addCase(createInsuranceProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Handlers for updateInsuranceProduct ---
            .addCase(updateInsuranceProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateInsuranceProduct.fulfilled, (state, action) => {
                state.loading = false;
                const updatedProduct = action.payload;
                const index = state.vendorProducts.findIndex(p => p._id === updatedProduct._id);
                if (index !== -1) {
                    state.vendorProducts[index] = updatedProduct;
                }
            })
            .addCase(updateInsuranceProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Handlers for deleteInsuranceProduct ---
            .addCase(deleteInsuranceProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteInsuranceProduct.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.payload;
                state.vendorProducts = state.vendorProducts.filter(p => p._id !== deletedId);
            })
            .addCase(deleteInsuranceProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, resetProductState } = insuranceSlice.actions;

export default insuranceSlice.reducer;