import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllInsuranceProducts, fetchInsuranceProductById } from '../features/insuranceSlice';
import { bookNewAppointment, fetchUserAppointments } from '../features/appointmentSlice';

const InsuranceProductsAndDetails = () => {
    const dispatch = useDispatch();
    const [selectedProductId, setSelectedProductId] = useState(null);
    const { products, currentProduct, loading, error } = useSelector((state) => state.insurance);
    const { loading: appointmentLoading, userAppointments } = useSelector((state) => state.appointments);

    const currentUser = useSelector((state) => state.auth.user);
    const currentUserId = currentUser?._id;

    useEffect(() => {
        if (!selectedProductId) {
            dispatch(fetchAllInsuranceProducts());
        }
    }, [dispatch, selectedProductId]);

    useEffect(() => {
        if (selectedProductId) {
            dispatch(fetchInsuranceProductById(selectedProductId));
        }
    }, [dispatch, selectedProductId]);

    useEffect(() => {
        if (currentUserId) {
            dispatch(fetchUserAppointments(currentUserId));
        }
    }, [dispatch, currentUserId]);

    const handleViewDetails = (productId) => {
        setSelectedProductId(productId);
    };

    const handleGoBack = () => {
        setSelectedProductId(null);
    };

    const handleScheduleAppointment = async () => {
        if (!currentProduct || !currentUserId) {
            alert("No product selected or user not authenticated.");
            return;
        }

        const appointmentData = {
            vendorId: currentProduct.vendorId._id,
            userId: currentUserId,
            insuranceProductId: currentProduct._id,
        };

        try {
            const resultAction = await dispatch(bookNewAppointment(appointmentData)).unwrap();

            if (resultAction) {
                alert("Appointment scheduled successfully!");
                handleGoBack();
                console.log("Newly booked appointment:", resultAction);
            }
        } catch (err) {
            alert(`Failed to schedule appointment: ${err}`);
        }
    };

    const renderUserAppointments = () => {
        if (userAppointments.length === 0) {
            return <p className="text-center text-gray-600">You have no scheduled appointments.</p>;
        }

        return (
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Appointments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userAppointments.map(appointment => (
                        <div key={appointment._id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
                            {/* Display Product Image if available */}
                            {appointment.insuranceProductId?.mainImage && (
                                <img
                                    src={appointment.insuranceProductId.mainImage}
                                    alt={appointment.insuranceProductId.name || 'Product'}
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                            )}
                            <div>
                                <p className="font-semibold text-gray-900">
                                    Product: {appointment.insuranceProductId?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Vendor: {appointment.vendorId?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Date: {new Date(appointment.createdAt).toLocaleString()}
                                </p>
                                <p className="text-sm font-medium">
                                    Status:
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {appointment.status || 'N/A'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // The rest of the component's existing logic remains here...
    if (loading || appointmentLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-xl text-gray-700">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <p className="text-xl text-red-600 mb-4">Error: {error}</p>
                <button
                    onClick={handleGoBack}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (selectedProductId && currentProduct) {
        const {
            name,
            description,
            mainImage,
            otherImages,
            badgeText,
            options,
            contactNumber,
            executiveContact,
            categories,
        } = currentProduct;

        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-10">
                    <button
                        onClick={handleGoBack}
                        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Back to Products
                    </button>
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Image and Icon Section */}
                        <div className="w-full md:w-1/2 flex flex-col items-center">
                            <div className="relative mb-4">
                                {mainImage && (
                                    <img
                                        src={mainImage}
                                        alt={name}
                                        className="w-full max-h-96 object-contain rounded-lg shadow-md"
                                    />
                                )}
                                {badgeText && badgeText !== "N/A" && (
                                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                                        {badgeText}
                                    </span>
                                )}
                            </div>
                            {otherImages && otherImages.length > 0 && (
                                <div className="flex space-x-2 overflow-x-auto w-full justify-center">
                                    {otherImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Product thumbnail ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-md cursor-pointer hover:border-2 hover:border-blue-500 transition-colors"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Product Details Section */}
                        <div className="w-full md:w-1/2">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
                            <p className="text-lg text-gray-700 mb-6">{description}</p>
                            <div className="space-y-4 text-gray-800">
                                {categories?.level1?.name && (
                                    <p className="text-lg">
                                        <span className="font-semibold text-gray-600">Category:</span>
                                        <br />
                                        {categories.level1.name} / {categories.level2.name} / {categories.level3.name}
                                    </p>
                                )}
                                {options && (
                                    <div>
                                        <span className="font-semibold text-gray-600">Features:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {options.isNew && <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">✨ New</span>}
                                            {options.isPopular && <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">🔥 Popular</span>}
                                            {options.isAwardWinning && <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded">🏆 Award-Winning</span>}
                                        </div>
                                    </div>
                                )}
                                {contactNumber && (
                                    <p className="text-lg">
                                        <span className="font-semibold text-gray-600">Contact:</span> {contactNumber}
                                    </p>
                                )}
                                {executiveContact && (
                                    <p className="text-lg">
                                        <span className="font-semibold text-gray-600">Executive:</span> {executiveContact.pointOfContact} - {executiveContact.phoneNumber}
                                    </p>
                                )}
                            </div>
                            <button
                                className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                onClick={handleScheduleAppointment}
                                disabled={appointmentLoading}
                            >
                                {appointmentLoading ? "Scheduling..." : "Schedule Appointment"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">
                Available Insurance Products
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 relative">
                            {product.badgeText && product.badgeText !== "N/A" && (
                                <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                                    {product.badgeText}
                                </span>
                            )}
                            {product.mainImage && (
                                <img
                                    src={product.mainImage}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        {product.categories?.level1?.name && (
                                            <p><span className="font-medium">Category:</span> {product.categories.level1.name} / {product.categories.level2.name} / {product.categories.level3.name}</p>
                                        )}
                                        {product.contactNumber && <p><span className="font-medium">Contact:</span> {product.contactNumber}</p>}
                                        {product.options && (
                                            <div className="flex items-center space-x-2">
                                                {product.options.isNew && <span className="text-xs font-semibold text-green-500">✨ New</span>}
                                                {product.options.isPopular && <span className="text-xs font-semibold text-yellow-500">🔥 Popular</span>}
                                                {product.options.isAwardWinning && <span className="text-xs font-semibold text-indigo-500">🏆 Award-Winning</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={() => handleViewDetails(product._id)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-600 text-lg">
                        No insurance products found.
                    </div>
                )}
            </div>
            {renderUserAppointments()}
        </div>
    );
};

export default InsuranceProductsAndDetails;