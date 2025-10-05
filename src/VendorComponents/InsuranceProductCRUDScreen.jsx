import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchVendorInsuranceProducts,
    createInsuranceProduct,
    updateInsuranceProduct,
    deleteInsuranceProduct,
    clearError,
} from "../features/insuranceSlice";
import { FaImage, FaPencilAlt, FaTrash } from "react-icons/fa";
import { IoArrowBack, IoCloseCircle } from "react-icons/io5";

// Mock for a web-based image picker
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
                    isNew: true,
                }));
                resolve({ canceled: false, assets });
            };
            input.click();
        });
    },
};

// Initial state for the form, aligned with your backend model
const initialFormState = {
    name: "",
    description: "",
    badgeText: "N/A",
    options: {
        isNew: false,
        isAwardWinning: false,
        isPopular: false,
    },
    contactNumber: "",
    executiveContact: {
        phoneNumber: "",
        pointOfContact: "Executive",
    },
    categories: {
        level1: { name: "" },
        level2: { name: "" },
        level3: { name: "" },
    },
};

export default function InsuranceProductCRUDScreen() {
    const dispatch = useDispatch();
    const {
        vendorProducts: products,
        loading,
        error,
    } = useSelector((state) => state.insurance);

    // Assuming you have a vendorAuth slice to get the vendor ID
    const { vendor } = useSelector((state) => state.vendorAuth);

    const [form, setForm] = useState(initialFormState);
    const [productImages, setProductImages] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    // State for image reordering
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [dragTargetIndex, setDragTargetIndex] = useState(null);

    // UPDATED useEffect Hook
    useEffect(() => {
        if (vendor) {
            dispatch(fetchVendorInsuranceProducts());
        }
    }, [dispatch, vendor]);

    useEffect(() => {
        if (error) {
            alert("An Error Occurred: " + error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOptionChange = (e) => {
        const { name, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            options: {
                ...prev.options,
                [name]: checked,
            },
        }));
    };

    const handleExecutiveContactChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            executiveContact: {
                ...prev.executiveContact,
                [name]: value,
            },
        }));
    };

    const handleCategoryChange = (level, e) => {
        const { value } = e.target;
        setForm((prev) => ({
            ...prev,
            categories: {
                ...prev.categories,
                [level]: {
                    ...prev.categories[level],
                    name: value,
                },
            },
        }));
    };

    const resetForm = () => {
        setForm(initialFormState);
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
            handleNewImages(result.assets.map((a) => a.file));
        }
    };

    const handleRemoveImage = (uriToRemove) => {
        setProductImages((prevImages) =>
            prevImages.filter((img) => img.uri !== uriToRemove)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation for required fields
        if (
            !form.name ||
            !form.description ||
            !form.contactNumber ||
            !form.executiveContact.phoneNumber ||
            !form.categories.level1.name ||
            !form.categories.level2.name ||
            !form.categories.level3.name ||
            !productImages.length
        ) {
            alert("Validation Error: Please fill all required fields and add at least one image.");
            return;
        }

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("badgeText", form.badgeText);
        formData.append("contactNumber", form.contactNumber);

        // Append stringified JSON for complex objects
        formData.append("options", JSON.stringify(form.options));
        formData.append("executiveContact", JSON.stringify(form.executiveContact));
        formData.append("categories", JSON.stringify(form.categories));

        const newImageFiles = productImages.filter((img) => img.isNew).map((img) => img.file);
        const existingImageUrls = productImages.filter((img) => !img.isNew).map((img) => img.uri);

        if (editingId) {
            // Logic for updating an existing product
            if (newImageFiles.length > 0) {
                // If new images are present, append them for upload
                newImageFiles.forEach((file) => {
                    formData.append("images", file);
                });
            } else if (productImages.length > 0) {
                // If no new images, send the existing Cloudinary URLs
                formData.append("mainImage", existingImageUrls[0]);
                formData.append("otherImages", JSON.stringify(existingImageUrls.slice(1)));
            }

            try {
                await dispatch(updateInsuranceProduct({ id: editingId, formData })).unwrap();
                alert("Success: Insurance product updated!");
                resetForm();
            } catch (err) {
                alert(`Operation Failed: ${err?.message || "An unknown error occurred."}`);
            }

        } else {
            // Logic for creating a new product
            if (newImageFiles.length === 0) {
                alert("Validation Error: A new product requires at least one image.");
                return;
            }
            newImageFiles.forEach((file) => {
                formData.append("images", file);
            });

            try {
                await dispatch(createInsuranceProduct(formData)).unwrap();
                alert("Success: Insurance product created!");
                resetForm();
            } catch (err) {
                alert(`Operation Failed: ${err?.message || "An unknown error occurred."}`);
            }
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setForm({
            name: product.name || "",
            description: product.description || "",
            badgeText: product.badgeText || "N/A",
            options: product.options || initialFormState.options,
            contactNumber: product.contactNumber || "",
            executiveContact: product.executiveContact || initialFormState.executiveContact,
            categories: product.categories || initialFormState.categories,
        });

        const existingImages = (product.mainImage ? [{ uri: product.mainImage, isNew: false }] : [])
            .concat((product.otherImages || []).map(uri => ({ uri, isNew: false })));
        setProductImages(existingImages);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this insurance product? This will also delete all associated appointments.")) {
            dispatch(deleteInsuranceProduct(id));
        }
    };

    // --- Image Drag-and-Drop and Reordering Logic ---
    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
    };

    const handleDragEnter = (e, index) => {
        e.preventDefault();
        setDragTargetIndex(index);
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

        // Handle file drop for new images
        if (draggedItemIndex === null && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleNewImages(e.dataTransfer.files);
        } else if (draggedItemIndex !== null && dragTargetIndex !== null) {
            // Handle reordering of existing images
            const newImages = [...productImages];
            const [reorderedItem] = newImages.splice(draggedItemIndex, 1);
            newImages.splice(dragTargetIndex, 0, reorderedItem);
            setProductImages(newImages);
        }
        setDraggedItemIndex(null);
        setDragTargetIndex(null);
    };

    // Filter products based on search query
    const filteredProducts = products.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
            p.name?.toLowerCase().includes(query) ||
            p.badgeText?.toLowerCase().includes(query) ||
            p.categories?.level1?.name?.toLowerCase().includes(query) ||
            p.categories?.level2?.name?.toLowerCase().includes(query) ||
            p.categories?.level3?.name?.toLowerCase().includes(query)
        );
    });

    const mainImage = productImages.length > 0 ? productImages[0] : null;
    const otherImages = productImages.slice(1);

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
                    Insurance Product Management
                </h1>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-8">
                {/* Form Section */}
                <div className="md:w-1/2 flex-shrink-0">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md mb-6 md:mb-0">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingId ? "Edit Insurance Product" : "Create New Insurance Product"}
                        </h2>
                        <CustomTextInput
                            label="Product Name*"
                            name="name"
                            value={form.name}
                            onChange={handleTextChange}
                        />
                        <CustomTextInput
                            label="Description*"
                            name="description"
                            value={form.description}
                            onChange={handleTextChange}
                            isTextArea
                        />
                        <CustomTextInput
                            label="Badge Text (e.g., Best, Exclusive for Women Sellers)"
                            name="badgeText"
                            value={form.badgeText}
                            onChange={handleTextChange}
                        />
                        <CustomTextInput
                            label="Contact Number*"
                            name="contactNumber"
                            value={form.contactNumber}
                            onChange={handleTextChange}
                            type="tel"
                        />

                        {/* New Checkbox Options */}
                        <div className="mt-5 mb-4 border-t pt-4 border-gray-200">
                            <h3 className="text-lg font-bold text-green-800 mb-2">Options</h3>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center">
                                    <input type="checkbox" name="isNew" checked={form.options.isNew} onChange={handleOptionChange} className="form-checkbox text-green-800 rounded-md" />
                                    <label className="ml-2 text-gray-600">Is New</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" name="isAwardWinning" checked={form.options.isAwardWinning} onChange={handleOptionChange} className="form-checkbox text-green-800 rounded-md" />
                                    <label className="ml-2 text-gray-600">Is Award Winning</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" name="isPopular" checked={form.options.isPopular} onChange={handleOptionChange} className="form-checkbox text-green-800 rounded-md" />
                                    <label className="ml-2 text-gray-600">Is Popular</label>
                                </div>
                            </div>
                        </div>

                        {/* New Executive Contact fields */}
                        <div className="mt-5 mb-4 border-t pt-4 border-gray-200">
                            <h3 className="text-lg font-bold text-green-800 mb-2">Executive Contact</h3>
                            <CustomTextInput
                                label="Phone Number*"
                                name="phoneNumber"
                                value={form.executiveContact.phoneNumber}
                                onChange={handleExecutiveContactChange}
                                type="tel"
                            />
                            <CustomTextInput
                                label="Point of Contact"
                                name="pointOfContact"
                                value={form.executiveContact.pointOfContact}
                                onChange={handleExecutiveContactChange}
                            />
                        </div>

                        {/* New 3-level Category fields */}
                        <div className="mt-5 mb-4 border-t pt-4 border-gray-200">
                            <h3 className="text-lg font-bold text-green-800 mb-2">Categories</h3>
                            <CustomTextInput
                                label="Level 1 Category*"
                                name="level1"
                                value={form.categories.level1.name}
                                onChange={(e) => handleCategoryChange("level1", e)}
                            />
                            <CustomTextInput
                                label="Level 2 Category*"
                                name="level2"
                                value={form.categories.level2.name}
                                onChange={(e) => handleCategoryChange("level2", e)}
                            />
                            <CustomTextInput
                                label="Level 3 Category*"
                                name="level3"
                                value={form.categories.level3.name}
                                onChange={(e) => handleCategoryChange("level3", e)}
                            />
                        </div>

                        {/* Image Uploader */}
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

                        <div className="mt-5 mb-4 border-t pt-4 border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Brand/Main Image</h3>
                            {mainImage ? (
                                <div className="relative w-40 h-40 m-1" draggable onDragStart={(e) => handleDragStart(e, 0)}>
                                    <img src={mainImage.uri} className={`w-40 h-40 rounded-md object-cover border-2 ${mainImage.isNew ? 'border-green-600' : 'border-yellow-600'}`} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(mainImage.uri)}
                                        className="absolute -top-2 -right-2 bg-white rounded-full"
                                    >
                                        <IoCloseCircle size={28} color="#D32F2F" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No main image selected. The first image you add or drag will become the main image.</p>
                            )}
                        </div>

                        {otherImages.length > 0 && (
                            <div className="mt-5 mb-4 border-t pt-4 border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Other Images (Drag to reorder)</h3>
                                <div className="flex flex-wrap mt-2" onDrop={handleDrop} onDragOver={handleDragOver}>
                                    {otherImages.map((image, index) => (
                                        <div
                                            key={image.uri}
                                            className="relative w-24 h-24 m-1 cursor-grab"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index + 1)}
                                            onDragEnter={(e) => handleDragEnter(e, index + 1)}
                                        >
                                            <img
                                                src={image.uri}
                                                className={`w-full h-full rounded-md object-cover border-2 ${image.isNew ? 'border-green-600' : 'border-yellow-600'}`}
                                            />
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
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`w-full p-4 rounded-md text-white font-bold mt-4 ${loading ? "bg-gray-400" : "bg-green-800"}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mx-auto"></div>
                            ) : (
                                <span>{editingId ? "Update Product" : "Create Product"}</span>
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
                        My Insurance Products
                    </h2>
                    <input
                        type="text"
                        placeholder="Search products by name, badge, or category..."
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
                                            p.mainImage
                                                ? p.mainImage
                                                : "https://placehold.co/100x100/eee/ccc?text=No+Img"
                                        }
                                        alt={p.name}
                                        className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 ml-4 flex flex-col justify-center min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{p.name}</h3>
                                        <p className="text-sm text-gray-600 mb-1">{p.badgeText}</p>
                                        <p className="text-sm text-gray-600">Contact: {p.contactNumber}</p>
                                        <p className="text-xs text-yellow-600 italic mt-1 truncate">
                                            {p.categories?.level1?.name && p.categories?.level2?.name && p.categories?.level3?.name ? (
                                                `${p.categories.level1.name} > ${p.categories.level2.name} > ${p.categories.level3.name}`
                                            ) : (
                                                `Categories: ${p.categories?.level1?.name || ''} ${p.categories?.level2?.name || ''} ${p.categories?.level3?.name || ''}`
                                            )}
                                        </p>
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