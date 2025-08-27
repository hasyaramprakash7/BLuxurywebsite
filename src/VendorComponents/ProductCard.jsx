import React, { useEffect, useMemo, useState } from "react";
import {
    FaBoxOpen,
    FaPlus,
    FaMinus,
} from "react-icons/fa";
import {
    ShoppingCart,
    CheckCircle,
    XCircle,
    Tag,
    DollarSign,
}
    from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
// import 'swiper/css/pagination'; // REMOVED THIS IMPORT
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// Import required modules
import { Autoplay, Navigation } from 'swiper/modules'; // REMOVED Pagination from here

/**
 * ProductCard Component
 *
 * Displays a product with its details and provides add to cart functionality.
 * When a vendor is offline, the card will be displayed with a "Vendor Offline"
 * overlay on the image, and the add to cart button will be replaced.
 * When a vendor is out of the user's delivery range, a "Vendor Out of Range"
 * overlay is displayed, and the add to cart button is also replaced.
 *
 * @param {Object} product - The product data to display
 * @param {Function} onAddToCart - Function to call when adding to cart
 * @param {Number} initialQuantity - Initial quantity if product is already in cart
 * @param {Boolean} isVendorOffline - Whether the vendor of this product is offline
 * @param {Boolean} isVendorOutOfRange - Whether the vendor of this product is out of user's delivery range
 */
const ProductCard = ({ product, onAddToCart, initialQuantity = 0, isVendorOffline = false, isVendorOutOfRange = false }) => {
    // State for quantity, allowing temporary empty string for input field
    const [quantity, setQuantity] = useState(initialQuantity > 0 ? String(initialQuantity) : ''); // Changed to String for input
    const [effectivePrice, setEffectivePrice] = useState(product.discountedPrice || product.price);
    // Show quantity input if initialQuantity is greater than 0, or if user has explicitly chosen to add
    const [showQuantityInput, setShowQuantityInput] = useState(initialQuantity > 0);
    // State to manage the displayed stock, simulating decrement
    const [displayStock, setDisplayStock] = useState(product.stock);

    // State to track if the item has been added to cart in the current session
    // This helps in showing the "Added to Cart" message vs. quantity input
    const [isAddedToCartInitially, setIsAddedToCartInitially] = useState(initialQuantity > 0);


    const PRODUCT_NAME_MAX_LENGTH = 15;

    const currentNumericalQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) || 0 : quantity;

    const amountSaved = useMemo(() => {
        if (product.price > 0 && product.discountedPrice && product.discountedPrice < product.price) {
            return (product.price - product.discountedPrice).toFixed(2);
        }
        return 0;
    }, [product.price, product.discountedPrice]);

    // Update effective price based on quantity tiers
    useEffect(() => {
        let currentPrice = product.discountedPrice || product.price;

        if (product.largeQuantityPrice && product.largeQuantityMinimumUnits && currentNumericalQuantity >= product.largeQuantityMinimumUnits) {
            currentPrice = product.largeQuantityPrice;
        } else if (product.bulkPrice && product.bulkMinimumUnits && currentNumericalQuantity >= product.bulkMinimumUnits) {
            currentPrice = product.bulkPrice;
        }

        setEffectivePrice(currentPrice);
    }, [currentNumericalQuantity, product.price, product.discountedPrice, product.bulkPrice, product.bulkMinimumUnits, product.largeQuantityPrice, product.largeQuantityMinimumUnits]);

    // Update display stock when product.stock changes from props
    useEffect(() => {
        setDisplayStock(product.stock);
    }, [product.stock]);

    // Reset showQuantityInput and isAddedToCartInitially if initialQuantity changes from prop (e.g., cart clears)
    useEffect(() => {
        setQuantity(initialQuantity > 0 ? String(initialQuantity) : ''); // Set to String
        setShowQuantityInput(initialQuantity > 0);
        setIsAddedToCartInitially(initialQuantity > 0);
    }, [initialQuantity]);


    const handleAddToCartConfirm = () => {
        if (isVendorOffline) {
            toast.error("Vendor is currently offline. Cannot add products from this shop.");
            return;
        }
        if (isVendorOutOfRange) {
            toast.error("Vendor is out of your delivery range. Cannot add products from this shop.");
            return;
        }

        const numericalQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) || 0 : quantity;

        if (numericalQuantity > 0) {
            if (numericalQuantity > displayStock) {
                toast.warn(`Only ${displayStock} units available for "${product.name}".`);
                setQuantity(String(displayStock)); // Set quantity to max available if user tries to add more
                return;
            }
            onAddToCart(product, numericalQuantity);
            // Simulate stock decrement on the client side
            setDisplayStock(prevStock => Math.max(0, prevStock - numericalQuantity));
            toast.success(`${numericalQuantity} of ${product.name} added to cart!`);
            setIsAddedToCartInitially(true); // Mark as added to cart
        } else {
            toast.info("Quantity must be at least 1");
            setIsAddedToCartInitially(false); // If quantity becomes 0, it's no longer 'added'
            setShowQuantityInput(false); // Hide input if quantity is 0
        }
    };

    // Handles the change event for the quantity input field
    const handleQuantityChange = (e) => {
        const value = e.target.value;

        // Allow an empty string for natural user typing experience (e.e., clearing the field)
        if (value === '') {
            setQuantity('');
            return;
        }

        // Only allow numbers
        if (!/^\d+$/.test(value)) {
            return;
        }

        let numVal = parseInt(value, 10);

        if (isNaN(numVal) || numVal < 0) {
            setQuantity('0');
        } else {
            // Do not clamp here to allow user to type numbers greater than stock temporarily
            setQuantity(String(numVal));
        }
    };

    // Ensures quantity is a valid number when the input loses focus
    const handleQuantityBlur = () => {
        let numericalQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) || 0 : quantity;

        if (isNaN(numericalQuantity) || numericalQuantity < 0) {
            numericalQuantity = 0;
            toast.error("Please enter a valid positive number for quantity.");
        }

        // Clamp to available stock on blur
        if (numericalQuantity > displayStock) {
            toast.warn(`Only ${displayStock} units available for "${product.name}". Setting quantity to max available.`);
            numericalQuantity = displayStock;
        }

        setQuantity(String(numericalQuantity)); // Set to a guaranteed number (0 if was empty/NaN)

        // If the quantity has changed from what was initially in the cart (or if it was 0 and now isn't)
        // then consider it a change that needs to be "updated" in the cart.
        if (numericalQuantity !== initialQuantity) {
            // Call onAddToCart to update the cart with the new quantity on blur
            // If numericalQuantity is 0, onAddToCart should handle removal
            onAddToCart(product, numericalQuantity);
            if (numericalQuantity === 0) {
                toast.info(`"${product.name}" removed from cart.`);
                setIsAddedToCartInitially(false);
                setShowQuantityInput(false);
            } else {
                toast.success(`Quantity of "${product.name}" updated to ${numericalQuantity}.`);
                setIsAddedToCartInitially(true);
                setShowQuantityInput(true);
            }
        }

        if (numericalQuantity === 0) {
            setShowQuantityInput(false);
            setIsAddedToCartInitially(false);
        }
    };

    const handleIncrement = () => {
        const newQuantity = currentNumericalQuantity + 1;
        if (newQuantity > displayStock) {
            toast.warn(`Only ${displayStock} units available for "${product.name}".`);
            return;
        }
        setQuantity(String(newQuantity));
        onAddToCart(product, newQuantity);
        toast.success(`Quantity of "${product.name}" increased to ${newQuantity}.`);
        setIsAddedToCartInitially(true);
        setShowQuantityInput(true);
    };

    const handleDecrement = () => {
        const newQuantity = currentNumericalQuantity - 1;
        if (newQuantity < 0) {
            toast.error("Quantity cannot be negative.");
            return;
        }
        setQuantity(String(newQuantity));
        onAddToCart(product, newQuantity);
        if (newQuantity === 0) {
            toast.info(`"${product.name}" removed from cart.`);
            setIsAddedToCartInitially(false);
            setShowQuantityInput(false);
        } else {
            toast.success(`Quantity of "${product.name}" decreased to ${newQuantity}.`);
            setIsAddedToCartInitially(true);
            setShowQuantityInput(true);
        }
    };


    // Truncate product name if it's too long
    const truncatedProductName = product.name.length > PRODUCT_NAME_MAX_LENGTH
        ? `${product.name.substring(0, PRODUCT_NAME_MAX_LENGTH)}...`
        : product.name;

    // Define price tiers based on the product data and the screenshot logic
    // Now including default price, bulk, and large quantity prices
    const priceTiers = useMemo(() => {
        const tiers = [];

        // Always include the default price tier (1 to X units)
        // Assume default price applies from 1 up to (bulkMinimumUnits - 1) or (largeQuantityMinimumUnits - 1)
        let defaultMax = Infinity;
        if (product.bulkMinimumUnits) {
            defaultMax = Math.min(defaultMax, product.bulkMinimumUnits - 1);
        }
        if (product.largeQuantityMinimumUnits) {
            defaultMax = Math.min(defaultMax, product.largeQuantityMinimumUnits - 1);
        }
        tiers.push({
            minQty: 1,
            maxQty: defaultMax, // Max for default tier
            price: product.discountedPrice || product.price,
            label: `1 - ${defaultMax === Infinity ? '999' : defaultMax} pieces` // Adjust label for default tier based on new image requirements
        });

        // Add bulk price tier if available
        if (product.bulkPrice && product.bulkMinimumUnits) {
            let bulkMax = Infinity;
            if (product.largeQuantityMinimumUnits) {
                bulkMax = Math.min(bulkMax, product.largeQuantityMinimumUnits - 1);
            }
            tiers.push({
                minQty: product.bulkMinimumUnits,
                maxQty: bulkMax, // Max for bulk tier
                price: product.bulkPrice,
                label: `${product.bulkMinimumUnits} - ${bulkMax === Infinity ? '4999' : bulkMax} pieces` // Adjust label for bulk tier
            });
        }

        // Add large quantity price tier if available
        if (product.largeQuantityPrice && product.largeQuantityMinimumUnits) {
            tiers.push({
                minQty: product.largeQuantityMinimumUnits,
                maxQty: Infinity, // Max for large quantity tier
                price: product.largeQuantityPrice,
                label: `>= ${product.largeQuantityMinimumUnits} pieces` // Adjust label for large quantity tier
            });
        }

        // Sort tiers by minimum quantity
        tiers.sort((a, b) => a.minQty - b.minQty);

        // Determine active tier
        return tiers.map(tier => ({
            ...tier,
            isActive: currentNumericalQuantity >= tier.minQty && currentNumericalQuantity <= tier.maxQty
        }));

    }, [currentNumericalQuantity, product.price, product.discountedPrice, product.bulkPrice, product.bulkMinimumUnits, product.largeQuantityPrice, product.largeQuantityMinimumUnits]);

    // Determine if the card should be disabled due to vendor status
    const isDisabled = isVendorOffline || isVendorOutOfRange;

    return (
        <div className={`
            flex-shrink-0 bg-white rounded-lg shadow-md m-2
            w-44 h-[350px] md:w-48 md:h-[380px] lg:w-44 xl:w-48
            flex flex-col justify-between
            transition transform duration-200 ease-in-out
            ${isDisabled ? 'grayscale opacity-80 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'}
        `}>
            {/* Styles for the fall-in animation */}
            <style>
                {`
                @keyframes fallIn {
                    0% { transform: translateY(-20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-fall-in {
                    animation: fallIn 0.5s ease-out forwards;
                }
                `}
            </style>
            <Link to={`/product/${product._id}`} state={{ product }} className="block flex-grow-0">
                <div className="relative w-full h-45 overflow-hidden rounded-t-lg">
                    {product.images && product.images.length > 0 ? (
                        <Swiper
                            // REMOVED Pagination from modules and pagination prop
                            modules={[Autoplay, Navigation]}
                            spaceBetween={0}
                            slidesPerView={1}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: true,
                            }}
                            loop={false}
                            className="w-full h-full"
                        >
                            {product.images.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <img
                                        src={image}
                                        alt={`${product.name} - ${index + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <FaBoxOpen className="text-3xl" />
                            <span className="text-[10px] ml-1">No Image</span>
                        </div>
                    )}

                    {isVendorOffline && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center rounded-t-lg">
                            <p className="text-white font-bold text-sm text-center p-1">Vendor Offline</p>
                        </div>
                    )}

                    {/* NEW: Vendor Out of Range Overlay */}
                    {isVendorOutOfRange && !isVendorOffline && ( // Show only if not already offline
                        <div className="absolute inset-0 bg-red-800 bg-opacity-60 flex items-center justify-center rounded-t-lg">
                            <p className="text-white font-bold text-sm text-center p-1">Vendor Out of Range</p>
                        </div>
                    )}

                    {amountSaved > 0 && (
                        <span className="absolute top-1 right-1 bg-gradient-to-r from-lime-600 to-green-700 text-white text-[8px] px-1 py-[1px] rounded-full font-bold z-10 shadow-sm animate-fall-in">
                            Save ₹{amountSaved}
                        </span>
                    )}
                </div>
            </Link>

            <div className="p-1.5 flex flex-col flex-grow">
                <div className="flex-grow space-y-0.5">
                    <h4 className="text-sm font-semibold text-gray-800 h-6 overflow-hidden">
                        {truncatedProductName}
                    </h4>
                    {product.companyName && <p className="text-[9px] text-gray-600 truncate">{product.companyName}</p>}
                    {product.brand && <p className="text-[9px] text-gray-600 truncate">Brand: {product.brandName}</p>}
                    {product.location && <p className="text-[9px] text-gray-600 truncate">📍 {product.location}</p>}
                    {product.rating && (
                        <p className="text-[9px] text-yellow-500 flex items-center gap-0.5">
                            ⭐ {product.rating.toFixed(1)} {product.numReviews ? `(${product.numReviews})` : ''}
                        </p>
                    )}

                    <div className="flex items-center gap-1 text-[9px] mt-0.5">
                        {displayStock > 0 ? (
                            displayStock <= 10 ? (
                                <span className="text-red-500 flex items-center gap-0.5 font-medium">
                                    Limited Stock! ({displayStock} in stock)
                                </span>
                            ) : (
                                <span className="text-green-700 flex items-center gap-0.5 font-medium">
                                    <CheckCircle size={10} /> Available: {displayStock} in stock
                                </span>
                            )
                        ) : ( // displayStock === 0
                            <span className="text-red-500 flex items-center gap-0.5 font-medium">
                                <XCircle size={10} /> Unavailable
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-1 flex-grow-0">
                    {/* New Price Tier Display - Horizontal Layout */}
                    {priceTiers.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mb-2">
                            {priceTiers.map((tier, index) => (
                                <div key={index} className={`flex flex-col items-center p-0.5
                                    ${tier.isActive ? 'bg-green-700 rounded-md text-white shadow-sm' : 'text-gray-700'}`}>
                                    <span className={`text-[9px] font-medium ${tier.isActive ? 'text-white' : 'text-gray-600'}`}>{tier.label}</span>
                                    <span className={`font-bold text-sm ${tier.isActive ? 'text-green-200' : 'text-green-800'}`}>₹{tier.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}


                    {isDisabled || displayStock === 0 ? ( // Use the combined isDisabled state or if stock is 0
                        <div className="w-full py-1 text-xs rounded-md font-semibold bg-gray-200 text-gray-500 flex items-center justify-center gap-1 cursor-not-allowed">
                            {displayStock === 0 ? "Out of Stock" : (isVendorOffline ? "Vendor Offline" : "Out of Range")}
                        </div>
                    ) : (
                        showQuantityInput ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between rounded-full bg-green-100 overflow-hidden shadow-sm">
                                    <button
                                        onClick={handleDecrement}
                                        disabled={currentNumericalQuantity <= 0}
                                        className={`w-1/3 py-1 text-white bg-green-700 hover:bg-green-800 flex justify-center items-center rounded-l-full
                                            ${currentNumericalQuantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <FaMinus size={10} />
                                    </button>
                                    <input
                                        type="text" // Changed to text to allow empty string and custom validation
                                        inputMode="numeric" // Suggest numeric keyboard on mobile
                                        pattern="[0-9]*" // Restrict to numbers
                                        min="0"
                                        max={displayStock}
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        onBlur={handleQuantityBlur}
                                        className="w-1/3 text-center text-xs font-semibold px-0.5 py-1 outline-none bg-green-100 text-green-800
                                            focus:ring-2 focus:ring-green-600 focus:border-green-600 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                        onClick={handleIncrement}
                                        disabled={currentNumericalQuantity >= displayStock}
                                        className={`w-1/3 py-1 text-white bg-green-700 hover:bg-green-800 flex justify-center items-center rounded-r-full
                                            ${currentNumericalQuantity >= displayStock ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <FaPlus size={10} />
                                    </button>
                                </div>

                                {currentNumericalQuantity > 0 && (
                                    <button
                                        onClick={handleAddToCartConfirm}
                                        className="mt-1 w-full py-1 text-xs font-semibold rounded-md bg-gradient-to-r from-green-700 to-green-900 hover:from-green-800 hover:to-green-950 text-white transition flex items-center justify-center gap-1"
                                    >
                                        <ShoppingCart size={10} />
                                        {initialQuantity > 0 ? "Update Cart" : "Add to Cart"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    if (product.isAvailable && displayStock > 0) { // Check both availability and stock
                                        setShowQuantityInput(true);
                                        setQuantity('1'); // Set initial quantity to 1 when showing input
                                        onAddToCart(product, 1); // Add 1 to cart immediately
                                        toast.success(`1 of ${product.name} added to cart!`);
                                        setIsAddedToCartInitially(true);
                                    } else if (displayStock === 0) {
                                        toast.error("This product is out of stock.");
                                    } else {
                                        toast.error("This product is not available.");
                                    }
                                }}
                                disabled={!product.isAvailable || displayStock === 0}
                                className={`w-full py-1 text-xs rounded-md font-semibold bg-green-700 text-white flex items-center justify-center gap-1
                                    hover:bg-green-800 transition-colors duration-200
                                    ${!product.isAvailable || displayStock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <ShoppingCart size={10} /> Add to Cart
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;