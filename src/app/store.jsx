import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/user/authSlice";
import vendorAuthReducer from "../features/vendor/vendorAuthSlice";
import vendorProductsReducer from "../features/vendor/vendorProductSlice"
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/order/orderSlice";
import vendorOrderReducer from '../features/vendor/vendorOrderSlice'; // Import your vendor order slice
import deliveryBoyAuthReducer from "../features/delivery/deliveryBoySlice";
import adminReducer from '../features/admin/adminSlice';


export const store = configureStore({
    reducer: {
        admin: adminReducer,

        auth: authReducer,
        vendorAuth: vendorAuthReducer,
        vendorProducts: vendorProductsReducer,
        cart: cartReducer,
        order: orderReducer,
        vendorOrders: vendorOrderReducer, // <--- **THIS IS CRUCIAL**
        deliveryBoyAuth: deliveryBoyAuthReducer,


    },
});
