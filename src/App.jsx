// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector, Provider } from "react-redux";
import { store } from "./app/store";
import { fetchUserProfile } from "./features/user/authSlice";
import { fetchVendorProfile } from "./features/vendor/vendorAuthSlice";
import { fetchDeliveryBoyProfile } from "./features/delivery/deliveryBoySlice";

// Common Components
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

// Delivery Boy Components
import DeliveryBoyLogin from "./deliveryComponent/DeliveryBoyLogin";
import DeliveryBoyRegister from "./deliveryComponent/DeliveryBoyRegister";
import DeliveryBoyDashboard from "./deliveryComponent/DeliveryBoyDashboard";
import VendorActiveDeliveryBoys from "./VendorComponents/venderDeliveryboy/VendorActiveDeliveryBoys";
import ProductDetails from "./VendorComponents/ProductDetails";
// import DeliveryBoyOrders from "./deliveryComponent/DeliveryBoyOrders";
import DeliveryBoyOrderList from "./deliveryComponent/DeliveryBoyOrderList";
import SearchInversLandingPage from "./SearchInversLandingPage";
import VendorOrderList from "./VendorComponents/VendorOrderList";
import GenerateInvoicePage from "./VendorComponents/GenerateInvoicePage";
import VendorShopProducts from "./VendorComponents/VendorShopProducts";
import AdminLogin from "./admin/AdminLogin";
import AdminRegister from "./admin/AdminRegister";
import AdminDashboard from "./admin/AdminDashboard";
// import AssignDeliveryBoy from "./VendorComponents/venderDeliveryboy/AssignDeliveryBoy";


// Import components


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
    const userToken = localStorage.getItem("token");
    if (userToken) dispatch(fetchUserProfile());

    const vendorToken = localStorage.getItem("vendorToken");
    if (vendorToken) dispatch(fetchVendorProfile());

    const deliveryToken = localStorage.getItem("deliveryBoyToken");
    if (deliveryToken) dispatch(fetchDeliveryBoyProfile());
  }, [dispatch]);

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    const vendorToken = localStorage.getItem("vendorToken");
    const deliveryToken = localStorage.getItem("deliveryBoyToken");

    console.log("User:", userToken, "Vendor:", vendorToken, "Delivery:", deliveryToken);

    if (userToken) dispatch(fetchUserProfile());
    if (vendorToken) dispatch(fetchVendorProfile());
    if (deliveryToken) dispatch(fetchDeliveryBoyProfile());
  }, [dispatch]);


  return (
    <Router>
      <Routes>


        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={
          <AdminPrivateRoute>
            <AdminDashboard />
          </AdminPrivateRoute>
        } />

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
        <Route
          path="/delivery-dashboard"
          element={
            <DeliveryBoyPrivateRoute>
              <DeliveryBoyDashboard />
            </DeliveryBoyPrivateRoute>
          }
        />

        <Route path="/vendor/active-delivery-boys" element={<VendorActiveDeliveryBoys />} />


        <Route path="/deliveryboy/:id/orders" element={<DeliveryBoyOrderList />} />

        {/* User Routes (Protected) */}
        <Route path="/profile" element={<PrivateRoute><Main /></PrivateRoute>} />
        <Route path="/main" element={<><HomePage /></>} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/order" element={<PrivateRoute><OrderScreen /></PrivateRoute>} />
        <Route path="/search" element={<SearchComponent />} />

        <Route path="/product/:id" element={<ProductDetails />} />


        {/* Vendor Routes (Protected) */}
        <Route path="/vendorCRUD" element={<VendorPrivateRoute><VendorProductCRUD /></VendorPrivateRoute>} />
        <Route path="/vendorList" element={<VendorPrivateRoute><AllVendorProducts /></VendorPrivateRoute>} />
        <Route path="/vendorDashboard" element={<VendorPrivateRoute><VendorDashboard /></VendorPrivateRoute>} />
        <Route path="/VendorOrderList" element={<VendorPrivateRoute><VendorOrderList /></VendorPrivateRoute>} />
        <Route path="/vendor/generate-invoice" element={<VendorPrivateRoute><GenerateInvoicePage /></VendorPrivateRoute>} />
        <Route path="/vendor/vendorShopProducts " element={<VendorPrivateRoute><VendorShopProducts /></VendorPrivateRoute>} />

        {/* <Route path="/assign-delivery-boy" element={<AssignDeliveryBoy />} /> */}
        {/* SearchInversLandingPage */}
        <Route path="/SearchInversLandingPage" element={<SearchInversLandingPage />} />
        {/* <Route path="/ProductsSection" element={<ProductsSection />} /> */}

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
