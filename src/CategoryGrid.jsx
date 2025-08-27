import React, { useState } from "react";

// Import all images from your assets folder
import img1 from '../assert/WhatsApp Image 2025-08-26 at 22.45.19_a9da8536.jpg';
import img2 from '../assert/WhatsApp Image 2025-08-26 at 22.45.20_0bca6325.jpg';
import img3 from '../assert/WhatsApp Image 2025-08-26 at 22.45.20_8825e190.jpg';
import img4 from '../assert/WhatsApp Image 2025-08-26 at 22.45.20_c41d0c59.jpg';
import img5 from '../assert/WhatsApp Image 2025-08-26 at 22.45.21_5aaf6e0a.jpg';
import img6 from '../assert/WhatsApp Image 2025-08-26 at 22.45.21_20df85d4.jpg';
import img7 from '../assert/WhatsApp Image 2025-08-26 at 22.45.21_80c56c8c.jpg';
import img8 from '../assert/WhatsApp Image 2025-08-26 at 22.45.21_b8750d26.jpg';
import img9 from '../assert/WhatsApp Image 2025-08-26 at 22.45.22_37e67053.jpg';
import img10 from '../assert/WhatsApp Image 2025-08-26 at 22.45.22_60cd11f6.jpg';
import img11 from '../assert/WhatsApp Image 2025-08-26 at 22.45.22_867b6b7c.jpg';
import img12 from '../assert/WhatsApp Image 2025-08-26 at 22.45.23_119aa440.jpg';
import img13 from '../assert/WhatsApp Image 2025-08-26 at 22.45.23_454b2d55.jpg';
import img14 from '../assert/WhatsApp Image 2025-08-26 at 22.45.23_cd29605e.jpg';
import img15 from '../assert/WhatsApp Image 2025-08-26 at 22.45.24_9e9a8f49.jpg';
import img16 from '../assert/WhatsApp Image 2025-08-26 at 22.45.24_8906d439.jpg';
import img17 from '../assert/WhatsApp Image 2025-08-26 at 22.45.24_99376c67.jpg';
import img18 from '../assert/WhatsApp Image 2025-08-26 at 22.45.25_2f228949.jpg';
import img19 from '../assert/WhatsApp Image 2025-08-26 at 22.45.25_24c6b9bf.jpg';
import img20 from '../assert/WhatsApp Image 2025-08-26 at 22.45.26_98353603.jpg';

// Combine all images and their data into a single array
const categories = [
    { id: '1', name: 'Formal', image: img1 },
    { id: '2', name: 'Snacks', image: img2 },
    { id: '3', name: 'Biscuits', image: img3 },
    { id: '4', name: 'Watches', image: img4 },
    { id: '5', name: 'Shirts', image: img5 },
    { id: '6', name: 'Dresses', image: img6 },
    { id: '7', name: 'Furniture', image: img7 },
    { id: '8', name: 'Laptop', image: img8 },
    { id: '9', name: 'Hotels', image: img9 },
    { id: '10', name: 'Cookware', image: img10 },
    { id: '11', name: 'Frozen Food', image: img11 },
    { id: '12', name: 'Hotels', image: img12 },
    { id: '13', name: "Men's Wear", image: img13 },
    { id: '14', name: "Women's Fashion", image: img14 },
    { id: '15', name: 'Interior', image: img15 },
    { id: '16', name: 'Bags', image: img16 },
    { id: '17', name: 'Brands', image: img17 },
    { id: '18', name: 'Luxury', image: img18 },
    { id: '19', name: 'Cosmetics', image: img19 },
    { id: '20', name: 'Shoes', image: img20 },
];

const CategoryGrid = () => {
    // State to hold the selected image object for the full-screen view
    const [selectedImage, setSelectedImage] = useState(null);

    // Handler to open the modal
    const openImage = (category) => {
        setSelectedImage(category);
    };

    // Handler to close the modal
    const closeImage = () => {
        setSelectedImage(null);
    };

    return (
        <div className="bg-black text-white p-5 font-sans">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
                All Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    // Attach onClick handler to the div to open the modal
                    <div
                        key={category.id}
                        onClick={() => openImage(category)}
                        className="group block text-center no-underline cursor-pointer"
                    >
                        <div className="bg-black rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg">
                            <div className="w-full h-[75vh] overflow-hidden">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-85"
                                />
                            </div>
                            <span className="p-2 text-sm md:text-base font-semibold block text-white">
                                {category.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Conditionally render the full-screen modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[1000]"
                    onClick={closeImage}
                >
                    <div
                        className="relative max-w-[90%] max-h-[90%]"
                        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking the image
                    >
                        <span
                            className="absolute top-5 right-8 text-white text-4xl font-bold cursor-pointer z-[1001]"
                            onClick={closeImage}
                        >
                            &times;
                        </span>
                        <img
                            src={selectedImage.image}
                            alt={selectedImage.name}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryGrid;