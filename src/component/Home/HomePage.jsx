import React from 'react';
import Navbar from './Navbar';
import AllVendorProducts from '../../VendorComponents/AllVendorProducts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Profiler } from 'react';
import VendorShopProducts from '../../VendorComponents/VendorShopProducts';
import VenderProduct from '../../VendorComponents/VenderProduct';
import AllVendrProductData from '../../VendorComponents/AllVendrProductData';
import HomeScreen from './HomeScreen';
const HomePage = () => {
    return (
        <div>
            <Navbar />
            {/* <VendorShopProducts /> */}
            {/* <HomeScreen /> */}
            <AllVendrProductData />
            {/* <AllVendorProducts /> */}

            <ToastContainer position="bottom-right" autoClose={200} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

        </div>
    );
}

export default HomePage;
