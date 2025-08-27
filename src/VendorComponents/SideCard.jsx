import React, { useEffect, useMemo, useState } from "react";
import {
    FaBoxOpen,
    FaCheckCircle,
    FaTimesCircle,
    FaShoppingCart,
    FaPlus,
    FaMinus,
    FaTags,
    FaDollarSign,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// Import required modules
import { Pagination, Autoplay, Navigation } from 'swiper/modules';


const SideCard = ({ product, onAddToCart, initialQuantity = 0, user }) => { // Accept 'user' as a prop
    const navigate = useNavigate(); // Initialize useNavigate
    const [quantity, setQuantity] = useState(initialQuantity);
    const [effectivePrice, setEffectivePrice] = useState(product.discountedPrice || product.price);
    const [priceNote, setPriceNote] = useState("");
    const [showQuantityInput, setShowQuantityInput] = useState(initialQuantity > 0);

    const MAX_DESCRIPTION_TAGS = 8; // Adjust as needed

    const amountSaved = useMemo(() => {
        if (product.price > 0 && product.discountedPrice && product.discountedPrice < product.price) {
            return (product.price - product.discountedPrice).toFixed(2);
        }
        return 0;
    }, [product.price, product.discountedPrice]);

    useEffect(() => {
        let currentPrice = product.discountedPrice || product.price;
        let note = "";

        if (product.largeQuantityPrice && product.largeQuantityMinimumUnits && quantity >= product.largeQuantityMinimumUnits) {
            currentPrice = product.largeQuantityPrice;
            note = `(Large Qty price applied for ${product.largeQuantityMinimumUnits}+ units)`;
        } else if (product.bulkPrice && product.bulkMinimumUnits && quantity >= product.bulkMinimumUnits) {
            currentPrice = product.bulkPrice;
            note = `(Bulk price applied for ${product.bulkMinimumUnits}+ units)`;
        }

        setEffectivePrice(currentPrice);
        setPriceNote(note);
    }, [quantity, product]);

    const handleActionClick = () => {
        if (!user?._id) {
            toast.error("Please login to add items to cart");
            navigate("/login"); // Redirect to login page
            return;
        }

        if (!showQuantityInput) {
            // This is the initial "Add to Cart" button click
            setShowQuantityInput(true);
            setQuantity(1); // Set quantity to 1 when first clicking "Add to Cart"
        } else {
            // This is the "Add to Cart" or "Update Cart" button after quantity selection
            if (quantity > 0) {
                onAddToCart(product, quantity);
            } else {
                toast.info("Quantity must be at least 1.");
            }
        }
    };

    const getDescriptionTags = (description) => {
        if (!description) return [];
        return description
            .split(/\s+/)
            .filter(word => word.length > 0)
            .slice(0, MAX_DESCRIPTION_TAGS);
    };

    const descriptionTags = getDescriptionTags(product.description);

    return (
        <div className="flex-shrink-0 bg-white  rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 duration-200 ease-in-out border border-gray-200">
            {/* Link to product detail page */}
            {/* <Link to={`/product/${product._id}`} state={{ product }} className="block"> */}
            <div className="relative">
                {product.images && product.images.length > 0 ? (
                    <Swiper
                        modules={[Pagination, Autoplay, Navigation]}
                        spaceBetween={0}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        autoplay={{
                            delay: 2500,
                            stopOnLastSlide: true,
                            disableOnInteraction: true,
                        }}
                        loop={false}
                        className="w-50 h-36 rounded-t-xl"
                    >
                        {product.images.map((image, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={image}
                                    alt={`${product.name} - ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <img
                        src="https://via.placeholder.com/300?text=No+Image"
                        alt="No Product Image"
                        className="w-50 h-36 object-cover rounded-t-xl"
                    />
                )}

                {/* NEW: Saving amount badge */}
                {amountSaved > 0 && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] px-2 py-[2px] rounded-full font-bold z-10">
                        Save ₹{amountSaved}
                    </span>
                )}
            </div>
            {/* </Link> */}

            <div className="p-3 flex flex-col h-[230px] justify-between">
                <div className="space-y-1">
                    <h4 className="text-base font-semibold text-gray-800 truncate">{product.name}</h4>
                    {product.companyName && <p className="text-xs text-gray-600">{product.companyName}</p>}
                    {product.location && <p className="text-xs text-gray-600">📍 {product.location}</p>}
                    {product.rating && (
                        <p className="text-xs text-yellow-500 flex items-center gap-1">
                            ⭐ {product.rating.toFixed(1)} {product.numReviews ? `(${product.numReviews})` : ''}
                        </p>
                    )}

                    {/* Product Description displayed as tags */}
                    {descriptionTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {descriptionTags.map((word, index) => (
                                <span
                                    key={index}
                                    className="inline-block bg-indigo-100 text-indigo-800 text-[10px] px-2 py-[1px] rounded-full font-medium"
                                >
                                    {word}
                                </span>
                            ))}
                            {/* Ellipsis if description is truncated */}
                            {product.description && product.description.split(/\s+/).length > MAX_DESCRIPTION_TAGS && (
                                <span className="text-[10px] text-gray-500">...</span>
                            )}
                        </div>
                    )}

                    {/* Total Stock and Availability in one row */}
                    <div className="flex items-center gap-2 text-xs mt-1">
                        <div className="flex items-center gap-1 text-gray-600 font-semibold">
                            <FaBoxOpen className="text-gray-500" />
                            <span>Total Stock: {product.stock}</span>
                        </div>
                        {product.isAvailable ? (
                            <span className="text-green-600 flex items-center gap-1">
                                <FaCheckCircle /> Available
                            </span>
                        ) : (
                            <span className="text-red-500 flex items-center gap-1">
                                <FaTimesCircle /> Unavailable
                            </span>
                        )}
                    </div>

                    {/* Bulk and Large Quantity pricing information */}
                    {product.bulkPrice && product.bulkMinimumUnits && (
                        <p className="text-xs text-indigo-700 flex items-center gap-1">
                            <FaTags className="text-indigo-500" /> Bulk: ₹{product.bulkPrice.toFixed(2)} (Min {product.bulkMinimumUnits})
                        </p>
                    )}
                    {product.largeQuantityPrice && product.largeQuantityMinimumUnits && (
                        <p className="text-xs text-purple-700 flex items-center gap-1">
                            <FaDollarSign className="text-purple-500" /> Large Qty: ₹{product.largeQuantityPrice.toFixed(2)} (Min {product.largeQuantityMinimumUnits})
                        </p>
                    )}

                    {/* Product tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {product.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-block bg-purple-100 text-purple-800 text-[10px] px-2 py-[1px] rounded-full font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-2">
                    {/* Price display with discount and notes */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-red-600 font-bold text-lg">₹{effectivePrice.toFixed(2)}</span>
                        {product.price > effectivePrice && (
                            <span className="line-through text-gray-400 text-sm">₹{product.price.toFixed(2)}</span>
                        )}
                        {priceNote && <span className="text-indigo-600 text-xs font-semibold">{priceNote}</span>}
                    </div>

                    {/* Add to Cart / Quantity Input section */}
                    {!showQuantityInput ? (
                        <button
                            onClick={handleActionClick} // Use the new handler
                            disabled={!product.isAvailable || product.stock <= 0}
                            className={`w-full mt-2 py-2 text-sm rounded-lg font-semibold transition flex items-center justify-center gap-1 ${product.isAvailable && product.stock > 0
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <FaShoppingCart size={14} />
                            Add to Cart
                        </button>
                    ) : (
                        <>
                            {/* Quantity controls */}
                            <div className="flex items-center justify-between mt-3 border border-gray-300 rounded-md overflow-hidden">
                                <button
                                    onClick={() => setQuantity((prev) => Math.max(0, prev - 1))}
                                    className="w-1/3 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex justify-center items-center"
                                >
                                    <FaMinus />
                                </button>
                                <input
                                    type="number"
                                    min="0"
                                    max={product.stock}
                                    value={quantity}
                                    onChange={(e) => {
                                        let val = parseInt(e.target.value);
                                        if (isNaN(val)) val = 0;
                                        if (val > product.stock) val = product.stock;
                                        setQuantity(val);
                                    }}
                                    className="w-1/3 text-center text-sm font-semibold border-x border-gray-300 px-1 py-2 outline-none"
                                />
                                <button
                                    onClick={() => setQuantity((prev) => (prev < product.stock ? prev + 1 : prev))}
                                    className={`w-1/3 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 flex justify-center items-center ${quantity >= product.stock ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    <FaPlus />
                                </button>
                            </div>

                            {/* Confirm Add/Update Cart button */}
                            {quantity > 0 && (
                                <button
                                    onClick={handleActionClick} // Use the new handler here too
                                    className="mt-2 w-full py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition flex items-center justify-center gap-1"
                                >
                                    <FaShoppingCart />
                                    {initialQuantity > 0 ? "Update Cart" : "Add to Cart"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SideCard;