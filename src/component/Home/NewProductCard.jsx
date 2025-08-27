
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Toast from "react-hot-toast"; // Using react-hot-toast for a simple toast solution

// Mocking Redux action for a standalone example
const addOrUpdateItem = (payload) => (dispatch) => {
    return Promise.resolve(payload);
};

const PRODUCT_NAME_MAX_LENGTH = 20;

const NewProductCard = ({ product, isVendorOffline = false, isVendorOutOfRange = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItem = useSelector((state) => state.cart?.items?.[product._id]);

    const [quantity, setQuantity] = useState(
        cartItem?.quantity > 0 ? String(cartItem.quantity) : ""
    );
    const [effectivePrice, setEffectivePrice] = useState(product.discountedPrice || product.price);
    const [showQuantityInput, setShowQuantityInput] = useState((cartItem?.quantity || 0) > 0);
    const [displayStock, setDisplayStock] = useState(product.stock);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const currentNumericalQuantity = useMemo(() => {
        return quantity === "" ? 0 : parseInt(quantity, 10) || 0;
    }, [quantity]);

    const amountSaved = useMemo(() => {
        if (product.price > 0 && product.discountedPrice && product.discountedPrice < product.price) {
            return (product.price - product.discountedPrice).toFixed(2);
        }
        return 0;
    }, [product.price, product.discountedPrice]);

    const priceTiers = useMemo(() => {
        const tiers = [];
        const bulkMin = product.bulkMinimumUnits || Infinity;
        const largeQtyMin = product.largeQuantityMinimumUnits || Infinity;
        const hasBulkTier = !!(product.bulkPrice && product.bulkMinimumUnits);
        const hasLargeQtyTier = !!(product.largeQuantityPrice && product.largeQuantityMinimumUnits);

        const defaultMax = Math.min(bulkMin - 1, largeQtyMin - 1);
        const defaultLabel = `1 - ${defaultMax === Infinity ? "max" : defaultMax} pcs`;
        if (defaultMax > 0) {
            tiers.push({
                minQty: 1,
                maxQty: defaultMax,
                price: product.discountedPrice || product.price,
                label: defaultLabel,
            });
        }

        if (hasBulkTier) {
            const bulkMax = largeQtyMin - 1;
            const bulkLabel = `${product.bulkMinimumUnits} - ${bulkMax === Infinity ? "max" : bulkMax} pcs`;
            tiers.push({ minQty: product.bulkMinimumUnits, maxQty: bulkMax, price: product.bulkPrice, label: bulkLabel });
        }

        if (hasLargeQtyTier) {
            tiers.push({ minQty: product.largeQuantityMinimumUnits, maxQty: Infinity, price: product.largeQuantityPrice, label: `>= ${product.largeQuantityMinimumUnits} pcs` });
        }

        tiers.sort((a, b) => a.minQty - b.minQty);
        const filteredTiers = tiers.filter((tier) => tier.minQty <= tier.maxQty);

        return filteredTiers.map((tier) => ({
            ...tier,
            isActive: currentNumericalQuantity >= tier.minQty && (tier.maxQty === Infinity || currentNumericalQuantity <= tier.maxQty),
        }));
    }, [currentNumericalQuantity, product]);

    useEffect(() => {
        let currentPrice = product.discountedPrice || product.price;
        const activeTier = priceTiers.find((tier) => currentNumericalQuantity >= tier.minQty && (tier.maxQty === Infinity || currentNumericalQuantity <= tier.maxQty));
        if (activeTier) {
            // currentPrice = activeTier.price;
        }
        setEffectivePrice(currentPrice);
    }, [currentNumericalQuantity, product.price, product.discountedPrice, priceTiers]);

    useEffect(() => {
        setDisplayStock(product.stock);
    }, [product.stock]);

    useEffect(() => {
        const currentCartQty = cartItem?.quantity || 0;
        setQuantity(currentCartQty > 0 ? String(currentCartQty) : "");
        setShowQuantityInput(currentCartQty > 0);
    }, [cartItem]);

    const handleCartAction = async (qtyToDispatch) => {
        if (isVendorOffline) {
            Toast.error("Vendor is currently offline. Cannot add products from this shop.");
            return;
        }
        if (isVendorOutOfRange) {
            Toast.error("Vendor is out of your delivery range. Cannot add products from this shop.");
            return;
        }

        const numericalQuantity = qtyToDispatch;
        if (numericalQuantity < 0) {
            Toast.error("Quantity cannot be negative.");
            return;
        }
        if (numericalQuantity > displayStock) {
            Toast.error(`Cannot add more than available stock (${displayStock})`);
            setQuantity(String(displayStock));
            return;
        }

        setIsAddingToCart(true);
        try {
            await dispatch(
                addOrUpdateItem({
                    productId: product._id,
                    quantity: numericalQuantity,
                    price: effectivePrice,
                    vendorId: product.vendorId || product.vendor?._id,
                })
            );
            if (numericalQuantity === 0) {
                Toast.success(`Removed ${product.name} from cart.`);
            } else if (!cartItem || cartItem.quantity === 0) {
                Toast.success(`Added ${numericalQuantity} x ${product.name} to cart!`);
            } else {
                Toast.success(`Updated cart: ${numericalQuantity} x ${product.name}`);
            }
        } catch (error) {
            console.error("Failed to update cart:", error);
            Toast.error("Failed to update item in cart. Please try again.");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (value === "") {
            setQuantity("");
            return;
        }
        if (!/^\d+$/.test(value)) {
            return;
        }
        let numVal = parseInt(value, 10);
        if (isNaN(numVal) || numVal < 0) {
            numVal = 0;
        }
        setQuantity(String(numVal));
    };

    const handleQuantityBlur = async () => {
        let numericalQuantity = currentNumericalQuantity;
        if (numericalQuantity === 0 && (cartItem?.quantity || 0) > 0) {
            await handleCartAction(0);
            setQuantity("");
            setShowQuantityInput(false);
            return;
        }
        if (numericalQuantity > displayStock) {
            Toast.error(`Only ${displayStock} units available for "${product.name}". Setting quantity to max available.`);
            numericalQuantity = displayStock;
            setQuantity(String(displayStock));
        }
        if (numericalQuantity !== (cartItem?.quantity || 0)) {
            await handleCartAction(numericalQuantity);
        } else if (numericalQuantity === 0 && (cartItem?.quantity || 0) === 0) {
            setShowQuantityInput(false);
            setQuantity("");
        }
    };

    const handleQuantityButtonClick = async (increment) => {
        let newQty;
        if (increment) {
            newQty = currentNumericalQuantity + 1;
            if (newQty > displayStock) {
                Toast.error(`Max stock reached (${displayStock})`);
                return;
            }
        } else {
            newQty = currentNumericalQuantity - 1;
            if (newQty < 0) newQty = 0;
        }
        setQuantity(String(newQty));
        await handleCartAction(newQty);
    };

    const handleAddToCartClick = async () => {
        if (isDisabled || displayStock === 0) {
            Toast.error(displayStock === 0 ? "This product is out of stock." : isVendorOffline ? "Vendor is offline." : "Vendor is out of range.");
            return;
        }
        if (!showQuantityInput || currentNumericalQuantity === 0) {
            setQuantity("1");
            setShowQuantityInput(true);
            await handleCartAction(1);
        }
    };

    const isDisabled = isVendorOffline || isVendorOutOfRange;
    const truncatedProductName = product.name.length > PRODUCT_NAME_MAX_LENGTH ? `${product.name.substring(0, PRODUCT_NAME_MAX_LENGTH)}...` : product.name;

    return (
        <div className={`relative m-1 flex h-48 min-w-[320px] max-w-full flex-grow flex-shrink-0 flex-row overflow-hidden rounded-xl bg-white shadow-lg ${isDisabled ? 'opacity-60' : ''}`}>
            <div className="flex w-[60%] flex-grow flex-col justify-between p-1.5">
                <a href={`/product-details/${product._id}`} className="flex-grow-0 min-h-10">
                    <div>
                        <h3 className="mb-1 text-center text-sm font-bold text-gray-800 leading-4">{truncatedProductName}</h3>
                        {product.companyName && <p className="text-[8px] text-gray-800">{product.companyName}</p>}
                        {product.brand && <p className="text-[8px] text-gray-800">Brand: {product.brand}</p>}
                        {product.location && <p className="text-[8px] text-gray-800">📍 {product.location}</p>}
                        {product.rating && (
                            <div className="mt-0.5 flex items-center gap-0.5">
                                <span className="text-yellow-500">★</span>
                                <p className="text-[8px] text-gray-800">{product.rating.toFixed(1)} {product.numReviews ? `(${product.numReviews})` : ""}</p>
                            </div>
                        )}
                    </div>
                </a>

                <div className="flex-grow flex flex-col justify-end">
                    <div className="mt-1 mb-0.5 flex items-center gap-0.5">
                        {displayStock > 0 ? (
                            displayStock <= 10 ? (
                                <p className="text-[8px] font-semibold text-red-600">Limited! ({displayStock} in stock)</p>
                            ) : (
                                <div className="flex items-center gap-0.5">
                                    <span className="text-green-500">✔</span>
                                    <p className="text-[8px] font-semibold text-green-800">Avail: {displayStock} in stock</p>
                                </div>
                            )
                        ) : (
                            <div className="flex items-center gap-0.5">
                                <span className="text-red-600">✖</span>
                                <p className="text-[8px] font-semibold text-red-600">Unavail.</p>
                            </div>
                        )}
                    </div>

                    {priceTiers.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 py-0.5">
                            {priceTiers.map((tier, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col items-center rounded-md p-0.5 shadow-sm ${tier.isActive ? 'bg-green-800 text-white' : 'bg-white text-gray-800'}`}
                                >
                                    <p className={`text-[8px] font-medium ${tier.isActive ? 'text-white' : 'text-gray-800'}`}>{tier.label}</p>
                                    <p className={`text-xs font-bold ${tier.isActive ? 'text-white' : 'text-green-800'}`}>₹{tier.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {isDisabled || displayStock === 0 ? (
                        <div className="mt-0.5 flex w-full items-center justify-center rounded-lg bg-gray-300 py-0.5">
                            <p className="text-xs font-semibold text-gray-700">
                                {displayStock === 0 ? "Out of Stock" : isVendorOffline ? "Vendor Offline" : "Out of Range"}
                            </p>
                        </div>
                    ) : showQuantityInput && (currentNumericalQuantity > 0 || quantity === "") ? (
                        <div className="mt-1 flex flex-col gap-0.5">
                            {(cartItem?.quantity || 0) > 0 && (
                                <div className="flex items-center justify-center rounded-lg bg-green-800 py-0.5">
                                    <span className="text-white">✔</span>
                                    <p className="ml-1 text-[10px] font-semibold text-white">Added ({cartItem.quantity})</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between rounded-full bg-green-100 shadow-sm">
                                <button
                                    onClick={() => handleQuantityButtonClick(false)}
                                    disabled={currentNumericalQuantity <= 0 || isAddingToCart}
                                    className={`flex h-6 w-1/3 items-center justify-center rounded-l-full bg-green-600 text-white ${currentNumericalQuantity <= 0 || isAddingToCart ? 'opacity-50' : ''}`}
                                >
                                    -
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    onBlur={handleQuantityBlur}
                                    className="w-1/3 text-center text-xs font-semibold text-green-800 bg-transparent outline-none"
                                    maxLength={String(displayStock).length + 2}
                                />
                                <button
                                    onClick={() => handleQuantityButtonClick(true)}
                                    disabled={currentNumericalQuantity >= displayStock || isAddingToCart}
                                    className={`flex h-6 w-1/3 items-center justify-center rounded-r-full bg-green-600 text-white ${currentNumericalQuantity >= displayStock || isAddingToCart ? 'opacity-50' : ''}`}
                                >
                                    +
                                </button>
                            </div>
                            {((currentNumericalQuantity > 0 && cartItem?.quantity !== currentNumericalQuantity) || (currentNumericalQuantity === 0 && (cartItem?.quantity || 0) > 0)) && (
                                <button
                                    onClick={() => handleCartAction(currentNumericalQuantity)}
                                    disabled={isAddingToCart}
                                    className={`mt-0.5 flex w-full items-center justify-center rounded-lg bg-green-800 py-1 ${isAddingToCart ? 'opacity-50' : ''}`}
                                >
                                    {isAddingToCart ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <span className="text-xs font-semibold text-white">{currentNumericalQuantity === 0 ? "Remove from Cart" : "Update Cart"}</span>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCartClick}
                            disabled={!product.isAvailable || displayStock === 0 || isAddingToCart}
                            className={`mt-0.5 flex w-full items-center justify-center rounded-lg bg-green-800 py-1 ${(!product.isAvailable || displayStock === 0 || isAddingToCart) ? 'bg-gray-300' : ''}`}
                        >
                            {isAddingToCart ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <span className="text-white">🛒</span>
                                    <span className="ml-1 text-xs font-semibold text-white">Add to Cart</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <a href={`/product-details/${product._id}`} className="block w-[40%] flex-shrink-0 overflow-hidden rounded-r-xl">
                <div className="relative h-full w-full">
                    {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover rounded-r-xl" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-r-xl bg-gray-300">
                            <span className="text-3xl text-gray-500">📷</span>
                            <p className="ml-0.5 text-[10px] text-gray-500">No Image</p>
                        </div>
                    )}

                    {isVendorOffline && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black bg-opacity-60">
                            <p className="p-1 text-center text-sm font-bold text-white">Vendor Offline</p>
                        </div>
                    )}
                    {isVendorOutOfRange && !isVendorOffline && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-red-600 bg-opacity-60">
                            <p className="p-1 text-center text-sm font-bold text-white">Out of Range</p>
                        </div>
                    )}

                    {amountSaved > 0 && (
                        <div className="absolute left-0 top-0 z-10 rounded-full bg-yellow-400 px-1 py-0.5 shadow-md">
                            <p className="text-[8px] font-bold text-white">Save ₹{amountSaved}</p>
                        </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 py-0.5 text-center bg-black bg-opacity-50 rounded-b-xl">
                        <p className="text-sm font-bold text-white">₹{effectivePrice.toFixed(2)}</p>
                    </div>
                </div>
            </a>
        </div>
    );
};

export default NewProductCard;