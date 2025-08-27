// src/components/VendorOrderList.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchVendorOrders,
    updateVendorOrderStatus,
    clearVendorOrderError
} from "../features/vendor/vendorOrderSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { Link } from "react-router-dom"; // Import Link

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
    relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "a few seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
    }
});

const statusOptions = ["placed", "processing", "shipped", "delivered", "cancelled"];

const VendorOrderList = () => {
    const dispatch = useDispatch();
    const { orders = [], loading, error } = useSelector((state) => state.vendorOrders);
    const vendor = useSelector((state) => state.vendorAuth.vendor);
    const vendorId = vendor?._id;

    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Debugging logs - Keep these if they are still needed for development
    useEffect(() => {
        console.log("Redux State - Orders:", orders);
        console.log("Redux State - Loading:", loading);
        console.log("Redux State - Error:", error);
        if (vendor) {
            console.log("Redux State - Vendor object:", vendor);
            console.log("Redux State - Vendor Address Latitude:", vendor.address?.latitude);
            console.log("Redux State - Vendor Address Longitude:", vendor.address?.longitude);
        } else {
            console.log("Redux State - Vendor data is not available. Please check vendorAuthSlice.");
        }
        orders.forEach(order => {
            console.log(`Order ${order._id} Customer Address:`, order.address);
            console.log(`Order ${order._id} Customer Latitude:`, order.address?.latitude);
            console.log(`Order ${order._id} Customer Longitude:`, order.address?.longitude);
        });
    }, [orders, loading, error, vendor]);

    useEffect(() => {
        if (vendorId) {
            console.log("Fetching orders for vendor ID:", vendorId);
            dispatch(fetchVendorOrders(vendorId));
        } else {
            console.log("Vendor ID not available, not fetching orders.");
        }
    }, [vendorId, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(clearVendorOrderError());
        };
    }, [dispatch]);

    const handleStatusChange = (orderId, currentOrderStatus, e) => {
        const newStatus = e.target.value;
        if (!window.confirm(`Are you sure you want to change this order's status to "${newStatus}"?`)) {
            e.target.value = currentOrderStatus;
            return;
        }
        dispatch(updateVendorOrderStatus({ orderId, newStatus }));
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "placed": return "bg-amber-100 text-amber-800 border-amber-200";
            case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
            case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
            case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "placed": return "🕐";
            case "processing": return "⚙️";
            case "shipped": return "🚚";
            case "delivered": return "✅";
            case "cancelled": return "❌";
            default: return "📋";
        }
    };

    if (!vendorId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
                    <p className="text-gray-600 mb-6">Please log in as a vendor to view your orders.</p>
                    <Link to="/vendor/login" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        Login as Vendor
                    </Link>
                </div>
            </div>
        );
    }

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        const matchesSearch = searchTerm === "" ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Corrected and enhanced Google Maps URL generation
    const getGoogleMapsRouteUrl = (vendorAddress, customerAddress) => {
        const vendorLat = vendorAddress?.latitude;
        const vendorLon = vendorAddress?.longitude;
        const customerLat = customerAddress?.latitude;
        const customerLon = customerAddress?.longitude;

        let origin = '';
        let destination = '';

        // Prioritize latitude/longitude for origin
        if (vendorLat && vendorLon) {
            origin = `${vendorLat},${vendorLon}`;
        } else {
            // Fallback to vendor's full address
            origin = encodeURIComponent(
                `${vendorAddress?.street || ''}, ${vendorAddress?.city || ''}, ${vendorAddress?.state || ''} ${vendorAddress?.zipCode || ''}, ${vendorAddress?.country || ''}`
            );
        }

        // Prioritize latitude/longitude for destination
        if (customerLat && customerLon) {
            destination = `${customerLat},${customerLon}`;
        } else {
            // Fallback to customer's full address
            destination = encodeURIComponent(
                `${customerAddress?.street || ''}, ${customerAddress?.street2 ? customerAddress.street2 + ', ' : ''}${customerAddress?.city || ''}, ${customerAddress?.state || ''} ${customerAddress?.zipCode || ''}, ${customerAddress?.country || ''}`
            );
        }

        if (!origin || !destination) {
            console.warn("Missing origin or destination for Google Maps URL. Cannot generate full route.");
            return '#'; // Return a non-functional link or handle this case in UI
        }

        // Correct Google Maps URL for directions
        const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
        console.log("Generated Google Maps URL:", url); // Log the generated URL for debugging
        return url;
    };


    const getTotalOrderValueForVendor = (order) => {
        const vendorItems = order.items.filter(item =>
            item.vendorId.toString() === vendorId.toString()
        );
        return vendorItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    };

    // New function to get the total value of the *entire* order
    const getFullOrderTotal = (order) => {
        return order.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📦</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Your Orders</h1>
                    </div>
                    <p className="text-gray-600">Manage and track your vendor orders</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400 text-xl">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error occurred</h3>
                                <p className="text-sm text-red-700 mt-1">{error}. Please try again later.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                Search Orders
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">🔍</span>
                                </div>
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search by Order ID or Customer Name..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-auto">
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Status
                            </label>
                            <select
                                id="statusFilter"
                                className="block w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                {statusOptions.map(status => (
                                    <option key={status} value={status} className="capitalize">
                                        {getStatusIcon(status)} {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {loading && filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-gray-600">Loading orders...</p>
                        </div>
                    )}

                    {!loading && filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📭</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                            <p className="text-gray-600">No orders match your current filters or you don't have any orders yet.</p>
                        </div>
                    )}

                    {filteredOrders.map((order) => {
                        const vendorItems = order.items.filter(item =>
                            item.vendorId.toString() === vendorId.toString()
                        );
                        const vendorOrderTotal = getTotalOrderValueForVendor(order);
                        const fullOrderTotal = getFullOrderTotal(order); // Calculate full order total

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                            >
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{getStatusIcon(order.status)}</span>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Order #{order._id.slice(-8)}
                                                </h3>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p>
                                                    <span className="font-medium">Customer:</span> {order.user?.name || "N/A"}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Placed:</span> {dayjs(order.createdAt).format("MMM D, YYYY [at] h:mm A")}
                                                    <span className="text-gray-500 ml-2">({dayjs(order.createdAt).fromNow()})</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Your Share</p>
                                                <p className="text-2xl font-bold text-green-600">₹{vendorOrderTotal.toFixed(2)}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusClasses(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                <select
                                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, order.status, e)}
                                                    disabled={loading}
                                                >
                                                    {statusOptions.map(status => (
                                                        <option key={status} value={status} className="capitalize">
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Order Items */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <span>🛍️</span> Your Items ({vendorItems.length})
                                        </h4>
                                        {vendorItems.length === 0 ? (
                                            <p className="text-gray-500 italic text-center py-4">
                                                No products from your shop in this order.
                                            </p>
                                        ) : (
                                            <div className="grid gap-4">
                                                {vendorItems.map((item, idx) => (
                                                    <div
                                                        key={item._id || item.productId || idx}
                                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                                    >
                                                        <img
                                                            src={item.productImage || "https://via.placeholder.com/80?text=No+Image"}
                                                            alt={item.name || "Product"}
                                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="font-medium text-gray-900 truncate">{item.name}</h5>
                                                            <p className="text-sm text-gray-600">
                                                                {item.quantity} × ₹{item.price.toFixed(2)}
                                                            </p>
                                                            {item.status && (
                                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusClasses(item.status)}`}>
                                                                    {item.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-900">
                                                                ₹{(item.quantity * item.price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Address and Payment Info */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                <span>📍</span> Delivery Address
                                            </h4>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-medium text-gray-900">{order.address?.fullName || "N/A"}</p>
                                                    <p className="text-gray-700">{order.address?.street}</p>
                                                    {order.address?.street2 && <p className="text-gray-700">{order.address.street2}</p>}
                                                    {order.address?.landmark && <p className="text-gray-700">Near {order.address.landmark}</p>}
                                                    <p className="text-gray-700">
                                                        {order.address?.city}, {order.address?.state} - {order.address?.zipCode}
                                                    </p>
                                                    <p className="text-gray-700">{order.address?.country}</p>
                                                    <p className="font-medium text-gray-900 mt-2">
                                                        📞 {order.address?.phone || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                <span>💳</span> Payment Details
                                            </h4>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Payment Method:</span>
                                                        <span className="font-medium text-gray-900 capitalize">
                                                            {order.paymentMethod || "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t pt-3">
                                                        <span className="text-md font-semibold text-gray-900">Your Share:</span>
                                                        <span className="text-xl font-bold text-green-600">
                                                            ₹{vendorOrderTotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {/* NEW: Display Full Order Total */}
                                                    <div className="flex justify-between items-center border-t pt-3">
                                                        <span className="text-md font-semibold text-gray-900">Total Order Value:</span>
                                                        <span className="text-xl font-bold text-gray-800">
                                                            ₹{fullOrderTotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Boy Info */}
                                    {order.deliveryBoy && typeof order.deliveryBoy === "object" && (
                                        <div className="mb-6 bg-green-50 rounded-lg p-4 border border-green-200">
                                            <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                                                <span>🚚</span> Assigned Delivery Boy
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2 text-sm">
                                                    <p><strong>Name:</strong> {order.deliveryBoy.name || 'N/A'}</p>
                                                    <p><strong>Email:</strong> {order.deliveryBoy.email || 'N/A'}</p>
                                                    <p><strong>Phone:</strong> {order.deliveryBoy.phone || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    <Link
                                                        to={`/vendor/delivery-boy-orders/${order.deliveryBoy._id}`}
                                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        View All Orders
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                        {/* Updated View Route button */}
                                        {(vendor?.address || order.address) && ( // Ensure at least one address is present to attempt route
                                            <a
                                                href={getGoogleMapsRouteUrl(vendor?.address, order.address)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <span className="mr-2">🗺️</span>
                                                View Route
                                            </a>
                                        )}
                                        <Link
                                            to="/vendor/active-delivery-boys"
                                            state={{ orderId: order._id }}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <span className="mr-2">👤</span>
                                            Assign Delivery Boy
                                        </Link>
                                        {/* NEW: Generate Invoice Button */}
                                        <Link
                                            to="/vendor/generate-invoice"
                                            state={{ orderData: order, vendorData: vendor }}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <span className="mr-2">🧾</span>
                                            Generate Invoice
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default VendorOrderList;