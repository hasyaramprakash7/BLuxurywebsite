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
    Tag, // Tag and DollarSign are not currently used in the provided code, but kept for completeness
    DollarSign,
}
    from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// Import required modules
import { Autoplay, Navigation } from 'swiper/modules';

/**
 * VenderProductcard Component
 *
 * Displays a product with its details and provides add to cart functionality.
 * When a vendor is offline, the card will be displayed with a "Vendor Offline"
 * overlay on the image, and the add to cart button will be replaced.
 *
 * @param {Object} product - The product data to display
 * @param {Function} onAddToCart - Function to call when adding to cart
 * @param {Number} initialQuantity - Initial quantity if product is already in cart
 * @param {Boolean} isVendorOffline - Whether the vendor of this product is offline
 * @param {Boolean} isAuthenticated - A prop to tell if the user is logged in (you'll need to pass this)
 */
const VenderProductcard = ({ product, onAddToCart, initialQuantity = 0, isVendorOffline = false, isAuthenticated = false }) => {
    const navigate = useNavigate();

    const [quantity, setQuantity] = useState(initialQuantity > 0 ? initialQuantity : '');
    const [effectivePrice, setEffectivePrice] = useState(product.discountedPrice || product.price);
    const [showQuantityInput, setShowQuantityInput] = useState(initialQuantity > 0);
    const [displayStock, setDisplayStock] = useState(product.stock);
    const [isAddedToCartInitially, setIsAddedToCartInitially] = useState(initialQuantity > 0);

    // Adjusted for horizontal layout, might need more or less depending on final design
    const PRODUCT_NAME_MAX_LENGTH = 30; // Increased to allow more characters for longer names

    const currentNumericalQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) || 0 : quantity;

    const amountSaved = useMemo(() => {
        if (product.price > 0 && product.discountedPrice && product.discountedPrice < product.price) {
            return (product.price - product.discountedPrice).toFixed(2);
        }
        return 0;
    }, [product.price, product.discountedPrice]);

    useEffect(() => {
        let currentPrice = product.discountedPrice || product.price;

        if (product.largeQuantityPrice && product.largeQuantityMinimumUnits && currentNumericalQuantity >= product.largeQuantityMinimumUnits) {
            currentPrice = product.largeQuantityPrice;
        } else if (product.bulkPrice && product.bulkMinimumUnits && currentNumericalQuantity >= product.bulkMinimumUnits) {
            currentPrice = product.bulkPrice;
        }

        setEffectivePrice(currentPrice);
    }, [currentNumericalQuantity, product.price, product.discountedPrice, product.bulkPrice, product.bulkMinimumUnits, product.largeQuantityPrice, product.largeQuantityMinimumUnits]);

    useEffect(() => {
        setDisplayStock(product.stock);
    }, [product.stock]);

    useEffect(() => {
        setQuantity(initialQuantity > 0 ? initialQuantity : '');
        setShowQuantityInput(initialQuantity > 0);
        setIsAddedToCartInitially(initialQuantity > 0);
    }, [initialQuantity]);

    const handleAddToCartConfirm = () => {
        if (isVendorOffline) {
            toast.error("Vendor is currently offline. Cannot add products from this shop.");
            return;
        }

        if (!isAuthenticated) {
            toast.info("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }

        const numericalQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) || 0 : quantity;

        if (numericalQuantity > 0) {
            onAddToCart(product, numericalQuantity);
            setDisplayStock(prevStock => Math.max(0, prevStock - numericalQuantity));
            toast.success(`${numericalQuantity} of ${product.name} added to cart!`);
            setIsAddedToCartInitially(true);
        } else {
            toast.info("Quantity must be at least 1");
            setIsAddedToCartInitially(false);
            setShowQuantityInput(false);
        }
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;

        if (value === '') {
            setQuantity('');
            return;
        }

        const numVal = parseInt(value, 10);

        if (isNaN(numVal) || numVal < 0) {
            setQuantity(0);
        } else {
            const clampedVal = Math.min(numVal, displayStock);
            setQuantity(clampedVal);
        }
    };

    const handleQuantityBlur = () => {
        const numericalQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) || 0 : quantity;
        setQuantity(numericalQuantity);
        if (numericalQuantity === 0) {
            setShowQuantityInput(false);
            setIsAddedToCartInitially(false);
        }
    };

    const truncatedProductName = product.name.length > PRODUCT_NAME_MAX_LENGTH
        ? `${product.name.substring(0, PRODUCT_NAME_MAX_LENGTH)}...`
        : product.name;

    const priceTiers = useMemo(() => {
        const tiers = [];

        let defaultMax = Infinity;
        if (product.bulkMinimumUnits) {
            defaultMax = Math.min(defaultMax, product.bulkMinimumUnits - 1);
        }
        if (product.largeQuantityMinimumUnits) {
            defaultMax = Math.min(defaultMax, product.largeQuantityMinimumUnits - 1);
        }
        tiers.push({
            minQty: 1,
            maxQty: defaultMax,
            price: product.discountedPrice || product.price,
            label: `1 - ${defaultMax === Infinity ? '999' : defaultMax} pcs` // 'pcs' for brevity
        });

        if (product.bulkPrice && product.bulkMinimumUnits) {
            let bulkMax = Infinity;
            if (product.largeQuantityMinimumUnits) {
                bulkMax = Math.min(bulkMax, product.largeQuantityMinimumUnits - 1);
            }
            tiers.push({
                minQty: product.bulkMinimumUnits,
                maxQty: bulkMax,
                price: product.bulkPrice,
                label: `${product.bulkMinimumUnits} - ${bulkMax === Infinity ? '4999' : bulkMax} pcs`
            });
        }

        if (product.largeQuantityPrice && product.largeQuantityMinimumUnits) {
            tiers.push({
                minQty: product.largeQuantityMinimumUnits,
                maxQty: Infinity,
                price: product.largeQuantityPrice,
                label: `>= ${product.largeQuantityMinimumUnits} pcs`
            });
        }

        tiers.sort((a, b) => a.minQty - b.minQty);

        return tiers.map(tier => ({
            ...tier,
            isActive: currentNumericalQuantity >= tier.minQty && currentNumericalQuantity <= tier.maxQty
        }));

    }, [currentNumericalQuantity, product.price, product.discountedPrice, product.bulkPrice, product.bulkMinimumUnits, product.largeQuantityPrice, product.largeQuantityMinimumUnits]);


    return (
        // Main card container with fixed size and royal green/white theme
        <div className={`
            flex bg-white rounded-xl shadow-xl m-2
            w-[450px] h-[200px] /* Fixed size for all cards */
            transition transform duration-200 ease-in-out
            ${isVendorOffline ? 'grayscale opacity-80 cursor-not-allowed' : 'hover:shadow-2xl hover:-translate-y-1'}
        `}>
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
            <div className="p-4  flex flex-col justify-between flex-grow w-1/2 overflow-hidden"> {/* Added overflow-hidden */}
                <Link to={`/product/${product._id}`} state={{ product }} className="block flex-grow-0 min-h-[70px]"> {/* Adjusted min-h for consistent top part */}
                    <div className="space-y-0.5">
                        <h4 className="text-base font-bold text-gray-900 leading-tight"> {/* Smaller font for fixed card size */}
                            {truncatedProductName}
                        </h4>
                        {product.companyName && <p className="text-[10px] text-gray-700 font-medium truncate">{product.companyName}</p>}
                        {product.brand && <p className="text-[10px] text-gray-600 truncate">Brand: {product.brand}</p>}
                        {product.location && <p className="text-[10px] text-gray-600 truncate">📍 {product.location}</p>}
                        {product.rating && (
                            <p className="text-[10px] text-yellow-500 flex items-center gap-0.5">
                                ⭐ {product.rating.toFixed(1)} {product.numReviews ? `(${product.numReviews})` : ''}
                            </p>
                        )}
                    </div>
                </Link>

                <div className=" flex-grow"> {/* flex-grow to push actions to bottom */}
                    {/* Stock Information */}
                    <div className="flex items-center gap-1 text-[10px] mt-1">
                        {displayStock > 0 ? (
                            displayStock <= 10 ? (
                                <span className="text-red-600 flex items-center gap-0.5 font-semibold">
                                    Limited Stock! ({displayStock} in stock)
                                </span>
                            ) : (
                                <span className="text-green-800 flex items-center gap-0.5 font-semibold">
                                    <CheckCircle size={10} /> Available: {displayStock} in stock
                                </span>
                            )
                        ) : (
                            <span className="text-red-600 flex items-center gap-0.5 font-semibold">
                                <XCircle size={10} /> Unavailable
                            </span>
                        )}
                    </div>

                    {/* Price Tier Display */}
                    {priceTiers.length > 0 && (
                        <div className="flex flex-wrap justify-start gap-x-1 gap-y-0.5 my-1">
                            {priceTiers.map((tier, index) => (
                                <div key={index} className={`flex flex-col items-center p-0.5 rounded-md
                                    ${tier.isActive ? 'bg-green-800 text-white shadow-sm' : 'text-gray-700'}`}> {/* Royal Green accent */}
                                    <span className={`text-[8px] font-medium ${tier.isActive ? 'text-green-200' : 'text-gray-600'}`}>{tier.label}</span>
                                    <span className={`font-bold text-xs ${tier.isActive ? 'text-white' : 'text-green-800'}`}>₹{tier.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add to Cart / Quantity Controls */}
                    {isVendorOffline ? (
                        <div className="w-full py-1 text-xs rounded-lg font-semibold bg-gray-200 text-gray-500 flex items-center justify-center gap-1 cursor-not-allowed mt-1">
                            Vendor Offline
                        </div>
                    ) : (
                        isAddedToCartInitially && currentNumericalQuantity > 0 && !showQuantityInput ? (
                            <div className="flex flex-col gap-1 mt-1">
                                <div className="w-full py-1 text-xs rounded-lg font-semibold bg-green-800 text-white flex items-center justify-center gap-1">
                                    <CheckCircle size={10} /> Added to Cart ({currentNumericalQuantity})
                                </div>
                                <div className="flex items-center justify-between rounded-full bg-green-100 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setQuantity((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1))}
                                        disabled={currentNumericalQuantity <= 0}
                                        className={`w-1/3 py-1 text-white bg-green-700 hover:bg-green-800 flex justify-center items-center rounded-l-full
                                            ${currentNumericalQuantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <FaMinus size={10} />
                                    </button>
                                    <input
                                        type="number"
                                        min="0"
                                        max={displayStock}
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        onBlur={handleQuantityBlur}
                                        className="w-1/3 text-center text-xs font-semibold px-0.5 py-1 outline-none bg-green-100 text-green-800
                                            focus:ring-2 focus:ring-green-600 focus:border-green-600"
                                    />
                                    <button
                                        onClick={() => setQuantity((prev) => Math.min(displayStock, (parseInt(prev, 10) || 0) + 1))}
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
                                        className="mt-1 w-full py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-green-800 to-green-950 hover:from-green-900 hover:to-black text-white transition flex items-center justify-center gap-1"
                                    >
                                        <ShoppingCart size={10} />
                                        {initialQuantity > 0 ? "Update Cart" : "Add to Cart"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            !showQuantityInput || currentNumericalQuantity === 0 ? (
                                <button
                                    onClick={() => {
                                        if (product.isAvailable && displayStock > 0) {
                                            setShowQuantityInput(true);
                                            setQuantity(1);
                                            setIsAddedToCartInitially(false);
                                        } else {
                                            toast.warn("This product is currently unavailable or out of stock.");
                                        }
                                    }}
                                    disabled={!product.isAvailable || displayStock <= 0}
                                    className={`w-full py-1.5 text-xs rounded-lg font-semibold transition flex items-center justify-center gap-1 mt-1
                                        ${!product.isAvailable || displayStock <= 0
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-green-800 to-green-950 hover:from-green-900 hover:to-black text-white" // Royal Green primary action
                                        }`}
                                >
                                    <ShoppingCart size={10} />
                                    Add to Cart
                                </button>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between bg-green-100 rounded-full overflow-hidden shadow-sm ">
                                        <button
                                            onClick={() => setQuantity((prev) => Math.max(0, (parseInt(prev, 10) || 0) - 1))}
                                            disabled={currentNumericalQuantity <= 0}
                                            className={`w-1/3 py-1 text-white bg-green-700 hover:bg-green-800 flex justify-center items-center rounded-l-full
                                                ${currentNumericalQuantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            max={displayStock}
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            onBlur={handleQuantityBlur}
                                            className="w-1/3 text-center text-xs font-semibold px-0.5 py-1 outline-none bg-green-100 text-green-800
                                                focus:ring-2 focus:ring-green-600 focus:border-green-600"
                                        />
                                        <button
                                            onClick={() => setQuantity((prev) => Math.min(displayStock, (parseInt(prev, 10) || 0) + 1))}
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
                                            className="mt-1 w-full py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-green-800 to-green-950 hover:from-green-900 hover:to-black text-white transition flex items-center justify-center gap-1"
                                        >
                                            <ShoppingCart size={10} />
                                            {initialQuantity > 0 ? "Update Cart" : "Add to Cart"}
                                        </button>
                                    )}
                                </>
                            )
                        )
                    )}
                </div>
            </div>

            {/* Right Section: Product Image */}
            <Link to={`/product/${product._id}`} state={{ product }} className="block flex-shrink-0 w-1/2 overflow-hidden rounded-r-xl relative">
                <div className="relative w-full h-full">
                    {product.images && product.images.length > 0 ? (
                        <Swiper
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
                                        className="w-full h-full object-cover rounded-r-xl"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-r-xl">
                            <FaBoxOpen className="text-4xl" />
                            <span className="text-sm ml-2">No Image</span>
                        </div>
                    )}

                    {isVendorOffline && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center rounded-r-xl">
                            <p className="text-white font-bold text-base text-center p-2">Vendor Offline</p>
                        </div>
                    )}

                    {amountSaved > 0 && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full font-bold z-10 shadow-lg animate-fall-in">
                            Save ₹{amountSaved}
                        </span>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 text-center text-white text-lg font-bold bg-black bg-opacity-50 py-1 rounded-md">
                        ₹{effectivePrice.toFixed(2)}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default VenderProductcard;