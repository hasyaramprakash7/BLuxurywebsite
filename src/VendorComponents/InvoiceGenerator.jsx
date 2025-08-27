// src/components/InvoiceGenerator.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Download, Share2, Phone, Mail, MapPin, Calendar, Package } from 'lucide-react';
import dayjs from "dayjs"; // Make sure dayjs is imported here if you use it within the component
import relativeTime from "dayjs/plugin/relativeTime"; // Import dayjs plugins
import updateLocale from "dayjs/plugin/updateLocale"; // Import dayjs plugins

// Extend dayjs with plugins (ensure this runs once per application, or per component if isolated)
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Configure dayjs locale (copying from VendorOrderList.jsx, ensure consistency)
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

// Utility function for phone number formatting (added here)
const formatIndianPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
        return "N/A";
    }

    let cleanedNumber = String(phoneNumber).trim();

    // Remove any leading '+' or '91' if already present
    cleanedNumber = cleanedNumber.replace(/^\+91/, '');
    cleanedNumber = cleanedNumber.replace(/^91/, '');

    // If it starts with '0' and is 11 digits long (indicating a leading 0 for 10-digit number)
    // This assumes Indian mobile numbers are 10 digits after country code.
    if (cleanedNumber.startsWith('0') && cleanedNumber.length === 11) {
        cleanedNumber = cleanedNumber.substring(1);
    }

    // Basic validation: ensure it's a 10-digit number before adding +91
    // You might want more robust validation based on your needs
    if (cleanedNumber.length === 10 && /^\d+$/.test(cleanedNumber)) {
        return `+91${cleanedNumber}`;
    }

    // Fallback for numbers that aren't exactly 10 digits after cleaning
    // If it's not 10 digits, just prepend +91 as a best effort, or return original/error
    return `+91${cleanedNumber}`;
};


const InvoiceGenerator = ({ initialInvoiceData }) => {
    const [invoiceData, setInvoiceData] = useState(() => {
        // Initialize state with default data or initialInvoiceData if provided
        if (initialInvoiceData) {
            return {
                ...initialInvoiceData,
                // Ensure dates are in YYYY-MM-DD format for input type="date"
                date: initialInvoiceData.date ? dayjs(initialInvoiceData.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                dueDate: initialInvoiceData.dueDate ? dayjs(initialInvoiceData.dueDate).format('YYYY-MM-DD') : dayjs().add(7, 'day').format('YYYY-MM-DD'),
                // Apply phone number formatting on initial load
                customer: {
                    ...initialInvoiceData.customer,
                    phone: formatIndianPhoneNumber(initialInvoiceData.customer?.phone)
                },
                vendor: {
                    ...initialInvoiceData.vendor,
                    phone: formatIndianPhoneNumber(initialInvoiceData.vendor?.phone)
                }
            };
        }
        return {
            invoiceNumber: 'INV-2025-001',
            date: dayjs().format('YYYY-MM-DD'),
            dueDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
            customer: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+91 9876543210', // Default formatted
                address: '123 Main Street, City, State - 123456'
            },
            vendor: {
                name: 'Your Store Name',
                email: 'store@example.com',
                phone: '+91 9876543210', // Default formatted
                address: '456 Business Street, City, State - 654321',
                gst: 'GST123456789'
            }
            ,
            items: [
                { id: 1, name: 'Product 1', quantity: 2, price: 500, total: 1000 },
                { id: 2, name: 'Product 2', quantity: 1, price: 750, total: 750 }
            ],
            tax: 18,
            discount: 0
        };
    });

    const invoiceRef = useRef(null);

    // Use useEffect to update state when initialInvoiceData prop changes
    useEffect(() => {
        if (initialInvoiceData) {
            setInvoiceData({
                ...initialInvoiceData,
                date: initialInvoiceData.date ? dayjs(initialInvoiceData.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                dueDate: initialInvoiceData.dueDate ? dayjs(initialInvoiceData.dueDate).format('YYYY-MM-DD') : dayjs().add(7, 'day').format('YYYY-MM-DD'),
                // Apply phone number formatting when prop updates
                customer: {
                    ...initialInvoiceData.customer,
                    phone: formatIndianPhoneNumber(initialInvoiceData.customer?.phone)
                },
                vendor: {
                    ...initialInvoiceData.vendor,
                    phone: formatIndianPhoneNumber(initialInvoiceData.vendor?.phone)
                }
            });
        }
    }, [initialInvoiceData]); // Dependency array: run effect when initialInvoiceData changes

    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * invoiceData.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * invoiceData.tax) / 100;
    const finalTotal = taxableAmount + taxAmount;

    const addItem = () => {
        const newItem = {
            id: Date.now(),
            name: 'New Product',
            quantity: 1,
            price: 0,
            total: 0
        };
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    const updateItem = (id, field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === id) {
                    const updated = { ...item, [field]: value };
                    if (field === 'quantity' || field === 'price') {
                        updated.total = updated.quantity * updated.price;
                    }
                    return updated;
                }
                return item;
            })
        }));
    };

    const removeItem = (id) => {
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    // Handlers for Vendor and Customer details
    const handleVendorChange = (field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            vendor: {
                ...prev.vendor,
                [field]: field === 'phone' ? formatIndianPhoneNumber(value) : value
            }
        }));
    };

    const handleCustomerChange = (field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                [field]: field === 'phone' ? formatIndianPhoneNumber(value) : value
            }
        }));
    };

    const generateWhatsAppMessage = () => {
        const message = `
🧾 *INVOICE*

*Invoice #:* ${invoiceData.invoiceNumber}
*Date:* ${dayjs(invoiceData.date).format('MMM D, YYYY')}
*Due Date:* ${dayjs(invoiceData.dueDate).format('MMM D, YYYY')}

*From:* ${invoiceData.vendor.name}
📧 ${invoiceData.vendor.email}
📞 ${invoiceData.vendor.phone}
📍 ${invoiceData.vendor.address}
${invoiceData.vendor.gst ? `GST: ${invoiceData.vendor.gst}` : ''}

*To:* ${invoiceData.customer.name}
📧 ${invoiceData.customer.email}
📞 ${invoiceData.customer.phone}
📍 ${invoiceData.customer.address}

*ITEMS:*
${invoiceData.items.map(item =>
            `• ${item.name} - ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${item.total.toFixed(2)}`
        ).join('\n')}

*SUMMARY:*
Subtotal: ₹${subtotal.toFixed(2)}
${invoiceData.discount > 0 ? `Discount (${invoiceData.discount}%): -₹${discountAmount.toFixed(2)}` : ''}
Tax (${invoiceData.tax}%): ₹${taxAmount.toFixed(2)}
*Total: ₹${finalTotal.toFixed(2)}*

Thank you for your business! 🙏
`.trim();

        return encodeURIComponent(message);
    };

    const sendWhatsApp = () => {
        const message = generateWhatsAppMessage();
        // Use the already formatted customer phone number
        const whatsappUrl = `https://wa.me/${invoiceData.customer.phone.replace(/[^\d]/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const downloadInvoice = () => {
        // This would typically use html2canvas or similar library
        // For now, we'll just show an alert
        alert('Download functionality would be implemented with html2canvas or similar library');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Invoice Generator</h1>
                                <p className="text-blue-100">Create and share professional invoices</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={downloadInvoice}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Download size={20} />
                                    Download
                                </button>
                                <button
                                    onClick={sendWhatsApp}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Share2 size={20} />
                                    Send WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Invoice Form */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Invoice Details */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800">Invoice Details</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                        <input
                                            type="text"
                                            value={invoiceData.invoiceNumber}
                                            onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={invoiceData.date}
                                            onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={invoiceData.dueDate}
                                            onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Details */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800">Vendor Details</h2>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Vendor Name"
                                        value={invoiceData.vendor.name}
                                        onChange={(e) => handleVendorChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Vendor Email"
                                        value={invoiceData.vendor.email}
                                        onChange={(e) => handleVendorChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Vendor Phone"
                                        value={invoiceData.vendor.phone}
                                        onChange={(e) => handleVendorChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <textarea
                                        placeholder="Vendor Address"
                                        value={invoiceData.vendor.address}
                                        onChange={(e) => handleVendorChange('address', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Vendor GST (Optional)"
                                        value={invoiceData.vendor.gst || ''}
                                        onChange={(e) => handleVendorChange('gst', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800">Customer Details</h2>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Customer Name"
                                        value={invoiceData.customer.name}
                                        onChange={(e) => handleCustomerChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Customer Email"
                                        value={invoiceData.customer.email}
                                        onChange={(e) => handleCustomerChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={invoiceData.customer.phone}
                                        onChange={(e) => handleCustomerChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <textarea
                                        placeholder="Address"
                                        value={invoiceData.customer.address}
                                        onChange={(e) => handleCustomerChange('address', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Items</h2>
                                <button
                                    onClick={addItem}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Package size={20} />
                                    Add Item
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Price</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceData.items.map(item => (
                                            <tr key={item.id}>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-center"
                                                    />
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-center"
                                                    />
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                                                    ₹{item.total.toFixed(2)}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tax & Discount Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    value={invoiceData.tax}
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    value={invoiceData.discount}
                                    onChange={(e) => setInvoiceData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Invoice Preview */}
                        <div className="bg-white border-2 border-gray-200 rounded-lg p-6" ref={invoiceRef}>
                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
                                <div className="text-gray-600">
                                    <p>Invoice #: {invoiceData.invoiceNumber}</p>
                                    <p>Date: {dayjs(invoiceData.date).format('MMM D, YYYY')}</p>
                                    <p>Due Date: {dayjs(invoiceData.dueDate).format('MMM D, YYYY')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">From:</h3>
                                    <div className="text-gray-700">
                                        <p className="font-medium">{invoiceData.vendor.name}</p>
                                        <p>{invoiceData.vendor.address}</p>
                                        <p className="flex items-center gap-1">
                                            <Phone size={16} />
                                            {invoiceData.vendor.phone}
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <Mail size={16} />
                                            {invoiceData.vendor.email}
                                        </p>
                                        {invoiceData.vendor.gst && (
                                            <p className="flex items-center gap-1">
                                                <span className="font-semibold">GST:</span>
                                                {invoiceData.vendor.gst}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">To:</h3>
                                    <div className="text-gray-700">
                                        <p className="font-medium">{invoiceData.customer.name}</p>
                                        <p>{invoiceData.customer.address}</p>
                                        <p className="flex items-center gap-1">
                                            <Phone size={16} />
                                            {invoiceData.customer.phone}
                                        </p>
                                        <p className="flex items-center gap-1">
                                            <Mail size={16} />
                                            {invoiceData.customer.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Price</th>
                                            <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceData.items.map(item => (
                                            <tr key={item.id}>
                                                <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">₹{item.price.toFixed(2)}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">₹{item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    {invoiceData.discount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Discount ({invoiceData.discount}%):</span>
                                            <span>-₹{discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Tax ({invoiceData.tax}%):</span>
                                        <span>₹{taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>₹{finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Preview */}
                        <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
                            <h3 className="text-lg font-semibold text-green-800 mb-4">WhatsApp Message Preview</h3>
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                    {decodeURIComponent(generateWhatsAppMessage())}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;