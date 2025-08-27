// src/components/GenerateInvoicePage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InvoiceGenerator from './InvoiceGenerator'; // Assuming InvoiceGenerator is in the same components folder
import dayjs from "dayjs";

const GenerateInvoicePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [invoiceData, setInvoiceData] = useState(null);

    useEffect(() => {
        if (location.state && location.state.orderData && location.state.vendorData) {
            const { orderData, vendorData } = location.state;

            // Filter items relevant to the current vendor
            const vendorItems = orderData.items.filter(item =>
                item.vendorId.toString() === vendorData._id.toString()
            ).map(item => ({
                id: item._id, // Use item's actual ID
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price // Calculate total for each item
            }));

            // Calculate total for vendor's items (subtotal for this invoice)
            const subtotal = vendorItems.reduce((sum, item) => sum + item.total, 0);

            // You might have tax and discount logic per vendor or order.
            // For now, let's assume a default tax/discount for this specific invoice.
            // You can adjust these based on your order schema.
            const taxRate = orderData.taxRate || 18; // Example: assuming taxRate is on order or default
            const discountRate = orderData.discountRate || 0; // Example: assuming discountRate is on order or default

            const discountAmount = (subtotal * discountRate) / 100;
            const taxableAmount = subtotal - discountAmount;
            const taxAmount = (taxableAmount * taxRate) / 100;
            const finalTotal = taxableAmount + taxAmount;

            const formattedInvoiceData = {
                invoiceNumber: `INV-${orderData._id.slice(-8)}-${dayjs().format('YYYYMMDD')}`,
                date: dayjs(orderData.createdAt).format('YYYY-MM-DD'),
                dueDate: dayjs(orderData.createdAt).add(7, 'day').format('YYYY-MM-DD'), // Example: 7 days from order date
                customer: {
                    name: orderData.user?.name || 'N/A',
                    email: orderData.user?.email || 'N/A',
                    phone: orderData.address?.phone || 'N/A',
                    address: `${orderData.address?.street}, ${orderData.address?.city}, ${orderData.address?.state} - ${orderData.address?.zipCode}, ${orderData.address?.country}`
                },
                vendor: {
                    name: vendorData.name,
                    email: vendorData.email,
                    phone: vendorData.phone,
                    address: `${vendorData.address?.street}, ${vendorData.address?.city}, ${vendorData.address?.state} - ${vendorData.address?.zipCode}, ${vendorData.address?.country}`,
                    gst: vendorData.gstin // Assuming vendor object has a gstin field
                },
                items: vendorItems,
                tax: taxRate,
                discount: discountRate,
                // You can add more fields if needed, like shipping, payment status, etc.
                subtotal: subtotal,
                discountAmount: discountAmount,
                taxAmount: taxAmount,
                finalTotal: finalTotal
            };
            setInvoiceData(formattedInvoiceData);
        } else {
            // If no order data is passed, navigate back or show an error
            alert('No order data found to generate invoice.');
            navigate('/vendor/orders'); // Redirect to vendor orders page
        }
    }, [location.state, navigate]);

    if (!invoiceData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading invoice data...</p>
            </div>
        );
    }

    return <InvoiceGenerator initialInvoiceData={invoiceData} />;
};

export default GenerateInvoicePage;