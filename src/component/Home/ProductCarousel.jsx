import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import NewProductCard from "./NewProductCard";

const ProductCarousel = ({ products, title, noResultsMessage, isHorizontal = true }) => {
    const allVendors = []; // Replace with useSelector
    const vendorMap = useMemo(() => {
        const map = {};
        allVendors?.forEach((vendor) => {
            map[vendor._id] = vendor;
        });
        return map;
    }, [allVendors]);

    if (products.length === 0) {
        return noResultsMessage ? (
            <div className="flex flex-col items-center justify-center py-5">
                <p className="mt-5 text-center text-base text-gray-600">{noResultsMessage}</p>
            </div>
        ) : null;
    }

    return (
        <div className="mb-20 mt-5">
            <h2 className="mb-2 pl-4 text-xl font-bold text-[#0A3D2B]">{title}</h2>
            <div
                className={`flex ${isHorizontal ? 'overflow-x-auto whitespace-nowrap' : 'flex-wrap'}`}
            >
                {products.map((item) => {
                    const vendorId = item.vendorId || item.vendor?._id || "";
                    const vendorData = vendorMap[vendorId];
                    const isVendorOffline = vendorData ? !vendorData.isOnline : true;
                    const isVendorOutOfRange = false;
                    return (
                        <NewProductCard
                            key={item._id}
                            product={item}
                            vendorShopName={vendorData?.shopName || "Unknown Shop"}
                            isVendorOffline={isVendorOffline}
                            isVendorOutOfRange={isVendorOutOfRange}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ProductCarousel;