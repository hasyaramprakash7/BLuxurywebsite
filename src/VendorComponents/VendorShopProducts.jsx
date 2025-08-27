import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { fetchAllVendorProducts } from "../features/vendor/vendorProductSlice";
import { fetchAllVendors } from "../features/vendor/vendorAuthSlice";
import { addOrUpdateItem } from "../features/cart/cartSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideCart from "./SideCard"; // Assuming Side is available and styled appropriately

const VendorShopProducts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize useNavigate
    const [activeVendor, setActiveVendor] = useState("All Shops"); // State for active vendor chip
    const scrollRefs = useRef({}); // Ref to scroll to specific vendor sections

    const { allProducts, loading, error } = useSelector((state) => state.vendorProducts);
    const user = useSelector((state) => state.auth.user);
    const allVendors = useSelector((state) => state.vendorAuth.allVendors);

    useEffect(() => {
        dispatch(fetchAllVendorProducts());
        dispatch(fetchAllVendors());
    }, [dispatch]);

    // Create a map for quick lookup of vendor shop names by ID
    const vendorMap = useMemo(() => {
        const map = {};
        allVendors.forEach((vendor) => {
            map[vendor._id] = vendor.shopName;
        });
        return map;
    }, [allVendors]);

    // Extract unique vendor shop names and sort them
    const vendorShopNames = useMemo(() => {
        const uniqueVendorNames = new Set();
        allProducts.forEach((product) => {
            // Use product.vendor?._id or product.vendorId based on your product schema
            const vendorId = product.vendor?._id || product.vendorId;
            if (vendorId && vendorMap[vendorId]) {
                uniqueVendorNames.add(vendorMap[vendorId]);
            }
        });
        // Sort alphabetically, ensuring "All Shops" is at the top
        return ["All Shops", ...Array.from(uniqueVendorNames).sort()];
    }, [allProducts, vendorMap]);

    // Group products by vendor shop name for display
    const productsGroupedByVendor = useMemo(() => {
        const grouped = { "All Shops": [] }; // Initialize with 'All Shops'
        allProducts.forEach((product) => {
            const vendorId = product.vendor?._id || product.vendorId;
            const shopName = vendorId ? vendorMap[vendorId] : "Other Vendors"; // Default if vendor info is missing

            if (shopName) { // Only group if shopName is valid
                if (!grouped[shopName]) {
                    grouped[shopName] = [];
                }
                grouped[shopName].push(product);
                grouped["All Shops"].push(product); // Add to 'All Shops' too
            }
        });
        return grouped;
    }, [allProducts, vendorMap]);

    // Handle smooth scroll to vendor section
    const handleVendorClick = (vendorName) => {
        setActiveVendor(vendorName);
        if (scrollRefs.current[vendorName]) {
            scrollRefs.current[vendorName].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleAddToCart = (product, quantity = 1) => {
        if (!user?._id) {
            toast.error("Please login to add items to cart");
            navigate("/login"); // Redirect to login page
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500">
                <p className="text-xl font-semibold mb-4 animate-pulse">Loading vendor products...</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-gray-200 h-72 rounded-xl animate-pulse shadow-md" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-6 rounded-lg mx-auto max-w-2xl mt-10 text-center shadow-lg">
                <strong className="font-bold text-xl">Oops! Error Loading Vendor Products</strong>
                <p className="block sm:inline mt-2">{typeof error === "string" ? error : error.message || JSON.stringify(error)}</p>
                <p className="text-sm mt-3">Please try refreshing the page or check your internet connection.</p>
            </div>
        );
    }

    // Custom scrollbar hiding for consistency
    const hideScrollbarStyle = `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;

    return (
        <div className="max-w-7xl mx-auto flex px-4 h-[calc(100vh-64px)]">
            <style>{hideScrollbarStyle}</style>

            {/* Main Content Area - Product Sections by Vendor */}
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-8">
                {Object.entries(productsGroupedByVendor)
                    .sort(([vendorA], [vendorB]) => {
                        // Keep "All Shops" conceptually first in the display order
                        if (vendorA === "All Shops") return -1;
                        if (vendorB === "All Shops") return 1;
                        return vendorA.localeCompare(vendorB);
                    })
                    .map(([vendorName, products]) => (
                        <section key={vendorName} ref={(el) => (scrollRefs.current[vendorName] = el)} className="mb-8">
                            <h2 className="w-fit rounded-xl text-center text-lg font-semibold text-gray-700 sticky top-0 bg-white z-10 py-1 px-2 shadow-2xl mx-auto md:mx-0">
                                {vendorName}
                            </h2>

                            {products.length === 0 ? (
                                <p className="text-gray-600 text-center py-4">No products found for this vendor.</p>
                            ) : (
                                <div className="flex overflow-x-auto hide-scrollbar pb-4 -mx-2">
                                    <div className="flex flex-nowrap gap-4 px-2">
                                        {products.map((product) => (
                                            <SideCart
                                                key={product._id}
                                                product={product}
                                                onAddToCart={handleAddToCart}
                                                vendorShopName={vendorMap[product.vendorId || product.vendor?._id]}
                                                className="flex-shrink-0 w-60"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    ))}
            </div>

            {/* Mobile/Small Screen Vendor Chips */}
            <div className="md:hidden fixed bottom-15 left-0 right-0 bg-white border-t border-gray-200 p-2 overflow-x-auto hide-scrollbar z-20 shadow-lg">
                <div className="flex flex-nowrap gap-2 justify-center">
                    {vendorShopNames.map((vendorName) => (
                        <button
                            key={vendorName}
                            onClick={() => handleVendorClick(vendorName)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap
                                ${activeVendor === vendorName
                                    ? "bg-blue-600 text-white" // Active vendor style
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {vendorName}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VendorShopProducts;