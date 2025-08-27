import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVendorProducts } from "../../features/vendor/vendorProductSlice";
import { fetchAllVendors } from "../../features/vendor/vendorAuthSlice";
import { addOrUpdateItem } from "../../features/cart/cartSlice";
import { fetchUserOrders } from "../../features/order/orderSlice";
import ProductCard from "../../VendorComponents/ProductCard"; // Not used directly in renderProductGrid, but keeping for reference if needed elsewhere.
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch } from "react-icons/fa";
import Navbar from "../Home/Navbar";
import NewProductCard from "../../VendorComponents/NewProductCard";

const SearchComponent = () => {
    const dispatch = useDispatch();
    const [query, setQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const { allProducts, loading: productsLoading, error: productsError } = useSelector((state) => state.vendorProducts);
    // Corrected: Destructure all three properties directly from state.vendorAuth
    const { allVendors, loading: vendorsLoading, error: vendorsError } = useSelector((state) => state.vendorAuth);
    const { user } = useSelector((state) => state.auth);
    const { userOrders, loading: ordersLoading } = useSelector((state) => state.order);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingProducts(true);
            await Promise.all([
                dispatch(fetchAllVendorProducts()),
                dispatch(fetchAllVendors()),
                user?._id ? dispatch(fetchUserOrders(user._id)) : Promise.resolve(),
            ]);
            setLoadingProducts(false);
        };
        fetchData();
    }, [dispatch, user?._id]);

    const vendorMap = useMemo(() => {
        const map = {};
        // Corrected: Access the 'vendors' property from the allVendors object,
        // using optional chaining for safety
        (allVendors?.vendors || []).forEach((vendor) => {
            map[vendor._id] = vendor.shopName;
        });
        return map;
    }, [allVendors]); // This dependency ensures the map only updates if the vendor data changes

    // Logic for setting suggestions based on past orders or a subset of all products
    useEffect(() => {
        if (!query.trim()) {
            if (user?._id && userOrders?.length > 0 && allProducts?.length > 0) {
                const orderedProductIds = new Set();
                userOrders.forEach((order) =>
                    order.items?.forEach((item) => orderedProductIds.add(item.productId))
                );

                const suggestions = allProducts.filter((product) =>
                    orderedProductIds.has(product._id)
                );

                // If user has ordered products, use them as suggestions (limit to 8)
                if (suggestions.length > 0) {
                    setSuggestedProducts(suggestions.slice(0, 8));
                } else {
                    // If user has no specific ordered products, but logged in, show general discover products
                    setSuggestedProducts(allProducts.slice(0, 8));
                }
            } else if (allProducts?.length > 0) {
                // If user is not logged in or has no orders, show a subset of all products as general "Discover"
                setSuggestedProducts(allProducts.slice(0, 8));
            } else {
                setSuggestedProducts([]); // No products to suggest yet
            }
        } else {
            setSuggestedProducts([]); // Clear suggestions when there's a query
        }
    }, [query, user, userOrders, allProducts]);

    // Search filtering
    useEffect(() => {
        if (!query.trim()) {
            setFilteredProducts([]);
            return;
        }

        const q = query.toLowerCase();

        const results = allProducts.filter((product) => {
            const name = product.name?.toLowerCase() || "";
            const description = product.description?.toLowerCase() || "";

            // --- FIX START ---
            let categorySearchString = "";
            if (typeof product.category === 'string') {
                // If category is a simple string (e.g., "Men's Fashion", "Drinks")
                categorySearchString = product.category.toLowerCase();
            } else if (typeof product.category === 'object' && product.category !== null) {
                // If category is an object (e.g., { mainCategory: "Grocery", subCategory: "Beverages" })
                const main = product.category.mainCategory?.toLowerCase() || "";
                const sub = product.category.subCategory?.toLowerCase() || "";
                categorySearchString = `${main} ${sub}`.trim(); // Combine main and sub categories
            }
            // --- FIX END ---

            const tags = (product.tags || []).map(tag => tag.toLowerCase()).join(" ");
            const vendorId = product.vendorId || product.vendor?._id || "";
            const vendorName = vendorMap[vendorId]?.toLowerCase() || "";

            return (
                name.includes(q) ||
                description.includes(q) ||
                categorySearchString.includes(q) || // Use the processed category string here
                tags.includes(q) ||
                vendorName.includes(q)
            );
        });

        setFilteredProducts(results);
    }, [query, allProducts, vendorMap]);

    const handleAddToCart = (product, quantity = 1) => {
        if (!user?._id) {
            toast.error("Please login to add items to cart");
            return;
        }
        if (quantity < 1) {
            toast.error("Quantity must be at least 1.");
            return;
        }

        const payload = {
            productId: product._id,
            quantity: quantity,
            price: product.discountedPrice || product.price,
            vendorId: product.vendorId || product.vendor?._id,
        };

        dispatch(addOrUpdateItem(payload))
            .unwrap()
            .then(() => toast.success(`${quantity} x ${product.name} added to cart`))
            .catch((err) => {
                console.error("Add to cart failed:", err);
                toast.error(err.message || "Failed to add item to cart");
            });
    };

    const isLoading = loadingProducts || productsLoading || vendorsLoading || ordersLoading;

    if (productsError || vendorsError) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-6 rounded-lg mx-auto max-w-2xl mt-10 text-center shadow-lg">
                <strong className="font-bold text-xl">Error Loading Data</strong>
                <p className="block sm:inline mt-2">
                    {productsError?.message || vendorsError?.message || "An unknown error occurred."}
                </p>
                <p className="text-sm mt-3">Please try refreshing the page.</p>
            </div>
        );
    }

    const renderProductGrid = (products, title, noResultsMessage) => {
        if (products.length === 0 && !noResultsMessage) {
            return null;
        }
        return (
            <>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#005612] to-[#009632] bg-clip-text text-transparent mb-6 border-b-2 border-gray-200 pb-2">
                    {title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500 text-lg py-8">
                            {noResultsMessage}
                        </p>
                    ) : (
                        products.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                            >
                                <NewProductCard
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    vendorShopName={vendorMap[product.vendorId || product.vendor?._id]}
                                />
                            </div>
                        ))
                    )}
                </div>
            </>
        );
    };

    const renderSkeletons = (count) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl shadow-md p-4 animate-pulse">
                    <div className="w-full h-36 bg-gray-300 rounded-t-xl mb-3"></div>
                    <div className="h-4 bg-gray-300 w-3/4 mb-2 rounded"></div>
                    <div className="h-3 bg-gray-300 w-1/2 mb-4 rounded"></div>
                    <div className="h-3 bg-gray-300 w-full mb-2 rounded"></div>
                    <div className="h-3 bg-gray-300 w-2/3 rounded"></div>
                    <div className="mt-4 h-10 bg-gray-300 w-full rounded-lg"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 mt-5 lg:mt-20"> {/* Changed this line */}
            <div className="relative mb-8 shadow-md rounded-xl">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                    type="text"
                    placeholder="Search products, categories, vendors, or tags..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
            </div>

            {isLoading ? (
                <>
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2 animate-pulse w-1/3 h-8 bg-gray-200 rounded"></h2>
                    {renderSkeletons(10)}
                </>
            ) : (
                <div className="mt-8">
                    {query.trim() ? (
                        // If there's a query, show filtered results
                        renderProductGrid(
                            filteredProducts,
                            "Search Results",
                            `No products found matching "${query}". Try a different search!`
                        )
                    ) : (
                        // If no query, show suggestions first, then all products
                        <>
                            {/* Suggestions/Recommended Section */}
                            {suggestedProducts.length > 0 && (
                                <div className="mb-12">
                                    {renderProductGrid(
                                        suggestedProducts,
                                        user?._id && userOrders?.length > 0 ? "Products from Your Past Orders" : "Discover Products",
                                        "No recommendations at the moment."
                                    )}
                                </div>
                            )}

                            {/* All Products Section - always shown when no query, below suggestions */}
                            {allProducts.length > 0 ? (
                                renderProductGrid(
                                    allProducts,
                                    "All Products",
                                    "No products available at the moment."
                                )
                            ) : (
                                <p className="text-gray-500 text-center text-xl py-10">
                                    No products to display. Please check back later!
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
            <Navbar />
        </div>
    );
};

export default SearchComponent;