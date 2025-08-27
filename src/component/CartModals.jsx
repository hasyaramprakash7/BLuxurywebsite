import React from "react";
import { XCircle } from "lucide-react"; // Import XCircle for modal close button
import { toast } from "react-toastify"; // Import toast for notifications

// AddressModal Component
const AddressModal = ({
    address,
    handleAddressChange,
    handlePincodeBlur,
    handleConfirmAddress,
    setShowAddressModal
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">📍 Enter Delivery Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Full Name" className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                    <input name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Phone Number" className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                    <input name="street" value={address.street} onChange={handleAddressChange} placeholder="Street Address" className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 col-span-1 sm:col-span-2" required />
                    <input name="street2" value={address.street2} onChange={handleAddressChange} placeholder="Apartment, Suite, etc. (Optional)" className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 col-span-1 sm:col-span-2" />
                    <input name="landmark" value={address.landmark} onChange={handleAddressChange} placeholder="Landmark (e.g., Near XYZ Mall)" className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 col-span-1 sm:col-span-2" />
                    <input name="city" value={address.city} onChange={handleAddressChange} placeholder="City" className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                    <input name="state" value={address.state} onChange={handleAddressChange} placeholder="State" className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                    <input
                        name="zipCode"
                        value={address.zipCode}
                        onChange={handleAddressChange}
                        onBlur={handlePincodeBlur}
                        placeholder="ZIP Code"
                        className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                    <input name="country" value={address.country} onChange={handleAddressChange} placeholder="Country" className="border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" readOnly />
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setShowAddressModal(false)} className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold shadow-md">Cancel</button>
                    <button onClick={handleConfirmAddress} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold shadow-md">Continue</button>
                </div>
            </div>
        </div>
    );
};

// ConfirmOrderModal Component
const ConfirmOrderModal = ({
    pricingBreakdown,
    paymentMethod,
    address,
    latitude,
    longitude,
    handleEditAddress,
    handlePlaceOrderConfirmed,
    orderLoading,
    items
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-95 animate-fade-in-up">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Confirm Your Order</h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Items ({items.length})</span>
                            <span>₹{pricingBreakdown.discountedSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span>{pricingBreakdown.deliveryCharge === 0 ? 'FREE' : `₹${pricingBreakdown.deliveryCharge.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span>₹{pricingBreakdown.platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>GST</span>
                            <span>₹{pricingBreakdown.gstAmount.toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>₹{pricingBreakdown.finalTotal.toFixed(2)}</span>
                        </div>
                        {pricingBreakdown.totalSavings > 0 && (
                            <div className="text-green-600 text-center font-medium">
                                You saved ₹{pricingBreakdown.totalSavings.toFixed(2)}!
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Delivery Address</h4>
                    <div className="text-sm text-gray-700">
                        <p><strong>Payment:</strong> {paymentMethod}</p>
                        <p><strong>Name:</strong> {address.fullName}</p>
                        <p><strong>Phone:</strong> {address.phone}</p>
                        <p><strong>Address:</strong> {address.street}, {address.street2 && `${address.street2}, `}{address.landmark && `${address.landmark}, `}{address.city}, {address.state} - {address.zipCode}, {address.country}</p>
                        {latitude && longitude && (
                            <p className="text-xs text-gray-600 mt-2">
                                Location: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={handleEditAddress} className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-semibold shadow-md">Edit Address</button>
                    <button onClick={handlePlaceOrderConfirmed} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold shadow-md" disabled={orderLoading}>
                        {orderLoading ? "Processing..." : `Place Order (₹${pricingBreakdown.finalTotal.toFixed(2)})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// CartModals Component
const CartModals = ({
    showAddressModal,
    setShowAddressModal,
    address,
    handleAddressChange,
    handlePincodeBlur,
    handleConfirmAddress,
    showConfirmOrderModal,
    setShowConfirmOrderModal,
    pricingBreakdown,
    paymentMethod,
    latitude,
    longitude,
    handleEditAddress,
    handlePlaceOrderConfirmed,
    orderLoading,
    items
}) => {
    return (
        <>
            {/* Address Modal */}
            {showAddressModal && (
                <AddressModal
                    address={address}
                    handleAddressChange={handleAddressChange}
                    handlePincodeBlur={handlePincodeBlur}
                    handleConfirmAddress={handleConfirmAddress}
                    setShowAddressModal={setShowAddressModal}
                />
            )}

            {/* Confirm Order Dialog */}
            {showConfirmOrderModal && (
                <ConfirmOrderModal
                    pricingBreakdown={pricingBreakdown}
                    paymentMethod={paymentMethod}
                    address={address}
                    latitude={latitude}
                    longitude={longitude}
                    handleEditAddress={handleEditAddress}
                    handlePlaceOrderConfirmed={handlePlaceOrderConfirmed}
                    orderLoading={orderLoading}
                    items={items}
                />
            )}
        </>
    );
};

export default CartModals;
