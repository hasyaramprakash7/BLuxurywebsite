import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { MapPin, Truck, Package, Clock, User, Phone, ShoppingBag, DollarSign, ExternalLink, LocateFixed, ArrowRight, ArrowRightLeft } from 'lucide-react';

export default function DeliveryBoyOrdersPage() {
    const { id } = useParams(); // deliveryBoyId
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myLocation, setMyLocation] = useState(null); // delivery boy's real-time location
    const [activeMap, setActiveMap] = useState(null); // State to control which order's map is active
    const [error, setError] = useState(""); // State for API errors

    // Get your (delivery boy) location
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setMyLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                console.log("📍 My Location:", position.coords);
            },
            (err) => {
                console.error("Geolocation error:", err.message);
                setError(`Geolocation error: ${err.message}. Please enable location services.`);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        // Cleanup function
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Fetch orders for delivery boy
    useEffect(() => {
        if (!id) {
            setError("Delivery boy ID is missing.");
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setError(""); // Clear previous errors
            try {
                const token = localStorage.getItem("deliveryBoyToken");
                if (!token) {
                    setError("Authentication token not found. Please log in.");
                    setLoading(false);
                    return;
                }
                const res = await axios.get(`/api/orders/delivery-boy/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setOrders(res.data.orders || []);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.response?.data?.message || "Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [id]);

    const getRouteUrl = (fromLat, fromLng, toLat, toLng) => {
        if (!fromLat || !fromLng || !toLat || !toLng) return "#";
        // Corrected Google Maps URL format: start_latitude,start_longitude/end_latitude,end_longitude
        return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
    };

    const getStaticMapUrl = (lat, lng) => {
        if (!lat || !lng) return "";
        // Corrected Google Maps Embed API URL format for a single marker
        // You'll need a Google Maps API Key for production use.
        // For development, embedding might work without one, but it's not reliable.
        // Replace YOUR_API_KEY with your actual Google Maps API key if needed.
        return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Fetching your assigned deliveries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                            <Truck className="inline-block w-8 h-8 mr-3 text-blue-600" />
                            Your Deliveries
                        </h1>
                        <p className="text-gray-600 text-lg">Manage all your assigned orders here.</p>
                    </div>
                    {myLocation ? (
                        <div className="flex items-center text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full shadow-md">
                            <LocateFixed className="w-4 h-4 mr-1" />
                            Location Active
                        </div>
                    ) : (
                        <div className="flex items-center text-sm text-red-700 bg-red-100 px-3 py-1.5 rounded-full shadow-md">
                            <LocateFixed className="w-4 h-4 mr-1" />
                            Location Disabled
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-100">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Assigned Yet</h3>
                        <p className="text-gray-500">Looks like you don't have any deliveries at the moment. Check back soon!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => {
                            const deliveryLat = order.address?.latitude;
                            const deliveryLng = order.address?.longitude;
                            const showMap = activeMap === order._id;

                            // Format date and time
                            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric'
                            }) : 'N/A';
                            const orderTime = order.createdAt ? new Date(order.createdAt).toLocaleTimeString(undefined, {
                                hour: '2-digit', minute: '2-digit', hour12: true
                            }) : '';

                            return (
                                <div key={order._id} className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                    {/* Order Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-bold flex items-center">
                                                Order ID: {order._id.substring(0, 8)}...
                                            </h2>
                                            {/* Display Vendor Order ID if available */}
                                            {order.vendorOrderId && (
                                                <p className="text-sm text-blue-100 mt-1">
                                                    Vendor Order ID: <span className="font-semibold">{order.vendorOrderId}</span>
                                                </p>
                                            )}
                                            <p className="text-sm text-blue-100 mt-1">
                                                Assigned: {orderDate} {orderTime && `at ${orderTime}`}
                                            </p>
                                        </div>
                                        <span className={`px-4 py-1 rounded-full text-sm font-semibold capitalize ${order.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                                            order.status === 'picked_up' ? 'bg-blue-400 text-blue-900' :
                                                order.status === 'delivered' ? 'bg-green-400 text-green-900' :
                                                    'bg-gray-400 text-gray-900'
                                            }`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Order Details */}
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Customer & Delivery Info */}
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Customer Name</p>
                                                    <p className="font-semibold text-gray-800">{order.address?.fullName || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Customer Phone</p>
                                                    <a href={`tel:${order.address?.phone}`} className="font-semibold text-blue-600 hover:underline">
                                                        {order.address?.phone || 'N/A'}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Delivery Address</p>
                                                    <p className="font-medium text-gray-800">
                                                        {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.zipCode}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items & Total */}
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                                                    <ShoppingBag className="w-4 h-4 mr-2" />Order Items:
                                                </h4>
                                                <ul className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                    {order.items && order.items.length > 0 ? (
                                                        order.items.map((item, idx) => (
                                                            <li key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0 last:pb-0">
                                                                {item.productImage && (
                                                                    <img src={item.productImage} alt={item.name} className="w-10 h-10 object-cover rounded mr-2" />
                                                                )}
                                                                <span className="text-gray-700 flex-grow">
                                                                    {item.name} x {item.quantity}
                                                                    {/* Item Each Total */}
                                                                    <span className="ml-2 text-gray-500 italic">
                                                                        (₹{(item.quantity * item.price).toFixed(2)})
                                                                    </span>
                                                                </span>
                                                                <span className="font-medium text-gray-800">
                                                                    ₹{item.price?.toFixed(2)} {/* Price per unit */}
                                                                </span>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">No items listed.</p>
                                                    )}
                                                </ul>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <span className="font-bold text-lg text-gray-800">Total Amount:</span>
                                                <span className="font-extrabold text-2xl text-blue-700">
                                                    ₹{(order.items || []).reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-6 pb-6 flex flex-wrap gap-3">
                                        {myLocation && deliveryLat && deliveryLng ? (
                                            <>
                                                <a
                                                    href={getRouteUrl(myLocation.lat, myLocation.lng, deliveryLat, deliveryLng)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 min-w-[160px] flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
                                                >
                                                    <Truck className="w-5 h-5 mr-2" />
                                                    Start Navigation
                                                </a>
                                                <button
                                                    onClick={() => setActiveMap(showMap ? null : order._id)}
                                                    className="flex-1 min-w-[160px] flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all shadow-md"
                                                >
                                                    <MapPin className="w-5 h-5 mr-2" />
                                                    {showMap ? "Hide Map" : "View Map"}
                                                </button>
                                            </>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic w-full text-center">
                                                Enable location and ensure order has valid address for navigation.
                                            </p>
                                        )}
                                        {/* You can add status update buttons here (e.g., "Mark as Picked Up", "Mark as Delivered") */}
                                        {/* Example:
                                        <button className="flex-1 min-w-[160px] flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md">
                                            <Check className="w-5 h-5 mr-2" /> Mark as Delivered
                                        </button>
                                        */}
                                    </div>

                                    {/* Inline map */}
                                    {showMap && deliveryLat && deliveryLng && (
                                        <div className="mt-4 border-t border-gray-200 p-6">
                                            <div className="rounded-lg overflow-hidden h-72">
                                                <iframe
                                                    title={`map-${order._id}`}
                                                    src={getStaticMapUrl(deliveryLat, deliveryLng)}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    allowFullScreen=""
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="text-center mt-10">
                    <Link to="/delivery-boy-dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-lg font-medium">
                        <ArrowRightLeft className="w-5 h-5 mr-2 rotate-180" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}