import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// ─── Auth reducers ───
import authReducer from "../features/user/authSlice";
import vendorAuthReducer from "../features/vendor/vendorAuthSlice";
import deliveryBoyAuthReducer from "../features/delivery/deliveryBoySlice";
import adminReducer from "../features/admin/adminSlice";

// ─── Vendor / shopping ───
import vendorProductsReducer from "../features/vendor/vendorProductSlice";
import vendorOrderReducer from "../features/vendor/vendorOrderSlice";
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/order/orderSlice";
import insuranceReducer from "../features/insuranceSlice";
import appointmentReducer from "../features/appointmentSlice";

// ─── Social / Ads ───
import ads from "../features/ads/adsSlice";
import stories from "../features/social/storiesSlice";
import social from "../features/social/socialSlice";
import msg from "../features/social/messagesSlice";

/* ─────────────────────────────────────────────────────────────
   1. Combine reducers
   ───────────────────────────────────────────────────────────── */
const rootReducer = combineReducers({
  auth: authReducer,
  vendorAuth: vendorAuthReducer,
  deliveryBoyAuth: deliveryBoyAuthReducer,
  admin: adminReducer,

  vendorProducts: vendorProductsReducer,
  vendorOrders: vendorOrderReducer,
  cart: cartReducer,
  order: orderReducer,
  insurance: insuranceReducer,
  appointments: appointmentReducer,

  ads,
  stories,
  social,
  msg,
});

/* ─────────────────────────────────────────────────────────────
   2. Persist config
   - whitelist: state slices written to localStorage
   - blacklist: slices that must NOT be persisted
   
   Auth slices are blacklisted because `authSlice` already saves its
   own token + user object to localStorage. Persisting them twice
   would create stale-state conflicts on rehydrate.
   ───────────────────────────────────────────────────────────── */
const persistConfig = {
  key: "bluxury",
  version: 1,
  storage,
  whitelist: [
    "social",          // notifications, unread badge counts
    "msg",             // conversations + message threads
    "ads",             // feed items, postsById, myPosts, userPosts
    "stories",         // active stories + my stories
    "cart",            // shopping cart
    "order",           // last order state
    "vendorProducts",  // vendor catalog
    "vendorOrders",    // vendor order list
    "insurance",       // insurance products
    "appointments",    // appointment list
  ],
  blacklist: ["auth", "vendorAuth", "deliveryBoyAuth", "admin"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ─────────────────────────────────────────────────────────────
   3. Middleware that purges persisted social data on logout
   so the next user on the same device doesn't see stale
   notifications, chats, or messages from the previous session.
   ───────────────────────────────────────────────────────────── */
let persistorRef = null;

const logoutPurgeMiddleware = () => (next) => (action) => {
  const result = next(action);

  if (
    action.type === "auth/logoutUser/fulfilled" ||
    action.type === "auth/logout"
  ) {
    // Purge runs on next tick so the reducer has finished updating state
    setTimeout(() => {
      try {
        persistorRef?.purge();
      } catch (e) {
        console.warn("[store] purge failed:", e?.message);
      }
    }, 50);
  }

  return result;
};

/* ─────────────────────────────────────────────────────────────
   4. Store + persistor
   - serializableCheck ignores redux-persist's internal actions
     because their payloads are not always plain serializable objects
   ───────────────────────────────────────────────────────────── */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(logoutPurgeMiddleware),
});

export const persistor = persistStore(store);
persistorRef = persistor;

/* ─────────────────────────────────────────────────────────────
   5. Debug helpers (open DevTools console to use)
   ───────────────────────────────────────────────────────────── */
if (typeof window !== "undefined") {
  window.__persistor = persistor;
  window.__store = store;
  window.__clearPersisted = () => {
    localStorage.removeItem("persist:bluxury");
    console.log("[persist] storage cleared — reload to reset state");
  };
}