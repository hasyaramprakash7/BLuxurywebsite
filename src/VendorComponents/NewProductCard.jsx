import React, { useEffect, useMemo, useState } from "react";
import {
    FaBoxOpen,
    FaPlus,
    FaMinus,
    FaSpinner, // Keep FaSpinner for loading state
} from "react-icons/fa";
import {
    ShoppingCart,
    CheckCircle,
    XCircle,
    Tag, // Add Tag icon if you plan to use it for offers/discounts
    DollarSign, // Add DollarSign icon if you plan to use it for prices
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { addOrUpdateItem } from "../features/cart/cartSlice"; // Adjust the path as per your project structure

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
// import 'swiper/css/pagination'; // As per your comment, pagination CSS might not be needed for simple carousels.

// Import required modules
import { Autoplay, Navigation } from 'swiper/modules'; // As per your comment, removed Pagination from here.

/**
 * NewProductCard Component
 *
 * Displays a product with its details and provides add to cart functionality.
 * When a vendor is offline, the card will be displayed with a "Vendor Offline"
 * overlay on the image, and the add to cart button will be replaced.
 * When a vendor is out of the user's delivery range, a "Vendor Out of Range"
 * overlay is displayed, and the add to cart button is also replaced.
 *
 * @param {Object} product - The product data to display
 * @param {Number} initialQuantity - Initial quantity if product is already in cart (from Redux cart state)
 * @param {Boolean} isVendorOffline - Whether the vendor of this product is offline
 * @param {Boolean} isVendorOutOfRange - Whether the vendor of this product is out of user's delivery range
 */
const NewProductCard = ({ product, initialQuantity = 0, isVendorOffline = false, isVendorOutOfRange = false }) => {
    const dispatch = useDispatch();
    const cartItem = useSelector((state) => state.cart.items[product?._id]);

    // State for quantity, allowing temporary empty string for input field
    // Initialize based on cartItem quantity, or empty string if not in cart
    const [quantity, setQuantity] = useState(cartItem?.quantity > 0 ? String(cartItem.quantity) : '');
    const [effectivePrice, setEffectivePrice] = useState(product.discountedPrice || product.price);
    // Show quantity input if the item is already in the cart
    const [showQuantityInput, setShowQuantityInput] = useState(cartItem?.quantity > 0);
    // State to manage the displayed stock, simulating decrement (or just reflecting actual stock)
    const [displayStock, setDisplayStock] = useState(product.stock);
    const [isAddingToCart, setIsAddingToCart] = useState(false); // For loading spinner on cart actions

    const PRODUCT_NAME_MAX_LENGTH = 20; // Slightly adjusted for better fit

    // Ensure quantity is always treated as a number for calculations
    // If quantity is an empty string, treat it as 0 for calculations
    const currentNumericalQuantity = useMemo(() => {
        return typeof quantity === 'string' && quantity === '' ? 0 : parseInt(quantity, 10) || 0;
    }, [quantity]);

    const amountSaved = useMemo(() => {
        if (product.price > 0 && product.discountedPrice && product.discountedPrice < product.price) {
            return (product.price - product.discountedPrice).toFixed(2);
        }
        return 0;
    }, [product.price, product.discountedPrice]);

    // Memoized calculation of price tiers for display
    const priceTiers = useMemo(() => {
        const tiers = [];

        let bulkMin = product.bulkMinimumUnits || Infinity;
        let largeQtyMin = product.largeQuantityMinimumUnits || Infinity;

        // Default tier (1 to just before bulk/large quantity)
        let defaultMax = Math.min(bulkMin, largeQtyMin) - 1;
        if (defaultMax < 1) defaultMax = Infinity; // Ensure it's at least 1 if no other tiers exist.

        tiers.push({
            minQty: 1,
            maxQty: defaultMax,
            price: product.discountedPrice || product.price,
            label: `1 - ${defaultMax === Infinity ? 'max' : defaultMax} pcs`
        });

        // Bulk price tier
        if (product.bulkPrice && product.bulkMinimumUnits) {
            let bulkMax = largeQtyMin - 1;
            tiers.push({
                minQty: product.bulkMinimumUnits,
                maxQty: bulkMax,
                price: product.bulkPrice,
                label: `${product.bulkMinimumUnits} - ${bulkMax === Infinity ? 'max' : bulkMax} pcs`
            });
        }

        // Large quantity price tier
        if (product.largeQuantityPrice && product.largeQuantityMinimumUnits) {
            tiers.push({
                minQty: product.largeQuantityMinimumUnits,
                maxQty: Infinity,
                price: product.largeQuantityPrice,
                label: `>= ${product.largeQuantityMinimumUnits} pcs`
            });
        }

        tiers.sort((a, b) => a.minQty - b.minQty);

        const filteredTiers = tiers.filter(tier => tier.minQty <= tier.maxQty);

        return filteredTiers.map(tier => ({
            ...tier,
            isActive: currentNumericalQuantity >= tier.minQty && (tier.maxQty === Infinity || currentNumericalQuantity <= tier.maxQty)
        }));

    }, [currentNumericalQuantity, product.price, product.discountedPrice, product.bulkPrice, product.bulkMinimumUnits, product.largeQuantityPrice, product.largeQuantityMinimumUnits]);


    // Effect to update effective price based on quantity and price tiers
    useEffect(() => {
        let currentPrice = product.discountedPrice || product.price;

        const activeTier = priceTiers.find(tier =>
            currentNumericalQuantity >= tier.minQty &&
            (tier.maxQty === Infinity || currentNumericalQuantity <= tier.maxQty)
        );

        if (activeTier) {
            currentPrice = activeTier.price;
        }

        setEffectivePrice(currentPrice);
    }, [currentNumericalQuantity, product.price, product.discountedPrice, priceTiers]);

    // Effect to update display stock when product stock changes (from props)
    useEffect(() => {
        setDisplayStock(product.stock);
    }, [product.stock]);

    // Effect to update internal quantity state and showQuantityInput
    // when cartItem changes (e.g., cart updates from elsewhere, or initial load)
    useEffect(() => {
        const currentCartQty = cartItem?.quantity || 0;
        setQuantity(currentCartQty > 0 ? String(currentCartQty) : '');
        setShowQuantityInput(currentCartQty > 0);
    }, [cartItem]); // Depend only on cartItem

    const showToast = (msg, type = "success") => {
        toast[type](msg, {
            position: "bottom-center",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
        });
    };

    /**
     * Handles the confirmation of adding/updating an item in the cart.
     * This function now directly dispatches the Redux action.
     * @param {number|null} qtyToDispatch - The quantity to send to the Redux store.
     * If null, it uses the current `quantity` state.
     */
    const handleCartAction = async (qtyToDispatch) => {
        if (isVendorOffline) {
            showToast("Vendor is currently offline. Cannot add products from this shop.", "error");
            return;
        }
        if (isVendorOutOfRange) {
            showToast("Vendor is out of your delivery range. Cannot add products from this shop.", "error");
            return;
        }

        const numericalQuantity = qtyToDispatch; // Use the provided quantity directly

        if (numericalQuantity < 0) { // Should ideally not happen with controls, but good to check
            showToast("Quantity cannot be negative.", "error");
            return;
        }
        if (numericalQuantity > displayStock) {
            showToast(`Cannot add more than available stock (${displayStock})`, "error");
            // Optionally, you might want to set quantity to displayStock here or prompt user.
            setQuantity(String(displayStock)); // Snap to max available
            return; // Abort dispatch if quantity exceeds stock
        }

        setIsAddingToCart(true); // Show loading spinner
        try {
            await dispatch(addOrUpdateItem({
                productId: product._id,
                quantity: numericalQuantity,
                price: effectivePrice, // Use current effective price
                vendorId: product.vendorId,
            })).unwrap(); // Use unwrap to handle success/failure

            if (numericalQuantity === 0) {
                showToast(`Removed ${product.name} from cart.`);
            } else if (!cartItem || cartItem.quantity === 0) {
                showToast(`Added ${numericalQuantity} x ${product.name} to cart!`);
            } else {
                showToast(`Updated cart: ${numericalQuantity} x ${product.name}`);
            }

            // The useEffect on cartItem will update `quantity` and `showQuantityInput`
            // so no need to manually set them here directly after dispatch
        } catch (error) {
            console.error("Failed to update cart:", error);
            showToast(error.message || "Failed to update item in cart. Please try again.", "error");
        } finally {
            setIsAddingToCart(false); // Hide loading spinner
        }
    };

    /**
     * Handles changes to the quantity input field.
     * Allows empty string and only numeric input.
     */
    const handleQuantityChange = (e) => {
        const value = e.target.value;

        if (value === '') {
            setQuantity(''); // Allow empty string for typing
            return;
        }

        // Only allow numbers
        if (!/^\d+$/.test(value)) {
            return; // Ignore non-numeric input
        }

        let numVal = parseInt(value, 10);
        if (isNaN(numVal) || numVal < 0) {
            numVal = 0; // Treat invalid as 0, though current regex prevents this.
        }
        setQuantity(String(numVal));
    };

    /**
     * Handles blurring of the quantity input field.
     * Validates and dispatches cart update.
     */
    const handleQuantityBlur = async () => {
        let numericalQuantity = currentNumericalQuantity; // Use memoized value

        // If the user clears the input (numericalQuantity becomes 0),
        // and the item was previously in the cart, it means they want to remove it.
        // If it was already 0 in the cart, do nothing.
        if (numericalQuantity === 0 && (cartItem?.quantity || 0) > 0) {
            await handleCartAction(0); // Remove item from cart
            setQuantity(''); // Keep input empty after removal
            setShowQuantityInput(false); // Hide the input after removal
            return;
        }

        if (numericalQuantity > displayStock) {
            showToast(`Only ${displayStock} units available for "${product.name}". Setting quantity to max available.`, "warn");
            numericalQuantity = displayStock;
            setQuantity(String(displayStock)); // Update input to show clamped value
        }

        // Only dispatch if the numerical quantity is different from what's currently in the Redux cart
        if (numericalQuantity !== (cartItem?.quantity || 0)) {
            await handleCartAction(numericalQuantity);
        } else if (numericalQuantity === 0 && (cartItem?.quantity || 0) === 0) {
            // If user blurred and quantity is 0 and cart also has 0, just hide input without dispatching
            // This happens if they add 1, then change it to 0 and blur, or if they clear it from initial 0 state.
            setShowQuantityInput(false);
            setQuantity(''); // Ensure it's empty
        }
    };

    /**
     * Handles increment/decrement buttons for quantity.
     * Dispatches cart update immediately.
     */
    const handleQuantityButtonClick = async (increment) => {
        let newQty;
        if (increment) {
            newQty = currentNumericalQuantity + 1;
            if (newQty > displayStock) {
                showToast(`Max stock reached (${displayStock})`, "info");
                return; // Prevent incrementing beyond stock
            }
        } else {
            newQty = currentNumericalQuantity - 1;
            if (newQty < 0) {
                newQty = 0; // Don't go below 0
            }
        }
        setQuantity(String(newQty)); // Update local state immediately
        await handleCartAction(newQty); // Dispatch action
    };

    // Determine if the card should be disabled due to vendor status
    const isDisabled = isVendorOffline || isVendorOutOfRange;

    const truncatedProductName = product.name.length > PRODUCT_NAME_MAX_LENGTH
        ? `${product.name.substring(0, PRODUCT_NAME_MAX_LENGTH)}...`
        : product.name;

    return (
        // Main card container with responsive sizing
        <div className={`
            flex bg-white rounded-xl shadow-xl m-1 /* Even smaller margin */
            flex-grow flex-shrink-0
            min-w-[180px] /* Further reduced min-width */
            max-w-[calc(100%-0.5rem)] /* Adjusted calc for smaller margin */
            sm:max-w-[calc(100%-0.5rem)]
            md:max-w-[calc(33.333%-0.5rem)]
            lg:max-w-[calc(105%-0.5rem)]
            xl:max-w-[calc(100%-0.5rem)] /* 5 columns on extra large screens */
            h-46 sm:h-40 md:h-44 lg:h-48 xl:h-52 /* Further adjusted responsive height */
            transition transform duration-200 ease-in-out
            ${isDisabled ? 'grayscale opacity-80 cursor-not-allowed' : 'hover:shadow-2xl hover:-translate-y-1'}
        `}>
            {/* Inline style for keyframe animation - consider moving to a CSS module/file */}
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

            {/* Left Section: Product Details */}
            {/* Reduced width for text content, giving more space to image */}
            <div className="p-1.5 flex flex-col justify-between flex-grow w-3/5 overflow-hidden">
                {/* Link to product detail page */}
                {/* Reduced min-height for product name section */}
                <Link to={`/product/${product._id}`} state={{ product }} className="block flex-grow-0 min-h-[40px] sm:min-h-[45px]">
                    <div className="space-y-0"> {/* Reduced space-y for tighter packing */}
                        {/* Reduced font size for product name */}
                        <h4 className="text-xs  m-2 sm:text-sm font-bold text-gray-900 leading-tight">
                            {truncatedProductName}
                        </h4>
                        {/* Even smaller font sizes for meta info */}
                        {product.companyName && <p className="text-[7px] sm:text-[8px] text-gray-700 font-medium truncate">{product.companyName}</p>}
                        {product.brand && <p className="text-[7px] sm:text-[8px] text-gray-600 truncate">Brand: {product.brand}</p>}
                        {product.location && <p className="text-[7px] sm:text-[8px] text-gray-600 truncate">📍 {product.location}</p>}
                        {product.rating && (
                            <p className="text-[7px] sm:text-[8px] text-yellow-500 flex items-center gap-0.5">
                                ⭐ {product.rating.toFixed(1)} {product.numReviews ? `(${product.numReviews})` : ''}
                            </p>
                        )}
                    </div>
                </Link>

                <div className="flex-grow flex flex-col justify-end">
                    {/* Stock Information - Now on the left below product details */}
                    <div className="flex items-center gap-0.5 text-[7px] sm:text-[8px] mt-0.5"> {/* Smaller gap and margin */}
                        {displayStock > 0 ? (
                            displayStock <= 10 ? (
                                <span className="text-red-600 flex items-center gap-0.5 font-semibold">
                                    Limited! ({displayStock} in stock)
                                </span>
                            ) : (
                                <span className="text-green-800 flex items-center gap-0.5 font-semibold">
                                    <CheckCircle size={8} aria-hidden="true" /> Avail: {displayStock} in stock
                                </span>
                            )
                        ) : (
                            <span className="text-red-600 flex items-center gap-0.5 font-semibold">
                                <XCircle size={8} aria-hidden="true" /> Unavail.
                            </span>
                        )}
                    </div>

                    {/* Price Tier Display */}
                    {priceTiers.length > 0 && (
                        <div className="flex sm:p-[5px]   flex-wrap justify-center gap-x-0.5 gap-y-0 py-0.5"> {/* Tighter spacing */}
                            {priceTiers.map((tier, index) => (
                                <div key={index} className={`flex flex-col items-center p-0.5 rounded-md
                                    ${tier.isActive ? 'bg-green-800 text-white shadow-sm' : 'text-gray-700'}`}>
                                    <span className={`text-[7px]  sm:text-[7px] xl:text-[9px] font-medium ${tier.isActive ? 'text-green-200' : 'text-gray-600'}`}>{tier.label}</span>
                                    <span className={`font-bold text-[14px] sm:text-[9px] xl:text-[13px] ${tier.isActive ? 'text-white' : 'text-green-800'}`}>₹{tier.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add to Cart / Quantity Controls */}
                    {isDisabled || displayStock === 0 ? ( // Use combined isDisabled or if stock is 0
                        <div className="w-full py-0.5 text-[8px] sm:text-[9px] rounded-lg font-semibold bg-gray-200 text-gray-500 flex items-center justify-center gap-0.5 cursor-not-allowed mt-0.5">
                            {displayStock === 0 ? "Out of Stock" : (isVendorOffline ? "Vendor Offline" : "Out of Range")}
                        </div>
                    ) : (
                        showQuantityInput && currentNumericalQuantity > 0 || (showQuantityInput && quantity === '') ? (
                            <div className="flex flex-col gap-0.5 mt-0.5"> {/* Tighter spacing */}
                                {/* "Added" message if in cart */}
                                {cartItem?.quantity > 0 && (
                                    <div className="w-full py-0.5 text-[8px] sm:text-[9px] rounded-lg font-semibold bg-green-800 text-white flex items-center justify-center gap-0.5">
                                        <CheckCircle size={8} aria-hidden="true" /> Added ({cartItem.quantity})
                                    </div>
                                )}
                                <div className="flex items-center justify-between rounded-full bg-green-100 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => handleQuantityButtonClick(false)}
                                        disabled={currentNumericalQuantity <= 0 || isAddingToCart}
                                        className={`w-1/3 py-0.5 text-white bg-green-700 hover:bg-green-800 flex justify-center items-center rounded-l-full
                                            ${currentNumericalQuantity <= 0 || isAddingToCart ? "opacity-50 cursor-not-allowed" : ""}`}
                                        aria-label="Decrease quantity"
                                    >
                                        <FaMinus size={7} aria-hidden="true" /> {/* Smaller icon */}
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
                                        className="w-1/3 text-center text-[8px] xl:text-[12px]  sm:text-[9px] font-semibold px-0.5 py-0.5 outline-none bg-green-100 text-green-800
                                            focus:ring-2 focus:ring-green-600 focus:border-green-600 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        aria-label="Enter quantity"
                                    />
                                    <button
                                        onClick={() => handleQuantityButtonClick(true)}
                                        disabled={currentNumericalQuantity >= displayStock || isAddingToCart}
                                        className={`w-1/3 py-0.5 text-white bg-green-700 hover:bg-green-800 flex justify-center items-center rounded-r-full
                                            ${currentNumericalQuantity >= displayStock || isAddingToCart ? "opacity-50 cursor-not-allowed" : ""}`}
                                        aria-label="Increase quantity"
                                    >
                                        <FaPlus size={7} aria-hidden="true" />
                                    </button>
                                </div>
                                {/* Update Cart button, only if quantity > 0 after blur/changes */}
                                {/* Show Update Cart if current numerical quantity is different from cart item, or if it's 0 and cart item had quantity */}
                                {(currentNumericalQuantity > 0 && cartItem?.quantity !== currentNumericalQuantity) || (currentNumericalQuantity === 0 && (cartItem?.quantity || 0) > 0) ? (
                                    <button
                                        onClick={() => handleCartAction(currentNumericalQuantity)}
                                        disabled={isAddingToCart}
                                        className="mt-0.5 w-full py-1 text-[8px] sm:text-[9px] font-semibold rounded-lg bg-gradient-to-r from-green-800 to-green-950 hover:from-green-900 hover:to-black text-white transition flex items-center justify-center gap-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Update item in cart"
                                    >
                                        {isAddingToCart ? (
                                            <FaSpinner className="animate-spin mr-1" size={7} />
                                        ) : (
                                            <ShoppingCart size={7} aria-hidden="true" />
                                        )}
                                        {currentNumericalQuantity === 0 ? "Remove from Cart" : "Update Cart"}
                                    </button>
                                ) : (currentNumericalQuantity === 0 && cartItem?.quantity === 0 && quantity !== '') && ( // Special case: user typed something, cleared, and wants to add 1
                                    <button
                                        onClick={async () => {
                                            if (product.isAvailable && displayStock > 0) {
                                                setQuantity('1'); // Set local quantity state to 1 for display
                                                await handleCartAction(1); // Dispatch Redux action to add 1
                                                setShowQuantityInput(true);
                                            } else if (displayStock === 0) {
                                                showToast("This product is out of stock.", "error");
                                            } else {
                                                showToast("This product is not available.", "error");
                                            }
                                        }}
                                        disabled={!product.isAvailable || displayStock === 0 || isAddingToCart}
                                        className={`mt-0.5 w-full py-0.5 text-[9px] sm:text-[10px] rounded-lg font-semibold transition flex items-center justify-center gap-0.5
                                            ${(!product.isAvailable || displayStock === 0 || isAddingToCart)
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-green-800 to-green-950 hover:from-green-900 hover:to-black text-white"
                                            }`}
                                        aria-label="Add to cart"
                                    >
                                        {isAddingToCart ? (
                                            <FaSpinner className="animate-spin mr-1" size={7} />
                                        ) : (
                                            <ShoppingCart size={7} aria-hidden="true" />
                                        )}
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={async () => {
                                    if (product.isAvailable && displayStock > 0) {
                                        // Set local quantity state to 1 for display
                                        setQuantity('1');
                                        // Dispatch Redux action
                                        await handleCartAction(1);
                                        // Only show input after successful addition if not already shown by useEffect
                                        setShowQuantityInput(true);
                                    } else if (displayStock === 0) {
                                        showToast("This product is out of stock.", "error");
                                    } else {
                                        showToast("This product is not available.", "error");
                                    }
                                }}
                                disabled={!product.isAvailable || displayStock === 0 || isAddingToCart}
                                className={`w-full py-1 text-[9px] sm:text-[10px] rounded-lg font-semibold transition flex items-center justify-center gap-0.5 mt-0.5
                                    ${(!product.isAvailable || displayStock === 0 || isAddingToCart)
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-800 to-green-950 hover:from-green-900 hover:to-black text-white"
                                    }`}
                                aria-label="Add to cart"
                            >
                                {isAddingToCart ? (
                                    <FaSpinner className="animate-spin mr-1" size={7} />
                                ) : (
                                    <ShoppingCart size={7} aria-hidden="true" />
                                )}
                                Add to Cart
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Right Section: Product Image and Price */}
            {/* Reduced width for image container */}
            <Link to={`/product/${product._id}`} state={{ product }} className="block flex-shrink-0 w-2/5 overflow-hidden rounded-r-xl relative">
                <div className="relative w-full h-full">
                    {product.images && product.images.length > 0 ? (
                        <Swiper
                            modules={[Autoplay, Navigation]} // Removed Pagination
                            spaceBetween={0}
                            slidesPerView={1}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: true,
                            }}
                            loop={true}
                            // pagination={{ clickable: true }} // Removed pagination prop
                            className="w-full h-full"
                            aria-label={`Image carousel for ${product.name}`}
                        >
                            {product.images.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <img
                                        src={image}
                                        alt={`${product.name} - ${index + 1} of ${product.images.length}`}
                                        className="w-full h-full object-cover rounded-r-xl"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-r-xl" role="img" aria-label="No product image available">
                            <FaBoxOpen className="text-2xl sm:text-3xl" aria-hidden="true" /> {/* Smaller icon */}
                            <span className="text-[9px] sm:text-xs ml-0.5 sm:ml-1">No Image</span> {/* Smaller text */}
                        </div>
                    )}

                    {isVendorOffline && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center rounded-r-xl" aria-label="Vendor is offline">
                            <p className="text-white font-bold text-xs sm:text-sm text-center p-1">Vendor Offline</p> {/* Smaller text */}
                        </div>
                    )}

                    {isVendorOutOfRange && !isVendorOffline && ( // Show only if not already offline
                        <div className="absolute inset-0 bg-red-800 bg-opacity-60 flex items-center justify-center rounded-r-xl" aria-label="Vendor is out of range">
                            <p className="text-white font-bold text-xs sm:text-sm text-center p-1">Out of Range</p>
                        </div>
                    )}

                    {amountSaved > 0 && (
                        <span className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[7px] sm:text-[8px] px-1 py-0.5 rounded-full font-bold z-10 shadow-lg animate-fall-in" aria-label={`Save ₹${amountSaved}`}>
                            Save ₹{amountSaved}
                        </span>
                    )}
                    {/* Price now positioned here (bottom right of image) */}
                    <div className="absolute bottom-0.5 left-0.5 right-0.5 sm:bottom-1 sm:left-1 sm:right-1 text-center text-white text-[10px] sm:text-xs font-bold bg-black bg-opacity-50 py-0.5 rounded-md" aria-label={`Current price: ₹${effectivePrice.toFixed(2)}`}>
                        ₹{effectivePrice.toFixed(2)}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default NewProductCard;