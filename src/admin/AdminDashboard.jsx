// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    logoutAdmin,
    updateAdminProfile,
    fetchAdminProfile,
    fetchAllAdmins,
    fetchAdminById,
    updateAdminById,
    deleteAdmin,
    toggleAdminStatus, // New: Import the toggleAdminStatus thunk
    clearAdminError, // Import clearAdminError
} from "../features/admin/adminSlice";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Edit3,
    Power,
    LogOut,
    Mail,
    Phone,
    Briefcase, // Changed from Building to Briefcase for role
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Users, // For all admins list
    Trash2, // For delete
    PlusCircle, // For register new admin
    ArrowLeft, // For back button
} from "lucide-react"; // Import Lucide-react icons

// Simple Modal Component (replaces alert())
const Modal = ({ message, onClose, type = "info" }) => {
    const modalBg = type === "error" ? "#fee2e2" : "#FFFFFF"; // Light red for error, white for info
    const modalTextColor = type === "error" ? "#dc2626" : "#1a1a1a"; // Red for error, dark for info
    const buttonBg = type === "error" ? "#fca5a5" : "#f0f0f0"; // Light red button, light grey for info
    const buttonHoverBg = type === "error" ? "#ef4444" : "#e0e0e0"; // Darker red hover, darker grey hover

    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div
                className="rounded-lg shadow-xl p-6 max-w-sm w-full text-center"
                style={{
                    backgroundColor: modalBg,
                    color: modalTextColor,
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    fontFamily: "'Playfair Display', serif",
                }}
            >
                <p className="mb-6 text-lg font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg font-semibold transition duration-200"
                    style={{
                        backgroundColor: buttonBg,
                        color: modalTextColor,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHoverBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { admin, admins, loading, error, selectedAdmin } = useSelector((state) => state.admin);

    const [isEditing, setIsEditing] = useState(false); // For logged-in admin's profile edit
    const [showPassword, setShowPassword] = useState(false); // For logged-in admin's password field
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "", // Include password for update
        phone: "",
    });
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("info");

    // State for Superadmin features
    const [showAdminList, setShowAdminList] = useState(false);
    const [showAdminEditModal, setShowAdminEditModal] = useState(false);
    const [editingOtherAdminData, setEditingOtherAdminData] = useState({
        _id: "",
        name: "",
        email: "",
        phone: "",
        role: "",
        isActive: true,
    });
    const [showOtherAdminPassword, setShowOtherAdminPassword] = useState(false);

    // Define colors for consistency
    const primaryGreenDark = "#005612";
    const primaryGreenLight = "#009632";
    const logoTextColor = "#FFFFFF";
    const backgroundColor = "black";
    const textColor = "white";
    const inputBgColor = "#333333"; // Darker input background for black theme
    const inputBorderColor = "#555555"; // Darker input border
    const inputFocusRingColor = primaryGreenLight; // Green focus ring
    const buttonBgColor = `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`;
    const buttonTextColor = "#ffffff";
    const cardBgColor = "#1a1a1a"; // Dark card background
    const cardBorderColor = "#333333"; // Dark card border

    // Show modal helper
    const showModal = (message, type = "info") => {
        setModalMessage(message);
        setModalType(type);
    };

    // Close modal helper
    const closeModal = () => {
        setModalMessage("");
        setModalType("info");
        dispatch(clearAdminError()); // Clear Redux error when modal is closed
    };

    // Effect to populate form data when logged-in admin data changes
    useEffect(() => {
        if (admin) {
            setFormData({
                name: admin.name || "",
                email: admin.email || "",
                phone: admin.phone || "",
                password: "", // Password field is intentionally left blank for security
            });
        }
    }, [admin]);

    // Effect to populate editingOtherAdminData when selectedAdmin changes
    useEffect(() => {
        if (selectedAdmin) {
            setEditingOtherAdminData({
                _id: selectedAdmin._id,
                name: selectedAdmin.name || "",
                email: selectedAdmin.email || "",
                phone: selectedAdmin.phone || "",
                role: selectedAdmin.role || "admin",
                isActive: selectedAdmin.isActive,
                password: "", // Leave blank for security
            });
        }
    }, [selectedAdmin]);

    // Fetch logged-in admin profile on component mount
    useEffect(() => {
        if (!admin) {
            dispatch(fetchAdminProfile());
        }
    }, [dispatch, admin]);

    // Handle Redux errors with modal
    useEffect(() => {
        if (error) {
            showModal(error, "error");
        }
    }, [error]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOtherAdminChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingOtherAdminData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSaveProfile = async () => {
        // Only send fields that are allowed to be updated by the admin themselves
        const dataToUpdate = {
            name: formData.name,
            phone: formData.phone,
        };
        if (formData.password) {
            dataToUpdate.password = formData.password;
        }

        const result = await dispatch(updateAdminProfile(dataToUpdate));
        if (updateAdminProfile.fulfilled.match(result)) {
            showModal("Profile updated successfully!");
            setIsEditing(false);
            setFormData((prev) => ({ ...prev, password: "" })); // Clear password field after save
        } else {
            showModal("Profile update failed: " + (result.payload?.message || "Unknown error"), "error");
        }
    };

    const handleLogout = () => {
        dispatch(logoutAdmin());
        navigate("/admin/login");
    };

    // Superadmin Functions
    const handleFetchAllAdmins = async () => {
        setShowAdminList(true);
        setShowAdminEditModal(false); // Hide edit modal if open
        const result = await dispatch(fetchAllAdmins());
        if (fetchAllAdmins.rejected.match(result)) {
            showModal("Failed to fetch admin list: " + (result.payload?.message || "Unknown error"), "error");
        }
    };

    const handleEditOtherAdmin = async (adminId) => {
        const result = await dispatch(fetchAdminById(adminId));
        if (fetchAdminById.fulfilled.match(result)) {
            setShowAdminEditModal(true);
        } else {
            showModal("Failed to fetch admin details: " + (result.payload?.message || "Unknown error"), "error");
        }
    };

    const handleSaveOtherAdmin = async () => {
        const { _id, password, ...dataToUpdate } = editingOtherAdminData;
        if (password) {
            dataToUpdate.password = password;
        }
        const result = await dispatch(updateAdminById({ id: _id, data: dataToUpdate }));
        if (updateAdminById.fulfilled.match(result)) {
            showModal("Admin updated successfully!");
            setShowAdminEditModal(false);
            dispatch(fetchAllAdmins()); // Refresh the list
        } else {
            showModal("Admin update failed: " + (result.payload?.message || "Unknown error"), "error");
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
            const result = await dispatch(deleteAdmin(adminId));
            if (deleteAdmin.fulfilled.match(result)) {
                showModal("Admin deleted successfully!");
                dispatch(fetchAllAdmins()); // Refresh the list
            } else {
                showModal("Admin deletion failed: " + (result.payload?.message || "Unknown error"), "error");
            }
        }
    };

    const handleToggleAdminAccountStatus = async (adminId, currentStatus) => {
        const confirmMessage = currentStatus
            ? "Are you sure you want to deactivate this admin account?"
            : "Are you sure you want to activate this admin account?";
        if (window.confirm(confirmMessage)) {
            const result = await dispatch(toggleAdminStatus({ adminId, isActive: !currentStatus }));
            if (toggleAdminStatus.fulfilled.match(result)) {
                showModal("Admin status updated successfully!");
                dispatch(fetchAllAdmins()); // Refresh the list
            } else {
                showModal("Failed to update admin status: " + (result.payload?.message || "Unknown error"), "error");
            }
        }
    };

    if (loading && !admin && !showAdminList && !showAdminEditModal) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: backgroundColor }}>
                <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: cardBgColor }}>
                    <FaSpinner className="animate-spin w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Loading dashboard...</h2>
                    <p className="text-gray-400">Please wait while we fetch your data.</p>
                </div>
            </div>
        );
    }

    if (!admin && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: backgroundColor }}>
                <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: cardBgColor }}>
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">No admin data found.</h2>
                    <p className="text-gray-400">Please login to access your dashboard.</p>
                    <Link
                        to="/admin/login"
                        className="mt-4 inline-block px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out"
                        style={{
                            background: buttonBgColor,
                            color: buttonTextColor,
                            boxShadow: `0px 4px 15px rgba(0, 0, 0, 0.2)`,
                        }}
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: backgroundColor, fontFamily: "'Playfair Display', serif" }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400 text-base sm:text-lg">Manage admin accounts and system settings.</p>
                </div>

                {/* Current Admin Status Card */}
                {admin && (
                    <div className="rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: cardBgColor, border: `1px solid ${cardBorderColor}` }}>
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${admin.isActive ? 'bg-green-700' : 'bg-red-700'}`}>
                                    {admin.isActive ? (
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        Account Status: {admin.isActive ? 'Active' : 'Inactive'}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {admin.isActive ? 'Your account is active.' : 'Your account is currently inactive.'}
                                    </p>
                                </div>
                            </div>
                            {/* Option to toggle own status (if allowed, typically only superadmin can deactivate others) */}
                            {/* For a regular admin, this might be a request to superadmin or not available */}
                            {/* For simplicity, I'm allowing the logged-in admin to toggle their own status if they are superadmin */}
                            {admin.role === 'superadmin' && (
                                <button
                                    onClick={() => handleToggleAdminAccountStatus(admin._id, admin.isActive)}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${admin.isActive
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30'
                                        }`}
                                    disabled={loading}
                                >
                                    <Power className="w-4 h-4 inline mr-2" />
                                    {admin.isActive ? 'Deactivate My Account' : 'Activate My Account'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Profile Card */}
                {admin && !showAdminList && !showAdminEditModal && (
                    <div className="rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: cardBgColor, border: `1px solid ${cardBorderColor}` }}>
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white">
                            <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                                        <User className="w-12 h-12 text-white/80" />
                                    </div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl font-bold">{admin.name}</h2>
                                    <p className="text-green-100 text-lg capitalize">{admin.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-6">
                            {isEditing ? (
                                <div className="space-y-6">
                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                <User className="w-4 h-4 inline mr-2 text-gray-400" />
                                                Name
                                            </label>
                                            <input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                                                placeholder="Enter your name"
                                                style={{
                                                    background: inputBgColor,
                                                    color: textColor,
                                                    borderColor: inputBorderColor,
                                                    "--tw-ring-color": inputFocusRingColor,
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                <Phone className="w-4 h-4 inline mr-2 text-gray-400" />
                                                Phone
                                            </label>
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                                                placeholder="Enter phone number"
                                                style={{
                                                    background: inputBgColor,
                                                    color: textColor,
                                                    borderColor: inputBorderColor,
                                                    "--tw-ring-color": inputFocusRingColor,
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                <Mail className="w-4 h-4 inline mr-2 text-gray-400" />
                                                Email
                                            </label>
                                            <input
                                                name="email"
                                                value={formData.email}
                                                disabled // Email is typically not editable by self
                                                className="w-full px-4 py-3 border rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed"
                                                style={{
                                                    background: inputBgColor,
                                                    color: textColor,
                                                    borderColor: inputBorderColor,
                                                }}
                                            />
                                        </div>
                                        <div className="relative">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                                Password (leave blank to keep current)
                                            </label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all pr-10"
                                                style={{
                                                    background: inputBgColor,
                                                    color: textColor,
                                                    borderColor: inputBorderColor,
                                                    "--tw-ring-color": inputFocusRingColor,
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                                                style={{ top: "60%", transform: "translateY(-50%)" }}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                <Briefcase className="w-4 h-4 inline mr-2 text-gray-400" />
                                                Role
                                            </label>
                                            <input
                                                name="role"
                                                value={admin.role}
                                                disabled // Role is not editable by self
                                                className="w-full px-4 py-3 border rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed"
                                                style={{
                                                    background: inputBgColor,
                                                    color: textColor,
                                                    borderColor: inputBorderColor,
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                <Power className="w-4 h-4 inline mr-2 text-gray-400" />
                                                Active Status
                                            </label>
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={admin.isActive}
                                                disabled // Active status not editable by self (unless superadmin)
                                                className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                                                style={{
                                                    background: inputBgColor,
                                                    borderColor: inputBorderColor,
                                                }}
                                            />
                                            <span className="ml-2 text-gray-400">{admin.isActive ? "Active" : "Inactive"}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: cardBorderColor }}>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 border rounded-lg text-gray-300 hover:bg-gray-700 transition-colors flex items-center"
                                            style={{ borderColor: cardBorderColor }}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className={`px-6 py-3 rounded-lg text-white font-medium transition-all flex items-center justify-center ${loading
                                                ? "bg-gray-600 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
                                                }`}
                                            disabled={loading}
                                        >
                                            {loading ? <><FaSpinner className="animate-spin mr-2" /> Saving...</> : <><Edit3 className="w-4 h-4 mr-2" /> Save Changes</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Profile Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-5 h-5 text-green-400" />
                                                <div>
                                                    <p className="text-sm text-gray-400">Email</p>
                                                    <p className="font-medium text-white">{admin.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Phone className="w-5 h-5 text-green-400" />
                                                <div>
                                                    <p className="text-sm text-gray-400">Phone</p>
                                                    <p className="font-medium text-white">{admin.phone || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <Briefcase className="w-5 h-5 text-green-400" />
                                                <div>
                                                    <p className="text-sm text-gray-400">Role</p>
                                                    <p className="font-medium text-white capitalize">{admin.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Power className="w-5 h-5 text-green-400" />
                                                <div>
                                                    <p className="text-sm text-gray-400">Account Status</p>
                                                    <p className="font-medium text-white">
                                                        {admin.isActive ? "Active" : "Inactive"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons for View Mode */}
                                    <div className="flex flex-wrap gap-4 justify-end pt-6 border-t" style={{ borderColor: cardBorderColor }}>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-lg shadow-yellow-600/30 flex items-center justify-center"
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Superadmin Management Section */}
                {admin?.role === "superadmin" && !showAdminEditModal && (
                    <div className="mt-8 rounded-2xl shadow-lg border overflow-hidden" style={{ backgroundColor: cardBgColor, border: `1px solid ${cardBorderColor}` }}>
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center">
                                <Users className="w-6 h-6 mr-3" /> Admin Management
                            </h2>
                            <div className="flex space-x-3">
                                <Link
                                    to="/admin/register"
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" /> Register New Admin
                                </Link>
                                <button
                                    onClick={handleFetchAllAdmins}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
                                    disabled={loading}
                                >
                                    <Users className="w-4 h-4 mr-2" /> {loading ? "Loading..." : "View All Admins"}
                                </button>
                            </div>
                        </div>

                        {showAdminList && (
                            <div className="p-6">
                                <button
                                    onClick={() => setShowAdminList(false)}
                                    className="mb-4 inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                                </button>
                                <h3 className="text-lg font-semibold text-white mb-4">All Admin Accounts</h3>
                                {admins.length === 0 && !loading && <p className="text-gray-400">No other admin accounts found.</p>}
                                {loading && <p className="text-gray-400 flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading admins...</p>}
                                {!loading && admins.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead className="bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                                {admins.map((adm) => (
                                                    <tr key={adm._id} className="hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{adm.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{adm.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{adm.phone || "N/A"}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{adm.role}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${adm.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {adm.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleEditOtherAdmin(adm._id)}
                                                                    className="text-yellow-500 hover:text-yellow-600"
                                                                    title="Edit Admin"
                                                                >
                                                                    <Edit3 className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAdmin(adm._id)}
                                                                    className="text-red-500 hover:text-red-600"
                                                                    title="Delete Admin"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleAdminAccountStatus(adm._id, adm.isActive)}
                                                                    className={`${adm.isActive ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}
                                                                    title={adm.isActive ? "Deactivate" : "Activate"}
                                                                >
                                                                    <Power className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Superadmin: Edit Other Admin Modal */}
                {admin?.role === "superadmin" && showAdminEditModal && selectedAdmin && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="rounded-2xl shadow-lg p-8 max-w-lg w-full" style={{ backgroundColor: cardBgColor, border: `1px solid ${cardBorderColor}` }}>
                            <h3 className="text-xl font-bold text-white mb-6">Edit Admin: {selectedAdmin.name}</h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveOtherAdmin(); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editingOtherAdminData.name}
                                        onChange={handleOtherAdminChange}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        style={{
                                            background: inputBgColor,
                                            color: textColor,
                                            borderColor: inputBorderColor,
                                            "--tw-ring-color": inputFocusRingColor,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editingOtherAdminData.email}
                                        onChange={handleOtherAdminChange}
                                        disabled // Email is generally not editable
                                        className="w-full px-3 py-2 border rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed"
                                        style={{
                                            background: inputBgColor,
                                            color: textColor,
                                            borderColor: inputBorderColor,
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editingOtherAdminData.phone}
                                        onChange={handleOtherAdminChange}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        style={{
                                            background: inputBgColor,
                                            color: textColor,
                                            borderColor: inputBorderColor,
                                            "--tw-ring-color": inputFocusRingColor,
                                        }}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Password (leave blank to keep current)</label>
                                    <input
                                        type={showOtherAdminPassword ? "text" : "password"}
                                        name="password"
                                        value={editingOtherAdminData.password}
                                        onChange={handleOtherAdminChange}
                                        placeholder="••••••••"
                                        className="w-full px-3 py-2 border rounded-lg pr-10"
                                        style={{
                                            background: inputBgColor,
                                            color: textColor,
                                            borderColor: inputBorderColor,
                                            "--tw-ring-color": inputFocusRingColor,
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOtherAdminPassword(!showOtherAdminPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                                        style={{ top: "60%", transform: "translateY(-50%)" }}
                                    >
                                        {showOtherAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={editingOtherAdminData.role}
                                        onChange={handleOtherAdminChange}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        style={{
                                            background: inputBgColor,
                                            color: textColor,
                                            borderColor: inputBorderColor,
                                            "--tw-ring-color": inputFocusRingColor,
                                        }}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={editingOtherAdminData.isActive}
                                        onChange={handleOtherAdminChange}
                                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                                        style={{
                                            background: inputBgColor,
                                            borderColor: inputBorderColor,
                                        }}
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Is Active</label>
                                </div>
                                <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: cardBorderColor }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminEditModal(false)}
                                        className="px-6 py-3 border rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                                        style={{ borderColor: cardBorderColor }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`px-6 py-3 rounded-lg text-white font-medium transition-all flex items-center justify-center ${loading
                                            ? "bg-gray-600 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
                                            }`}
                                        disabled={loading}
                                    >
                                        {loading ? <><FaSpinner className="animate-spin mr-2" /> Saving...</> : <><Edit3 className="w-4 h-4 mr-2" /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <Modal message={modalMessage} onClose={closeModal} type={modalType} />
        </div>
    );
}
