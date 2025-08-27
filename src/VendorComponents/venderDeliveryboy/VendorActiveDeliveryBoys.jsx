import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    User,
    Phone,
    Mail,
    MapPin,
    Clock,
    Star,
    Truck,
    Badge,
    Calendar,
    Award,
    CheckCircle,
    XCircle,
    Package,
    CreditCard,
    Filter, // Not used in this simplified version, but kept for consistency
    Search, // Not used in this simplified version, but kept for consistency
    SortAsc, // Not used in this simplified version, but kept for consistency
    Globe
} from "lucide-react";
import {
    assignDeliveryBoy,
    fetchAllDeliveryBoys,
} from "../../features/delivery/deliveryBoySlice";
import { fetchOrderById } from "../../features/order/orderSlice"; // Assuming this path is correct
import { useLocation } from "react-router-dom";

const AllDeliveryBoys = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { orderId } = location.state || {};

    // Local state for orderDetails (as per your working code)
    const [orderDetails, setOrderDetails] = useState(null);

    // Redux state for delivery boys
    const { allDeliveryBoys, loading, error } = useSelector(
        (state) => state.deliveryBoyAuth
    );

    // Filtered and sorted boys (removed filters/sort for this simplified example, can be re-added)
    const filteredAndSortedBoys = allDeliveryBoys; // Placeholder if no search/filter logic is applied here for now

    // Find the assigned delivery boy's full details from the fetched list
    const assignedDeliveryBoy = orderDetails?.deliveryBoy
        ? allDeliveryBoys.find(boy => boy._id === orderDetails.deliveryBoy)
        : null;

    // Determine if an assignment has already been made for this order
    const hasBeenAssigned = !!orderDetails?.deliveryBoy;

    // Fetch order details on component mount or orderId change
    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderById(orderId)).then((res) => {
                if (res.payload) {
                    setOrderDetails(res.payload); // Update local state directly with fetched order
                }
            });
        }
    }, [orderId, dispatch]);

    // Fetch all delivery boys on component mount
    useEffect(() => {
        dispatch(fetchAllDeliveryBoys());
    }, [dispatch]);

    const handleAssign = (selectedOrderId, deliveryBoyId) => {
        if (!selectedOrderId || !deliveryBoyId) {
            alert("Order ID or Delivery Boy ID is missing.");
            return;
        }

        if (hasBeenAssigned) {
            alert("This order is already assigned.");
            return;
        }

        if (window.confirm("Assign this delivery boy to the order?")) {
            dispatch(assignDeliveryBoy({ orderId: selectedOrderId, deliveryBoyId })).then((res) => {
                console.log("📨 assignDeliveryBoy response:", res);

                if (res.payload?.success) {
                    alert('✅ Delivery boy assigned successfully!');
                    // OPTION 1: Update local state directly from the payload
                    setOrderDetails(res.payload.order); // This is crucial for the UI to update immediately

                    // OPTION 2 (if you preferred refetching):
                    // dispatch(fetchOrderById(selectedOrderId)).then((fetchRes) => {
                    //     if (fetchRes.payload) {
                    //         setOrderDetails(fetchRes.payload);
                    //     }
                    // });
                } else {
                    alert('❌ Assignment failed: ' + (res.payload?.message || res.error?.message || 'Unknown error'));
                }
            });
        }
    };

    // --- Start: AssignedOrderCard Component (AssignedOrderCardContent) ---
    // This component is designed to be the *only* thing rendered when an order is assigned.
    const AssignedOrderCardContent = ({ order, deliveryBoy }) => {
        if (!order || !deliveryBoy) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-lg mb-8">
                    <p className="text-red-800 text-lg">Error: Order or Delivery Boy data is missing for assignment display.</p>
                    <p className="text-red-600 text-sm mt-2">Please ensure all required data is loaded or retry.</p>
                </div>
            );
        }

        return (
            <div className="mb-8 bg-white rounded-2xl shadow-xl border border-green-300 overflow-hidden transform transition-all duration-300 hover:scale-[1.005]">
                {/* Header for the Card */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-6 flex items-center gap-4">
                    <Truck className="w-10 h-10 text-white" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-white">Order Assigned!</h2>
                        <p className="text-green-100 text-lg mt-1">Details for Order ID: <span className="font-mono">{order._id}</span></p>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Order Details Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-200 flex items-center gap-3">
                            <Package className="w-7 h-7 text-indigo-600" /> Order Information
                        </h3>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex items-center gap-3">
                                <Badge className="w-6 h-6 text-indigo-600" />
                                <span className="font-semibold">Status:</span>
                                <span className={`px-4 py-1 rounded-full text-base font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {order.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-purple-600" />
                                <span className="font-semibold">Total Amount:</span>
                                <span className="text-3xl font-extrabold text-green-700">₹{order.total.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-orange-600" />
                                <span className="font-semibold">Payment Method:</span>
                                <span className="text-lg">{order.paymentMethod}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="w-6 h-6 text-blue-600" />
                                <span className="font-semibold">Customer:</span>
                                <span className="text-lg">{order.userId?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-6 h-6 text-red-600 mt-1" />
                                <div className="flex flex-col">
                                    <span className="font-semibold">Delivery Address:</span>
                                    <span className="text-lg">{order.address.fullName}</span>
                                    <span className="text-md">{order.address.street}{order.address.street2 ? `, ${order.address.street2}` : ''}</span>
                                    <span className="text-md">{order.address.city}, {order.address.state} - {order.address.zipCode}</span>
                                    {order.address.landmark && <span className="text-md">Landmark: {order.address.landmark}</span>}
                                </div>
                            </div>
                            {/* Added phone from address object */}
                            <div className="flex items-center gap-3">
                                <Phone className="w-6 h-6 text-blue-600" />
                                <span className="font-semibold">Address Phone:</span>
                                <span className="text-lg">{order.address.phone || 'N/A'}</span>
                            </div>
                            {/* Added Latitude and Longitude */}
                            {(order.address.latitude && order.address.longitude) && (
                                <div className="flex items-center gap-3">
                                    <Globe className="w-6 h-6 text-blue-600" />
                                    <span className="font-semibold">Coordinates:</span>
                                    <span className="text-lg">Lat: {order.address.latitude.toFixed(4)}, Lon: {order.address.longitude.toFixed(4)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                                <span className="font-semibold">Order Date:</span>
                                <span className="text-lg">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Boy Details Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-emerald-200 flex items-center gap-3">
                            <Truck className="w-7 h-7 text-emerald-600" /> Assigned Delivery Executive
                        </h3>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex items-center gap-3">
                                <User className="w-6 h-6 text-emerald-600" />
                                <span className="font-semibold">Name:</span>
                                <span className="text-xl font-bold text-gray-900">{deliveryBoy.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-6 h-6 text-emerald-600" />
                                <span className="font-semibold">Email:</span>
                                <span className="text-lg">{deliveryBoy.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-6 h-6 text-emerald-600" />
                                <span className="font-semibold">Phone:</span>
                                <span className="text-lg">{deliveryBoy.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-emerald-600" />
                                <span className="font-semibold">Address:</span>
                                <span className="text-lg">{deliveryBoy.address || "Not provided"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Star className="w-6 h-6 text-yellow-500" />
                                <span className="font-semibold">Rating:</span>
                                <span className="text-lg">{deliveryBoy.rating ? `${deliveryBoy.rating}/5` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Package className="w-6 h-6 text-emerald-600" />
                                <span className="font-semibold">Total Deliveries:</span>
                                <span className="text-lg">{deliveryBoy.totalDeliveries || 0}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Award className="w-6 h-6 text-blue-600" />
                                <span className="font-semibold">Experience:</span>
                                <span className="text-lg">{deliveryBoy.experience || '1'} years</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-gray-600" />
                                <span className="font-semibold">Availability:</span>
                                <span className={`text-lg font-bold ${deliveryBoy.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                    {deliveryBoy.isAvailable ? 'Available' : 'Currently Busy'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Action Section (Optional: Add buttons like "Track Order" etc.) */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 text-right">
                    <button
                        onClick={() => alert("Implement tracking functionality here!")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300"
                    >
                        View Order Progress
                    </button>
                </div>
            </div>
        );
    };
    // --- End: AssignedOrderCard Component ---


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-600 rounded-xl">
                            <Truck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Delivery Management</h1>
                            <p className="text-gray-600 mt-1">Efficiently manage order assignments to your delivery team.</p>
                        </div>
                    </div>
                </div>

                {/* Main Conditional Rendering Block: Show only the Assigned card if assigned, else show selection UI */}
                {hasBeenAssigned && assignedDeliveryBoy && orderDetails ? (
                    // IF assigned: ONLY show the combined AssignedOrderCard
                    <AssignedOrderCardContent order={orderDetails} deliveryBoy={assignedDeliveryBoy} />
                ) : (
                    // IF NOT assigned: Show the order summary, and the list of delivery boys for assignment
                    <>
                        {/* Order Summary Card (Only shown if NOT assigned) */}
                        {orderDetails && ( // Ensure orderDetails is loaded before showing this
                            <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Package className="w-8 h-8 text-white" />
                                        <h2 className="text-2xl font-bold text-white">Order Details</h2>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className="w-5 h-5 text-indigo-600" />
                                                <span className="font-medium text-gray-700">Order ID:</span>
                                                <span className="text-gray-900 font-mono">{orderDetails._id}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="font-medium text-gray-700">Status:</span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${orderDetails.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    orderDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {orderDetails.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-purple-600" />
                                                <span className="font-medium text-gray-700">Total:</span>
                                                <span className="text-2xl font-bold text-green-600">₹{orderDetails.total}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-orange-600" />
                                                <span className="font-medium text-gray-700">Payment:</span>
                                                <span className="text-gray-900">{orderDetails.paymentMethod}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium text-gray-700">Customer:</span>
                                                <span className="text-gray-900">{orderDetails.userId?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-indigo-600" />
                                                <span className="font-medium text-gray-700">Date:</span>
                                                <span className="text-gray-900">{new Date(orderDetails.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading/Error/No Boys (Only shown if NOT assigned) */}
                        {loading && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-xl text-gray-600">Loading delivery team...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                                <p className="text-red-800 text-lg">{error}</p>
                            </div>
                        )}

                        {!loading && !error && filteredAndSortedBoys.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600">No delivery boys found.</p>
                                <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}

                        {/* Delivery Boys Grid (Only shown if NOT assigned) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredAndSortedBoys.map((boy) => (
                                <div
                                    key={boy._id}
                                    className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300
                                    ${!boy.isAvailable || hasBeenAssigned // Also disable if order is already assigned
                                            ? "opacity-50 grayscale cursor-not-allowed"
                                            : "hover:shadow-xl transform hover:-translate-y-1"
                                        }`}
                                >
                                    {/* Card Header */}
                                    <div className={`p-6 bg-gradient-to-r from-indigo-600 to-purple-600`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                                    <User className={`w-6 h-6 text-indigo-600`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{boy.name}</h3>
                                                    <p className="text-indigo-100 text-sm">ID: {boy._id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${boy.isAvailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                <span className="text-white text-sm font-medium">
                                                    {boy.isAvailable ? 'Available' : 'Busy'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6">
                                        {/* Contact Information */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-indigo-600" />
                                                <span className="text-gray-700">{boy.email || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-green-600" />
                                                <span className="text-gray-700">{boy.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-5 h-5 text-red-600" />
                                                <span className="text-gray-700">{boy.address || "Address not provided"}</span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-sm font-medium text-gray-700">Rating</span>
                                                </div>
                                                <div className="text-lg font-bold text-blue-600">
                                                    {boy.rating ? `${boy.rating}/5` : 'N/A'}
                                                </div>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <Package className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-gray-700">Deliveries</span>
                                                </div>
                                                <div className="text-lg font-bold text-green-600">
                                                    {boy.totalDeliveries || 0}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Details */}
                                        <div className="space-y-2 mb-6 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Vehicle Type:</span>
                                                <span className="font-medium text-gray-800">{boy.vehicleType || 'Bike'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Experience:</span>
                                                <span className="font-medium text-gray-800">{boy.experience || '1'} years</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Joined:</span>
                                                <span className="font-medium text-gray-800">
                                                    {boy.joinDate ? new Date(boy.joinDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleAssign(orderId, boy._id)}
                                            disabled={!boy.isAvailable || hasBeenAssigned} // Disable if already assigned
                                            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${!boy.isAvailable || hasBeenAssigned
                                                ? "bg-gray-200 text-gray-700 cursor-not-allowed" // Grey out if unavailable or already assigned
                                                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                }`}
                                        >
                                            {hasBeenAssigned
                                                ? "Order Already Assigned"
                                                : (!boy.isAvailable ? "Currently Unavailable" : "Assign to this Order")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AllDeliveryBoys;