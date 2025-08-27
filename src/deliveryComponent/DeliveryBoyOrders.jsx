import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DeliveryBoyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("deliveryBoyToken");

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await axios.get("/api/orders/my-deliveries", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setOrders(res.data.orders);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Assigned Orders</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <ul className="space-y-4">
                {orders.map((order) => (
                    <li key={order._id} className="p-4 border rounded">
                        <p><strong>Order ID:</strong> {order._id}</p>
                        <p><strong>Status:</strong> {order.status}</p>
                        <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                        {/* Add more fields as needed */}
                    </li>
                ))}
            </ul>

            {!loading && !error && orders.length === 0 && (
                <p>No assigned orders found.</p>
            )}
        </div>
    );
};

export default DeliveryBoyOrders;
