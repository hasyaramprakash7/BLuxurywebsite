import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = 'http://192.168.29.148:3000/api/admin';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// --- Async Thunks for CRUD Operations ---

export const loginAdmin = createAsyncThunk('admin/login', async (credentials, thunkAPI) => {
    try {
        const res = await axios.post(`${API}/login`, credentials);
        localStorage.setItem('adminToken', res.data.token);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

// adminSlice.js

export const registerAdmin = createAsyncThunk('admin/register', async (data, thunkAPI) => {
    try {
        // ✅ Send token because the route is now protected
        const res = await axios.post(`${API}/register`, data, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

export const fetchAdminProfile = createAsyncThunk('admin/profile', async (_, thunkAPI) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        return thunkAPI.rejectWithValue({ message: "No authentication token found." });
    }
    try {
        const res = await axios.get(`${API}/profile`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const updateAdminProfile = createAsyncThunk('admin/updateProfile', async (profileData, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/profile`, profileData, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const fetchAllAdmins = createAsyncThunk('admin/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/`, getAuthHeaders());
        return res.data.admins;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const fetchAdminById = createAsyncThunk('admin/fetchById', async (adminId, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/${adminId}`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const updateAdminById = createAsyncThunk('admin/updateById', async ({ id, data }, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/${id}`, data, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const deleteAdmin = createAsyncThunk('admin/delete', async (adminId, thunkAPI) => {
    try {
        await axios.delete(`${API}/${adminId}`, getAuthHeaders());
        return adminId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const fetchPlatformAnalytics = createAsyncThunk('admin/analytics/fetch', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/analytics/income`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

// Users
export const fetchAllUsers = createAsyncThunk('admin/users/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/users`, getAuthHeaders());
        return res.data.users;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const fetchUserById = createAsyncThunk('admin/users/fetchById', async (userId, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/users/${userId}`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const updateUser = createAsyncThunk('admin/users/update', async ({ id, data }, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/users/${id}`, data, getAuthHeaders());
        return res.data.user;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const deleteUser = createAsyncThunk('admin/users/delete', async (userId, thunkAPI) => {
    try {
        await axios.delete(`${API}/users/${userId}`, getAuthHeaders());
        return userId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

// Vendors
export const fetchAllVendors = createAsyncThunk('admin/vendors/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/vendors`, getAuthHeaders());
        return res.data.vendors;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const fetchVendorById = createAsyncThunk('admin/vendors/fetchById', async (vendorId, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/vendors/${vendorId}`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const updateVendor = createAsyncThunk('admin/vendors/update', async ({ id, data }, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/vendors/${id}`, data, getAuthHeaders());
        return res.data.vendor;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const deleteVendor = createAsyncThunk('admin/vendors/delete', async (vendorId, thunkAPI) => {
    try {
        await axios.delete(`${API}/vendors/${vendorId}`, getAuthHeaders());
        return vendorId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const toggleVendorApproval = createAsyncThunk('admin/vendors/toggleApproval', async (vendorId, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/vendors/${vendorId}/approve`, {}, getAuthHeaders());
        return res.data.vendor;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

// Delivery Boys
export const fetchAllDeliveryBoys = createAsyncThunk('admin/deliveryboys/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/delivery-boys`, getAuthHeaders());
        return res.data.boys;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const fetchDeliveryBoyById = createAsyncThunk('admin/deliveryboys/fetchById', async (boyId, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/delivery-boys/${boyId}`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const updateDeliveryBoy = createAsyncThunk('admin/deliveryboys/update', async ({ id, data }, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/delivery-boys/${id}`, data, getAuthHeaders());
        return res.data.deliveryBoy;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const deleteDeliveryBoy = createAsyncThunk('admin/deliveryboys/delete', async (boyId, thunkAPI) => {
    try {
        await axios.delete(`${API}/delivery-boys/${boyId}`, getAuthHeaders());
        return boyId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

// Products
export const fetchAllProducts = createAsyncThunk('admin/products/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/products`, getAuthHeaders());
        return res.data.products;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const fetchProductById = createAsyncThunk('admin/products/fetchById', async (productId, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/products/${productId}`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const updateProduct = createAsyncThunk('admin/products/update', async ({ id, data }, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/products/${id}`, data, getAuthHeaders());
        return res.data.product;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const deleteProduct = createAsyncThunk('admin/products/delete', async (productId, thunkAPI) => {
    try {
        await axios.delete(`${API}/products/${productId}`, getAuthHeaders());
        return productId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

// Orders
export const fetchAllOrders = createAsyncThunk('admin/orders/fetchAll', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/orders`, getAuthHeaders());
        return res.data.orders;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const fetchOrderById = createAsyncThunk('admin/orders/fetchById', async (orderId, thunkAPI) => {
    try {
        const res = await axios.get(`${API}/orders/${orderId}`, getAuthHeaders());
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const updateOrder = createAsyncThunk('admin/orders/update', async ({ id, data }, thunkAPI) => {
    try {
        const res = await axios.put(`${API}/orders/${id}`, data, getAuthHeaders());
        return res.data.order;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

export const deleteOrder = createAsyncThunk('admin/orders/delete', async (orderId, thunkAPI) => {
    try {
        await axios.delete(`${API}/orders/${orderId}`, getAuthHeaders());
        return orderId;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
    }
});

// Bulk Dashboard Data Fetch
export const fetchInitialSuperadminData = createAsyncThunk(
    'admin/fetchInitialSuperadminData',
    async (_, thunkAPI) => {
        try {
            console.log('🔄 Fetching all initial superadmin data...');
            const [
                analyticsRes,
                adminsRes,
                usersRes,
                vendorsRes,
                deliveryBoysRes,
                productsRes,
                ordersRes,
            ] = await Promise.all([
                axios.get(`${API}/analytics/income`, getAuthHeaders()),
                axios.get(`${API}/`, getAuthHeaders()),
                axios.get(`${API}/users`, getAuthHeaders()),
                axios.get(`${API}/vendors`, getAuthHeaders()),
                axios.get(`${API}/delivery-boys`, getAuthHeaders()),
                axios.get(`${API}/products`, getAuthHeaders()),
                axios.get(`${API}/orders`, getAuthHeaders()),
            ]);

            return {
                analytics: analyticsRes.data,
                admins: adminsRes.data.admins,
                users: usersRes.data.users,
                vendors: vendorsRes.data.vendors,
                deliveryBoys: deliveryBoysRes.data.boys,
                products: productsRes.data.products,
                orders: ordersRes.data.orders,
            };
        } catch (err) {
            console.error('❌ Failed to fetch all initial superadmin data:', err.response?.data?.message || err.message);
            return thunkAPI.rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// --- Slice Definition ---

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        admin: null,
        admins: [],
        users: [],
        vendors: [],
        deliveryBoys: [],
        products: [],
        orders: [],
        analytics: null,
        token: localStorage.getItem('adminToken') || null,
        loading: false,
        error: null,
        selectedAdmin: null,
        selectedUser: null,
        selectedVendor: null,
        selectedDeliveryBoy: null,
        selectedProduct: null,
        selectedOrder: null,
    },
    reducers: {
        logoutAdmin(state) {
            console.log('➡️ Clearing Redux state and token on logout.');
            state.admin = null;
            state.token = null;
            state.admins = [];
            state.users = [];
            state.vendors = [];
            state.deliveryBoys = [];
            state.products = [];
            state.orders = [];
            state.analytics = null;
            state.selectedAdmin = null;
            state.selectedUser = null;
            state.selectedVendor = null;
            state.selectedDeliveryBoy = null;
            state.selectedProduct = null;
            state.selectedOrder = null;
            localStorage.removeItem('adminToken');
        },
        clearAdminError(state) {
            state.error = null;
        },
        setSelectedAdmin(state, action) {
            state.selectedAdmin = action.payload;
        },
        setSelectedUser(state, action) {
            state.selectedUser = action.payload;
        },
        setSelectedVendor(state, action) {
            state.selectedVendor = action.payload;
        },
        setSelectedDeliveryBoy(state, action) {
            state.selectedDeliveryBoy = action.payload;
        },
        setSelectedProduct(state, action) {
            state.selectedProduct = action.payload;
        },
        setSelectedOrder(state, action) {
            state.selectedOrder = action.payload;
        },
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

            // Fetch Admin Profile
            .addCase(fetchAdminProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAdminProfile.fulfilled, (state, action) => {
                state.admin = action.payload.admin;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAdminProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch profile.";
                state.admin = null;
                state.token = null;
                localStorage.removeItem('adminToken');
            })

            // Fetch Initial Superadmin Data
            .addCase(fetchInitialSuperadminData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInitialSuperadminData.fulfilled, (state, action) => {
                state.analytics = action.payload.analytics;
                state.admins = action.payload.admins;
                state.users = action.payload.users;
                state.vendors = action.payload.vendors;
                state.deliveryBoys = action.payload.deliveryBoys;
                state.products = action.payload.products;
                state.orders = action.payload.orders;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchInitialSuperadminData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch initial superadmin data.";
            })

            // Register Admin
            .addCase(registerAdmin.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload.admin) {
                    state.admins.push(action.payload.admin);
                }
            })
            .addCase(registerAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Registration failed.";
            })

            // Update Admin Profile
            .addCase(updateAdminProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateAdminProfile.fulfilled, (state, action) => {
                state.admin = action.payload.admin;
                state.loading = false;
                state.error = null;
            })
            .addCase(updateAdminProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update profile.";
            })

            // Fetch All Admins
            .addCase(fetchAllAdmins.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllAdmins.fulfilled, (state, action) => {
                state.admins = action.payload;
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
                state.selectedAdmin = action.payload.admin;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAdminById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch admin by ID.";
                state.selectedAdmin = null;
            })

            // Update Admin By ID
            .addCase(updateAdminById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateAdminById.fulfilled, (state, action) => {
                const index = state.admins.findIndex(admin => admin._id === action.payload.admin._id);
                if (index !== -1) {
                    state.admins[index] = action.payload.admin;
                }
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
                state.admins = state.admins.filter(admin => admin._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete admin.";
            })

            // Fetch Platform Analytics
            .addCase(fetchPlatformAnalytics.pending, (state) => { state.loading = true; state.error = null; state.analytics = null; })
            .addCase(fetchPlatformAnalytics.fulfilled, (state, action) => {
                state.analytics = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchPlatformAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch analytics.";
                state.analytics = null;
            })

            // --- USERS ---
            .addCase(fetchAllUsers.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.users = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch users.";
            })
            .addCase(fetchUserById.pending, (state) => { state.loading = true; state.error = null; state.selectedUser = null; })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.selectedUser = action.payload.user;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch user by ID.";
                state.selectedUser = null;
            })
            .addCase(updateUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(user => user._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser && state.selectedUser._id === action.payload._id) {
                    state.selectedUser = action.payload;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update user.";
            })
            .addCase(deleteUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete user.";
            })

            // --- VENDORS ---
            .addCase(fetchAllVendors.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllVendors.fulfilled, (state, action) => {
                state.vendors = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAllVendors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch vendors.";
            })
            .addCase(fetchVendorById.pending, (state) => { state.loading = true; state.error = null; state.selectedVendor = null; })
            .addCase(fetchVendorById.fulfilled, (state, action) => {
                state.selectedVendor = action.payload.vendor;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchVendorById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch vendor by ID.";
                state.selectedVendor = null;
            })
            .addCase(updateVendor.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateVendor.fulfilled, (state, action) => {
                const index = state.vendors.findIndex(vendor => vendor._id === action.payload._id);
                if (index !== -1) {
                    state.vendors[index] = action.payload;
                }
                if (state.selectedVendor && state.selectedVendor._id === action.payload._id) {
                    state.selectedVendor = action.payload;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(updateVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update vendor.";
            })
            .addCase(deleteVendor.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteVendor.fulfilled, (state, action) => {
                state.vendors = state.vendors.filter(vendor => vendor._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete vendor.";
            })
            .addCase(toggleVendorApproval.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(toggleVendorApproval.fulfilled, (state, action) => {
                const index = state.vendors.findIndex(vendor => vendor._id === action.payload._id);
                if (index !== -1) {
                    state.vendors[index] = action.payload;
                }
                if (state.selectedVendor && state.selectedVendor._id === action.payload._id) {
                    state.selectedVendor = action.payload;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(toggleVendorApproval.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update vendor approval.";
            })

            // --- DELIVERY BOYS ---
            .addCase(fetchAllDeliveryBoys.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllDeliveryBoys.fulfilled, (state, action) => {
                state.deliveryBoys = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAllDeliveryBoys.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch delivery boys.";
            })
            .addCase(fetchDeliveryBoyById.pending, (state) => { state.loading = true; state.error = null; state.selectedDeliveryBoy = null; })
            .addCase(fetchDeliveryBoyById.fulfilled, (state, action) => {
                state.selectedDeliveryBoy = action.payload.deliveryBoy;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchDeliveryBoyById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch delivery boy by ID.";
                state.selectedDeliveryBoy = null;
            })
            .addCase(updateDeliveryBoy.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateDeliveryBoy.fulfilled, (state, action) => {
                const index = state.deliveryBoys.findIndex(boy => boy._id === action.payload._id);
                if (index !== -1) {
                    state.deliveryBoys[index] = action.payload;
                }
                if (state.selectedDeliveryBoy && state.selectedDeliveryBoy._id === action.payload._id) {
                    state.selectedDeliveryBoy = action.payload;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(updateDeliveryBoy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update delivery boy.";
            })
            .addCase(deleteDeliveryBoy.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteDeliveryBoy.fulfilled, (state, action) => {
                state.deliveryBoys = state.deliveryBoys.filter(boy => boy._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteDeliveryBoy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete delivery boy.";
            })

            // --- PRODUCTS ---
            .addCase(fetchAllProducts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.products = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch products.";
            })
            .addCase(fetchProductById.pending, (state) => { state.loading = true; state.error = null; state.selectedProduct = null; })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.selectedProduct = action.payload.product;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch product by ID.";
                state.selectedProduct = null;
            })
            .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(prod => prod._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                if (state.selectedProduct && state.selectedProduct._id === action.payload._id) {
                    state.selectedProduct = action.payload;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update product.";
            })
            .addCase(deleteProduct.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(prod => prod._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete product.";
            })

            // --- ORDERS ---
            .addCase(fetchAllOrders.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.orders = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch orders.";
            })
            .addCase(fetchOrderById.pending, (state) => { state.loading = true; state.error = null; state.selectedOrder = null; })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.selectedOrder = action.payload.order;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to fetch order by ID.";
                state.selectedOrder = null;
            })
            .addCase(updateOrder.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateOrder.fulfilled, (state, action) => {
                const index = state.orders.findIndex(ord => ord._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                if (state.selectedOrder && state.selectedOrder._id === action.payload._id) {
                    state.selectedOrder = action.payload;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(updateOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update order.";
            })
            .addCase(deleteOrder.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.orders = state.orders.filter(ord => ord._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete order.";
            });
    },
});

export const {
    logoutAdmin,
    clearAdminError,
    setSelectedAdmin,
    setSelectedUser,
    setSelectedVendor,
    setSelectedDeliveryBoy,
    setSelectedProduct,
    setSelectedOrder,
} = adminSlice.actions;

export default adminSlice.reducer;