import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVendorProducts } from "../features/vendor/vendorProductSlice";
import { fetchAllVendors } from "../features/vendor/vendorAuthSlice";
import { addOrUpdateItem } from "../features/cart/cartSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "./ProductCard";
import { Filter, Store, Tag, ShoppingCart, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { FaSpinner, FaBoxOpen, FaPlus, FaMinus } from "react-icons/fa";
import ProductFilterSidebar from "./ProductFilterSidebar"; // Make sure the path is correct
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';


const AllVendorProducts = () => {
    const dispatch = useDispatch();
    const [viewMode, setViewMode] = useState("vendor"); // "vendor" or "category"
    const [activeSelection, setActiveSelection] = useState(
        viewMode === "vendor" ? "All Shops" : "All Products"
    );
    const [sortOrder, setSortOrder] = useState('default'); // 'default', 'asc', 'desc'
    const [maxAllowedPrice, setMaxAllowedPrice] = useState(10000); // Default high value
    const [selectedBrands, setSelectedBrands] = useState([]); // State for selected brands
    const [showFilterModal, setShowFilterModal] = useState(false); // For mobile filter modal

    const scrollRefs = useRef({});

    const { allProducts, loading, error } = useSelector((state) => state.vendorProducts);
    const user = useSelector((state) => state.auth.user);
    const allVendors = useSelector((state) => state.vendorAuth.allVendors);

    useEffect(() => {
        dispatch(fetchAllVendorProducts());
        dispatch(fetchAllVendors());
    }, [dispatch]);

    // Calculate overall min/max product price for slider bounds
    const { overallMinProductPrice, overallMaxProductPrice } = useMemo(() => {
        if (!allProducts || allProducts.length === 0) {
            return { overallMinProductPrice: 0, overallMaxProductPrice: 10000 };
        }
        const prices = allProducts.map(p => p.discountedPrice || p.price);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        return { overallMinProductPrice: min, overallMaxProductPrice: Math.max(max, 100) };
    }, [allProducts]);

    // Initialize maxAllowedPrice to overallMaxProductPrice once products are loaded
    useEffect(() => {
        if (!loading && allProducts.length > 0) {
            setMaxAllowedPrice(overallMaxProductPrice);
        }
    }, [loading, allProducts, overallMaxProductPrice]);

    // Update active selection and reset filters/sort when viewMode changes
    useEffect(() => {
        setActiveSelection(viewMode === "vendor" ? "All Shops" : "All Products");
        setSortOrder('default');
        setMaxAllowedPrice(overallMaxProductPrice);
        setSelectedBrands([]);
    }, [viewMode, overallMaxProductPrice]);

    const vendorMap = useMemo(() => {
        const map = {};
        allVendors.forEach((vendor) => {
            map[vendor._id] = vendor.shopName;
        });
        return map;
    }, [allVendors]);

    const allBrands = useMemo(() => {
        const brands = new Set();
        allProducts.forEach(product => {
            if (product.brand) {
                brands.add(product.brand);
            }
        });
        return Array.from(brands).sort();
    }, [allProducts]);

    // Function to apply price range filtering (now based on maxAllowedPrice)
    const applyPriceFilter = (productsArray) => {
        return productsArray.filter(product => {
            const price = product.discountedPrice || product.price;
            return price <= maxAllowedPrice;
        });
    };

    // Function to apply brand filtering
    const applyBrandFilter = (productsArray) => {
        if (selectedBrands.length === 0) {
            return productsArray;
        }
        return productsArray.filter(product =>
            selectedBrands.includes(product.brand)
        );
    };

    // Function to apply sorting to an array of products
    const applySort = (productsArray) => {
        const sortableProducts = [...productsArray];

        if (sortOrder === 'asc') {
            return sortableProducts.sort((a, b) => {
                const priceA = a.discountedPrice || a.price;
                const priceB = b.discountedPrice || b.price;
                return priceA - priceB;
            });
        } else if (sortOrder === 'desc') {
            return sortableProducts.sort((a, b) => {
                const priceA = a.discountedPrice || a.price;
                const priceB = b.discountedPrice || b.price;
                return priceB - priceA;
            });
        }
        return productsArray;
    };

    // --- Logic for Vendor View ---
    const vendorShopNames = useMemo(() => {
        const uniqueVendorNames = new Set();
        allProducts.forEach((product) => {
            const vendorId = product.vendor?._id || product.vendorId;
            if (vendorId && vendorMap[vendorId]) {
                uniqueVendorNames.add(vendorMap[vendorId]);
            }
        });
        return ["All Shops", ...Array.from(uniqueVendorNames).sort()];
    }, [allProducts, vendorMap]);

    const productsGroupedByVendor = useMemo(() => {
        const grouped = { "All Shops": [] };
        const filteredAndSortedAllProducts = applySort(applyBrandFilter(applyPriceFilter(allProducts)));
        grouped["All Shops"] = filteredAndSortedAllProducts;

        allProducts.forEach((product) => {
            const vendorId = product.vendor?._id || product.vendorId;
            const shopName = vendorId ? vendorMap[vendorId] : "Other Vendors";

            if (shopName) {
                if (!grouped[shopName]) {
                    grouped[shopName] = [];
                }
                grouped[shopName].push(product);
            }
        });

        for (const shopName in grouped) {
            if (shopName !== "All Shops") {
                grouped[shopName] = applySort(applyBrandFilter(applyPriceFilter(grouped[shopName])));
            }
        }
        return grouped;
    }, [allProducts, vendorMap, sortOrder, maxAllowedPrice, selectedBrands]);

    // --- Logic for Category View ---
    const categories = useMemo(() => {
        const uniqueCategories = new Set();
        allProducts.forEach((product) => {
            // Ensure product.category is a string before calling charAt
            if (typeof product.category === 'string' && product.category) {
                uniqueCategories.add(product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase());
            }
        });
        return ["All Products", ...Array.from(uniqueCategories).sort()];
    }, [allProducts]);

    const productsGroupedByCategory = useMemo(() => {
        const grouped = { "All Products": [] };
        const filteredAndSortedAllProducts = applySort(applyBrandFilter(applyPriceFilter(allProducts)));
        grouped["All Products"] = filteredAndSortedAllProducts;

        allProducts.forEach((product) => {
            // Ensure product.category is a string before processing
            const categoryName = (typeof product.category === 'string' && product.category)
                ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()
                : "Other"; // Default to "Other" if category is not a valid string

            if (!grouped[categoryName]) {
                grouped[categoryName] = [];
            }
            grouped[categoryName].push(product);
        });

        for (const categoryName in grouped) {
            if (categoryName !== "All Products") {
                grouped[categoryName] = applySort(applyBrandFilter(applyPriceFilter(grouped[categoryName])));
            }
        }
        return grouped;
    }, [allProducts, sortOrder, maxAllowedPrice, selectedBrands]);

    // Handle smooth scroll for both vendors and categories
    const handleItemClick = (name) => {
        setActiveSelection(name);
        if (scrollRefs.current[name]) {
            scrollRefs.current[name].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleAddToCart = (product, quantity = 1) => {
        if (!user?._id) {
            toast.error("Please login to add items to cart");
            return;
        }
        if (quantity < 1) {
            toast.error("Quantity must be at least 1.");
            return;
        }

        const vendorId = product.vendorId || product.vendor?._id;
        const vendorData = allVendors.find(v => v._id === vendorId);
        if (vendorData?.isOnline === false) {
            toast.warn("Cannot add product from an offline vendor to cart.");
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
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500 font-inter">
                <FaSpinner className="animate-spin text-4xl text-gray-800 mb-4" />
                <p className="text-xl font-semibold mb-6">Loading products, please wait...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-6 rounded-lg mx-auto max-w-2xl mt-10 text-center shadow-lg font-inter">
                <strong className="font-bold text-xl">Oops! Error Loading Products</strong>
                <p className="block sm:inline mt-2">{typeof error === "string" ? error : error.message || JSON.stringify(error)}</p>
                <p className="text-sm mt-3">Please try refreshing the page or check your internet connection.</p>
            </div>
        );
    }

    const hideScrollbarStyle = `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;

    const groupedProducts = viewMode === "vendor" ? productsGroupedByVendor : productsGroupedByCategory;
    const titlePrefix = viewMode === "vendor" ? "Vendor Shops" : "Categories";


    return (
        <div className="min-h-screen font-inter bg-white
            bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-50 to-transparent
            bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gray-50 to-transparent
            bg-[linear-gradient(to_top_left,_var(--tw-gradient-stops))] from-gray-100 to-transparent
            dark:bg-gray-900 overflow-visible "> {/* Changed overflow-hidden to overflow-visible on the main container */}
            <style>{hideScrollbarStyle}</style>

            {/*
                CRITICAL PLACEMENT:
                This wrapper for the desktop filter sidebar is crucial.
                It ensures the ProductFilterSidebar (when isModal=false) is positioned
                at a higher level in the DOM tree, *outside* the main scrollable
                content area (the product grid), preventing dropdown clipping.
                Added z-index-30 for good measure.
            */}
            {/* <div className="max-w-7xl mx-auto px-1 relative z-30">
                <ProductFilterSidebar
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    activeSelection={activeSelection}
                    handleItemClick={handleItemClick}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    maxAllowedPrice={maxAllowedPrice}
                    setMaxAllowedPrice={setMaxAllowedPrice}
                    selectedBrands={selectedBrands}
                    setSelectedBrands={setSelectedBrands}
                    allBrands={allBrands}

                    overallMinProductPrice={overallMinProductPrice}
                    overallMaxProductPrice={overallMaxProductPrice}
                    sidebarItems={viewMode === "vendor" ? vendorShopNames : categories}
                    titlePrefix={titlePrefix}
                    isModal={false} // Renders as horizontal bar for desktop
                />
            </div> */}


            {/* Main Content Area - Product Sections. This div IS THE SCROLLABLE PART. */}
            {/* It is now separate from the filter bar above it. */}
            <div className="max-w-7xl mx-auto flex px-1 pb-1 relative z-10"> {/* Lower z-index than filter bar */}
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1 md:ml-0">
                    {/* Filter Button & View Mode Toggles for Mobile/Small Screens */}
                    {/* This div is inside the scrollable area, which is fine for mobile modal trigger */}


                    {Object.entries(groupedProducts)
                        .sort(([nameA], [nameB]) => {
                            const allKey = viewMode === "vendor" ? "All Shops" : "All Products";
                            if (nameA === allKey) return -1;
                            if (nameB === allKey) return 1;
                            return nameA.localeCompare(nameB);
                        })
                        .map(([name, products]) => (
                            <section key={name} ref={(el) => (scrollRefs.current[name] = el)} className="m-1 p-1 bg-white rounded-lg shadow-md">
                                <h2 className="text-xl font-bold text-black mb-2 border-b border-gray-200 p-2 flex w-100 ">
                                    {viewMode === "vendor" ? <Store className="mr-2 text-gray-800 " size={24} /> : <Tag className="mr-2 text-gray-800 " size={24} />}

                                    <span className="bg-gradient-to-r from-[#005612] to-[#009632] bg-clip-text text-transparent
">
                                        {name}
                                    </span>
                                </h2>

                                {products.length === 0 ? (
                                    <p className="text-gray-600 text-center py-8 text-lg">
                                        No products found for this {viewMode === "vendor" ? "vendor" : "category"} within the selected criteria.
                                        <br />Try adjusting your filters or selecting "All {viewMode === "vendor" ? "Shops" : "Products"}".
                                    </p>
                                ) : (
                                    <div className="flex overflow-x-auto hide-scrollbar pb-1 -mx-2 ml-2">
                                        <div className="flex flex-nowrap gap-5 ">
                                            {products.map((product) => {
                                                const vendorId = product.vendorId || product.vendor?._id;
                                                const vendorData = allVendors.find(v => v._id === vendorId);
                                                const isVendorOffline = vendorData?.isOnline === false;
                                                return (
                                                    <ProductCard
                                                        key={product._id}
                                                        product={product}
                                                        onAddToCart={handleAddToCart}
                                                        vendorShopName={vendorMap[vendorId]}
                                                        className="flex-shrink-0 w-64 md:w-72 transform transition-transform duration-200 hover:scale-[1.02] shadow-sm hover:shadow-lg"
                                                        isVendorOffline={isVendorOffline}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </section>
                        ))}
                </div>
            </div>

            {/* Filter Modal (Mobile Only) - Uses ProductFilterSidebar with isModal=true */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4 font-inter transition-opacity duration-300 ease-in-out">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-md max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out scale-100 opacity-100">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <Filter className="mr-2 text-gray-800 " size={24} /> Filters
                            </h2>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="text-gray-500 hover:text-gray-800 text-3xl transition-colors p-1 rounded-full hover:bg-gray-100"
                            >
                                <XCircle size={32} />
                            </button>
                        </div>

                        {/* ProductFilterSidebar rendered inside the modal */}
                        <ProductFilterSidebar
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            activeSelection={activeSelection}
                            handleItemClick={handleItemClick}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                            maxAllowedPrice={maxAllowedPrice}
                            setMaxAllowedPrice={setMaxAllowedPrice}
                            selectedBrands={selectedBrands}
                            setSelectedBrands={setSelectedBrands}
                            allBrands={allBrands}
                            overallMinProductPrice={overallMinProductPrice}
                            overallMaxProductPrice={overallMaxProductPrice}
                            sidebarItems={viewMode === "vendor" ? vendorShopNames : categories}
                            titlePrefix={titlePrefix}
                            isModal={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllVendorProducts;