import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  // 💡 NOTE: useNavigate is used inside child components, not here
} from "react-router-dom";
import { useDispatch, useSelector, Provider } from "react-redux";
import { store } from "./app/store";
import { fetchUserProfile } from "./features/user/authSlice";
import { fetchVendorProfile } from "./features/vendor/vendorAuthSlice";
import { fetchDeliveryBoyProfile } from "./features/delivery/deliveryBoySlice";
import { fetchAdminProfile } from "./features/admin/adminSlice";

// Common Components (Assume these are updated as per the conceptual code below)
import Login from "./component/Login";
import Signup from "./component/Signup";
import Main from "./component/Main1";
import HomePage from "./component/Home/HomePage";
import Cart from "./component/Cart";
import OrderScreen from "./component/OrderScreen";
import SearchComponent from "./component/Search/SearchComponent";

// Vendor Components
import SignupVendor from "./VendorComponents/SignupVendor";
import VendorLogin from "./VendorComponents/VendorLogin";
import VendorDashboard from "./VendorComponents/VendorDashboard";
import VendorProductCRUD from "./VendorComponents/VendorProductCRUD";
import AllVendorProducts from "./VendorComponents/AllVendorProducts";
import InsuranceProductCRUDScreen from "./VendorComponents/InsuranceProductCRUDScreen";
import VendorAppointmentsList from "./VendorComponents/VendorAppointmentsList";

// Delivery Boy Components
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

// Admin Components
import AdminLogin from "./admin/AdminLogin";
import AdminRegister from "./admin/AdminRegister";
import AdminDashboard from "./admin/AdminDashboard";
import AdminControlPanel from "./admin/AdminControlPanel";
import InsuranceProducts from "./VendorComponents/InsuranceProducts";


// -------- Private Route Components --------
const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const VendorPrivateRoute = ({ children }) => {
  const { vendor, loading } = useSelector((state) => state.vendorAuth);
  if (loading) return <div>Loading...</div>;
  return vendor ? children : <Navigate to="/vendorlogin" />;
};

const DeliveryBoyPrivateRoute = ({ children }) => {
  const { token, loading } = useSelector((state) => state.deliveryBoyAuth);
  if (loading) return <div>Loading...</div>;
  return token ? children : <Navigate to="/delivery-login" />;
};

const AdminPrivateRoute = ({ children }) => {
  const { token, loading } = useSelector((state) => state.admin);
  if (loading) return <div>Loading...</div>;
  return token ? children : <Navigate to="/admin/login" />;
};

// -------- App Routes Component --------
const AppRoutes = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetches profile data if tokens are present, updating the Redux store.
    // The login components will read this state update and navigate away if needed.
    const userToken = localStorage.getItem("token");
    if (userToken) dispatch(fetchUserProfile());

    const vendorToken = localStorage.getItem("vendorToken");
    if (vendorToken) dispatch(fetchVendorProfile());

    const deliveryToken = localStorage.getItem("deliveryBoyToken");
    if (deliveryToken) dispatch(fetchDeliveryBoyProfile());

    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) dispatch(fetchAdminProfile());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
        <Route path="/admin/control-panel" element={<AdminPrivateRoute><AdminControlPanel /></AdminPrivateRoute>} />

        {/* User Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Vendor Auth */}
        <Route path="/vendorsignup" element={<SignupVendor />} />
        <Route path="/vendorlogin" element={<VendorLogin />} />

        {/* Delivery Boy Auth */}
        <Route path="/delivery-login" element={<DeliveryBoyLogin />} />
        <Route path="/delivery-register" element={<DeliveryBoyRegister />} />

        {/* Delivery Boy Dashboard (Protected) */}
        <Route path="/delivery-dashboard" element={<DeliveryBoyPrivateRoute><DeliveryBoyDashboard /></DeliveryBoyPrivateRoute>} />

        <Route path="/vendor/active-delivery-boys" element={<VendorActiveDeliveryBoys />} />
        <Route path="/deliveryboy/:id/orders" element={<DeliveryBoyOrderList />} />

        {/* User Routes (Protected) */}
        <Route path="/profile" element={<PrivateRoute><Main /></PrivateRoute>} />
        <Route path="/main" element={<HomePage />} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/order" element={<PrivateRoute><OrderScreen /></PrivateRoute>} />
        <Route path="/search" element={<SearchComponent />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/insP" element={<PrivateRoute><InsuranceProducts /></PrivateRoute>} />


        {/* Vendor Routes (Protected) */}
        <Route path="/vendorCRUD" element={<VendorPrivateRoute><VendorProductCRUD /></VendorPrivateRoute>} />
        <Route path="/vendorList" element={<VendorPrivateRoute><AllVendorProducts /></VendorPrivateRoute>} />
        <Route path="/vendorDashboard" element={<VendorPrivateRoute><VendorDashboard /></VendorPrivateRoute>} />
        <Route path="/VendorOrderList" element={<VendorPrivateRoute><VendorOrderList /></VendorPrivateRoute>} />
        <Route path="/vendor/generate-invoice" element={<VendorPrivateRoute><GenerateInvoicePage /></VendorPrivateRoute>} />
        <Route path="/vendor/vendorShopProducts" element={<VendorPrivateRoute><VendorShopProducts /></VendorPrivateRoute>} />
        <Route path="/vendor/insu" element={<VendorPrivateRoute><InsuranceProductCRUDScreen /></VendorPrivateRoute>} />
        <Route path="/vendor/appointments" element={<VendorPrivateRoute><VendorAppointmentsList /></VendorPrivateRoute>} />


        <Route path="/SearchInversLandingPage" element={<SearchInversLandingPage />} />

        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/SearchInversLandingPage" />} />
      </Routes>
    </Router>
  );
};

// -------- App Component --------
export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}