// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";

// const AssignDeliveryBoy = () => {
//     const { state } = useLocation();
//     const navigate = useNavigate();

//     const [deliveryBoys, setDeliveryBoys] = useState([]);
//     const [orderDetails, setOrderDetails] = useState(null);
//     const [assigning, setAssigning] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const order = state?.order;
//     const vendor = state?.vendor;
//     const orderId = order?._id || state?.orderId;

//     // Fetch delivery boys and order details
//     useEffect(() => {
//         const fetchDetails = async () => {
//             try {
//                 setLoading(true);

//                 // Fetch active delivery boys
//                 const boysRes = await axios.get("/api/delivery/active");
//                 const activeBoys = boysRes.data.deliveryBoys || [];
//                 setDeliveryBoys(activeBoys.slice(0, 3));

//                 // Fetch order details only if not provided via state
//                 if (!order && orderId) {
//                     const orderRes = await axios.get(`/api/orders/${orderId}`);
//                     setOrderDetails(orderRes.data.order);
//                 } else {
//                     setOrderDetails(order);
//                 }
//             } catch (err) {
//                 console.error("Error fetching data:", err);
//                 toast.error("Failed to load delivery boys or order.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (orderId || order) fetchDetails();
//     }, [orderId, order]);

//     const handleAssign = async (deliveryBoyId) => {
//         try {
//             setAssigning(true);
//             await axios.post("/api/orders/assign", {
//                 orderId: orderDetails._id,
//                 deliveryBoyId,
//             });
//             toast.success("✅ Delivery boy assigned successfully.");
//             navigate("/vendor/orders");
//         } catch (err) {
//             toast.error(err.response?.data?.message || "❌ Failed to assign delivery boy.");
//         } finally {
//             setAssigning(false);
//         }
//     };

//     if (!orderDetails) {
//         return <p className="p-6 text-red-600">Order not found or loading...</p>;
//     }

//     return (
//         <div className="p-6 max-w-4xl mx-auto">
//             <h1 className="text-2xl font-bold mb-4">🚚 Assign Delivery Boy</h1>

//             <div className="bg-white p-4 border rounded mb-6">
//                 <h2 className="font-semibold mb-2">🧾 Order Details</h2>
//                 <p><strong>Order ID:</strong> {orderDetails._id}</p>
//                 <p><strong>Status:</strong> {orderDetails.status}</p>
//                 <p><strong>Customer:</strong> {orderDetails.user?.name || 'N/A'}</p>
//                 <p><strong>Total:</strong> ₹{orderDetails.total}</p>
//                 <p><strong>Delivery Address:</strong> {orderDetails.address?.latitude}, {orderDetails.address?.longitude}</p>
//                 <p><strong>Vendor Location:</strong> {vendor?.address?.latitude}, {vendor?.address?.longitude}</p>
//             </div>

//             <h2 className="text-lg font-semibold mb-3">Suggested Delivery Boys:</h2>

//             {loading ? (
//                 <p>Loading delivery boys...</p>
//             ) : deliveryBoys.length === 0 ? (
//                 <p>No available delivery boys.</p>
//             ) : (
//                 deliveryBoys.map((boy) => (
//                     <div key={boy._id} className="p-4 border rounded mb-3 flex justify-between items-center shadow-sm">
//                         <div>
//                             <p><strong>Name:</strong> {boy.name}</p>
//                             <p><strong>Phone:</strong> {boy.phone}</p>
//                         </div>
//                         <button
//                             disabled={assigning}
//                             onClick={() => handleAssign(boy._id)}
//                             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                         >
//                             {assigning ? "Assigning..." : "Assign"}
//                         </button>
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// };

// export default AssignDeliveryBoy;
