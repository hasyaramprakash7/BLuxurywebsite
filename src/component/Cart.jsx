import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, clearCart } from "../features/cart/cartSlice";
import { placeOrder } from "../features/order/orderSlice";
import { updateProduct } from "../features/vendor/vendorProductSlice"; // Assuming this handles stock updates
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Navbar from "./Home/Navbar";
import { Package, MapPin, ReceiptText, XCircle, CheckCircle, Truck, HandCoins } from "lucide-react"; // Added Truck, HandCoins
import { useNavigate } from "react-router-dom";

// Import the new components
import CartItem from './CartItem';
import OrderSummary from './OrderSummary'; // Assuming OrderSummary is the main sidebar summary

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, loading, error } = useSelector((state) => state.cart);
    const { loading: orderLoading } = useSelector((state) => state.order);

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false);

    // Pricing constants - centralized and easily configurable
    const DELIVERY_CHARGE = 75;
    const FREE_DELIVERY_THRESHOLD = 200;
    const PLATFORM_FEE_RATE = 0.10; // 10%
    const GST_RATE = 0.18; // Corrected to 18% GST

    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        street: "",
        street2: "",
        landmark: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India", // Default to India as per previous code and pincode logic
    });

    // Helper function to calculate effective price (copied to CartItem.jsx as well)
    const getEffectivePrice = (product, quantity) => {
        let price = product.discountedPrice || product.price || 0;

        if (product.largeQuantityPrice && product.largeQuantityMinimumUnits && quantity >= product.largeQuantityMinimumUnits) {
            price = product.largeQuantityPrice;
        } else if (product.bulkPrice && product.bulkMinimumUnits && quantity >= product.bulkMinimumUnits) {
            price = product.bulkPrice;
        }
        return price;
    };

    // Function to handle auto-filling city and state based on pincode using Nominatim
    const handlePincodeBlur = useCallback(async () => {
        const { zipCode } = address; // Use 'address.zipCode' from component state

        if (!zipCode || zipCode.length !== 6 || isNaN(zipCode)) {
            toast.info("Please enter a valid 6-digit pincode to auto-fill city/state.");
            return;
        }

        try {
            console.log("Fetching address using pincode:", zipCode);

            const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                    postalcode: zipCode,
                    format: "json",
                    addressdetails: 1,
                    countrycodes: "in", // Crucial for India-specific pincodes
                    limit: 1,
                },
                headers: {
                    'User-Agent': 'GrocerEase-CartPage/1.0 (contact@grocer-ease.com)' // IMPORTANT: Replace with your actual app name and email
                }
            });

            console.log("Pincode search response:", res.data);

            if (res.data.length > 0) {
                const location = res.data[0];
                const addr = location.address;

                setAddress((prev) => ({
                    ...prev,
                    // Added addr.county to the fallback for city
                    city: addr.city || addr.town || addr.village || addr.county || prev.city,
                    state: addr.state || prev.state,
                    country: addr.country || "India",
                    // Optionally update latitude and longitude from pincode if it's considered accurate enough
                    latitude: parseFloat(location.lat) || prev.latitude,
                    longitude: parseFloat(location.lon) || prev.longitude,
                }));
                toast.success("City and State pre-filled from pincode!");
            } else {
                toast.warn("No address details found for this pincode.");
            }
        } catch (err) {
            console.error("Error fetching from pincode:", err);
            toast.error("Failed to fetch address from pincode. Please try again or fill manually.");
        }
    }, [address.zipCode]); // Dependency array: re-run if pincode changes


    // Effect hook to fetch cart and auto-detect/pre-fill address based on geolocation
    useEffect(() => {
        dispatch(fetchCart());

        // Attempt to pre-fill address from user's stored data if available
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setAddress((prev) => ({
                fullName: user.address?.fullName || user.username || prev.fullName,
                phone: user.phone || prev.phone,
                street: user.address?.street || prev.street,
                street2: user.address?.street2 || prev.street2,
                landmark: user.address?.landmark || prev.landmark,
                city: user.address?.city || user.address?.town || user.address?.village || user.address?.county || prev.city, // Added user.address?.county here as well for consistency
                state: user.address?.state || prev.state,
                zipCode: user.address?.pincode || prev.zipCode,
                country: user.address?.country || "India",
            }));
        }

        // Check for Geolocation API support
        if (!navigator.geolocation) {
            toast.warn("Geolocation not supported by your browser. Please enter your address manually.");
            return;
        }

        // Get current position and attempt reverse geocoding
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude);
                setLongitude(longitude);
                console.log("Geolocation success:", { latitude, longitude });


                try {
                    // Using Nominatim OpenStreetMap for reverse geocoding
                    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                        params: {
                            lat: latitude,
                            lon: longitude,
                            format: "json",
                            addressdetails: 1,
                            zoom: 16, // Increase zoom for more detailed address
                        },
                        headers: {
                            'User-Agent': 'GrocerEase-CartPage/1.0 (contact@grocer-ease.com)' // IMPORTANT: Replace with your actual app name and email
                        }
                    });

                    const addr = res.data?.address || {};
                    console.log("📍 Reverse geocoding result:", addr); // For debugging

                    // Update address state with detected details, preferring detected over existing if more specific
                    setAddress((prev) => ({
                        ...prev,
                        street: addr.road || addr.building || prev.street,
                        landmark: addr.neighbourhood || addr.suburb || prev.landmark,
                        // Added addr.county to the fallback for city here for reverse geocoding too
                        city: addr.city || addr.town || addr.village || addr.county || prev.city,
                        state: addr.state || prev.state,
                        zipCode: addr.postcode || prev.zipCode, // Use postcode from reverse geocoding
                        country: addr.country || "India",
                    }));
                    toast.success("Location detected and address pre-filled!");
                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                    toast.warn("Failed to auto-detect address from location. Please fill manually.");
                }
            },
            (err) => {
                console.error("Geolocation error:", err.message);
                let errorMessage = "Could not get your precise location. Please fill address manually.";
                if (err.code === err.PERMISSION_DENIED) {
                    errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    errorMessage = "Location information is unavailable.";
                } else if (err.code === err.TIMEOUT) {
                    errorMessage = "Attempt to get location timed out.";
                }
                toast.warn(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 } // Geolocation options
        );
    }, [dispatch]); // Dependency array: run once on mount, or if dispatch changes (unlikely)


    const handleClear = () => {
        dispatch(clearCart())
            .unwrap()
            .then(() => toast.success("Cart cleared successfully!"))
            .then(() => {
                navigate('/main');
            })
            .catch((err) => toast.error(err?.message || "Failed to clear cart."));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenAddressModal = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            toast.error("You need to be logged in to place an order.");
            navigate('/login');
            return;
        }
        if (items.length === 0) {
            toast.warn("Your cart is empty. Add items before placing an order.");
            return;
        }
        setShowAddressModal(true);
    };

    const handleConfirmAddress = () => {
        // Basic validation for required fields
        if (!address.fullName.trim() || !address.phone.trim() || !address.street.trim() || !address.city.trim() || !address.state.trim() || !address.zipCode.trim()) {
            toast.error("Please fill in all *required fields (Full Name, Phone, Street, City, State, ZIP Code).");
            return;
        }
        // Phone number validation (10 digits)
        if (!/^\d{10}$/.test(address.phone.trim())) {
            toast.error("Please enter a valid 10-digit phone number.");
            return;
        }
        // ZIP code validation (6 digits for India)
        if (!/^\d{6}$/.test(address.zipCode.trim())) {
            toast.error("Please enter a valid 6-digit ZIP code.");
            return;
        }

        setShowAddressModal(false);
        setShowConfirmOrderModal(true);
    };

    const handleEditAddress = () => {
        setShowConfirmOrderModal(false);
        setShowAddressModal(true);
    };

    // Memoize pricing calculations to prevent unnecessary re-renders
    const pricingBreakdown = useMemo(() => {
        const itemsSubtotal = items.reduce((sum, item) => {
            const product = item.productId || {};
            const originalPrice = product.price || 0;
            return sum + (originalPrice * item.quantity);
        }, 0);

        const discountedSubtotal = items.reduce((sum, item) => {
            const product = item.productId || {};
            const effectivePrice = getEffectivePrice(product, item.quantity);
            return sum + (effectivePrice * item.quantity);
        }, 0);

        const totalSavings = itemsSubtotal - discountedSubtotal;

        // Delivery charge logic
        const deliveryCharge = discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

        // Platform fee calculation
        const platformFee = discountedSubtotal * PLATFORM_FEE_RATE;

        // GST calculation: Apply GST on (discountedSubtotal + platformFee)
        const gstAmount = (discountedSubtotal + platformFee) * GST_RATE;

        // Final total
        const finalTotal = discountedSubtotal + deliveryCharge + platformFee + gstAmount;

        return {
            itemsSubtotal,
            discountedSubtotal,
            totalSavings,
            deliveryCharge,
            platformFee,
            gstAmount,
            finalTotal
        };
    }, [items, DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD, PLATFORM_FEE_RATE, GST_RATE]);

    const handlePlaceOrderConfirmed = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token"); // User token
        // Assuming vendorToken is stored client-side for stock updates.
        // In a real-world scenario, stock updates would often be handled by a backend service
        // or a dedicated vendor API authenticated separately.
        const vendorToken = localStorage.getItem("vendorToken");

        if (!token || !user) {
            toast.error("You need to be logged in to place an order.");
            setShowConfirmOrderModal(false);
            navigate('/login');
            return;
        }

        // Check if all cart items have a valid `productId` and `vendorId`
        const invalidItems = items.filter(item => !item.productId?._id || !item.productId?.vendorId);
        if (invalidItems.length > 0) {
            toast.error("Some items in your cart are invalid or missing vendor information. Please remove them.");
            return;
        }

        if (items.length === 0) {
            toast.error("Your cart is empty. No order to place.");
            setShowConfirmOrderModal(false);
            return;
        }

        // Group items by vendor to create separate orders if necessary (as per common e-commerce logic)
        const vendorGroups = items.reduce((groups, item) => {
            const vendorId = item.productId.vendorId; // Assuming productId and vendorId are populated
            if (!groups[vendorId]) groups[vendorId] = [];
            groups[vendorId].push(item);
            return groups;
        }, {});

        try {
            const placedOrders = [];
            for (const vendorId in vendorGroups) {
                const vendorItems = vendorGroups[vendorId];

                // Note: The current implementation sends overall cart totals to each vendor's order.
                // If your backend expects per-vendor calculated totals, you would calculate them here:
                /*
                let vendorSubtotal = vendorItems.reduce((sum, item) => getEffectivePrice(item.productId, item.quantity) * item.quantity, 0);
                let vendorPlatformFee = vendorSubtotal * PLATFORM_FEE_RATE;
                let vendorGSTAmount = (vendorSubtotal + vendorPlatformFee) * GST_RATE;
                let vendorTotal = vendorSubtotal + vendorPlatformFee + vendorGSTAmount; // Delivery might be tricky per-vendor
                */

                const orderData = {
                    userId: user._id,
                    vendorId, // Specific vendor for this group of items
                    address: {
                        ...address,
                        latitude: latitude ?? null, // Include detected latitude
                        longitude: longitude ?? null, // Include detected longitude
                    },
                    items: vendorItems.map((item) => ({
                        productId: item.productId._id,
                        name: item.productId.name,
                        quantity: item.quantity,
                        price: getEffectivePrice(item.productId, item.quantity), // This is the unit price for this order item
                        productImage: item.productId.images?.[0],
                        vendorId: item.productId.vendorId,
                    })),
                    // Sending overall cart totals. Adjust if backend needs per-vendor totals.
                    total: pricingBreakdown.finalTotal,
                    subtotal: pricingBreakdown.discountedSubtotal,
                    deliveryCharge: pricingBreakdown.deliveryCharge,
                    platformFee: pricingBreakdown.platformFee,
                    gstAmount: pricingBreakdown.gstAmount,
                    totalSavings: pricingBreakdown.totalSavings,
                    status: "placed", // Initial status
                    paymentMethod,
                };

                // Dispatch placeOrder action for each vendor group
                const resultAction = await dispatch(placeOrder(orderData)).unwrap();
                placedOrders.push(resultAction);
                toast.success(`Order placed with vendor ${vendorId.substring(0, 5)}...`);

                // Stock decrement logic for each product after successful order placement
                for (const item of vendorItems) {
                    const productId = item.productId._id;
                    const orderedQuantity = item.quantity;
                    const currentStock = item.productId.stock;

                    if (productId && currentStock !== undefined && vendorToken) {
                        const newStock = Math.max(0, currentStock - orderedQuantity); // Ensure stock doesn't go below zero
                        const formData = new FormData();
                        formData.append('stock', newStock); // Prepare data for stock update

                        try {
                            // Dispatch updateProduct thunk to update vendor's product stock
                            // Note: This assumes your updateProduct thunk can handle sending a FormData object
                            // and that the vendorToken is sufficient for authentication for this update.
                            await dispatch(updateProduct({ id: productId, formData, token: vendorToken })).unwrap();
                            toast.info(`Stock for "${item.productId.name}" updated on vendor side.`);
                        } catch (stockUpdateError) {
                            console.error(`Failed to update stock for product ${productId}:`, stockUpdateError);
                            toast.error(`Warning: Failed to update stock for "${item.productId.name}". Please notify vendor.`);
                        }
                    } else if (!vendorToken) {
                        console.warn("Vendor token is missing. Stock update skipped.");
                    }
                }
            }

            toast.success("All orders placed and stock updated successfully!");
            dispatch(clearCart()); // Clear cart after all orders are placed
            setShowConfirmOrderModal(false);
            navigate('/order'); // Redirect to order history or confirmation page
        } catch (err) {
            console.error("Order placement error:", err);
            // Display a more user-friendly error message
            toast.error("Order failed: " + (err.message?.message || err.message || "An unexpected error occurred."));
            setShowConfirmOrderModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-20">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">Your Shopping Cart</h1>

                {loading && (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
                        <p className="ml-4 text-gray-700 text-lg">Loading your cart...</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline ml-2">{error.message?.message || error.message || "Failed to load cart items."}</span>
                        {error.message === "Authentication required. Please log in." && (
                            <button
                                onClick={() => navigate('/login')}
                                className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Login
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && items.length === 0 ? (
                    <div className="text-center bg-white p-10 rounded-lg shadow-md mt-10">
                        <Package size={64} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-xl font-medium">Your cart is feeling a little empty.</p>
                        <p className="text-gray-500 mt-2">Discover amazing products and fill it up!</p>
                        <button
                            onClick={() => navigate('/main')}
                            className="mt-6 px-8 py-3 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-800 transition duration-300"
                        >
                            Shop Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => (
                                <CartItem key={item._id} item={item} loading={loading} />
                            ))}
                        </div>

                        {/* Order Summary Section */}
                        <OrderSummary
                            items={items}
                            pricingBreakdown={pricingBreakdown}
                            DELIVERY_CHARGE={DELIVERY_CHARGE}
                            FREE_DELIVERY_THRESHOLD={FREE_DELIVERY_THRESHOLD}
                            PLATFORM_FEE_RATE={PLATFORM_FEE_RATE}
                            GST_RATE={GST_RATE}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            handleOpenAddressModal={handleOpenAddressModal}
                            handleClear={handleClear}
                            orderLoading={orderLoading}
                        />
                    </div>
                )}

                {/* Address Modal */}
                {showAddressModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform scale-100 opacity-100 transition-all duration-300 ease-out animate-fade-in-up">
                            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                                <MapPin className="inline-block mr-2 text-green-700" size={28} />
                                Enter Delivery Address
                            </h2>
                            <p className="text-sm text-gray-600 mb-6 text-center">Fields marked with <span className="text-red-500">*</span> are required.</p>
                            {/* Scrollable content wrapper */}
                            <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                        <input id="fullName" name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="John Doe" className="border border-gray-300 p-3 rounded-lg w-full focus:ring-green-500 focus:border-green-500 transition" required />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                        <input id="phone" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="e.g., 9876543210" className="border border-gray-300 p-3 rounded-lg w-full focus:ring-green-500 focus:border-green-500 transition" required type="tel" maxLength="10" />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street Address <span className="text-red-500">*</span></label>
                                        <input id="street" name="street" value={address.street} onChange={handleAddressChange} placeholder="House No., Building Name" className="border border-gray-300 p-3 rounded-lg w-full focus:ring-green-500 focus:border-green-500 transition" required />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label htmlFor="street2" className="block text-sm font-medium text-gray-700 mb-1">Apartment, Suite, Floor (Optional)</label>
                                        <input id="street2" name="street2" value={address.street2} onChange={handleAddressChange} placeholder="Apt, Suite, Unit, etc." className="border border-gray-300 p-3 rounded-lg w-full focus:ring-green-500 focus:border-green-500 transition" />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">Landmark (e.g., Near XYZ Mall)</label>
                                        <input id="landmark" name="landmark" value={address.landmark} onChange={handleAddressChange} placeholder="e.g., Near Main Market" className="border border-gray-300 p-3 rounded-lg w-full focus:ring-green-500 focus:border-green-500 transition" />
                                    </div>
                                    <div>
                                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code <span className="text-red-500">*</span></label>
                                        <input
                                            id="zipCode"
                                            name="zipCode"
                                            value={address.zipCode}
                                            onChange={handleAddressChange}
                                            onBlur={handlePincodeBlur} // Trigger auto-fill on blur
                                            placeholder="e.g., 530001"
                                            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-green-500 focus:border-green-500 transition"
                                            required
                                            type="text"
                                            pattern="\d{6}"
                                            maxLength="6"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Enter ZIP code to auto-fill City/State.</p>
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                        <input id="city" name="city" value={address.city} onChange={handleAddressChange} placeholder="City" className="border border-gray-300 p-3 rounded-lg w-full focus:ring-green-500 focus:border-green-500 transition" required />
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                                        <input id="state" name="state" value={address.state} onChange={handleAddressChange} placeholder="State" className="border border-gray-300 p-3 rounded-lg w-full focus:ring-green-500 focus:border-green-500 transition" required />
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <input id="country" name="country" value={address.country} onChange={handleAddressChange} placeholder="Country" className="border border-gray-300 p-3 rounded-lg w-full bg-gray-100 cursor-not-allowed" readOnly />
                                    </div>
                                </div>
                            </div> {/* End of scrollable content wrapper for Address Modal */}
                            <div className="flex justify-end gap-4 mt-8">
                                <button onClick={() => setShowAddressModal(false)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-semibold shadow-md">Cancel</button>
                                <button onClick={handleConfirmAddress} className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200 font-semibold shadow-md">Continue to Summary</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Order Dialog - REVISED SECTION */}
                {showConfirmOrderModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 sm:p-6">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg
                                    flex flex-col h-full sm:max-h-[90vh]   {/* h-full for mobile, max-h-90vh for larger */}
                                    transform scale-100 opacity-100 transition-all duration-300 ease-out animate-fade-in-up">

                            {/* Modal Header */}
                            <div className="p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
                                    Confirm Your Order
                                </h2>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-grow overflow-y-auto px-6 py-4 custom-scrollbar">

                                {/* Order Summary Section */}
                                <section className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <ReceiptText size={20} className="text-blue-600" /> Order Summary
                                    </h3>
                                    <div className="space-y-2 text-base text-gray-700">
                                        <div className="flex justify-between">
                                            <span>Items Subtotal</span>
                                            <span>₹{pricingBreakdown.itemsSubtotal.toFixed(2)}</span> {/* Changed to itemsSubtotal for consistency with image */}
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery Charges</span>
                                            {pricingBreakdown.deliveryCharge === 0 ? (
                                                <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle size={16} /> FREE</span>
                                            ) : (
                                                <span className="font-medium">₹{pricingBreakdown.deliveryCharge.toFixed(2)}</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Platform Fee ({Math.round(PLATFORM_FEE_RATE * 100)}%)</span>
                                            <span>₹{pricingBreakdown.platformFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>GST ({Math.round(GST_RATE * 100)}%)</span>
                                            <span>₹{pricingBreakdown.gstAmount.toFixed(2)}</span>
                                        </div>

                                        <hr className="my-3 border-gray-200" /> {/* Separator */}

                                        <div className="flex justify-between font-bold text-lg sm:text-xl text-gray-900">
                                            <span>Total Payable</span>
                                            <span className="text-green-700">₹{pricingBreakdown.finalTotal.toFixed(2)}</span>
                                        </div>
                                        {pricingBreakdown.totalSavings > 0 && (
                                            <div className="text-sm text-green-700 bg-green-50 p-2 rounded-lg mt-2 flex items-center justify-center gap-1 border border-green-200">
                                                <HandCoins size={16} /> Your Total Savings ₹{pricingBreakdown.totalSavings.toFixed(2)} 🎉
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Delivery Address Section */}
                                <section className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <MapPin size={20} className="text-orange-600" /> Delivery Address
                                    </h3>
                                    <div className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="font-medium">{address.fullName} - {address.phone}</p>
                                        <p>{address.street}</p>
                                        {address.street2 && <p>{address.street2}</p>}
                                        {address.landmark && <p>Landmark: {address.landmark}</p>}
                                        <p>{address.city}, {address.state} - {address.zipCode}</p>
                                        <p>{address.country}</p>
                                        <button
                                            onClick={handleEditAddress}
                                            className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                            Edit Address
                                        </button>
                                    </div>
                                </section>

                                {/* Payment Method Section */}
                                <section>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <HandCoins size={20} className="text-purple-600" /> Payment Method
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2 text-base text-gray-800">
                                            {/* Custom radio button like styling for COD */}
                                            <span className="w-4 h-4 rounded-full border-2 border-green-600 flex items-center justify-center">
                                                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                            </span>
                                            <span>Cash on Delivery (COD)</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">Currently, only Cash on Delivery is available.</p>
                                    </div>
                                </section>

                            </div> {/* End of Scrollable Content Area */}

                            {/* Modal Footer (Action Buttons) */}
                            <div className="p-6 pt-4 border-t border-gray-200 flex justify-end gap-4 flex-shrink-0">
                                <button
                                    onClick={() => setShowConfirmOrderModal(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-semibold shadow-sm text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePlaceOrderConfirmed}
                                    className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200 font-semibold shadow-md text-lg
                                           flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={orderLoading || items.length === 0}
                                >
                                    {orderLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} /> Place Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default Cart;