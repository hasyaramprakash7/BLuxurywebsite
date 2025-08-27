// VendorProfileCard.jsx
import React from "react";
import { MapPin, Loader2, AlertCircle, CheckCircle, Upload, Save, X, Edit2 } from "lucide-react";

export default function VendorProfileCard({
    vendor,
    loading,
    isEditing,
    setIsEditing,
    formData,
    handleChange,
    handleImageChange,
    handleSave,
    getStatusDisplay,
    handleFetchLocation, // Passed from parent
    handlePincodeBlur,   // Passed from parent
    loadingAddress,      // Passed from parent
    signupError,         // Passed from parent
    showModal            // Passed from parent
}) {
    // If vendor data is still loading, show a loading indicator
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="ml-3 text-gray-600">Loading vendor profile...</p>
            </div>
        );
    }

    // If no vendor data, this case should ideally be handled by the parent
    // VendorDashboard which renders the "Access Denied" message.
    if (!vendor) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center text-red-600">
                <AlertCircle className="inline-block w-6 h-6 mr-2" />
                No vendor data available.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Your Profile</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            // Optionally, reset formData to original vendor data here if edit is cancelled
                            // dispatch(fetchVendorProfile()); // Re-fetch to revert changes
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
                <div className="md:col-span-1 flex justify-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                            src={formData.shopImage || "https://via.placeholder.com/150?text=Shop+Image"}
                            alt="Shop"
                            className="w-full h-full object-cover"
                        />
                        {isEditing && (
                            <label
                                htmlFor="shop-image-upload"
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer hover:bg-opacity-75 transition-all"
                            >
                                <Upload className="w-6 h-6" />
                            </label>
                        )}
                        <input
                            id="shop-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <p className="text-sm text-gray-500">Shop Name:</p>
                    <p className="text-xl font-bold text-gray-900">{vendor.shopName}</p>
                    <p className="text-sm text-gray-500">Status:</p>
                    {getStatusDisplay(vendor.isApproved, vendor.isOnline)}
                </div>
            </div>

            {isEditing && (
                <div className="mt-6 border-t border-gray-200 pt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Vendor Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop Name</label>
                        <input
                            type="text"
                            name="shopName"
                            id="shopName"
                            value={formData.shopName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">Business Type</label>
                        <input
                            type="text"
                            name="businessType"
                            id="businessType"
                            value={formData.businessType}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="gstNo" className="block text-sm font-medium text-gray-700">GST Number</label>
                        <input
                            type="text"
                            name="gstNo"
                            id="gstNo"
                            value={formData.gstNo}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="deliveryRange" className="block text-sm font-medium text-gray-700">Delivery Range (in km)</label>
                        <input
                            type="number" // Changed to number for better input handling
                            name="deliveryRange"
                            id="deliveryRange"
                            value={formData.deliveryRange}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>

                    {/* --- Address Fields --- */}
                    <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 mt-6">Business Address</h3>

                        {/* Pincode Input with Auto-fill */}
                        <div>
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="text"
                                    name="address.pincode"
                                    id="pincode"
                                    value={formData.address.pincode}
                                    onChange={handleChange}
                                    onBlur={handlePincodeBlur} // Trigger auto-fill on blur
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Enter 6-digit Pincode"
                                    maxLength="6"
                                />
                                {loadingAddress && formData.address.pincode && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" aria-hidden="true" />
                                    </div>
                                )}
                            </div>
                            {signupError && <p className="mt-2 text-sm text-red-600">{signupError}</p>}
                        </div>

                        {/* Fetch Current Location Button */}
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleFetchLocation}
                                disabled={loadingAddress}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {loadingAddress ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Fetching Location...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Fetch Current Location
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Display auto-filled address details (read-only for user clarity) */}
                        <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">District</label>
                                <input
                                    type="text"
                                    name="address.district"
                                    value={formData.address.district}
                                    onChange={handleChange}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    name="address.country"
                                    value={formData.address.country}
                                    onChange={handleChange}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                <input
                                    type="text"
                                    name="address.latitude"
                                    value={formData.address.latitude}
                                    onChange={handleChange}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                <input
                                    type="text"
                                    name="address.longitude"
                                    value={formData.address.longitude}
                                    onChange={handleChange}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Changes Button */}
                    <div className="sm:col-span-2 flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading} // Disable save button if vendorAuth is loading
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-5 w-5" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}