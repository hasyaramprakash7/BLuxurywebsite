
// VendorDashboardSidePanel.jsx
import React from 'react';
import { Power, Wallet, ShoppingBag, Clock, BarChart, Package } from 'lucide-react'; // Import icons for stats

const VendorDashboardSidePanel = ({
    vendor,
    loading,
    handleToggleOnlineStatus,
    handleLogout,
    getStatusDisplay,
    totalOrders,
    pendingOrders,
    totalRevenue,
    statsLoading // New prop for loading state
}) => {
    return (
        <div className="lg:col-span-1 space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="space-y-4">
                    {vendor && (
                        <button
                            onClick={handleToggleOnlineStatus}
                            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200
                                ${vendor.isOnline
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                            disabled={loading}
                        >
                            <Power className="w-5 h-5 mr-2" />
                            {vendor.isOnline ? "Go Offline" : "Go Online"}
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                        disabled={loading}
                    >
                        <Power className="w-5 h-5 mr-2 rotate-180" />
                        Logout
                    </button>
                </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    <a
                        href="/vendorCRUD" // Use <a> for mock links in a standalone component
                        className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors shadow-sm"
                    >
                        <Package className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium text-center">Manage Products</span>
                    </a>
                    <a
                        href="/VendorOrderList" // Use <a> for mock links
                        className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 transition-colors shadow-sm"
                    >
                        <ShoppingBag className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium text-center">View Orders</span>
                    </a>

                </div>
            </div>
            {/* Business Statistics Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Statistics</h2>
                {statsLoading ? (
                    <div className="text-center py-4 text-gray-500">
                        <svg className="animate-spin h-5 w-5 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-sm">Loading stats...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                            <div className="flex items-center gap-2 text-blue-800">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="font-medium">Total Orders:</span>
                            </div>
                            <span className="text-lg font-bold text-blue-900">{totalOrders}</span>
                        </div>
                        <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-md">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <Clock className="w-5 h-5" />
                                <span className="font-medium">Pending Orders:</span>
                            </div>
                            <span className="text-lg font-bold text-yellow-900">{pendingOrders}</span>
                        </div>
                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                            <div className="flex items-center gap-2 text-green-800">
                                <Wallet className="w-5 h-5" />
                                <span className="font-medium">Total Revenue:</span>
                            </div>
                            <span className="text-lg font-bold text-green-900">₹{totalRevenue.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Status (assuming this was part of the original side panel) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Status</h2>
                {vendor ? getStatusDisplay(vendor.isApproved, vendor.isOnline) : <p className="text-gray-500">No status available.</p>}
            </div>
        </div>
    );
};

export default VendorDashboardSidePanel;