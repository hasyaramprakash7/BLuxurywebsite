import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMyProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    clearError,
} from "../features/vendor/vendorProductSlice";
import { categories } from "./categories";
import { FaImage, FaPencilAlt, FaTrash } from "react-icons/fa";
import { IoArrowBack, IoCloseCircle } from "react-icons/io5";

// Simplified mock for ImagePicker for web to work with the button
const imagePicker = {
    launchImageLibraryAsync: (options) => {
        return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            if (options.allowsMultipleSelection) {
                input.multiple = true;
            }
            input.onchange = (event) => {
                const assets = Array.from(event.target.files).map((file) => ({
                    uri: URL.createObjectURL(file),
                    file: file,
                    isNew: true, // Tag new files
                }));
                resolve({ canceled: false, assets });
            };
            input.click();
        });
    },
};

const initialFormState = {
    name: "",
    description: "",
    brandName: "",
    price: "",
    discountedPrice: "",
    discountPercent: "",
    category: "",
    stock: "",
    isAvailable: true,
    bulkPrice: "",
    bulkMinimumUnits: "",
    largeQuantityPrice: "",
    largeQuantityMinimumUnits: "",
};

export default function VendorProductCRUDScreen() {
    const dispatch = useDispatch();
    const {
        myProducts: products,
        loading,
        error,
    } = useSelector((state) => state.vendorProducts);
    const { vendor } = useSelector((state) => state.vendorAuth);

    const [form, setForm] = useState(initialFormState);
    const [selectedMainCategory, setSelectedMainCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [productImages, setProductImages] = useState([]); // Consolidated image state
    const [editingId, setEditingId] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentLevel, setCurrentLevel] = useState("main");
    const [filterQuery, setFilterQuery] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // New state for search

    useEffect(() => {
        if (vendor?._id) {
            dispatch(fetchMyProducts());
        }
    }, [dispatch, vendor]);

    useEffect(() => {
        if (error) {
            alert("An Error Occurred: " + error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const resetForm = () => {
        setForm(initialFormState);
        setSelectedMainCategory("");
        setSelectedSubCategory("");
        setProductImages([]);
        setEditingId(null);
    };

    const handleNewImages = (files) => {
        const newAssets = Array.from(files).map((file) => ({
            uri: URL.createObjectURL(file),
            file: file,
            isNew: true,
        }));
        setProductImages((prev) => [...prev, ...newAssets]);
    };

    const handlePickImages = async () => {
        const result = await imagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            handleNewImages(result.assets.map(a => a.file));
        }
    };

    const handleRemoveImage = (uriToRemove) => {
        setProductImages((prevImages) =>
            prevImages.filter((img) => img.uri !== uriToRemove)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for required fields
        if (!form.name || !form.price || !form.stock) {
            alert("Validation Error: Please fill Name, Price, and Stock.");
            return;
        }

        const brandName = form.brandName.trim();
        if (brandName.length > 0 && (brandName.length < 2 || brandName.length > 50)) {
            alert("Validation Error: Brand Name must be between 2 and 50 characters, or empty.");
            return;
        }

        // Check if a category has been selected for new products
        if (!editingId && !selectedMainCategory) {
            alert("Validation Error: Please select a category.");
            return;
        }

        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            if (form[key] !== "") {
                formData.append(key, form[key]);
            }
        });

        // The final category string is constructed based on the selected categories
        let finalCategory = selectedMainCategory;
        if (selectedSubCategory) {
            finalCategory += `_${selectedSubCategory}`;
        }
        if (form.category) {
            finalCategory += `_${form.category}`;
        }
        formData.set("category", finalCategory);

        const newImageFiles = productImages.filter(img => img.isNew).map(img => img.file);

        newImageFiles.forEach((file) => {
            formData.append("images", file);
        });

        try {
            if (editingId) {
                await dispatch(
                    updateProduct({
                        id: editingId,
                        formData,
                    })
                ).unwrap();
                alert("Success: Product updated!");
            } else {
                await dispatch(addProduct(formData)).unwrap();
                alert("Success: Product added!");
            }
            resetForm();
        } catch (err) {
            alert(`Operation Failed: ${err?.message || "An unknown error occurred."}`);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);

        const categoryString = product.category || "";
        const categoryParts = categoryString.split('_');

        const parsedMainCategory = categoryParts[0] || "";
        const parsedSubCategory = categoryParts[1] || "";
        const parsedSubSubCategory = categoryParts.slice(2).join('_') || "";

        setSelectedMainCategory(parsedMainCategory);
        setSelectedSubCategory(parsedSubCategory);
        setForm({
            name: product.name || "",
            description: product.description || "",
            brandName: product.brandName || "",
            price: product.price !== undefined ? String(product.price) : "",
            discountedPrice: product.discountedPrice !== undefined ? String(product.discountedPrice) : "",
            discountPercent: product.discountPercent !== undefined ? String(product.discountPercent) : "",
            category: parsedSubSubCategory,
            stock: product.stock !== undefined ? String(product.stock) : "",
            isAvailable: product.isAvailable,
            bulkPrice: product.bulkPrice !== undefined ? String(product.bulkPrice) : "",
            bulkMinimumUnits: product.bulkMinimumUnits !== undefined ? String(product.bulkMinimumUnits) : "",
            largeQuantityPrice: product.largeQuantityPrice !== undefined ? String(product.largeQuantityPrice) : "",
            largeQuantityMinimumUnits: product.largeQuantityMinimumUnits !== undefined ? String(product.largeQuantityMinimumUnits) : "",
        });

        // Set the product images, tagging them as not new
        const existingImages = (product.images || []).map(uri => ({ uri, isNew: false }));
        setProductImages(existingImages);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            dispatch(deleteProduct(id));
        }
    };

    const handleSelectCategory = (value) => {
        if (currentLevel === "main") {
            setSelectedMainCategory(value);
            setSelectedSubCategory("");
            setForm((prev) => ({ ...prev, category: "" }));

            const nextLevelData = categories[value];
            if (nextLevelData && typeof nextLevelData === 'object' && !Array.isArray(nextLevelData)) {
                setCurrentLevel("sub");
            } else {
                setForm((prev) => ({ ...prev, category: value }));
                setIsModalVisible(false);
            }
        } else if (currentLevel === "sub") {
            setSelectedSubCategory(value);
            setForm((prev) => ({ ...prev, category: "" }));

            const nextLevelData = categories[selectedMainCategory]?.[value];
            if (nextLevelData && Array.isArray(nextLevelData) && nextLevelData.length > 0) {
                setCurrentLevel("sub-sub");
            } else {
                setIsModalVisible(false);
            }
        } else if (currentLevel === "sub-sub") {
            setForm((prev) => ({ ...prev, category: value }));
            setIsModalVisible(false);
        }
        setFilterQuery("");
    };

    const getCategoryOptions = () => {
        let options = [];
        let currentCategoryData = {};

        if (currentLevel === "main") {
            currentCategoryData = categories;
        } else if (currentLevel === "sub" && selectedMainCategory) {
            currentCategoryData = categories[selectedMainCategory];
        } else if (currentLevel === "sub-sub" && selectedMainCategory && selectedSubCategory) {
            const subCategoryData = categories[selectedMainCategory]?.[selectedSubCategory];
            if (Array.isArray(subCategoryData)) {
                options = subCategoryData;
            }
        }

        if (currentLevel !== "sub-sub") {
            options = Object.keys(currentCategoryData);
        }

        return options.filter((option) =>
            option.toLowerCase().includes(filterQuery.toLowerCase())
        );
    };

    const getCategoryLabel = () => {
        if (currentLevel === "main") return "Main Category";
        if (currentLevel === "sub") return "Subcategory";
        if (currentLevel === "sub-sub") return "Sub-Subcategory";
        return "";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleNewImages(e.dataTransfer.files);
        }
    };

    // Filter products based on search query
    const filteredProducts = products.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            p.brandName.toLowerCase().includes(query) ||
            p.category.toLowerCase().replace(/_/g, ' ').includes(query)
        );
    });

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-serif">
            <div className="flex items-center justify-center mb-5 relative">
                <button
                    onClick={() => window.history.back()}
                    className="absolute left-0 p-1"
                >
                    <IoArrowBack size={24} color="#333" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900 text-center flex-1">
                    Product Management
                </h1>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-8">
                {/* Form Section */}
                <div className="md:w-1/2 flex-shrink-0">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md mb-6 md:mb-0">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingId ? "Edit Product" : "Add New Product"}
                        </h2>
                        <CustomTextInput
                            label="Name*"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                        />
                        <CustomTextInput
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            isTextArea
                        />
                        <CustomTextInput
                            label="Brand Name"
                            name="brandName"
                            value={form.brandName}
                            onChange={handleChange}
                        />
                        <CustomTextInput
                            label="Price (₹)*"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            type="number"
                        />
                        <CustomTextInput
                            label="Discounted Price (₹)"
                            name="discountedPrice"
                            value={form.discountedPrice}
                            onChange={handleChange}
                            type="number"
                        />
                        <CustomTextInput
                            label="Discount Percent (%)"
                            name="discountPercent"
                            value={form.discountPercent}
                            onChange={handleChange}
                            type="number"
                        />
                        <CustomTextInput
                            label="Stock*"
                            name="stock"
                            value={form.stock}
                            onChange={handleChange}
                            type="number"
                        />

                        <p className="text-gray-600 mb-2">Category Selection</p>
                        <button
                            type="button"
                            className="w-full border border-gray-200 p-3 rounded-md bg-gray-50 text-left mb-4"
                            onClick={() => {
                                setCurrentLevel("main");
                                setIsModalVisible(true);
                            }}
                        >
                            <span className="text-gray-900 text-base">
                                {selectedMainCategory || "-- Select Main Category --"}
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`w-full border border-gray-200 p-3 rounded-md bg-gray-50 text-left mb-4 ${!selectedMainCategory || Array.isArray(categories[selectedMainCategory]) ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""}`}
                            onClick={() => {
                                if (selectedMainCategory && typeof categories[selectedMainCategory] === 'object' && !Array.isArray(categories[selectedMainCategory])) {
                                    setCurrentLevel("sub");
                                    setIsModalVisible(true);
                                }
                            }}
                            disabled={!selectedMainCategory || Array.isArray(categories[selectedMainCategory])}
                        >
                            <span className="text-gray-900 text-base">
                                {selectedSubCategory || "-- Select Subcategory --"}
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`w-full border border-gray-200 p-3 rounded-md bg-gray-50 text-left mb-4 ${!selectedSubCategory || !categories[selectedMainCategory]?.[selectedSubCategory] || !Array.isArray(categories[selectedMainCategory]?.[selectedSubCategory]) ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""}`}
                            onClick={() => {
                                const subCategoryData = categories[selectedMainCategory]?.[selectedSubCategory];
                                if (subCategoryData && Array.isArray(subCategoryData) && subCategoryData.length > 0) {
                                    setCurrentLevel("sub-sub");
                                    setIsModalVisible(true);
                                }
                            }}
                            disabled={!selectedSubCategory || !categories[selectedMainCategory]?.[selectedSubCategory] || !Array.isArray(categories[selectedMainCategory]?.[selectedSubCategory])}
                        >
                            <span className="text-gray-900 text-base">
                                {form.category || "-- Select Sub-Subcategory (Optional) --"}
                            </span>
                        </button>

                        {editingId && products.find((p) => p._id === editingId)?.category && (
                            <div className="flex items-center flex-wrap mb-4 -mt-1">
                                <span className="text-gray-600 mr-1">Current Category:</span>
                                <span className="font-bold text-gray-900">
                                    {products.find((p) => p._id === editingId)?.category.replace(/_/g, " ")}
                                </span>
                            </div>
                        )}

                        <h2 className="text-lg font-bold text-green-800 mt-5 mb-2 border-t pt-4 border-gray-200">
                            Bulk Pricing (Optional)
                        </h2>
                        <CustomTextInput
                            label="Bulk Price (₹)"
                            name="bulkPrice"
                            value={form.bulkPrice}
                            onChange={handleChange}
                            type="number"
                        />
                        <CustomTextInput
                            label="Minimum Units for Bulk Price"
                            name="bulkMinimumUnits"
                            value={form.bulkMinimumUnits}
                            onChange={handleChange}
                            type="number"
                        />
                        <h2 className="text-lg font-bold text-green-800 mt-5 mb-2 border-t pt-4 border-gray-200">
                            Large Quantity Pricing (Optional)
                        </h2>
                        <CustomTextInput
                            label="Large Qty Price (₹)"
                            name="largeQuantityPrice"
                            value={form.largeQuantityPrice}
                            onChange={handleChange}
                            type="number"
                        />
                        <CustomTextInput
                            label="Minimum Units for Large Qty"
                            name="largeQuantityMinimumUnits"
                            value={form.largeQuantityMinimumUnits}
                            onChange={handleChange}
                            type="number"
                        />

                        <div className="flex justify-between items-center py-2">
                            <p className="text-gray-600">Is Available</p>
                            <input
                                type="checkbox"
                                name="isAvailable"
                                checked={form.isAvailable}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-green-800 rounded-full border-gray-300 focus:ring-green-800"
                            />
                        </div>

                        <div
                            className={`w-full p-6 rounded-md mb-3 border-2 border-dashed transition-colors duration-200 ${isDragging ? 'border-yellow-600 bg-yellow-50' : 'border-gray-300 bg-white'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handlePickImages}
                            role="button"
                        >
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <FaImage size={24} className={`text-gray-500 ${isDragging ? 'text-yellow-600' : ''}`} />
                                <p className={`text-center text-sm ${isDragging ? 'text-yellow-600' : 'text-gray-600'}`}>
                                    {isDragging ? "Drop images here..." : "Drag and drop images here or click to select"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap mt-2">
                            {productImages.map((image, index) => (
                                <div key={image.uri} className="relative m-1">
                                    <img src={image.uri} className={`w-16 h-16 rounded-md object-cover border-2 ${image.isNew ? 'border-green-600' : 'border-yellow-600'}`} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(image.uri)}
                                        className="absolute -top-1 -right-1 bg-white rounded-full"
                                    >
                                        <IoCloseCircle size={24} color="#D32F2F" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className={`w-full p-4 rounded-md text-white font-bold mt-4 ${loading ? "bg-gray-400" : "bg-green-800"}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mx-auto"></div>
                            ) : (
                                <span>{editingId ? "Update Product" : "Add Product"}</span>
                            )}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="w-full p-4 rounded-md bg-gray-500 text-white font-bold mt-2"
                                onClick={resetForm}
                            >
                                <span>Cancel Edit</span>
                            </button>
                        )}
                    </form>
                </div>

                {/* Products Section */}
                <div className="md:w-1/2 mt-6 md:mt-0 flex flex-col">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
                        My Products
                    </h2>
                    {/* Add Search Bar */}
                    <input
                        type="text"
                        placeholder="Search products by name, brand, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-200 p-3 rounded-md mb-4 bg-white text-base"
                    />

                    <div className="overflow-y-auto max-h-[80vh] md:max-h-none flex-grow">
                        {loading && products.length === 0 ? (
                            <div className="flex justify-center items-center">
                                <div className="animate-spin h-8 w-8 border-4 border-green-800 rounded-full border-t-transparent"></div>
                            </div>
                        ) : (
                            filteredProducts.map((p) => (
                                <div key={p._id} className="bg-white p-4 rounded-xl shadow-sm mb-4 flex overflow-hidden">
                                    <img
                                        src={
                                            p.images && p.images.length > 0
                                                ? p.images[0]
                                                : "https://placehold.co/100x100/eee/ccc?text=No+Img"
                                        }
                                        alt={p.name}
                                        className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 ml-4 flex flex-col justify-center min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{p.name}</h3>
                                        <p className="text-sm text-gray-600 mb-1">{p.brandName}</p>
                                        <div className="flex items-center my-1">
                                            {p.discountedPrice ? (
                                                <>
                                                    <p className="text-lg font-bold text-green-800">
                                                        ₹{Number(p.discountedPrice).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-red-600 line-through ml-2">
                                                        ₹{Number(p.price).toFixed(2)}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-lg font-bold text-green-800">
                                                    ₹{Number(p.price).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">Stock: {p.stock}</p>
                                        <p className="text-xs text-yellow-600 italic mt-1 truncate">
                                            {p.category.replace(/_/g, " ")}
                                        </p>
                                        {p.bulkPrice && p.bulkMinimumUnits && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Bulk: {p.bulkMinimumUnits}+ @ ₹
                                                {Number(p.bulkPrice).toFixed(2)}/unit
                                            </p>
                                        )}
                                        {p.largeQuantityPrice && p.largeQuantityMinimumUnits && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Large Qty: {p.largeQuantityMinimumUnits}+ @ ₹
                                                {Number(p.largeQuantityPrice).toFixed(2)}/unit
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-around ml-2">
                                        <button
                                            type="button"
                                            className="p-2"
                                            onClick={() => handleEdit(p)}
                                        >
                                            <FaPencilAlt size={20} className="text-yellow-700" />
                                        </button>
                                        <button
                                            type="button"
                                            className="p-2"
                                            onClick={() => handleDelete(p._id)}
                                        >
                                            <FaTrash size={20} className="text-red-700" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-lg max-h-4/5 overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">
                            Select {getCategoryLabel()}
                        </h2>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md p-2 mb-4 text-base"
                            placeholder="Search..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                        />
                        <div className="w-full mb-4 border border-gray-200 rounded-md overflow-hidden">
                            {getCategoryOptions().map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
                                    onClick={() => handleSelectCategory(option)}
                                >
                                    <span className="text-base text-gray-900">{option}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="w-full p-3 rounded-md bg-red-600 text-white font-bold mt-2"
                            onClick={() => setIsModalVisible(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const CustomTextInput = ({ label, isTextArea, ...props }) => (
    <div className="mb-4">
        <label className="block text-gray-600 mb-2">{label}</label>
        {isTextArea ? (
            <textarea
                className="w-full border border-gray-200 p-3 rounded-md bg-gray-50 text-base resize-none"
                rows="4"
                {...props}
            />
        ) : (
            <input
                className="w-full border border-gray-200 p-3 rounded-md bg-gray-50 text-base"
                {...props}
            />
        )}
    </div>
);