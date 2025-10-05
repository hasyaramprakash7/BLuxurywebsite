import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorAppointments } from '../features/appointmentSlice';

const VendorAppointmentsList = () => {
    const dispatch = useDispatch();
    const { vendorAppointments, loading, error } = useSelector((state) => state.appointments);

    const { vendor } = useSelector((state) => state.vendorAuth);
    const vendorId = vendor?._id;

    useEffect(() => {
        if (vendorId) {
            dispatch(fetchVendorAppointments(vendorId));
        }
    }, [dispatch, vendorId]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-lg text-gray-600">Loading appointments...</p></div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-lg text-red-500">Error: {error}</p></div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">Your Appointments Dashboard</h1>

            {vendorAppointments.length > 0 ? (
                <div className="space-y-6">
                    {vendorAppointments.map((appointment) => (
                        <div key={appointment._id} className="bg-white rounded-xl shadow-lg p-6 md:p-8 transition-transform transform hover:scale-[1.01] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            {/* Product and User Info Section */}
                            <div className="flex items-center gap-6 w-full sm:w-1/2">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={appointment.insuranceProductId?.mainImage || 'https://via.placeholder.com/150'}
                                        alt={appointment.insuranceProductId?.name || 'Product'}
                                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-md"
                                    />
                                </div>

                                {/* Product and User Details */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{appointment.insuranceProductId?.name || 'Product Not Found'}</h3>
                                    
                                    {/* Product description is now directly under the product name */}
                                    <div className="text-sm text-gray-600 mb-4">
                                        <p>
                                            <span className="font-semibold">Description:</span> {appointment.insuranceProductId?.description?.substring(0, 100) + '...' || 'N/A'}
                                        </p>
                                    </div>
                                    
                                    <p className="text-gray-600 font-medium text-sm sm:text-base mb-2">User: <span className="text-blue-600">{appointment.userId?.name || 'User Not Found'}</span></p>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>Email: {appointment.userId?.email || 'N/A'}</p>
                                        <p>Phone: {appointment.userId?.phone || 'N/A'}</p>
                                        <p>
                                            Address: {`${appointment.userId?.address?.pincode}, ${appointment.userId?.address?.district}, ${appointment.userId?.address?.state}, ${appointment.userId?.address?.country}` || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Details Section */}
                            <div className="w-full sm:w-1/2 flex flex-col items-start sm:items-end text-gray-700 mt-4 sm:mt-0">
                                <p className="text-sm font-semibold mb-2">
                                    Appointment Date:
                                    <span className="text-gray-900 ml-2">
                                        {new Date(appointment.createdAt).toLocaleDateString()}
                                    </span>
                                </p>
                                <div className="flex items-center gap-2 mb-4">
                                    <p className="font-semibold text-sm">Status:</p>
                                    <span
                                        className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider
                                        ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                                    >
                                        {appointment.status || 'N/A'}
                                    </span>
                                </div>
                                <button className="mt-2 sm:mt-0 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center min-h-[40vh] text-center">
                    <p className="text-lg text-gray-500">You have no scheduled appointments at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default VendorAppointmentsList;