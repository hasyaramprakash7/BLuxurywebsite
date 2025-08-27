import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVendorProducts } from "../features/vendor/vendorProductSlice";
import { fetchAllVendors } from "../features/vendor/vendorAuthSlice";
import { addOrUpdateItem } from "../features/cart/cartSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "./ProductCard"; // Not used in this version but kept for context
import { Filter, Store, Tag, ShoppingCart, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { FaSpinner, FaBoxOpen, FaPlus, FaMinus } from "react-icons/fa";
import ProductFilterSidebar from "./ProductFilterSidebar";
import { Swiper, SwiperSlide } from 'swiper/react'; // Not used in this version but kept for context
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import NewProductCard from "./NewProductCard";

const AllVendorProductData = () => {
    const dispatch = useDispatch();
    const [viewMode, setViewMode] = useState("vendor");
    const [activeSelection, setActiveSelection] = useState(
        viewMode === "vendor" ? "All Shops" : "All Products"
    );
    const [sortOrder, setSortOrder] = useState('default');
    const [maxAllowedPrice, setMaxAllowedPrice] = useState(10000);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showInStockOnly, setShowInStockOnly] = useState(false);
    const [minRating, setMinRating] = useState(0);

    const scrollRefs = useRef({});

    const { allProducts, loading, error } = useSelector((state) => state.vendorProducts);
    const user = useSelector((state) => state.auth.user);
    // Correctly access the vendors array from the state
    const allVendors = useSelector((state) => state.vendorAuth.allVendors?.vendors || []);

    useEffect(() => {
        dispatch(fetchAllVendorProducts());
        dispatch(fetchAllVendors());
    }, [dispatch]);

    const { overallMinProductPrice, overallMaxProductPrice } = useMemo(() => {
        if (!allProducts || allProducts.length === 0) {
            return { overallMinProductPrice: 0, overallMaxProductPrice: 10000 };
        }
        const prices = allProducts.map(p => p.discountedPrice || p.price);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        return { overallMinProductPrice: min, overallMaxProductPrice: Math.max(max, 100) };
    }, [allProducts]);

    useEffect(() => {
        if (!loading && allProducts.length > 0) {
            setMaxAllowedPrice(overallMaxProductPrice);
        }
    }, [loading, allProducts, overallMaxProductPrice]);

    useEffect(() => {
        setActiveSelection(viewMode === "vendor" ? "All Shops" : "All Products");
        setSortOrder('default');
        setMaxAllowedPrice(overallMaxProductPrice);
        setSelectedBrands([]);
        setShowInStockOnly(false);
        setMinRating(0);
    }, [viewMode, overallMaxProductPrice]);

    const vendorMap = useMemo(() => {
        const map = {};
        // The allVendors variable is now guaranteed to be an array
        allVendors.forEach((vendor) => {
            map[vendor._id] = { shopName: vendor.shopName, isOnline: vendor.isOnline };
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

    const applyFiltersAndSort = (productsArray) => {
        let filteredProducts = productsArray;

        // Apply Price Filter
        filteredProducts = filteredProducts.filter(product => {
            const price = product.discountedPrice || product.price;
            return price <= maxAllowedPrice;
        });

        // Apply Brand Filter
        if (selectedBrands.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
                selectedBrands.includes(product.brand)
            );
        }

        // Apply Stock Filter
        if (showInStockOnly) {
            filteredProducts = filteredProducts.filter(product => product.stock > 0);
        }

        // Apply Rating Filter
        if (minRating > 0) {
            filteredProducts = filteredProducts.filter(product => product.ratings >= minRating);
        }

        // Apply Sort
        const sortableProducts = [...filteredProducts];
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
        return filteredProducts;
    };

    const vendorShopNames = useMemo(() => {
        const onlineVendorNames = new Set();
        const offlineVendorNames = new Set();

        allProducts.forEach((product) => {
            const vendorId = product.vendor?._id || product.vendorId;
            if (vendorId && vendorMap[vendorId]) {
                if (vendorMap[vendorId].isOnline) {
                    onlineVendorNames.add(vendorMap[vendorId].shopName);
                } else {
                    offlineVendorNames.add(vendorMap[vendorId].shopName);
                }
            }
        });

        const sortedOnline = Array.from(onlineVendorNames).sort();
        const sortedOffline = Array.from(offlineVendorNames).sort();

        return ["All Shops", ...sortedOnline, ...sortedOffline];
    }, [allProducts, vendorMap]);

    const productsGroupedByVendor = useMemo(() => {
        const grouped = {};
        const filteredAndSortedAllProducts = applyFiltersAndSort(allProducts);
        grouped["All Shops"] = filteredAndSortedAllProducts;

        const tempGrouped = {};
        allProducts.forEach((product) => {
            const vendorId = product.vendor?._id || product.vendorId;
            const shopName = vendorId ? vendorMap[vendorId]?.shopName : "Other Vendors";

            if (shopName) {
                if (!tempGrouped[shopName]) {
                    tempGrouped[shopName] = [];
                }
                tempGrouped[shopName].push(product);
            }
        });

        const sortedVendorNamesForGrouping = [...vendorShopNames].filter(name => name !== "All Shops");
        sortedVendorNamesForGrouping.forEach(shopName => {
            if (tempGrouped[shopName]) {
                grouped[shopName] = applyFiltersAndSort(tempGrouped[shopName]);
            }
        });

        return grouped;
    }, [allProducts, vendorMap, sortOrder, maxAllowedPrice, selectedBrands, showInStockOnly, minRating, vendorShopNames]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set();
        allProducts.forEach((product) => {
            if (typeof product.category === 'string' && product.category) {
                uniqueCategories.add(product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase());
            }
        });
        return ["All Products", ...Array.from(uniqueCategories).sort()];
    }, [allProducts]);

    const productsGroupedByCategory = useMemo(() => {
        const grouped = {};
        const filteredAndSortedAllProducts = applyFiltersAndSort(allProducts);
        grouped["All Products"] = filteredAndSortedAllProducts;

        allProducts.forEach((product) => {
            const categoryName = (typeof product.category === 'string' && product.category)
                ? product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()
                : "Other";

            if (!grouped[categoryName]) {
                grouped[categoryName] = [];
            }
            grouped[categoryName].push(product);
        });

        for (const categoryName in grouped) {
            if (categoryName !== "All Products") {
                grouped[categoryName] = applyFiltersAndSort(grouped[categoryName]);
            }
        }
        return grouped;
    }, [allProducts, sortOrder, maxAllowedPrice, selectedBrands, showInStockOnly, minRating]);

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
        const vendorData = allVendors?.find(v => v._id === vendorId);
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
        <div className="min-h-screen font-inter bg-white pt-20
            bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-50 to-transparent
            bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gray-50 to-transparent
            bg-[linear-gradient(to_top_left,_var(--tw-gradient-stops))] from-gray-100 to-transparent
            dark:bg-gray-900 overflow-visible ">
            <style>{hideScrollbarStyle}</style>

            <div className="max-w-7xl mx-auto px-1 relative z-30">
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
                    isModal={false}
                    showInStockOnly={showInStockOnly}
                    setShowInStockOnly={setShowInStockOnly}
                    minRating={minRating}
                    setMinRating={setMinRating}
                />
            </div>

            <div className="max-w-7xl mx-auto flex px-1 pb-1 relative z-10">
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1 md:ml-0">
                    {Object.entries(groupedProducts)
                        .sort(([nameA], [nameB]) => {
                            const allKey = viewMode === "vendor" ? "All Shops" : "All Products";
                            if (nameA === allKey) return -1;
                            if (nameB === allKey) return 1;

                            if (viewMode === "vendor") {
                                const isAOnline = allVendors?.find(v => v.shopName === nameA)?.isOnline;
                                const isBOnline = allVendors?.find(v => v.shopName === nameB)?.isOnline;

                                if (isAOnline && !isBOnline) return -1;
                                if (!isAOnline && isBOnline) return 1;
                            }

                            return nameA.localeCompare(nameB);
                        })
                        .map(([name, products]) => {
                            if (products.length === 0 && name !== (viewMode === "vendor" ? "All Shops" : "All Products")) {
                                return null;
                            }

                            return (
                                <section key={name} ref={(el) => (scrollRefs.current[name] = el)} className="m-1 p-1 bg-white rounded-lg shadow-md">
                                    <h2 className="text-xl font-bold text-black mb-2 border-b border-gray-200 p-2 flex w-100 ">
                                        {viewMode === "vendor" ? <Store className="mr-2 text-gray-800 " size={24} /> : <Tag className="mr-2 text-gray-800 " size={24} />}

                                        <span className="bg-gradient-to-r from-[#005612] to-[#009632] bg-clip-text text-transparent">
                                            {name}
                                        </span>
                                    </h2>

                                    {products.length === 0 ? (
                                        <p className="text-gray-600 text-center py-8 text-lg">
                                            No products found for this {viewMode === "vendor" ? "vendor" : "category"} within the selected criteria.
                                            <br />Try adjusting your filters or selecting "All {viewMode === "vendor" ? "Shops" : "Products"}".
                                        </p>
                                    ) : (
                                        <div className="
                                                grid gap-5 p-2
                                                grid-cols-1 auto-cols-[minmax(250px,_1fr)] overflow-x-auto hide-scrollbar pb-1
                                                sm:grid-cols-2
                                                md:grid-cols-3 md:overflow-visible md:auto-cols-auto
                                                lg:grid-cols-3
                                                xl:grid-cols-3
                                            ">
                                            {products.map((product) => {
                                                const vendorId = product.vendorId || product.vendor?._id;
                                                const vendorData = allVendors?.find(v => v._id === vendorId);
                                                const isVendorOffline = vendorData?.isOnline === false;
                                                return (
                                                    <NewProductCard
                                                        key={product._id}
                                                        product={product}
                                                        onAddToCart={handleAddToCart}
                                                        vendorShopName={vendorMap[vendorId]?.shopName}
                                                        className="w-full h-full flex flex-col justify-between"
                                                        isVendorOffline={isVendorOffline}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                </div>
            </div>

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
                            showInStockOnly={showInStockOnly}
                            setShowInStockOnly={setShowInStockOnly}
                            minRating={minRating}
                            setMinRating={setMinRating}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllVendorProductData;