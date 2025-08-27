import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Minus, Plus, Percent, Info, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { addOrUpdateItem, removeItem } from '../features/cart/cartSlice';

// Helper function to calculate effective price (copied from Cart.jsx)
const getEffectivePrice = (product, quantity) => {
    let price = product.discountedPrice || product.price || 0;

    if (product.largeQuantityPrice && product.largeQuantityMinimumUnits && quantity >= product.largeQuantityMinimumUnits) {
        price = product.largeQuantityPrice;
    } else if (product.bulkPrice && product.bulkMinimumUnits && quantity >= product.bulkMinimumUnits) {
        price = product.bulkPrice;
    }
    return price;
};

const CartItem = ({ item, loading }) => {
    const dispatch = useDispatch();

    // Ensure item.productId is populated. If not, handle gracefully.
    const product = item.productId || {};
    const currentQuantity = item.quantity;
    const originalPrice = product.price || 0;
    const availableStock = product.stock !== undefined ? product.stock : Infinity;

    // Local state for the manual quantity input field
    const [tempQuantity, setTempQuantity] = useState(String(currentQuantity));

    // Effect to sync tempQuantity with actual item.quantity from Redux on prop changes
    useEffect(() => {
        setTempQuantity(String(currentQuantity));
    }, [currentQuantity]);

    // Derived values for rendering
    const effectivePrice = getEffectivePrice(product, currentQuantity);
    const itemSavings = (originalPrice - effectivePrice) * currentQuantity;
    const hasDiscount = effectivePrice < originalPrice;
    const isBulkDiscount = product.bulkMinimumUnits && currentQuantity >= product.bulkMinimumUnits && effectivePrice === product.bulkPrice;
    const isLargeQuantityDiscount = product.largeQuantityMinimumUnits && currentQuantity >= product.largeQuantityMinimumUnits && effectivePrice === product.largeQuantityPrice;

    // --- Quantity Handlers ---
    const handleIncrement = async () => {
        const newQuantity = currentQuantity + 1;
        if (newQuantity > availableStock) {
            toast.warn(`Only ${availableStock} units available for "${product.name}".`);
            return;
        }
        try {
            await dispatch(addOrUpdateItem({ productId: product._id, quantity: newQuantity })).unwrap();
            toast.success(`Quantity of "${product.name}" increased to ${newQuantity}.`);
        } catch (err) {
            toast.error(err?.message || "Failed to update quantity.");
        }
    };

    const handleDecrement = async () => {
        const newQuantity = currentQuantity - 1;
        if (newQuantity < 0) {
            toast.error("Quantity cannot be negative.");
            return;
        }
        try {
            await dispatch(addOrUpdateItem({ productId: product._id, quantity: newQuantity })).unwrap();
            if (newQuantity === 0) {
                toast.info(`"${product.name}" removed from cart.`);
            } else {
                toast.success(`Quantity of "${product.name}" decreased to ${newQuantity}.`);
            }
        } catch (err) {
            toast.error(err?.message || "Failed to update quantity.");
        }
    };

    const handleManualQuantityChange = (e) => {
        const value = e.target.value;
        // Allow empty string or numbers only
        if (value === '' || /^\d+$/.test(value)) {
            setTempQuantity(value);
        }
    };

    const handleManualQuantityBlur = async () => {
        const inputValue = tempQuantity;
        let newQuantity = parseInt(inputValue, 10);

        // If input is empty, revert to current quantity
        if (inputValue === '') {
            newQuantity = currentQuantity;
            setTempQuantity(String(currentQuantity)); // Revert display
            if (currentQuantity === 0) return; // If already 0 and input was empty, do nothing.
        } else if (isNaN(newQuantity) || newQuantity < 0) {
            toast.error("Please enter a valid positive number for quantity.");
            newQuantity = currentQuantity; // Revert to current valid quantity
            setTempQuantity(String(currentQuantity)); // Revert display
        }

        // Only dispatch if quantity has actually changed from the Redux state
        if (newQuantity === currentQuantity) {
            return;
        }

        // Apply stock limit check
        if (newQuantity > availableStock) {
            toast.warn(`Only ${availableStock} units available for "${product.name}". Setting quantity to max available.`);
            newQuantity = availableStock; // Adjust to max available
            setTempQuantity(String(newQuantity)); // Update input field to adjusted value
        }

        try {
            await dispatch(addOrUpdateItem({ productId: product._id, quantity: newQuantity })).unwrap();
            if (newQuantity === 0) {
                toast.info(`"${product.name}" removed from cart.`);
            } else {
                toast.success(`Quantity of "${product.name}" updated to ${newQuantity}.`);
            }
        } catch (err) {
            toast.error(err?.message || "Failed to update quantity.");
            // Revert the input field to the actual current quantity from Redux state on error
            setTempQuantity(String(currentQuantity));
        }
    };
    // --- End Quantity Handlers ---

    const handleRemove = async () => {
        try {
            await dispatch(removeItem(product._id)).unwrap();
            toast.success(`"${product.name || 'Item'}" removed from cart.`);
        } catch (err) {
            toast.error(err?.message || "Failed to remove item.");
        }
    };

    if (!product._id) {
        // Render a placeholder or message if product data is missing
        return (
            <div key={item._id || Math.random()} className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-lg flex items-center gap-4">
                <Info size={24} />
                <div>
                    <p className="font-semibold">Invalid Item in Cart</p>
                    <p className="text-sm">This item could not be loaded. It might have been removed or is unavailable. Please remove it.</p>
                    <button
                        onClick={handleRemove} // Pass no args, use product._id from closure or item._id
                        className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                        Remove Invalid Item
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            key={item._id}
            className="flex flex-col sm:flex-row items-center bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md"
        >
            <img
                src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/120?text=No+Image"}
                alt={product.name || "Product Image"}
                className="w-28 h-28 object-contain rounded-lg bg-gray-100 flex-shrink-0 mb-4 sm:mb-0 sm:mr-6"
                onError={(e) => { e.target.src = "https://via.placeholder.com/120?text=No+Image"; }}
            />
            <div className="flex-1 w-full">
                <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name || "Unknown Product"}</h3>
                {product.companyName && <p className="text-sm text-gray-500 mb-2">Vendor: {product.companyName}</p>}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description || "No description available."}</p>

                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-700">₹{effectivePrice.toFixed(2)}</span>
                        {originalPrice > effectivePrice && (
                            <span className="text-sm text-gray-500 line-through">₹{originalPrice.toFixed(2)}</span>
                        )}
                    </div>
                    {hasDiscount && (
                        <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                            <Percent size={12} />
                            {isLargeQuantityDiscount ? 'Large Qty Discount' : (isBulkDiscount ? 'Bulk Discount' : 'Discounted')}
                        </span>
                    )}
                </div>

                {itemSavings > 0 && (
                    <p className="text-xs text-green-600 mb-3">
                        You save ₹{itemSavings.toFixed(2)} on this item!
                    </p>
                )}
                {availableStock !== Infinity && (
                    <p className="text-xs text-gray-500 mb-2">
                        Available Stock: {availableStock}
                    </p>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-4">
                    {/* Quantity Control with Manual Input */}
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden shadow-sm">
                        <button
                            onClick={handleDecrement}
                            className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentQuantity <= 0 || loading}
                            aria-label="Decrease quantity"
                        >
                            <Minus size={16} />
                        </button>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={tempQuantity}
                            onChange={handleManualQuantityChange}
                            onBlur={handleManualQuantityBlur}
                            className="w-16 text-center text-lg font-medium text-gray-800 focus:outline-none focus:ring-0 appearance-none bg-transparent"
                            disabled={loading}
                            aria-label="Item quantity"
                        />
                        <button
                            onClick={handleIncrement}
                            className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentQuantity >= availableStock || loading}
                            aria-label="Increase quantity"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <span className="font-bold text-gray-800 text-lg">
                        ₹{(effectivePrice * currentQuantity).toFixed(2)}
                    </span>

                    <button
                        onClick={handleRemove}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200 text-sm py-1 px-2 rounded-md hover:bg-red-50"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;