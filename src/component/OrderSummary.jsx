import React from 'react';
import { Truck, HandCoins, CheckCircle, ReceiptText, MapPin } from 'lucide-react';

const OrderSummary = ({
    items,
    pricingBreakdown,
    DELIVERY_CHARGE,
    FREE_DELIVERY_THRESHOLD,
    PLATFORM_FEE_RATE,
    GST_RATE,
    paymentMethod,
    setPaymentMethod,
    handleOpenAddressModal,
    handleClear,
    orderLoading
}) => {
    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-24">
                <h3 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                    <ReceiptText size={24} /> Order Summary
                </h3>

                <div className="space-y-3 text-base">
                    <div className="flex justify-between items-center text-gray-700">
                        <span>Items ({items.length})</span>
                        <span>₹{pricingBreakdown.itemsSubtotal.toFixed(2)}</span>
                    </div>

                    {pricingBreakdown.totalSavings > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Savings</span>
                            <span>- ₹{pricingBreakdown.totalSavings.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-gray-700">
                        <span>Discounted Subtotal</span>
                        <span className="font-semibold">₹{pricingBreakdown.discountedSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-700">
                        <span>Platform Fee ({Math.round(PLATFORM_FEE_RATE * 100)}%)</span>
                        <span>₹{pricingBreakdown.platformFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-700">
                        <span>GST ({Math.round(GST_RATE * 100)}%)</span>
                        <span>₹{pricingBreakdown.gstAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-gray-700">
                        <span>Delivery Charges</span>
                        {pricingBreakdown.deliveryCharge === 0 ? (
                            <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle size={16} /> FREE</span>
                        ) : (
                            <span className="font-medium">₹{pricingBreakdown.deliveryCharge.toFixed(2)}</span>
                        )}
                    </div>

                    {pricingBreakdown.discountedSubtotal > 0 && pricingBreakdown.discountedSubtotal < FREE_DELIVERY_THRESHOLD && (
                        <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                            <Truck size={18} />
                            Add ₹{(FREE_DELIVERY_THRESHOLD - pricingBreakdown.discountedSubtotal).toFixed(2)} more for FREE delivery!
                        </div>
                    )}

                    <hr className="my-4 border-gray-200" />

                    <div className="flex justify-between font-bold text-xl text-gray-900">
                        <span>Total Amount</span>
                        <span className="text-green-700">₹{pricingBreakdown.finalTotal.toFixed(2)}</span>
                    </div>

                    {pricingBreakdown.totalSavings > 0 && (
                        <div className="text-center text-green-700 font-bold text-base bg-green-50 p-3 rounded-lg mt-3 flex items-center justify-center gap-2">
                            <HandCoins size={20} />
                            🎉 You're saving ₹{pricingBreakdown.totalSavings.toFixed(2)} on this order!
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <label htmlFor="paymentMethod" className="block text-base font-medium text-gray-700 mb-2">Select Payment Method</label>
                    <div className="relative">
                        <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="block w-full border border-gray-300 rounded-md py-3 px-4 pr-10 text-base leading-6 text-gray-900 shadow-sm focus:ring-green-500 focus:border-green-500 appearance-none"
                        >
                            <option value="COD">Cash on Delivery (COD)</option>
                            {/* <option value="Online Payment" disabled>Online Payment (Coming Soon)</option> */}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleOpenAddressModal}
                        className="w-full bg-green-700 text-white py-3.5 rounded-lg hover:bg-green-800 transition-colors duration-200 font-semibold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={orderLoading || items.length === 0}
                    >
                        {orderLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                Processing...
                            </>
                        ) : (
                            <>Place Order</>
                        )}
                    </button>

                    <button
                        onClick={handleClear}
                        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold text-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={orderLoading || items.length === 0}
                    >
                        Clear Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;