import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMyProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    clearError,
} from "../features/vendor/vendorProductSlice"; // Adjust path as needed

export default function VendorProductCRUD() {
    const dispatch = useDispatch();
    const { myProducts: products, loading, error } = useSelector((state) => state.vendorProducts);
    const { vendor } = useSelector((state) => state.vendorAuth);

    const vendorId = vendor?._id;

    const fileInputRef = useRef(null); // Ref for triggering file input click

    // Simplified 'categories' array for a single dropdown
    const categories = [
        "Electronics",
        "Fashion",
        "Home & Kitchen",
        "Grocery",
        "Books, Movies & Music",
        "Sports, Fitness & Outdoors",
        "Beauty & Personal Care",
        "Toys & Games",
        "Automotive",
        "Health & Household",
        "Baby Products",
        "Office Products & Stationery",
        "Industrial & Scientific",
        "Musical Instruments",
        "Pet Supplies",
        "Bags & Luggage",
        "Jewelry & Watches",
    ].sort(); // Sort categories alphabetically for better UX

    const [form, setForm] = useState({
        name: "",
        description: "",
        brandName: "",
        price: "",
        discountedPrice: "",
        discountPercent: "",
        category: "", // Now directly holds the single category string
        stock: "",
        isAvailable: true,
        bulkPrice: "",
        bulkMinimumUnits: "",
        largeQuantityPrice: "",
        largeQuantityMinimumUnits: "",
    });

    const [newImageFiles, setNewImageFiles] = useState([]);
    const [currentProductImageUrls, setCurrentProductImageUrls] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (vendorId) {
            dispatch(fetchMyProducts(vendorId));
        }
    }, [dispatch, vendorId]);

    useEffect(() => {
        if (error) {
            alert("Error: " + error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "checkbox") {
            setForm((f) => ({ ...f, [name]: checked }));
        } else if (type === "file") {
            setNewImageFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
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
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        setNewImageFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    };

    const handleRemoveNewImage = (index) => {
        setNewImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleRemoveCurrentImage = (urlToRemove) => {
        setCurrentProductImageUrls((prevUrls) => prevUrls.filter(url => url !== urlToRemove));
    };

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            brandName: "",
            price: "",
            discountedPrice: "",
            discountPercent: "",
            category: "", // Reset to empty
            stock: "",
            isAvailable: true,
            bulkPrice: "",
            bulkMinimumUnits: "",
            largeQuantityPrice: "",
            largeQuantityMinimumUnits: "",
        });
        setNewImageFiles([]);
        setCurrentProductImageUrls([]);
        setEditingId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!vendorId) {
            alert("You must be logged in as a vendor to perform this action.");
            return;
        }

        // Validate that a category has been selected
        if (!form.name || !form.description || !form.price || !form.category) {
            alert("Please fill required fields (Name, Description, Price, Category).");
            return;
        }

        const formData = new FormData();

        // Append all fields from the form state directly
        Object.entries(form).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                // Special handling for numerical values that might come as strings from input fields
                if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && key !== 'name' && key !== 'description' && key !== 'brandName' && key !== 'category')) {
                    formData.append(key, String(value));
                } else {
                    formData.append(key, value);
                }
            }
        });

        // Append new image files
        newImageFiles.forEach((file) => {
            formData.append("images", file);
        });

        // Append current image URLs if editing and they have been modified (removed some)
        // Only send currentImages if new files are NOT being uploaded, OR if you want to explicitly manage current images
        // The backend should decide how to merge/replace. For simplicity, if new images are present,
        // often the backend just replaces all images, so sending currentImages might be redundant or require complex backend logic.
        // For an update, if only old images are present and modified, explicitly send them.
        if (editingId && currentProductImageUrls.length > 0 && newImageFiles.length === 0) {
            formData.append("currentImages", JSON.stringify(currentProductImageUrls));
        }


        if (!editingId) {
            formData.append("vendorId", vendorId);
        }

        try {
            if (editingId) {
                await dispatch(updateProduct({ id: editingId, formData })).unwrap();
                alert("Product updated successfully!");
            } else {
                await dispatch(addProduct(formData)).unwrap();
                alert("Product added successfully!");
            }
            resetForm();
            dispatch(fetchMyProducts(vendorId)); // Re-fetch products to update the list
        } catch (err) {
            console.error("Product operation failed:", err);
            alert("Error: " + (err.message || "Something went wrong."));
        }
    };

    const handleEdit = (p) => {
        setEditingId(p._id);

        setForm({
            name: p.name,
            description: p.description,
            brandName: p.brandName || "",
            price: p.price,
            discountedPrice: p.discountedPrice || "",
            discountPercent: p.discountPercent || "",
            category: p.category || "", // Directly set the single category
            stock: p.stock || "",
            isAvailable: p.isAvailable,
            bulkPrice: p.bulkPrice || "",
            bulkMinimumUnits: p.bulkMinimumUnits || "",
            largeQuantityPrice: p.largeQuantityPrice || "",
            largeQuantityMinimumUnits: p.largeQuantityMinimumUnits || "",
        });
        setNewImageFiles([]);
        setCurrentProductImageUrls(p.images || []);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDelete = (id) => {
        if (!vendorId) {
            alert("You must be logged in as a vendor to delete products.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this product?")) {
            dispatch(deleteProduct(id));
            alert("Product deletion initiated.");
        }
    };

    if (!vendorId && !loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center text-red-600">
                <p>Please log in as a vendor to manage your products.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingId ? "Edit Product" : "Add New Product"}</h2>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    <p>{error}</p>
                    <button onClick={() => dispatch(clearError())} className="underline text-sm mt-1">Clear Error</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md p-6 rounded-lg">
                {[
                    ["Product Name*", "name", "text"],
                    ["Description*", "description", "textarea"],
                    ["Brand Name", "brandName", "text"],
                    ["Price*", "price", "number"],
                    ["Discounted Price", "discountedPrice", "number"],
                    ["Discount Percent", "discountPercent", "number", { min: 0, max: 100, step: 0.1 }],
                    ["Stock", "stock", "number", { min: 0, step: 1 }]
                ].map(([label, name, type, attrs = {}]) => (
                    <div key={name}>
                        <label htmlFor={name} className="block font-medium mb-1 text-gray-700">
                            {label}
                        </label>
                        {type === "textarea" ? (
                            <textarea
                                id={name}
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                                required={label.includes("*")}
                                rows="3"
                            />
                        ) : (
                            <input
                                id={name}
                                type={type}
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                                required={label.includes("*")}
                                {...attrs}
                            />
                        )}
                    </div>
                ))}

                {/* Single Category Dropdown */}
                <div>
                    <label htmlFor="category" className="block font-medium mb-1 text-gray-700">
                        Category*
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                        required
                    >
                        <option value="">Select a Category</option>
                        {categories.map((catName) => (
                            <option key={catName} value={catName}>
                                {catName}
                            </option>
                        ))}
                    </select>
                </div>


                {/* BULK AND LARGE QUANTITY PRICING FIELDS (no changes here) */}
                <h3 className="text-xl font-semibold pt-4 border-t mt-6 text-gray-800">Bulk Pricing</h3>
                <div>
                    <label htmlFor="bulkMinimumUnits" className="block font-medium mb-1 text-gray-700">
                        Minimum Units for Bulk Price:
                    </label>
                    <input
                        id="bulkMinimumUnits"
                        type="number"
                        name="bulkMinimumUnits"
                        value={form.bulkMinimumUnits}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                        min="1"
                        step="1"
                    />
                </div>
                <div>
                    <label htmlFor="bulkPrice" className="block font-medium mb-1 text-gray-700">
                        Bulk Price Per Unit (₹):
                    </label>
                    <input
                        id="bulkPrice"
                        type="number"
                        name="bulkPrice"
                        value={form.bulkPrice}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                        min="0.01"
                        step="0.01"
                    />
                </div>

                <h3 className="text-xl font-semibold pt-4 border-t mt-6 text-gray-800">Large Quantity Pricing (Optional)</h3>
                <div>
                    <label htmlFor="largeQuantityMinimumUnits" className="block font-medium mb-1 text-gray-700">
                        Minimum Units for Large Quantity Price:
                    </label>
                    <input
                        id="largeQuantityMinimumUnits"
                        type="number"
                        name="largeQuantityMinimumUnits"
                        value={form.largeQuantityMinimumUnits}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                        min="1"
                        step="1"
                    />
                </div>
                <div>
                    <label htmlFor="largeQuantityPrice" className="block font-medium mb-1 text-gray-700">
                        Large Quantity Price Per Unit (₹):
                    </label>
                    <input
                        id="largeQuantityPrice"
                        type="number"
                        name="largeQuantityPrice"
                        value={form.largeQuantityPrice}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                        min="0.01"
                        step="0.01"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={form.isAvailable}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isAvailable" className="text-gray-700">Available</label>
                </div>

                {/* Image Upload Section */}
                <div>
                    <label className="block font-medium mb-1 text-gray-700">Product Images</label>
                    <div
                        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <p className="text-gray-600 mb-2">
                            {isDragging ? "Drop your images here!" : "Drag 'n' drop some images here, or click to select files"}
                        </p>
                        <input
                            type="file"
                            id="imageFile"
                            name="imageFile"
                            ref={fileInputRef}
                            onChange={handleChange}
                            className="hidden"
                            accept="image/*"
                            multiple
                        />
                    </div>

                    {/* Display Existing Images (from currentProductImageUrls) */}
                    {currentProductImageUrls.length > 0 && (
                        <div className="mt-4">
                            <p className="font-medium text-gray-700 mb-2">Current Product Images:</p>
                            <div className="flex flex-wrap gap-3">
                                {currentProductImageUrls.map((url, index) => (
                                    <div key={url + index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                                        <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveCurrentImage(url); }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove existing image"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                (Images above are currently associated with the product. Uploading new files will **replace** existing ones by default in the backend, or you can control this by carefully handling the `currentImages` and `newImages` arrays in your backend logic for the update route.)
                            </p>
                        </div>
                    )}

                    {/* Display Newly Selected Images (from newImageFiles) */}
                    {newImageFiles.length > 0 && (
                        <div className="mt-4">
                            <p className="font-medium text-gray-700 mb-2">New Images to Upload:</p>
                            <div className="flex flex-wrap gap-3">
                                {newImageFiles.map((file, index) => (
                                    <div key={file.name + index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            onLoad={() => URL.revokeObjectURL(file.preview)} // Clean up URL when image loads
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveNewImage(index); }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove new image"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-400 transition duration-200"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            <h2 className="text-2xl font-bold mb-6 mt-12 text-gray-800">My Products</h2>
            {loading && <p className="text-center text-blue-600">Loading products...</p>}
            {products.length === 0 && !loading && (
                <p className="text-center text-gray-600">No products found. Add your first product above!</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                    <div key={p._id} className="bg-white shadow-md rounded-lg p-4 relative border border-gray-200">
                        {p.images && p.images.length > 0 && (
                            <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-48 object-contain rounded-md mb-4 bg-gray-50"
                            />
                        )}
                        <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{p.brandName}</p>
                        <p className="text-md font-bold text-gray-900 mb-2">₹{p.price.toFixed(2)}</p>
                        {p.discountedPrice && (
                            <p className="text-sm text-green-600 font-medium">
                                Discounted Price: ₹{p.discountedPrice.toFixed(2)} ({p.discountPercent}% off)
                            </p>
                        )}
                        <p className="text-sm text-gray-700 mt-1">Category: {p.category}</p>
                        <p className={`text-sm ${p.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                            Stock: {p.stock} {p.isAvailable ? "(Available)" : "(Not Available)"}
                        </p>
                        {p.bulkMinimumUnits && p.bulkPrice && (
                            <p className="text-xs text-gray-500 mt-1">Bulk: {p.bulkMinimumUnits}+ units @ ₹{p.bulkPrice.toFixed(2)}/unit</p>
                        )}
                        {p.largeQuantityMinimumUnits && p.largeQuantityPrice && (
                            <p className="text-xs text-gray-500">Large Qty: {p.largeQuantityMinimumUnits}+ units @ ₹{p.largeQuantityPrice.toFixed(2)}/unit</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                        <div className="mt-4 flex space-x-2">
                            <button
                                onClick={() => handleEdit(p)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 transition duration-200"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(p._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}