import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders, cancelUserOrder } from "../features/order/orderSlice";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import Navbar from "./Home/Navbar";

const OrderScreen = () => {
    const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user);
    const userId = user?._id || JSON.parse(localStorage.getItem("user"))?._id;

    const { orders, loading, error } = useSelector((state) => state.order);

    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserOrders(userId));
        }
    }, [userId, dispatch]);

    const handleCancelOrder = (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            dispatch(cancelUserOrder(orderId))
                .unwrap()
                .then(() => {
                    toast.success("Order cancelled successfully.");
                })
                .catch((err) => {
                    toast.error(err?.message || "Failed to cancel order. Please try again.");
                });
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (activeFilter === "All") {
            return true;
        }
        return order.status === activeFilter.toLowerCase();
    });

    // Group items within each order by vendor
    const ordersGroupedByVendor = useMemo(() => {
        return filteredOrders.map(order => {
            const vendorsMap = new Map();
            order.items.forEach(item => {
                const vendorId = item.vendorId || item.vendorName; // Use vendorId if available, else vendorName
                if (!vendorsMap.has(vendorId)) {
                    vendorsMap.set(vendorId, {
                        vendorName: item.vendorName,
                        vendorPhone: item.vendorPhone,
                        vendorId: item.vendorId, // Store vendorId if available
                        items: [],
                        vendorTotal: 0
                    });
                }
                const vendorData = vendorsMap.get(vendorId);
                vendorData.items.push(item);
                vendorData.vendorTotal += item.quantity * item.price;
            });
            return {
                ...order,
                vendors: Array.from(vendorsMap.values())
            };
        });
    }, [filteredOrders]);

    // Define the Rolex-inspired colors for consistency - Now primarily for reference or inline styles where dynamic values are needed
    const rolexGreen = "#006039"; // A deep, rich green from Rolex branding
    const rolexGold = "#A37E2C"; // A metallic gold from Rolex branding
    const neutralLightGray = "#F9FAFB"; // Very light background
    const subtleBorder = "#E5E7EB"; // Light border color
    const textGray = "#4B5563"; // Deeper gray for standard text
    const headingGray = "#1F2937"; // Even darker for headings

    const getStatusStyles = (status) => {
        switch (status) {
            case "placed":
                return "bg-yellow-50 text-yellow-700 border border-yellow-200";
            case "processing":
                return "bg-blue-50 text-blue-700 border border-blue-200";
            case "shipped":
                return "bg-purple-50 text-purple-700 border border-purple-200";
            case "delivered":
                return "bg-green-50 text-green-700 border border-green-200";
            case "cancelled":
                return "bg-red-50 text-red-700 border border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    return (
        <div className={`min-h-screen bg-neutral-light-gray py-6 px-3 sm:px-4 lg:px-6 mt-14`}> {/* Reduced top/bottom padding */}
            <div className="max-w-5xl mx-auto">
                <h2 className={`text-3xl sm:text-4xl font-extrabold mb-6 text-center text-heading-gray`}> {/* Reduced mb */}
                    Your Orders <span style={{ color: rolexGreen }}>•</span> <span style={{ color: rolexGold }}>History</span>
                </h2>

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center p-1.5 bg-white rounded-lg shadow-md border border-gray-100"> {/* Reduced gap, padding, mb, rounded */}
                    {["All", "Placed", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ease-in-out
                                ${activeFilter === status
                                    ? `bg-rolex-green text-white shadow-lg transform scale-105`
                                    : `bg-gray-100 text-text-gray hover:bg-gray-200 hover:text-rolex-green`
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {loading && <p className={`text-base text-center my-6 text-rolex-green`}>Loading your valuable orders...</p>} {/* Reduced text size and margin */}
                {error && <p className="text-red-600 text-base text-center my-6">❌ Error retrieving orders: {error.message || "An unexpected error occurred."}</p>} {/* Reduced text size and margin */}
                {!loading && orders.length === 0 && (
                    <p className={`text-gray-600 text-base text-center my-6`}>It appears you haven't placed any orders yet. Start exploring!</p>
                )}
                {!loading && orders.length > 0 && filteredOrders.length === 0 && (
                    <p className={`text-gray-600 text-base text-center my-6`}>No orders found with status: <span className={`font-semibold text-rolex-green`}>{activeFilter}</span>. Try a different filter.</p>
                )}

                <div className="space-y-4"> {/* Reduced space-y */}
                    {ordersGroupedByVendor.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out"
                        >
                            {/* Order Header */}
                            <div className={`p-3 sm:p-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5`}
                                style={{ background: `linear-gradient(to right, ${rolexGreen}, #009632)` }}>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold tracking-wide"> {/* Reduced font size */}
                                        Order #<span className="font-mono text-gray-100">{order._id.slice(-8).toUpperCase()}</span>
                                    </h3>
                                    <p className="text-2xs opacity-90 mt-0.5 font-light"> {/* Reduced font size, mt */}
                                        Placed on: {dayjs(order.createdAt).format("MMM D, YYYY [at] h:mm A")}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wide ${getStatusStyles(order.status)}`}
                                >
                                    {order.status}
                                </span>
                            </div>

                            <div className="p-3 sm:p-4"> {/* Reduced padding */}
                                {/* Cancel Order Button */}
                                {/* MODIFIED: Removed "shipped" from the array */}
                                {["placed", "processing"].includes(order.status) && (
                                    <div className="flex justify-end mb-3"> {/* Reduced mb */}
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition duration-200 ease-in-out transform hover:scale-105 shadow-md"
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                )}

                                {/* Render items grouped by vendor */}
                                {order.vendors.map((vendorData, vendorIdx) => (
                                    <div key={vendorData.vendorId || vendorIdx} className={`mb-4 border border-gray-200 rounded-md p-3 bg-neutral-light-gray shadow-inner`}> {/* Reduced mb, rounded, padding */}
                                        <h4 className={`text-base font-bold mb-2 flex justify-between items-center text-heading-gray`}> {/* Reduced font size, mb */}
                                            <span> Items from <span style={{ color: rolexGreen }}>{vendorData.vendorName}</span></span>
                                            {vendorData.vendorPhone ? (
                                                <span className={`text-xs text-rolex-gold`}> {/* Reduced font size */}
                                                    📞 <a href={`tel:${vendorData.vendorPhone}`} className={`underline hover:text-rolex-green transition-colors`}>Call Vendor</a>
                                                </span>
                                            ) : ""}
                                        </h4>
                                        <div className="space-y-2"> {/* Reduced space-y */}
                                            {vendorData.items.map((item, itemIdx) => (
                                                <div
                                                    key={item.productId || itemIdx}
                                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border border-gray-100 rounded-sm bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                                                >
                                                    <img
                                                        src={item.productImage || "https://via.placeholder.com/100?text=No+Image"}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded-xs border border-gray-200 flex-shrink-0"
                                                    />
                                                    <div className="flex-1 text-xs"> {/* Reduced font size */}
                                                        <h5 className={`font-semibold text-heading-gray`}>{item.name}</h5>
                                                        <p className={`text-2xs text-text-gray mt-0`}> {/* Reduced font size, mt */}
                                                            Qty: <strong className="font-medium">{item.quantity}</strong> × ₹{item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className={`text-heading-gray font-bold text-sm sm:text-base mt-0.5 sm:mt-0`}> {/* Reduced font size, mt */}
                                                        ₹{(item.quantity * item.price).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end"> {/* Reduced mt, pt */}
                                            <span className={`font-bold text-base text-rolex-green`}>Vendor Total: ₹{vendorData.vendorTotal.toFixed(2)}</span> {/* Reduced font size */}
                                        </div>
                                    </div>
                                ))}

                                {/* Address and Payment Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4 mt-4"> {/* Reduced gap, pt, mt */}
                                    <div>
                                        <h4 className={`text-sm font-semibold mb-2 text-heading-gray`}>Delivery Address:</h4> {/* Reduced font size, mb */}
                                        <div className={`bg-white p-3 rounded-md border border-gray-200 text-xs text-text-gray shadow-sm`}> {/* Reduced padding, rounded, font size */}
                                            <p className="font-medium">{order.address?.fullName}</p>
                                            <p>{order.address?.street}</p>
                                            <p>
                                                {order.address?.street2 && `${order.address.street2}, `}
                                                {order.address?.landmark && `Near ${order.address.landmark}`}
                                            </p>
                                            <p>{order.address?.city}, {order.address?.state} - {order.address?.zipCode}</p>
                                            <p>{order.address?.country}</p>
                                            <p className={`mt-1.5 font-medium text-rolex-green`}>Phone: {order.address?.phone}</p> {/* Reduced mt */}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className={`text-sm font-semibold mb-2 text-heading-gray`}>Payment Details:</h4> {/* Reduced font size, mb */}
                                        <div className={`bg-white p-3 rounded-md border border-gray-200 text-xs text-text-gray shadow-sm`}> {/* Reduced padding, rounded, font size */}
                                            <div className="flex justify-between mb-1.5"> {/* Reduced mb */}
                                                <span>Payment Method:</span>
                                                <span className={`font-semibold capitalize text-rolex-green`}>{order.paymentMethod}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-base sm:text-lg mt-3 pt-3 border-t border-gray-200"> {/* Reduced font size, mt, pt */}
                                                <span>Order Total:</span>
                                                <span className={`text-rolex-green`}>₹{order.total?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* The Navbar will appear here, fixed at the bottom on mobile */}
            <Navbar />
        </div>
    );
};

export default OrderScreen;