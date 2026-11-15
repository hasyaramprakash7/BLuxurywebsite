import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector, Provider } from "react-redux";
import { store } from "./app/store";
import { fetchUserProfile } from "./features/user/authSlice";
import { fetchVendorProfile } from "./features/vendor/vendorAuthSlice";
import { fetchDeliveryBoyProfile } from "./features/delivery/deliveryBoySlice";
import { fetchAdminProfile } from "./features/admin/adminSlice";
import { useSocket } from "./hooks/useSocket";

// Common
import Login from "./component/Login";
import Signup from "./component/Signup";
import Main from "./component/Main1";
import HomePage from "./component/Home/HomePage";
import Cart from "./component/Cart";
import OrderScreen from "./component/OrderScreen";
import SearchComponent from "./component/Search/SearchComponent";

// Social
import FeedScreen from "./component/ads/FeedScreen";
import ExploreScreen from "./component/ads/ExploreScreen";
import CreatePostScreen from "./component/ads/CreatePostScreen";
import PostDetailScreen from "./component/ads/PostDetailScreen";
import ProfileScreen from "./component/ads/ProfileScreen";
import MessagesScreen from "./component/ads/MessagesScreen";
import ChatScreen from "./component/ads/ChatScreen";
import NotificationsScreen from "./component/ads/NotificationsScreen";
import MapScreen from "./component/ads/MapScreen";
import SearchScreen from "./component/ads/SearchScreen";
import HashtagPostsScreen from "./component/social/HashtagPostsScreen";

// Vendor / Delivery / Admin
import SignupVendor from "./VendorComponents/SignupVendor";
import VendorLogin from "./VendorComponents/VendorLogin";
import VendorDashboard from "./VendorComponents/VendorDashboard";
import VendorProductCRUD from "./VendorComponents/VendorProductCRUD";
import AllVendorProducts from "./VendorComponents/AllVendorProducts";
import InsuranceProductCRUDScreen from "./VendorComponents/InsuranceProductCRUDScreen";
import VendorAppointmentsList from "./VendorComponents/VendorAppointmentsList";

import DeliveryBoyLogin from "./deliveryComponent/DeliveryBoyLogin";
import DeliveryBoyRegister from "./deliveryComponent/DeliveryBoyRegister";
import DeliveryBoyDashboard from "./deliveryComponent/DeliveryBoyDashboard";
import VendorActiveDeliveryBoys from "./VendorComponents/venderDeliveryboy/VendorActiveDeliveryBoys";
import ProductDetails from "./VendorComponents/ProductDetails";
import DeliveryBoyOrderList from "./deliveryComponent/DeliveryBoyOrderList";
import SearchInversLandingPage from "./SearchInversLandingPage";
import VendorOrderList from "./VendorComponents/VendorOrderList";
import GenerateInvoicePage from "./VendorComponents/GenerateInvoicePage";
import VendorShopProducts from "./VendorComponents/VendorShopProducts";

import AdminLogin from "./admin/AdminLogin";
import AdminRegister from "./admin/AdminRegister";
import AdminDashboard from "./admin/AdminDashboard";
import AdminControlPanel from "./admin/AdminControlPanel";
import InsuranceProducts from "./VendorComponents/InsuranceProducts";

const isCleanToken = (t) =>
  !!t && t !== "undefined" && t !== "null" && t.trim() !== "";

/* ─────────── Auth guards ─────────── */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const VendorPrivateRoute = ({ children }) => {
  const { vendor, loading } = useSelector((s) => s.vendorAuth);
  const location = useLocation();
  if (loading) return <div>Loading...</div>;
  return vendor ? (
    children
  ) : (
    <Navigate to="/vendorlogin" state={{ from: location }} replace />
  );
};

const DeliveryBoyPrivateRoute = ({ children }) => {
  const { token, loading } = useSelector((s) => s.deliveryBoyAuth);
  const location = useLocation();
  const localToken = localStorage.getItem("deliveryBoyToken");
  const activeToken = token || (isCleanToken(localToken) ? localToken : null);
  if (loading) return <div>Loading...</div>;
  return activeToken ? (
    children
  ) : (
    <Navigate to="/delivery-login" state={{ from: location }} replace />
  );
};

const AdminPrivateRoute = ({ children }) => {
  const { token, loading } = useSelector((s) => s.admin);
  const location = useLocation();
  const localToken = localStorage.getItem("adminToken");
  const activeToken = token || (isCleanToken(localToken) ? localToken : null);
  if (loading) return <div>Loading...</div>;
  return activeToken ? (
    children
  ) : (
    <Navigate to="/admin/login" state={{ from: location }} replace />
  );
};

/* ─────────── Socket bootstrap ───────────
   Placed INSIDE <Router> as a sibling of <Routes>.
   It never renders UI — just keeps the socket alive. */
const SocketBootstrap = () => {
  useSocket();
  return null;
};

/* ─────────── Auth bootstrap ─────────── */
const AuthBootstrap = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (isCleanToken(userToken)) dispatch(fetchUserProfile());
    const vendorToken = localStorage.getItem("vendorToken");
    if (isCleanToken(vendorToken)) dispatch(fetchVendorProfile());
    const deliveryToken = localStorage.getItem("deliveryBoyToken");
    if (isCleanToken(deliveryToken)) dispatch(fetchDeliveryBoyProfile());
    const adminToken = localStorage.getItem("adminToken");
    if (isCleanToken(adminToken)) dispatch(fetchAdminProfile());
  }, [dispatch]);
  return null;
};

/* ─────────── Routes ─────────── */
const AppRoutes = () => (
  <Router>
    <AuthBootstrap />
    <SocketBootstrap />
    <Routes>
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/dashboard" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
      <Route path="/admin/control-panel" element={<AdminPrivateRoute><AdminControlPanel /></AdminPrivateRoute>} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Vendor auth */}
      <Route path="/vendorsignup" element={<SignupVendor />} />
      <Route path="/vendorlogin" element={<VendorLogin />} />

      {/* Delivery Boy */}
      <Route path="/delivery-login" element={<DeliveryBoyLogin />} />
      <Route path="/delivery-register" element={<DeliveryBoyRegister />} />
      <Route path="/delivery-dashboard" element={<DeliveryBoyPrivateRoute><DeliveryBoyDashboard /></DeliveryBoyPrivateRoute>} />
      <Route path="/vendor/active-delivery-boys" element={<VendorActiveDeliveryBoys />} />
      <Route path="/deliveryboy/:id/orders" element={<DeliveryBoyOrderList />} />

      {/* Root → Feed */}
      <Route path="/" element={<FeedScreen />} />

      {/* Shopping */}
      <Route path="/profile" element={<PrivateRoute><Main /></PrivateRoute>} />
      <Route path="/main" element={<HomePage />} />
      <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
      <Route path="/order" element={<PrivateRoute><OrderScreen /></PrivateRoute>} />
      <Route path="/search" element={<SearchComponent />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/insP" element={<PrivateRoute><InsuranceProducts /></PrivateRoute>} />

      {/* Social / Ads — public reads */}
      <Route path="/feed" element={<FeedScreen />} />
      <Route path="/explore" element={<ExploreScreen />} />
      <Route path="/post/:id" element={<PostDetailScreen />} />
      <Route path="/profile/:userId" element={<ProfileScreen />} />
      <Route path="/map" element={<MapScreen />} />
      <Route path="/discover" element={<SearchScreen />} />
      <Route path="/hashtag/:tag" element={<HashtagPostsScreen />} />

      {/* Social / Ads — auth required */}
      <Route path="/create" element={<PrivateRoute><CreatePostScreen /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><MessagesScreen /></PrivateRoute>} />
      <Route path="/chat/:conversationId" element={<PrivateRoute><ChatScreen /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><NotificationsScreen /></PrivateRoute>} />

      {/* Vendor */}
      <Route path="/vendorCRUD" element={<VendorPrivateRoute><VendorProductCRUD /></VendorPrivateRoute>} />
      <Route path="/vendorList" element={<VendorPrivateRoute><AllVendorProducts /></VendorPrivateRoute>} />
      <Route path="/vendorDashboard" element={<VendorPrivateRoute><VendorDashboard /></VendorPrivateRoute>} />
      <Route path="/VendorOrderList" element={<VendorPrivateRoute><VendorOrderList /></VendorPrivateRoute>} />
      <Route path="/vendor/generate-invoice" element={<VendorPrivateRoute><GenerateInvoicePage /></VendorPrivateRoute>} />
      <Route path="/vendor/vendorShopProducts" element={<VendorPrivateRoute><VendorShopProducts /></VendorPrivateRoute>} />
      <Route path="/vendor/insu" element={<VendorPrivateRoute><InsuranceProductCRUDScreen /></VendorPrivateRoute>} />
      <Route path="/vendor/appointments" element={<VendorPrivateRoute><VendorAppointmentsList /></VendorPrivateRoute>} />

      <Route path="/SearchInversLandingPage" element={<SearchInversLandingPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  </Router>
);

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}