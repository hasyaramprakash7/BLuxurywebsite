import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    logoutDeliveryBoy,
    updateDeliveryBoyProfile,
    fetchDeliveryBoyProfile,
    toggleAvailability,
} from "../features/delivery/deliveryBoySlice";
import { Link } from "react-router-dom";
// Assuming DeliveryBoyOrderList is a separate component and you want to keep the link
// import DeliveryBoyOrderList from "./DeliveryBoyOrderList"; // Uncomment if needed

// Lucide-react icons for a better UI
import { Camera, Edit3, Power, LogOut, MapPin, Phone, Mail, Building, User, Package, CheckCircle, XCircle } from "lucide-react";

export default function DeliveryBoyDashboard() {
    const dispatch = useDispatch();
    const { deliveryBoy, loading } = useSelector((state) => state.deliveryBoyAuth); // Use actual Redux state

    const [isEditing, setIsEditing] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        shopImage: "",
        businessType: "",
        address: {
            latitude: "",
            longitude: "",
            pincode: "",
            state: "",
            district: "",
            country: "India",
        },
    });

    // Effect to populate form data when deliveryBoy data changes
    useEffect(() => {
        if (deliveryBoy) {
            setFormData({
                name: deliveryBoy.name || "",
                email: deliveryBoy.email || "",
                phone: deliveryBoy.phone || "",
                shopImage: deliveryBoy.shopImage || "",
                businessType: deliveryBoy.businessType || "",
                address: {
                    latitude: deliveryBoy.address?.latitude || "",
                    longitude: deliveryBoy.address?.longitude || "",
                    pincode: deliveryBoy.address?.pincode || "",
                    state: deliveryBoy.address?.state || "",
                    district: deliveryBoy.address?.district || "",
                    country: deliveryBoy.address?.country || "India",
                },
            });
        }
    }, [deliveryBoy]);

    // Fetch delivery boy profile on component mount (if not already fetched or stale)
    // You might want to add a condition here to prevent re-fetching if data exists and is fresh
    useEffect(() => {
        if (!deliveryBoy) {
            dispatch(fetchDeliveryBoyProfile());
        }
    }, [dispatch, deliveryBoy]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const key = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [key]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfileImageFile(file);
        setFormData((prev) => ({ ...prev, shopImage: URL.createObjectURL(file) }));
    };

    const handleSave = async () => {
        const dataToUpdate = new FormData();
        for (const key in formData) {
            if (key === "address") {
                for (const addrKey in formData.address) {
                    dataToUpdate.append(`address.${addrKey}`, formData.address[addrKey]);
                }
            } else {
                dataToUpdate.append(key, formData[key]);
            }
        }
        if (profileImageFile) {
            dataToUpdate.append("shopImage", profileImageFile);
        }

        const result = await dispatch(updateDeliveryBoyProfile(dataToUpdate));
        if (result.meta.requestStatus === "fulfilled") {
            alert("Profile updated successfully!");
            setIsEditing(false);
            setProfileImageFile(null); // Clear the file input after successful upload
            // Re-fetch profile to get updated image URL from backend if it's not immediately updated in state
            dispatch(fetchDeliveryBoyProfile());
        } else {
            alert("Profile update failed: " + (result.payload || "Unknown error"));
        }
    };

    const handleToggleAvailability = () => {
        dispatch(toggleAvailability());
    };

    const handleLogout = () => {
        dispatch(logoutDeliveryBoy());
    };

    if (loading && !deliveryBoy) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading profile...</h2>
                    <p className="text-gray-500">Please wait while we fetch your data.</p>
                </div>
            </div>
        );
    }

    if (!deliveryBoy) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">No delivery boy data found.</h2>
                    <p className="text-gray-500">Please login to access your dashboard.</p>
                    <Link to="/login" className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">Delivery Partner Dashboard</h1>
                    <p className="text-gray-600 text-base sm:text-lg">Manage your profile and track your deliveries efficiently.</p>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${deliveryBoy.isAvailable ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {deliveryBoy.isAvailable ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {deliveryBoy.isAvailable ? 'Available for Delivery' : 'Currently Unavailable'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {deliveryBoy.isAvailable ? 'You can receive new orders.' : 'You will not receive new orders.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleAvailability}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${deliveryBoy.isAvailable
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                                }`}
                            disabled={loading}
                        >
                            <Power className="w-4 h-4 inline mr-2" />
                            {deliveryBoy.isAvailable ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                </div>

                {/* Main Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
                            <div className="relative">
                                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                                    {deliveryBoy.shopImage ? (
                                        <img
                                            src={deliveryBoy.shopImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-white/80" />
                                    )}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${deliveryBoy.isAvailable ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-bold">{deliveryBoy.name}</h2>
                                <p className="text-blue-100 text-lg">{deliveryBoy.businessType || 'Delivery Partner'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        {isEditing ? (
                            <div className="space-y-6">
                                {/* Profile Image Upload */}
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                        {formData.shopImage ? (
                                            <img
                                                src={formData.shopImage}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="profile-image" className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Profile Image
                                        </label>
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="profile-image"
                                            accept="image/*"
                                        />
                                        <label
                                            htmlFor="profile-image"
                                            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-blue-600 font-medium"
                                        >
                                            <Camera className="w-4 h-4 mr-2" />
                                            Choose File
                                        </label>
                                        {profileImageFile && <span className="ml-3 text-gray-600 text-sm">{profileImageFile.name}</span>}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User className="w-4 h-4 inline mr-2 text-gray-500" />
                                            Name
                                        </label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Phone className="w-4 h-4 inline mr-2 text-gray-500" />
                                            Phone
                                        </label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 inline mr-2 text-gray-500" />
                                            Email
                                        </label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Building className="w-4 h-4 inline mr-2 text-gray-500" />
                                            Business Type
                                        </label>
                                        <input
                                            name="businessType"
                                            value={formData.businessType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="e.g., Food Delivery, Courier"
                                        />
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <MapPin className="w-5 h-5 inline mr-2 text-blue-600" />
                                        Address Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { field: "district", label: "District" },
                                            { field: "state", label: "State" },
                                            { field: "country", label: "Country" },
                                            { field: "pincode", label: "Pincode" },
                                            { field: "latitude", label: "Latitude" },
                                            { field: "longitude", label: "Longitude" },
                                        ].map(({ field, label }) => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {label}
                                                </label>
                                                <input
                                                    name={`address.${field}`}
                                                    value={formData.address[field]}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder={`Enter ${label.toLowerCase()}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className={`px-6 py-3 rounded-lg text-white font-medium transition-all flex items-center justify-center ${loading
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                                            }`}
                                        disabled={loading}
                                    >
                                        {loading ? <><span className="animate-spin mr-2">⚙️</span> Saving...</> : <><Edit3 className="w-4 h-4 mr-2" /> Save Changes</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Profile Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium text-gray-800">{deliveryBoy.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium text-gray-800">{deliveryBoy.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Building className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Business Type</p>
                                                <p className="font-medium text-gray-800">{deliveryBoy.businessType || "Not specified"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Location</p>
                                                <p className="font-medium text-gray-800">
                                                    {`${deliveryBoy.address?.district || "N/A"}, ${deliveryBoy.address?.state || "N/A"}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Details */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">Address Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">District</p>
                                            <p className="font-medium text-gray-800">{deliveryBoy.address?.district || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">State</p>
                                            <p className="font-medium text-gray-800">{deliveryBoy.address?.state || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Country</p>
                                            <p className="font-medium text-gray-800">{deliveryBoy.address?.country || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Pincode</p>
                                            <p className="font-medium text-gray-800">{deliveryBoy.address?.pincode || "N/A"}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-500">Coordinates</p>
                                            <p className="font-medium text-gray-800">
                                                {deliveryBoy.address?.latitude && deliveryBoy.address?.longitude
                                                    ? `${deliveryBoy.address.latitude}, ${deliveryBoy.address.longitude}`
                                                    : "Not Set"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons for View Mode */}
                                <div className="flex flex-wrap gap-4 justify-end pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/30 flex items-center justify-center"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-800/30 flex items-center justify-center"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* View Assigned Orders Link */}
                {deliveryBoy?._id && (
                    <div className="max-w-xl mx-auto mt-8 text-center">
                        <Link
                            to={`/deliveryboy/${deliveryBoy._id}/orders`}
                            className="inline-flex items-center px-6 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 font-semibold hover:bg-blue-100 hover:shadow-md transition-all duration-200"
                        >
                            <Package className="w-5 h-5 mr-3" />
                            View Assigned Orders
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}