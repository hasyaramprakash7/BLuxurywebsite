import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    logoutVendor,
    updateVendorProfile,
    fetchVendorProfile,
    toggleVendorStatus
} from "../features/vendor/vendorAuthSlice";
import { fetchVendorOrders } from "../features/vendor/vendorOrderSlice";

import { Link } from "react-router-dom";
import VendorProfileCard from "./VendorProfileCard";
import VendorDashboardSidePanel from "./VendorDashboardSidePanel";
import { User, AlertCircle, CheckCircle, MapPin, Loader2 } from "lucide-react"; // Import MapPin and Loader2 icons
import axios from "axios"; // Import axios

/**
 * VendorDashboard Component (Parent Container)
 *
 * This component acts as the main dashboard container for vendors.
 * It manages the core state and logic, and renders sub-components for profile management,
 * quick actions, and business statistics.
 */
export default function VendorDashboard() {
    const dispatch = useDispatch();
    // Select vendor data and loading status from the Redux store
    const { vendor, loading: vendorAuthLoading } = useSelector((state) => state.vendorAuth);
    // Select orders data and loading status from the vendorOrders slice
    const { orders: vendorOrders, loading: vendorOrdersLoading, error: vendorOrdersError } = useSelector((state) => state.vendorOrders);

    // State for managing edit mode and form data
    const [isEditing, setIsEditing] = useState(false);
    const [shopImageFile, setShopImageFile] = useState(null); // Stores the actual file object for upload
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        shopName: "",
        shopImage: "", // This will hold the URL for display (either existing or object URL for new file)
        businessType: "",
        gstNo: "",
        deliveryRange: "", // Assuming this is stored as a number or string
        address: {
            latitude: "",
            longitude: "",
            pincode: "",
            state: "",
            district: "",
            country: "India",
        },
    });

    // State for geolocation/pincode fetching
    const [loadingAddress, setLoadingAddress] = useState(false); // Combined loading state
    const [signupError, setSignupError] = useState(null); // For general form errors including address

    /**
     * Helper for showing modal/alert messages.
     * In a real app, this would trigger a proper modal component.
     */
    const showModal = (message) => {
        alert(message);
    };

    /**
     * useEffect Hook: Populates formData when vendor data is loaded or updated from Redux.
     * Ensures form fields reflect the current vendor's profile information.
     */
    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || "",
                email: vendor.email || "",
                phone: vendor.phone || "",
                shopName: vendor.shopName || "",
                shopImage: vendor.shopImage || "", // Use existing shop image URL
                businessType: vendor.businessType || "",
                gstNo: vendor.gstNo || "",
                deliveryRange: vendor.deliveryRange || "", // Ensure this matches backend type
                address: {
                    latitude: vendor.address?.latitude || "",
                    longitude: vendor.address?.longitude || "",
                    pincode: vendor.address?.pincode || "",
                    state: vendor.address?.state || "",
                    district: vendor.address?.district || "",
                    country: vendor.address?.country || "India",
                },
            });
            // When vendor data changes, ensure we are not in editing mode and clear any selected file
            setIsEditing(false);
            setShopImageFile(null);
        }
    }, [vendor]); // Dependency array ensures this runs when 'vendor' object changes

    /**
     * useEffect Hook: Fetches vendor orders when the vendor ID is available.
     */
    useEffect(() => {
        if (vendor?._id) {
            dispatch(fetchVendorOrders(vendor._id));
        }
    }, [dispatch, vendor?._id]); // Dispatch when vendor ID becomes available or changes

    /**
     * Calculate Order Statistics
     * These calculations will now be derived directly from the `vendorOrders` array.
     */
    const totalOrders = vendorOrders.length;
    const pendingOrders = vendorOrders.filter(
        (order) => order.status === "Pending" || order.status === "Processing"
    ).length;

    const totalRevenue = vendorOrders.reduce((sum, order) => {
        let orderRevenue = 0;
        if (order.items && Array.isArray(order.items)) {
            orderRevenue = order.items.reduce((itemSum, item) => {
                return itemSum + (item.price * item.quantity);
            }, 0);
        } else if (order.totalAmount && typeof order.totalAmount === 'number') {
            orderRevenue = order.totalAmount;
        }

        return sum + orderRevenue;
    }, 0);


    /**
     * Handles changes for all input fields in the form.
     * Updates the formData state based on the input name and value.
     */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        // Handle nested address fields specifically
        if (name.startsWith("address.")) {
            const key = name.split(".")[1]; // Extracts 'latitude', 'pincode', etc.
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [key]: value,
                },
            }));
        }
        else if (name === "gstNo" || name === "deliveryRange") {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        else {
            // Handle other top-level fields
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        setSignupError(null); // Clear errors on change
    }, []);

    /**
     * Handles the selection of a new shop image file.
     * Creates a local URL for instant preview and stores the file for later upload.
     */
    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        setShopImageFile(file);
        setFormData((prev) => ({ ...prev, shopImage: URL.createObjectURL(file) }));
    }, []);

    /**
     * Fetches current geolocation and reverse geocodes it to get address details.
     */
    const handleFetchLocation = useCallback(async () => {
        console.log("handleFetchLocation triggered: Attempting to get geolocation...");
        if (!navigator.geolocation) {
            showModal("Geolocation is not supported by your browser. Please enter address manually.");
            return;
        }

        setLoadingAddress(true);
        setSignupError(null); // Clear previous errors

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Geolocation success:", { latitude, longitude });

                setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, latitude, longitude },
                }));

                try {
                    // OpenStreetMap Nominatim API for reverse geocoding
                    // Important: Add a proper User-Agent header in production, and respect usage policies.
                    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse`;
                    const response = await axios.get(nominatimUrl, {
                        params: {
                            lat: latitude,
                            lon: longitude,
                            format: "json",
                            addressdetails: 1,
                        },
                        headers: {
                            'User-Agent': 'YourAppName/1.0 (your-email@example.com)' // Replace with your app name and email
                        }
                    });

                    console.log("Reverse geocoding success:", response.data);

                    const address = response.data.address || {};

                    setFormData((prev) => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            pincode: address.postcode || "",
                            state: address.state || "",
                            district: address.county || address.city_district || "",
                            country: address.country || "",
                            latitude: latitude, // Ensure latitude/longitude are kept
                            longitude: longitude,
                        },
                    }));
                    showModal("Address auto-filled from your location.");
                } catch (error) {
                    console.error("Error fetching address from coordinates:", error);
                    showModal("Could not fetch address details automatically. Please enter manually.");
                } finally {
                    setLoadingAddress(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                let errorMessage = "Could not get your location. Please enter address manually.";
                if (err.code === err.PERMISSION_DENIED) {
                    errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    errorMessage = "Location information is unavailable.";
                } else if (err.code === err.TIMEOUT) {
                    errorMessage = "Attempt to get location timed out.";
                }
                showModal(errorMessage);
                setLoadingAddress(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Geolocation options
        );
    }, [showModal]);


    /**
     * Handles autofilling state, district, and country based on pincode.
     * This function will be triggered onBlur from the pincode input field.
     */
    const handlePincodeBlur = useCallback(async () => {
        const { pincode } = formData.address;

        // Basic pincode validation for India (6 digits)
        if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
            setSignupError("Please enter a valid 6-digit pincode.");
            return;
        }
        setSignupError(null); // Clear previous errors

        try {
            setLoadingAddress(true);
            console.log("Fetching address using pincode:", pincode);

            // Using Nominatim Search API for pincode
            const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                    postalcode: pincode,
                    format: "json",
                    addressdetails: 1,
                    countrycodes: "in", // Limit search to India
                },
                headers: {
                    'User-Agent': 'YourAppName/1.0 (your-email@example.com)' // Replace with your app name and email
                }
            });

            console.log("Pincode search response:", res.data);

            if (res.data.length > 0) {
                const address = res.data[0].address;

                setFormData((prev) => ({ // Corrected from setForm to setFormData
                    ...prev,
                    address: {
                        ...prev.address,
                        // Note: Nominatim's 'state' and 'county' might not always map perfectly
                        // to Indian 'State' and 'District' names. Adjust mapping if needed.
                        state: address.state || "",
                        district: address.county || address.city_district || "",
                        country: address.country || "",
                        // Do NOT clear latitude and longitude here if they were already set by geolocation.
                        // If you want pincode to override location, uncomment next two lines:
                        // latitude: res.data[0].lat || "",
                        // longitude: res.data[0].lon || "",
                    },
                }));
                showModal("Address details updated based on pincode.");
            } else {
                showModal("No address found for this pincode.");
            }
        } catch (err) {
            console.error("Error fetching address from pincode:", err);
            showModal("Failed to fetch address from pincode. Please check the pincode or enter details manually.");
        } finally {
            setLoadingAddress(false);
        }
    }, [formData.address.pincode, showModal]); // Dependency: re-run if pincode changes

    /**
     * Handles saving the updated vendor profile.
     * Dispatches the updateVendorProfile action and provides user feedback.
     */
    const handleSave = useCallback(async () => {
        const dataToUpdate = {
            ...formData,
            shopImageFile,
            // Ensure deliveryRange is a number if your backend expects it as such
            deliveryRange: formData.deliveryRange ? Number(formData.deliveryRange) : undefined,
        };

        // Basic validation before saving
        if (!dataToUpdate.name || !dataToUpdate.email || !dataToUpdate.shopName) {
            alert("Please fill in all required profile fields (Name, Email, Shop Name).");
            return;
        }
        if (!dataToUpdate.address.latitude || !dataToUpdate.address.longitude || !dataToUpdate.address.pincode) {
            alert("Please provide complete address details including latitude, longitude, and pincode. Use 'Fetch Current Location' or enter pincode to autofill.");
            return;
        }


        const result = await dispatch(updateVendorProfile(dataToUpdate));

        if (result.meta.requestStatus === "fulfilled") {
            alert("Profile updated successfully!");
            setIsEditing(false);
            if (shopImageFile) { // Revoke object URL if a new image was selected
                URL.revokeObjectURL(formData.shopImage);
            }
            setShopImageFile(null); // Clear the file after successful upload
            dispatch(fetchVendorProfile());
        } else {
            alert("Update failed: " + (result.payload?.message || "Unknown error occurred."));
        }
    }, [dispatch, formData, shopImageFile]);

    /**
     * Handles vendor logout.
     * Prompts for confirmation before dispatching the logoutVendor action.
     */
    const handleLogout = useCallback(() => {
        if (window.confirm("Are you sure you want to logout?")) {
            dispatch(logoutVendor());
            alert("Logged out successfully!");
        }
    }, [dispatch]);

    /**
     * Handles toggling the vendor's online/offline status.
     * Dispatches the toggleVendorStatus async thunk.
     */
    const handleToggleOnlineStatus = useCallback(async () => {
        if (!vendor) return;

        const currentIsOnline = vendor.isOnline;
        const newIsOnlineStatus = !currentIsOnline;

        const result = await dispatch(toggleVendorStatus(newIsOnlineStatus));

        if (result.meta.requestStatus === "fulfilled") {
            alert(`Vendor is now ${newIsOnlineStatus ? 'Online' : 'Offline'}.`);
        } else {
            alert("Failed to update online status: " + (result.payload?.message || "Unknown error."));
        }
    }, [dispatch, vendor]);

    /**
     * Function to determine status display style based on isApproved and isOnline.
     * This function is kept in the parent as it's used by both child components.
     * @param {boolean} isApproved - Vendor's approval status.
     * @param {boolean} isOnline - Vendor's online status.
     * @returns {JSX.Element} A styled span with icon and text.
     */
    const getStatusDisplay = useCallback((isApproved, isOnline) => {
        let classes = "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1";
        let icon = null;
        let text = "Unknown";

        if (!isApproved) {
            classes += " bg-yellow-100 text-yellow-800";
            icon = <AlertCircle className="w-3 h-3" />;
            text = "Pending Approval";
        } else {
            if (isOnline) {
                classes += " bg-green-100 text-green-800";
                icon = <CheckCircle className="w-3 h-3" />;
                text = "Online";
            } else {
                classes += " bg-gray-100 text-gray-800";
                icon = <AlertCircle className="w-3 h-3" />;
                text = "Offline";
            }
        }

        return (
            <span className={classes}>
                {icon}
                {text}
            </span>
        );
    }, []);

    // --- Conditional Rendering: Access Denied ---
    if (!vendor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h3>
                    <p className="text-gray-600">No vendor data found. Please login to continue.</p>
                    <Link
                        to="/vendor-login"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // --- Main Vendor Dashboard UI ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Vendor Dashboard</h1>
                    <p className="text-gray-600">Welcome, {vendor.name || vendor.shopName}!</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-2">
                        <VendorProfileCard
                            vendor={vendor}
                            loading={vendorAuthLoading} // Use loading from vendorAuthSlice for profile card
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            formData={formData}
                            handleChange={handleChange}
                            handleImageChange={handleImageChange}
                            handleSave={handleSave}
                            getStatusDisplay={getStatusDisplay}
                            handleFetchLocation={handleFetchLocation}
                            handlePincodeBlur={handlePincodeBlur} // Pass the new handler
                            loadingAddress={loadingAddress} // Pass the loading state
                            signupError={signupError} // Pass error state
                            showModal={showModal} // Pass the modal helper
                        />
                    </div>

                    {/* Quick Actions & Business Stats */}
                    <VendorDashboardSidePanel
                        vendor={vendor}
                        loading={vendorAuthLoading} // Use loading from vendorAuthSlice for general vendor info
                        handleToggleOnlineStatus={handleToggleOnlineStatus}
                        handleLogout={handleLogout}
                        getStatusDisplay={getStatusDisplay}

                        totalOrders={totalOrders}
                        pendingOrders={pendingOrders}
                        totalRevenue={totalRevenue}
                        statsLoading={vendorOrdersLoading} // Use loading from vendorOrders slice for stats
                    />
                </div>
            </div>
        </div>
    );
}