import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVendorProducts } from "../features/vendor/vendorProductSlice";
import { fetchAllVendors } from "../features/vendor/vendorAuthSlice";
import { addOrUpdateItem } from "../features/cart/cartSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "./ProductCard"; // This component seems unused in the provided snippet
import { Filter, Store, Tag, ShoppingCart, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { FaSpinner, FaBoxOpen, FaPlus, FaMinus } from "react-icons/fa";
import ProductFilterSidebar from "./ProductFilterSidebar"; // Make sure the path is correct
import { Swiper, SwiperSlide } from 'swiper/react'; // These Swiper imports seem unused
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import VenderProductcard from "./VenderProductcard";


const VenderProduct = () => {
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
        // FIX: Add a conditional check to ensure allVendors and allVendors.vendors exist
        if (allVendors && allVendors.vendors) {
            allVendors.vendors.forEach((vendor) => {
                map[vendor._id] = vendor.shopName;
            });
        }
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
            // **CRITICAL FIX: Ensure product.category is a string and not empty**
            if (typeof product.category === 'string' && product.category.length > 0) {
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
            let categoryName = "Other"; // Default value if category is not valid

            // **CRITICAL FIX: Ensure product.category is a string and not empty**
            if (typeof product.category === 'string' && product.category.length > 0) {
                categoryName = product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase();
            }

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
        // FIX: Access the 'vendors' array property on the allVendors object before calling find()
        const vendorData = allVendors?.vendors?.find(v => v._id === vendorId);
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

    // Styles for hiding scrollbars
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
        <div className="min-h-screen font-inter bg-black
            bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-50 to-transparent
            bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gray-50 to-transparent
            bg-[linear-gradient(to_top_left,_var(--tw-gradient-stops))] from-gray-100 to-transparent
            dark:bg-gray-900 overflow-visible ">
            <style>{hideScrollbarStyle}</style>

            {/* Desktop Filter Sidebar and Main Content Wrapper */}
            <div className="flex max-w-7xl mx-auto py-4 ">
                {/* Desktop Filter Sidebar (Commented out in original snippet) */}
                {/* <div className="hidden md:block w-72 pr-6 sticky top-0 h-screen overflow-y-auto hide-scrollbar z-30"> ... </div> */}

                {/* Main Content Area - Product Sections. This div IS THE SCROLLABLE PART. */}
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-8 md:ml-0 bg-black">
                    {/* Filter Button & View Mode Toggles for Mobile/Small Screens */}
                    {/* <div className="md:hidden sticky top-0 bg-white z-20 py-3 px-4 flex  bg-black justify-between items-center border-b border-gray-200 shadow-sm mb-6">
                        <div className="flex-1 flex justify-center space-x-3 bg-black">
                            <button
                                onClick={() => setViewMode("vendor")}
                                className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap shadow-md
                                    ${viewMode === "vendor" ? "bg-gradient-to-r from-black to-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black"}`}
                            >
                                <Store className="inline-block mr-1 " size={16} /> By Vendor
                            </button>
                            <button
                                onClick={() => setViewMode("category")}
                                className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap shadow-md
                                    ${viewMode === "category" ? "bg-gradient-to-r from-black to-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black"}`}
                            >
                                <Tag className="inline-block mr-1" size={16} /> By Category
                            </button>
                        </div>
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className={`ml-4 bg-gradient-to-r from-black to-gray-800 text-white font-bold py-2.5 px-5 rounded-full shadow-lg flex items-center text-sm transform transition-transform hover:scale-105`}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </button>
                    </div> */}

                    {Object.entries(groupedProducts)
                        .sort(([nameA], [nameB]) => {
                            const allKey = viewMode === "vendor" ? "All Shops" : "All Products";
                            if (nameA === allKey) return -1;
                            if (nameB === allKey) return 1;
                            return nameA.localeCompare(nameB);
                        })
                        .map(([name, products]) => (
                            <section key={name} ref={(el) => (scrollRefs.current[name] = el)} className="m-1 p-1 bg-black rounded-lg shadow-md bg-black">
                                <h2 className="text-xl font-bold text-black mb-2 p-2 flex w-100 ">
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
                                    <>
                                        {/* 💡 1. Small Screen (Mobile/sm) Layout: Vertical Grid (Y-Axis, 1 Card per row) */}
                                        <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-black">
                                            {products.map((product) => {
                                                const vendorId = product.vendorId || product.vendor?._id;
                                                const vendorData = allVendors?.vendors?.find(v => v._id === vendorId);
                                                const isVendorOffline = vendorData?.isOnline === false;
                                                return (
                                                    <VenderProductcard
                                                        key={product._id}
                                                        product={product}
                                                        onAddToCart={handleAddToCart}
                                                        vendorShopName={vendorMap[vendorId]}
                                                        // No fixed width, lets grid handle it
                                                        className="transform transition-transform duration-200 hover:scale-[1.02] shadow-sm hover:shadow-lg"
                                                        isVendorOffline={isVendorOffline}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {/* 2. Medium Screen (Web/md+) Layout: Horizontal Scroll (X-Axis) */}
                                        <div className="hidden md:flex md:overflow-x-auto hide-scrollbar pb-1 -mx-2 ml-2 bg-black">
                                            <div className="flex flex-nowrap gap-5 bg-black ">
                                                {products.map((product) => {
                                                    const vendorId = product.vendorId || product.vendor?._id;
                                                    const vendorData = allVendors?.vendors?.find(v => v._id === vendorId);
                                                    const isVendorOffline = vendorData?.isOnline === false;
                                                    return (
                                                        <VenderProductcard
                                                            key={product._id}
                                                            product={product}
                                                            onAddToCart={handleAddToCart}
                                                            vendorShopName={vendorMap[vendorId]}
                                                            // Fixed width and flex-shrink-0 for horizontal flow
                                                            className="flex-shrink-0 w-64 md:w-72 transform transition-transform duration-200 hover:scale-[1.02] shadow-sm hover:shadow-lg"
                                                            isVendorOffline={isVendorOffline}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </section>
                        ))}
                </div>
            </div>

            {/* Filter Modal (Mobile Only) - Uses ProductFilterSidebar with isModal=true */}

        </div>
    );
};

export default VenderProduct;