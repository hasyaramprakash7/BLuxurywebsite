import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProductCarousel from "./ProductCarousel";
import BackgroundImage from "../../../assert/assets/Gemini_Generated_Image_arkgbnarkgbnarkg.png";
// import LocalVideo1 from "../../assets/Gemino_Luxury_Video_Generation.mp4";

// NOTE: Tailwind CSS classes replace StyleSheet.create
// The logic from the original file is preserved

const getCategoryName = (fullCategoryName) => {
    const parts = fullCategoryName.split("_");
    if (fullCategoryName.toLowerCase().includes("hotels")) {
        if (parts.length >= 2) {
            return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
        }
    }
    return parts[parts.length - 1];
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const OrderBox = ({ productVideo, isLarge }) => (
    <div className={`relative w-full overflow-hidden bg-starbucksGreen ${isLarge ? 'h-[10vh]' : 'h-[10vh]'}`}>
        <div className={`relative h-full w-full justify-end`}>
            <video
                src={productVideo}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
            />
            <div className="absolute inset-0 bg-black opacity-30" />
            <div className="relative z-10 flex h-full items-end justify-between px-[4vw] py-[2vh]">
                {/* Content can be added here if needed */}
            </div>
        </div>
    </div>
);

const HorizontalCarousel = ({ title, data, onPressItem, renderItem }) => (
    <div className="mt-5">
        <h2 className="mb-4 px-5 text-xl font-bold text-textDarkBrown">{title}</h2>
        <div className="flex overflow-x-auto overflow-y-hidden px-5">
            {data.map((item, index) => (
                <button key={index} onClick={() => onPressItem(item)} className="mr-4 flex-shrink-0">
                    {renderItem(item, index)}
                </button>
            ))}
        </div>
    </div>
);

const HomeScreen = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Mocking Redux state and actions for a standalone example
    const allProducts = []; // Replace with useSelector
    const allVendors = []; // Replace with useSelector
    const productsLoading = false; // Replace with useSelector
    const vendorsLoading = false; // Replace with useSelector

    const [shuffledProducts, setShuffledProducts] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [isLocationLoading, setIsLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState(null);

    const vendorMap = useMemo(() => {
        const map = {};
        if (allVendors) {
            allVendors.forEach((vendor) => {
                map[vendor._id] = vendor;
            });
        }
        return map;
    }, [allVendors]);

    const fetchUserLocation = useCallback(async () => {
        setIsLocationLoading(true);
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setIsLocationLoading(false);
            return;
        }
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                });
            });
            setUserLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
        } catch (locError) {
            console.error("Error fetching user location:", locError);
            let errorMessage = "Could not get your location. Please check your browser's location settings.";
            if (locError.code === 1) {
                errorMessage = "Location permission was denied. Please enable it to see nearby shops.";
            }
            setLocationError(errorMessage);
        } finally {
            setIsLocationLoading(false);
        }
    }, []);

    useEffect(() => {
        // dispatch(fetchAllVendorProducts()); // Uncomment once Redux is set up
        // dispatch(fetchAllVendors()); // Uncomment once Redux is set up
        fetchUserLocation();
    }, [fetchUserLocation]);

    const inRangeVendors = useMemo(() => {
        if (!allVendors || !userLocation) return [];
        const vendorsWithDistance = allVendors
            .map((vendor) => {
                if (!vendor.address || vendor.address.latitude === undefined || vendor.address.longitude === undefined || vendor.deliveryRange === undefined || !vendor.isOnline) {
                    return null;
                }
                const distance = haversineDistance(userLocation.latitude, userLocation.longitude, vendor.address.latitude, vendor.address.longitude);
                return distance <= vendor.deliveryRange ? { ...vendor, distance } : null;
            })
            .filter(Boolean)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        return vendorsWithDistance;
    }, [allVendors, userLocation]);

    const uniqueShops = useMemo(() => {
        return inRangeVendors.map((vendor) => ({
            id: vendor._id,
            name: vendor.shopName,
            shopImageUrl: vendor.shopImage,
            distance: vendor.distance,
            address: vendor.address,
        }));
    }, [inRangeVendors]);

    const inRangeProducts = useMemo(() => {
        if (!allProducts || allProducts.length === 0 || !inRangeVendors || inRangeVendors.length === 0) return [];
        const inRangeVendorIds = inRangeVendors.map((vendor) => vendor._id);
        return allProducts.filter((product) => inRangeVendorIds.includes(product.vendorId));
    }, [allProducts, inRangeVendors]);

    const uniqueBrands = useMemo(() => {
        if (!inRangeProducts || inRangeProducts.length === 0) return [];
        const brandsMap = new Map();
        inRangeProducts.forEach((product) => {
            if (product.brandName && !brandsMap.has(product.brandName)) {
                const firstImageProduct = inRangeProducts.find((p) => p.brandName === product.brandName && p.images && p.images.length > 0);
                const imageUrl = firstImageProduct?.images?.[0];
                brandsMap.set(product.brandName, imageUrl);
            }
        });
        return Array.from(brandsMap.entries()).map(([name, imageUrl]) => ({
            name,
            imageUrl,
        }));
    }, [inRangeProducts]);

    const uniqueCategories = useMemo(() => {
        if (!inRangeProducts || inRangeProducts.length === 0) return [];
        const categoriesMap = new Map();
        inRangeProducts.forEach((product) => {
            if (product.category && !categoriesMap.has(product.category)) {
                const firstImageProduct = inRangeProducts.find((p) => p.category === product.category && p.images && p.images.length > 0);
                const imageUrl = firstImageProduct?.images?.[0];
                categoriesMap.set(product.category, imageUrl);
            }
        });
        return Array.from(categoriesMap.entries()).map(([name, imageUrl]) => ({
            name,
            imageUrl,
        }));
    }, [inRangeProducts]);

    const hotelsCategory = useMemo(() => {
        return uniqueCategories.filter((cat) => cat.name.toLowerCase().includes("hotels"));
    }, [uniqueCategories]);

    const otherCategories = useMemo(() => {
        return uniqueCategories.filter((cat) => !cat.name.toLowerCase().includes("hotels"));
    }, [uniqueCategories]);

    useEffect(() => {
        setShuffledProducts(shuffleArray(inRangeProducts.slice(0, 10)));
    }, [inRangeProducts]);

    const handleProfilePress = () => navigate("/profile");
    const handleShopListingsPress = () => navigate("/shop-listings");
    const handleShopPress = (shop) => navigate(`/shop-products/${shop.id}`, { state: { vendorName: shop.name } });
    const handleBrandPress = (brand) => navigate(`/brand-products/${brand.name}`);
    const handleCategoryPress = (category) => navigate(`/category-products/${category.name}`);

    const isLoading = productsLoading || vendorsLoading || isLocationLoading;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-1 flex-col items-center justify-center bg-white bg-opacity-70 py-5">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-starbucksDarkGreen" />
                    <p className="mt-2 text-base text-textDarkBrown">
                        {isLocationLoading ? "Finding your location..." : "Loading products..."}
                    </p>
                </div>
            );
        }
        if (locationError) {
            return (
                <div className="flex flex-1 flex-col items-center justify-center p-5 text-center bg-white bg-opacity-70">
                    <h2 className="mb-2 text-xl font-bold text-textDarkBrown">Location Error</h2>
                    <p className="text-base text-textDarkBrown">{locationError}</p>
                    <p className="mb-2 text-base text-textDarkBrown">
                        Please enable location services and try again.
                    </p>
                    <button onClick={fetchUserLocation} className="mt-5 rounded-md bg-starbucksGreen px-5 py-2.5">
                        <span className="text-base font-bold text-textWhite">Retry</span>
                    </button>
                </div>
            );
        }
        if (uniqueShops.length === 0) {
            return (
                <div className="flex flex-1 flex-col items-center justify-center p-5 text-center bg-white bg-opacity-70">
                    <h2 className="mb-2 text-xl font-bold text-textDarkBrown">No Shops Nearby!</h2>
                    <p className="text-base text-textDarkBrown">
                        Looks like no shops are currently delivering to your location.
                    </p>
                    <p className="mb-1 text-base leading-snug text-textDarkBrown">
                        Please check back later or adjust your location.
                    </p>
                </div>
            );
        }
        const videoSources = [];
        return (
            <div className="relative flex-1 overflow-y-auto">
                <div className="pb-8">
                    {videoSources.map((video, index) => (
                        <OrderBox
                            key={`video-${index}`}
                            productVideo={video.source}
                            isLarge={video.isLarge}
                        />
                    ))}

                    {uniqueShops.length > 0 && (
                        <HorizontalCarousel
                            title="Nearby Shops"
                            data={uniqueShops}
                            onPressItem={handleShopPress}
                            renderItem={(shop) => (
                                <div className="flex w-40 flex-shrink-0 flex-col items-center">
                                    {shop.shopImageUrl && typeof shop.shopImageUrl === "string" ? (
                                        <img
                                            src={shop.shopImageUrl}
                                            alt={shop.name}
                                            className="h-32 w-full rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-32 w-full items-center justify-center rounded-lg bg-gray-500">
                                            <span className="text-3xl font-bold text-white">
                                                {shop.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <p className="mt-2 text-sm font-semibold text-textDarkBrown">{shop.name}</p>
                                    {shop.distance !== undefined && (
                                        <p className="mt-1 text-xs text-gray-500">{shop.distance.toFixed(2)} km</p>
                                    )}
                                </div>
                            )}
                        />
                    )}

                    {uniqueBrands.length > 0 && (
                        <HorizontalCarousel
                            title="Brands"
                            data={uniqueBrands}
                            onPressItem={handleBrandPress}
                            renderItem={(brand) => (
                                <div className="flex w-40 flex-shrink-0 flex-col items-center">
                                    <img
                                        src={brand.imageUrl || "https://via.placeholder.com/150"}
                                        alt={brand.name}
                                        className="h-32 w-full rounded-lg object-cover"
                                    />
                                    <p className="mt-2 text-sm font-semibold text-textDarkBrown">{brand.name}</p>
                                </div>
                            )}
                        />
                    )}

                    {hotelsCategory.length > 0 && (
                        <HorizontalCarousel
                            title="Hotels"
                            data={hotelsCategory}
                            onPressItem={handleCategoryPress}
                            renderItem={(category) => (
                                <div className="flex w-40 flex-shrink-0 flex-col items-center">
                                    <img
                                        src={category.imageUrl || "https://via.placeholder.com/150"}
                                        alt={getCategoryName(category.name)}
                                        className="h-32 w-full rounded-lg object-cover"
                                    />
                                    <p className="mt-2 text-sm font-semibold text-textDarkBrown">
                                        {getCategoryName(category.name)}
                                    </p>
                                </div>
                            )}
                        />
                    )}

                    {otherCategories.length > 0 && (
                        <div className="mt-5">
                            <h2 className="mb-4 px-5 text-xl font-bold text-textDarkBrown">Other Categories</h2>
                            <div className="mx-auto flex flex-wrap justify-center px-5">
                                {otherCategories.map((category, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleCategoryPress(category)}
                                        className="m-[2.5%] w-[45%] flex-shrink-0 flex-col items-center"
                                    >
                                        <img
                                            src={category.imageUrl || "https://via.placeholder.com/150"}
                                            alt={getCategoryName(category.name)}
                                            className="h-4/5 w-full rounded-lg object-cover"
                                        />
                                        <p className="mt-2 text-sm font-semibold text-textDarkBrown">
                                            {getCategoryName(category.name)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {shuffledProducts.length > 0 && (
                        <ProductCarousel
                            products={shuffledProducts}
                            title="Nearby Products"
                            noResultsMessage="No products available in your area."
                            isHorizontal={true}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            className="relative flex h-screen w-screen flex-col overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
            <div className="flex flex-1 flex-col bg-transparent">
                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-transparent py-4 md:py-8">
                    <div className="-ml-4 flex h-12 w-16 items-start justify-center rounded-r-full bg-[#0A3D2B] pl-4">
                        <button onClick={handleShopListingsPress}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-textWhite" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                        </button>
                    </div>
                    <div className="-mr-4 flex h-12 w-16 items-end justify-center rounded-l-full bg-[#0A3D2B] pr-4">
                        <button onClick={handleProfilePress}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-textWhite" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.93 0 3.5 1.57 3.5 3.5S13.93 12 12 12s-3.5-1.57-3.5-3.5S10.07 5 12 5zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="mt-20 flex-1 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;