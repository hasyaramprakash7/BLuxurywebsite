import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaShoppingCart,
    FaStar,
    FaPlus,
    FaMinus,
    FaBoxOpen
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addOrUpdateItem } from "../features/cart/cartSlice"; // Adjust the path
import Navbar from "../component/Home/Navbar"; // Assuming you have a Navbar component

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import required modules
import { Pagination, Autoplay, Navigation } from 'swiper/modules';

const ProductDetails = () => {
    const { state } = useLocation();
    const product = state?.product || {};

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user);
    const cartItem = useSelector((state) => state.cart.items[product?._id]);

    const [quantity, setQuantity] = useState(cartItem?.quantity > 0 ? cartItem.quantity : '');
    const [effectivePrice, setEffectivePrice] = useState(product?.discountedPrice || product?.price || 0);
    const [showQuantityControls, setShowQuantityControls] = useState(cartItem?.quantity > 0);
    const [isLoading, setIsLoading] = useState(false);
    // New state to track if input is being focused, to differentiate blur from initial render
    const [isInputFocused, setIsInputFocused] = useState(false);

    const currentNumericalQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) || 0 : quantity;

    const priceTiers = useMemo(() => {
        const tiers = [];

        let bulkMin = product.bulkMinimumUnits || 10;
        let largeQtyMin = product.largeQuantityMinimumUnits || 5000;

        tiers.push({
            minQty: 1,
            maxQty: bulkMin - 1,
            price: product.discountedPrice || product.price,
            label: `1 - ${bulkMin - 1} pieces`
        });

        if (product.bulkPrice && product.bulkMinimumUnits) {
            tiers.push({
                minQty: product.bulkMinimumUnits,
                maxQty: largeQtyMin - 1,
                price: product.bulkPrice,
                label: `${product.bulkMinimumUnits} - ${largeQtyMin - 1} pieces`
            });
        }

        if (product.largeQuantityPrice && product.largeQuantityMinimumUnits) {
            tiers.push({
                minQty: product.largeQuantityMinimumUnits,
                maxQty: Infinity,
                price: product.largeQuantityPrice,
                label: `>= ${product.largeQuantityMinimumUnits} pieces`
            });
        }

        tiers.sort((a, b) => a.minQty - b.minQty);

        return tiers.map(tier => ({
            ...tier,
            isActive: currentNumericalQuantity >= tier.minQty && (tier.maxQty === Infinity || currentNumericalQuantity <= tier.maxQty)
        }));

    }, [currentNumericalQuantity, product.price, product.discountedPrice, product.bulkPrice, product.bulkMinimumUnits, product.largeQuantityPrice, product.largeQuantityMinimumUnits]);

    // Define showToast using useCallback to memoize it
    const showToast = useCallback((msg, type = "success") => {
        toast[type](msg, {
            position: "bottom-center",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
        });
    }, []); // No dependencies needed for showToast

    useEffect(() => {
        const currentCartQty = cartItem?.quantity || 0;
        setQuantity(currentCartQty > 0 ? currentCartQty : '');
        setShowQuantityControls(currentCartQty > 0);
    }, [cartItem]);

    useEffect(() => {
        let currentPrice = product.discountedPrice || product.price || 0;

        const activeTier = priceTiers.find(tier =>
            currentNumericalQuantity >= tier.minQty &&
            (tier.maxQty === Infinity || currentNumericalQuantity <= tier.maxQty)
        );

        if (activeTier) {
            currentPrice = activeTier.price;
        }

        setEffectivePrice(currentPrice);
    }, [currentNumericalQuantity, product, priceTiers]);

    if (!product._id) {
        showToast("Product data not found! Redirecting to home.", "error");
        navigate("/");
        return null;
    }

    const handleCartConfirmation = async () => {
        if (!user?._id) {
            showToast("Please login to add items to cart", "error");
            navigate("/login");
            return;
        }

        if (currentNumericalQuantity <= 0) {
            showToast("Quantity must be at least 1 to add to cart.", "info");
            return;
        }
        if (currentNumericalQuantity > product.stock) {
            showToast(`Cannot add more than available stock (${product.stock})`, "error");
            return;
        }

        const payload = {
            productId: product._id,
            quantity: currentNumericalQuantity,
            price: effectivePrice,
            vendorId: product.vendorId,
        };

        setIsLoading(true);
        try {
            await dispatch(addOrUpdateItem(payload)).unwrap();
            if (!cartItem || (cartItem.quantity || 0) === 0) {
                showToast(`Added ${currentNumericalQuantity} x ${product.name} to cart!`);
            } else {
                showToast(`Cart updated: ${currentNumericalQuantity} x ${product.name}`);
            }
            setShowQuantityControls(true);
        } catch (err) {
            console.error("Cart update failed:", err);
            showToast(err.message || "Failed to update item in cart. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // New handler for updating cart when quantity becomes zero
    const handleCartConfirmationForZero = useCallback(async (productId) => {
        if (!user?._id) return;
        setIsLoading(true);
        try {
            await dispatch(addOrUpdateItem({
                productId: productId,
                quantity: 0,
                price: effectivePrice,
                vendorId: product.vendorId,
            })).unwrap();
            showToast(`Removed ${product.name} from cart.`);
        } catch (err) {
            console.error("Failed to remove item from cart:", err);
            showToast(err.message || "Failed to remove item from cart.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, product.name, product.vendorId, effectivePrice, user?._id, showToast]); // Added showToast to dependencies

    const handleQuantityChange = useCallback((e) => {
        const value = e.target.value;
        // Allow empty string for initial input clearing
        if (value === '') {
            setQuantity('');
            return;
        }

        let numVal = parseInt(value, 10);

        // If not a number, set to 0 (or previous valid quantity if desired)
        if (isNaN(numVal)) {
            setQuantity(0); // Set to 0 if input is invalid text
            showToast("Please enter a valid number.", "error");
            return;
        }

        // Ensure non-negative and within stock limits
        numVal = Math.max(0, numVal);
        numVal = Math.min(numVal, product.stock);

        setQuantity(numVal);

        // Provide immediate feedback if stock limit is hit while typing
        if (numVal > 0 && numVal === product.stock && parseInt(value, 10) > product.stock) {
            showToast(`Max stock reached: ${product.stock}`, "info");
        }
    }, [product.stock, showToast]);


    const handleQuantityBlur = useCallback(() => {
        setIsInputFocused(false); // Input is no longer focused
        const numericalQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) || 0 : quantity;

        // If the quantity is 0 and it was previously in cart or input had a value
        if (numericalQuantity === 0) {
            // Only trigger removal if item was actually in cart or had some value before blur
            if (cartItem?.quantity > 0 || (typeof quantity === 'string' && quantity !== '')) {
                handleCartConfirmationForZero(product._id);
            }
            setShowQuantityControls(false); // Hide controls if quantity is effectively 0
        } else {
            // Ensure quantity is set to a number after blur
            setQuantity(numericalQuantity);
            // If the quantity input was empty and now it's 1 (from button click/default)
            if (!showQuantityControls && numericalQuantity > 0) {
                setShowQuantityControls(true);
            }
        }
    }, [quantity, cartItem?.quantity, product._id, showQuantityControls, handleCartConfirmationForZero]);


    const handleQuantityFocus = useCallback(() => {
        setIsInputFocused(true); // Input is focused
        if (quantity === 0) {
            setQuantity(''); // Clear 0 on focus to make typing easier
        }
    }, [quantity]);

    const handleQuantityButtonClick = useCallback((increment) => {
        setQuantity((prev) => {
            const numPrev = typeof prev === 'string' ? parseInt(prev, 10) || 0 : prev;
            let newQty;
            if (increment) {
                newQty = Math.min(product.stock, numPrev + 1);
                if (numPrev >= product.stock) {
                    showToast(`Max stock reached (${product.stock})`, "info");
                }
            } else {
                newQty = Math.max(0, numPrev - 1);
            }

            if (newQty === 0) {
                setShowQuantityControls(false);
                // Trigger removal only if it was previously in cart or input had a value
                if (cartItem?.quantity > 0 || numPrev > 0) {
                    handleCartConfirmationForZero(product._id);
                }
            } else {
                setShowQuantityControls(true);
            }
            return newQty;
        });
    }, [product.stock, cartItem?.quantity, product._id, handleCartConfirmationForZero, showToast]);


    return (
        <>
            <Navbar />

            <div className="flex flex-col items-center px-2 sm:px-4 pt-[20px]">
                <div className="bg-white max-w-5xl w-full flex flex-col md:flex-row md:space-x-6 ">
                    {/* Left Column: Image Swiper */}
                    <div className="md:w-1/2 relative flex-shrink-0 h-80 md:h-[400px] bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                            <Swiper
                                modules={[Pagination, Autoplay, Navigation]}
                                spaceBetween={0}
                                slidesPerView={1}
                                pagination={{ clickable: true }}
                                autoplay={{
                                    delay: 3000,
                                    disableOnInteraction: false,
                                }}
                                loop={true}
                                className="w-full h-full"
                            >
                                {product.images.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <img
                                            src={image}
                                            alt={`${product.name} - ${index + 1}`}
                                            className="w-full h-full object-contain "
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                                <FaBoxOpen className="text-4xl mb-1" />
                                <span className="text-sm">No Image Available</span>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Product Details and Actions */}
                    <div className="md:w-1/2 mt-6 md:mt-0 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                            {/* Product Name with very subtle Text Shadow */}
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight [text-shadow:_0.5px_0.5px_1px_rgb(0_0_0_/_0.1)]">
                                {product.name}
                            </h1>

                            {product.rating && (
                                <div className="flex items-center gap-1.5 text-lg text-yellow-500 mt-1 [text-shadow:_0.2px_0.2px_0.5px_rgb(0_0_0_/_0.08)]">
                                    <FaStar size={14} />
                                    <span className="font-bold">{product.rating.toFixed(1)}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm font-semibold mt-1">
                                {product.stock > 0 ? (
                                    product.stock <= 10 ? (
                                        <span className="text-red-600 flex items-center gap-0.5">
                                            <FaTimesCircle size={14} /> Limited Stock! ({product.stock} in stock)
                                        </span>
                                    ) : (
                                        <span className="text-green-700 flex items-center gap-0.5">
                                            <FaCheckCircle size={14} /> Available: {product.stock} in stock
                                        </span>
                                    )
                                ) : (
                                    <span className="text-red-600 flex items-center gap-0.5">
                                        <FaTimesCircle size={14} /> Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Price Section */}
                            <div className="border-t border-b border-gray-200 py-3 mt-3">
                                <div className="flex items-baseline gap-3 mb-1.5">
                                    {/* Effective Price with subtle Text Shadow */}
                                    <span className="text-4xl lg:text-5xl font-extrabold text-green-700 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_0.15)]">
                                        ₹{effectivePrice.toFixed(2)}
                                    </span>
                                    {product.discountedPrice && product.price > product.discountedPrice && (
                                        <span className="text-base lg:text-lg text-gray-400 line-through">
                                            ₹{product.price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Price Tier Display - With very subtle text shadow on prices and adjusted styling */}
                            <div className="mt-3 p-3 rounded-md bg-gray-100 border border-gray-200">
                                <h3 className="text-base font-bold text-gray-800 mb-2 text-center">Price Tiers:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {priceTiers.map((tier, index) => (
                                        <div key={index} className={`flex flex-col items-center p-2 rounded-md border
                                                ${tier.isActive ? 'border-green-700 bg-green-100 text-green-800 shadow-xs scale-100' : 'border-gray-300 bg-white text-gray-700'}
                                                transition-all duration-200 ease-in-out`}>
                                            <span className={`text-xs font-semibold mb-0.5 ${tier.isActive ? 'text-green-800' : 'text-gray-600'}`}>
                                                {tier.label}
                                            </span>
                                            {/* Tier Price with subtle Text Shadow */}
                                            <span className={`font-extrabold text-lg ${tier.isActive ? 'text-green-900 [text-shadow:_0.5px_0.5px_1px_rgb(0_0_0_/_0.1)]' : 'text-green-700 [text-shadow:_0.2px_0.2px_0.5px_rgb(0_0_0_/_0.08)]'}`}>
                                                ₹{tier.price.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quantity Controls & Add to Cart Button */}
                        <div className="mt-6 flex flex-col gap-3">
                            {!showQuantityControls || currentNumericalQuantity === 0 ? (
                                <button
                                    onClick={() => {
                                        if (!product.isAvailable || product.stock <= 0) {
                                            showToast("This product is currently unavailable or out of stock.", "warn");
                                            return;
                                        }
                                        setShowQuantityControls(true);
                                        setQuantity(1); // Set to 1 when 'Add to Cart' is first clicked
                                    }}
                                    disabled={!product.isAvailable || product.stock <= 0 || isLoading}
                                    className={`w-full py-2.5 text-base rounded-md font-bold transition flex items-center justify-center gap-1.5
                                        ${!product.isAvailable || product.stock <= 0 || isLoading
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md"
                                        }`}
                                >
                                    {isLoading ? (
                                        <span className="animate-spin mr-2">⚙️</span>
                                    ) : (
                                        <FaShoppingCart size={16} />
                                    )}
                                    Add to Cart
                                </button>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between bg-green-50 rounded-full p-0.5 shadow-sm">
                                        <button
                                            onClick={() => handleQuantityButtonClick(false)}
                                            disabled={isLoading || currentNumericalQuantity <= 0}
                                            aria-label="Decrease quantity"
                                            className={`w-1/3 py-1.5 text-lg text-white bg-green-700 hover:bg-green-800 flex justify-center items-center rounded-full
                                                ${isLoading || currentNumericalQuantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <FaMinus size={12} />
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            max={product.stock}
                                            value={isInputFocused && quantity === 0 ? '' : quantity} // Clear 0 on focus for easier typing
                                            onChange={handleQuantityChange}
                                            onBlur={handleQuantityBlur}
                                            onFocus={handleQuantityFocus} // Added onFocus handler
                                            aria-label="Product quantity"
                                            className="w-1/3 text-center text-lg font-bold px-1 py-1.5 outline-none bg-transparent text-green-800
                                                focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                            onClick={() => handleQuantityButtonClick(true)}
                                            disabled={isLoading || currentNumericalQuantity >= product.stock}
                                            aria-label="Increase quantity"
                                            className={`w-1/3 py-1.5 text-lg text-white bg-green-700 hover:bg-green-800 flex justify-center items-center rounded-full
                                                ${isLoading || currentNumericalQuantity >= product.stock ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <FaPlus size={12} />
                                        </button>
                                    </div>

                                    {currentNumericalQuantity > 0 && (
                                        <button
                                            onClick={handleCartConfirmation}
                                            disabled={isLoading}
                                            className="w-full py-2.5 text-base font-bold rounded-md bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md transition flex items-center justify-center gap-1.5"
                                        >
                                            {isLoading ? (
                                                <span className="animate-spin mr-2">⚙️</span>
                                            ) : (
                                                <FaShoppingCart size={16} />
                                            )}
                                            {cartItem?.quantity > 0 ? "Update Cart" : "Add to Cart"}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;