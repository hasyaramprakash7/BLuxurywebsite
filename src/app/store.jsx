import { configureStore } from "@reduxjs/toolkit";

// Auth reducers
import authReducer from "../features/user/authSlice";
import vendorAuthReducer from "../features/vendor/vendorAuthSlice";
import deliveryBoyAuthReducer from "../features/delivery/deliveryBoySlice";
import adminReducer from "../features/admin/adminSlice";

// Vendor / shopping
import vendorProductsReducer from "../features/vendor/vendorProductSlice";
import vendorOrderReducer from "../features/vendor/vendorOrderSlice";
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/order/orderSlice";
import insuranceReducer from "../features/insuranceSlice";
import appointmentReducer from "../features/appointmentSlice";

// Social / Ads
import ads from "../features/ads/adsSlice";
import stories from "../features/social/storiesSlice";
import social from "../features/social/socialSlice";
import msg from "../features/social/messagesSlice";

export const store = configureStore({
  reducer: {
    // ─── Auth ───
    auth: authReducer,
    vendorAuth: vendorAuthReducer,
    deliveryBoyAuth: deliveryBoyAuthReducer,
    admin: adminReducer,

    // ─── Shopping / vendor ───
    vendorProducts: vendorProductsReducer,
    vendorOrders: vendorOrderReducer,
    cart: cartReducer,
    order: orderReducer,
    insurance: insuranceReducer,
    appointments: appointmentReducer,

    // ─── Social / Ads ───
    ads,
    stories,
    social,
    msg,
  },
});