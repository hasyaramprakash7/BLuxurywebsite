import React, { useState, useEffect, useRef } from "react";
import { Filter, SortAsc, DollarSign, Store, Tag, RotateCcw, ChevronDown, ChevronRight, Star, PackageCheck, X } from "lucide-react";
import { toast } from "react-toastify";

const ProductFilterSidebar = ({
    viewMode,
    setViewMode,
    activeSelection,
    handleItemClick,
    sortOrder,
    setSortOrder,
    maxAllowedPrice,
    setMaxAllowedPrice,
    selectedBrands,
    setSelectedBrands,
    allBrands,
    overallMinProductPrice,
    overallMaxProductPrice,
    sidebarItems,
    titlePrefix,
    isModal = false,
    showInStockOnly,
    setShowInStockOnly,
    minRating,
    setMinRating
}) => {
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [expandedSections, setExpandedSections] = useState({
        price: true,
        rating: true,
        brands: true
    });

    const sortDropdownRef = useRef(null);
    const sidebarRef = useRef(null);

    const allOptionText = viewMode === "vendor" ? "All Shops" : "All Products";

    // Toggle section expansion
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    useEffect(() => {
        if (isModal) return;
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModal]);

    useEffect(() => {
        if (isModal) return;

        const handleScroll = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsVisible(false);
                }
                else if (currentScrollY < lastScrollY || currentScrollY <= 0) {
                    setIsVisible(true);
                }
                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY, isModal]);

    const handleSortChange = (value) => {
        setSortOrder(value);
        if (!isModal) setShowSortDropdown(false);
    };

    const resetAllFilters = () => {
        setSortOrder('default');
        setMaxAllowedPrice(overallMaxProductPrice);
        setSelectedBrands([]);
        setShowInStockOnly(false);
        setMinRating(0);
        toast.info("All filters reset!", { position: "bottom-right" });
        if (!isModal) setShowSortDropdown(false);
    };

    // Active filter count for badge
    const activeFilterCount = [
        sortOrder !== 'default',
        maxAllowedPrice !== overallMaxProductPrice,
        selectedBrands.length > 0,
        showInStockOnly,
        minRating > 0
    ].filter(Boolean).length;

    // Class for active selection
    const activeClass = "bg-[#005612] text-white";
    const defaultButtonClass = "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200";
    const selectedOutlineClass = "border-2 border-[#005612] text-[#005612] font-semibold";

    const containerClasses = isModal
        ? "w-full p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
        : `w-full bg-white border-b border-gray-200 py-3 px-4 shadow-sm fixed top-0 sm:top-16 left-0 z-10 flex flex-col sm:flex-row items-center justify-between transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`;

    const dropdownContentClasses = isModal
        ? "relative mt-2 p-2 bg-gray-50 rounded-md"
        : "absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[240px] py-1";

    return (
        <>
            <style jsx="true">{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                /* Enhanced slider styles */
                input[type="range"] {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: #e0e0e0;
                    outline: none;
                }
                
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #005612;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.2s ease;
                }
                
                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                
                input[type="range"]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #005612;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                /* Custom checkbox */
                .custom-checkbox {
                    position: relative;
                    width: 18px;
                    height: 18px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    transition: all 0.2s;
                }
                
                .custom-checkbox.checked {
                    background-color: #005612;
                    border-color: #005612;
                }
                
                .custom-checkbox.checked::after {
                    content: '';
                    position: absolute;
                    left: 6px;
                    top: 2px;
                    width: 4px;
                    height: 9px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                /* Rating stars */
                .rating-star {
                    color: #d1d5db;
                    transition: color 0.2s;
                }
                
                .rating-star.active {
                    color: #f59e0b;
                }
                
                .rating-star.hovered {
                    color: #f59e0b;
                }
            `}</style>

            <div ref={sidebarRef} className={containerClasses}>
                {isModal ? (
                    // --- Modal Layout ---
                    <div className="flex flex-col space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                            <button
                                onClick={() => {/* close modal handler here */ }}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* View Mode Toggles */}
                        <div className="flex space-x-2 border-b border-gray-200 pb-4">
                            <button
                                onClick={() => setViewMode("vendor")}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                                    ${viewMode === "vendor" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                <Store className="mr-2" size={16} /> By Vendor
                            </button>
                            <button
                                onClick={() => setViewMode("category")}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                                    ${viewMode === "category" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                <Tag className="mr-2" size={16} /> By Category
                            </button>
                        </div>

                        {/* Categories/Vendors List */}
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{titlePrefix}</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {sidebarItems.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No {viewMode === 'vendor' ? 'vendors' : 'categories'} available.</p>
                                ) : (
                                    sidebarItems.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => handleItemClick(item)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-left
                                                ${activeSelection === item ? activeClass : defaultButtonClass}`}
                                        >
                                            {item}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sort Order */}
                        <div className="pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sort By</h3>
                            <div className="space-y-2">
                                {['default', 'asc', 'desc'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleSortChange(option)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                                            ${sortOrder === option ? activeClass : defaultButtonClass}`}
                                    >
                                        {option === 'default' ? 'Featured' :
                                            option === 'asc' ? 'Price: Low to High' : 'Price: High to Low'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="pb-4 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <h3
                                    className="text-lg font-semibold text-gray-900 cursor-pointer"
                                    onClick={() => toggleSection('price')}
                                >
                                    Price Range
                                </h3>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${expandedSections.price ? '' : 'rotate-180'}`}
                                />
                            </div>

                            {expandedSections.price && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">₹{overallMinProductPrice}</span>
                                        <span className="text-sm font-medium text-gray-700">₹{maxAllowedPrice}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={overallMinProductPrice}
                                        max={overallMaxProductPrice}
                                        value={maxAllowedPrice}
                                        onChange={(e) => setMaxAllowedPrice(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Availability */}
                        <div className="pb-4 border-b border-gray-200">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <div
                                    className={`custom-checkbox ${showInStockOnly ? 'checked' : ''}`}
                                    onClick={() => setShowInStockOnly(!showInStockOnly)}
                                ></div>
                                <span className="text-sm font-medium text-gray-900">In Stock Only</span>
                            </label>
                        </div>

                        {/* Rating */}
                        <div className="pb-4 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <h3
                                    className="text-lg font-semibold text-gray-900 cursor-pointer"
                                    onClick={() => toggleSection('rating')}
                                >
                                    Customer Rating
                                </h3>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${expandedSections.rating ? '' : 'rotate-180'}`}
                                />
                            </div>

                            {expandedSections.rating && (
                                <div className="space-y-2">
                                    {[4, 3, 2, 1].map((rating) => (
                                        <button
                                            key={`rating-${rating}`}
                                            onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center
                                                ${minRating >= rating ? activeClass : defaultButtonClass}`}
                                        >
                                            <div className="flex mr-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={`mr-0.5 ${star <= rating ? 'fill-current' : ''} ${minRating >= rating ? 'text-white' : 'text-yellow-400'}`}
                                                    />
                                                ))}
                                            </div>
                                            {rating}+ Stars
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Brands */}
                        {allBrands.length > 0 && (
                            <div className="pb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3
                                        className="text-lg font-semibold text-gray-900 cursor-pointer"
                                        onClick={() => toggleSection('brands')}
                                    >
                                        Brands
                                    </h3>
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform ${expandedSections.brands ? '' : 'rotate-180'}`}
                                    />
                                </div>

                                {expandedSections.brands && (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
                                        {allBrands.map(brand => (
                                            <label key={brand} className="flex items-center space-x-3 cursor-pointer">
                                                <div
                                                    className={`custom-checkbox ${selectedBrands.includes(brand) ? 'checked' : ''}`}
                                                    onClick={() => {
                                                        if (selectedBrands.includes(brand)) {
                                                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                                        } else {
                                                            setSelectedBrands([...selectedBrands, brand]);
                                                        }
                                                    }}
                                                ></div>
                                                <span className="text-sm font-medium text-gray-900 capitalize">{brand}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={resetAllFilters}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={() => {/* apply filters handler here */ }}
                                className="flex-1 py-2.5 bg-[#005612] text-white font-medium rounded-lg hover:bg-[#004610] transition-colors duration-200"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- Horizontal Bar Layout ---
                    <div className="flex flex-col sm:flex-row justify-between items-center w-full">
                        {/* View Mode Toggles */}
                        <div className="flex space-x-2 mb-3 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
                            <button
                                onClick={() => setViewMode("vendor")}
                                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center
                                    ${viewMode === "vendor" ? selectedOutlineClass : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"}`}
                            >
                                <Store className="mr-1" size={14} /> Vendors
                            </button>
                            <button
                                onClick={() => setViewMode("category")}
                                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center
                                    ${viewMode === "category" ? selectedOutlineClass : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"}`}
                            >
                                <Tag className="mr-1" size={14} /> Categories
                            </button>
                        </div>

                        {/* Categories/Vendors List */}
                        <div className="flex-1 overflow-x-auto hide-scrollbar px-2 sm:px-4 flex items-center justify-center w-full sm:w-auto">
                            <div className="flex flex-nowrap space-x-2">
                                <button
                                    onClick={() => handleItemClick(allOptionText)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap
                                        ${activeSelection === allOptionText ? activeClass : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    {allOptionText}
                                </button>
                                {sidebarItems.filter(item => item !== allOptionText).map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => handleItemClick(item)}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap
                                            ${activeSelection === item ? activeClass : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Button with Badge */}
                        <div ref={sortDropdownRef} className="relative flex-shrink-0 mt-3 sm:mt-0 w-full sm:w-auto text-right">
                            <button
                                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 flex items-center justify-center sm:justify-end whitespace-nowrap w-full"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                            >
                                <Filter size={14} className="mr-1" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-1.5 bg-[#005612] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                                <ChevronDown size={14} className={`ml-1 transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showSortDropdown && (
                                <div className={dropdownContentClasses}>
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <h4 className="text-sm font-semibold text-gray-900">Sort By</h4>
                                        <div className="mt-2 space-y-1">
                                            {['default', 'asc', 'desc'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => handleSortChange(option)}
                                                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors duration-150
                                                        ${sortOrder === option ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
                                                >
                                                    {option === 'default' ? 'Featured' :
                                                        option === 'asc' ? 'Price: Low to High' : 'Price: High to Low'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <h4 className="text-sm font-semibold text-gray-900">Price Range</h4>
                                        <div className="mt-2">
                                            <input
                                                type="range"
                                                min={overallMinProductPrice}
                                                max={overallMaxProductPrice}
                                                value={maxAllowedPrice}
                                                onChange={(e) => setMaxAllowedPrice(Number(e.target.value))}
                                                className="w-full mt-2"
                                            />
                                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                <span>₹{overallMinProductPrice}</span>
                                                <span>₹{maxAllowedPrice}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <div
                                                className={`custom-checkbox ${showInStockOnly ? 'checked' : ''}`}
                                                onClick={() => setShowInStockOnly(!showInStockOnly)}
                                            ></div>
                                            <span className="text-xs font-medium text-gray-900">In Stock Only</span>
                                        </label>
                                    </div>

                                    <div className="px-4 py-2">
                                        <h4 className="text-sm font-semibold text-gray-900">Rating</h4>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {[4, 3].map((rating) => (
                                                <button
                                                    key={`rating-drop-${rating}`}
                                                    onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                                                    className={`px-2 py-1 rounded text-xs transition-colors duration-150 flex items-center
                                                        ${minRating >= rating ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                                >
                                                    {rating}<Star size={10} className="ml-0.5 fill-current" />+
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 px-4 py-2">
                                        <button
                                            onClick={resetAllFilters}
                                            className="w-full text-left text-xs font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center justify-center py-1.5"
                                        >
                                            <RotateCcw size={12} className="mr-1" /> Reset All
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProductFilterSidebar;