import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    logoutAdmin,
    fetchAdminProfile,
    fetchAllAdmins,
    fetchAdminById,
    updateAdminById,
    deleteAdmin,
    toggleAdminStatus,
    fetchPlatformAnalytics,
    toggleVendorApproval,
    fetchUsers,
    fetchUserById,
    updateUserById,
    deleteUserById,
    fetchVendors,
    fetchVendorById,
    updateVendorById,
    deleteVendorById,
    fetchDeliveryBoys,
    fetchDeliveryBoyById,
    updateDeliveryBoyById,
    deleteDeliveryBoyById,
    fetchProducts,
    fetchProductById,
    updateProductById,
    deleteProductById,
    fetchOrders,
    fetchOrderById,
    updateOrderById,
    deleteOrderById,
    clearAdminError,
    setSelectedAdmin,
    setSelectedUser,
    setSelectedVendor,
    setSelectedDeliveryBoy,
    setSelectedProduct,
    setSelectedOrder,
    registerAdmin,
} from "../features/admin/adminSlice";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Edit3,
    Power,
    LogOut,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Users,
    Trash2,
    PlusCircle,
    ArrowLeft,
    DollarSign,
    Percent,
    Truck,
    Store,
    Package,
    ShoppingCart,
    LayoutDashboard,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";

// Simple Modal Component
const Modal = ({ message, onClose, type = "info" }) => {
    const modalBg = type === "error" ? "#fee2e2" : "#FFFFFF";
    const modalTextColor = type === "error" ? "#dc2626" : "#1a1a1a";
    const buttonBg = type === "error" ? "#fca5a5" : "#f0f0f0";
    const buttonHoverBg = type === "error" ? "#ef4444" : "#e0e0e0";

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

export default function AdminControlPanel() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        admin,
        admins,
        users,
        vendors,
        deliveryBoys,
        products,
        orders,
        analytics,
        loading,
        error,
        selectedAdmin,
        selectedUser,
        selectedVendor,
        selectedDeliveryBoy,
        selectedProduct,
        selectedOrder,
    } = useSelector((state) => state.admin);

    const [activeTab, setActiveTab] = useState("analytics");
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("info");

    const [showAdminEditModal, setShowAdminEditModal] = useState(false);
    const [editingOtherAdminData, setEditingOtherAdminData] = useState({
        _id: "",
        name: "",
        email: "",
        phone: "",
        role: "",
        isActive: true,
        password: "",
    });
    const [showOtherAdminPassword, setShowOtherAdminPassword] = useState(false);

    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdminData, setNewAdminData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "admin",
    });
    const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);

    const [showEntityEditModal, setShowEntityEditModal] = useState(false);
    const [editingEntityData, setEditingEntityData] = useState(null);
    const [editingEntityType, setEditingEntityType] = useState("");
    const [showEntityPassword, setShowEntityPassword] = useState(false);

    const primaryGreenDark = "#005612";
    const primaryGreenLight = "#009632";
    const backgroundColor = "black";
    const textColor = "white";
    const inputBgColor = "#333333";
    const inputBorderColor = "#555555";
    const inputFocusRingColor = primaryGreenLight;
    const buttonBgColor = `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`;
    const buttonTextColor = "#ffffff";
    const cardBgColor = "#1a1a1a";
    const cardBorderColor = "#333333";
    const tabActiveBg = `linear-gradient(to right, ${primaryGreenDark}, ${primaryGreenLight})`;
    const tabInactiveBg = "#333333";
    const tabTextColor = "#ffffff";

    const showModal = (message, type = "info") => {
        setModalMessage(message);
        setModalType(type);
    };

    const closeModal = () => {
        setModalMessage("");
        setModalType("info");
        dispatch(clearAdminError());
    };

    useEffect(() => {
        if (admin?.role === "superadmin") {
            dispatch(fetchPlatformAnalytics());
            dispatch(fetchAllAdmins());
            dispatch(fetchUsers());
            dispatch(fetchVendors());
            dispatch(fetchDeliveryBoys());
            dispatch(fetchProducts());
            dispatch(fetchOrders());
        } else {
            // If not a superadmin, navigate to the regular dashboard
            navigate("/admin/dashboard");
        }
    }, [dispatch, admin?.role, navigate]);

    useEffect(() => {
        if (error) {
            showModal(error, "error");
        }
    }, [error]);

    useEffect(() => {
        if (selectedAdmin) {
            setEditingOtherAdminData({
                _id: selectedAdmin._id,
                name: selectedAdmin.name || "",
                email: selectedAdmin.email || "",
                phone: selectedAdmin.phone || "",
                role: selectedAdmin.role || "admin",
                isActive: selectedAdmin.isActive,
                password: "",
            });
        }
    }, [selectedAdmin]);

    useEffect(() => {
        let entity = null;
        switch (editingEntityType) {
            case 'user': entity = selectedUser; break;
            case 'vendor': entity = selectedVendor; break;
            case 'deliveryboy': entity = selectedDeliveryBoy; break;
            case 'product': entity = selectedProduct; break;
            case 'order': entity = selectedOrder; break;
            default: entity = null;
        }

        if (entity) {
            setEditingEntityData({ ...entity, password: "" });
        }
    }, [selectedUser, selectedVendor, selectedDeliveryBoy, selectedProduct, selectedOrder, editingEntityType]);

    const handleLogout = () => {
        dispatch(logoutAdmin());
        navigate("/admin/login");
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        const result = await dispatch(registerAdmin(newAdminData));
        if (registerAdmin.fulfilled.match(result)) {
            showModal("New admin account created successfully!");
            setShowAddAdminModal(false);
            setNewAdminData({ name: "", email: "", phone: "", password: "", role: "admin" });
            dispatch(fetchAllAdmins());
        } else {
            showModal("Admin creation failed: " + (result.payload?.message || "Unknown error"), "error");
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
            dispatch(fetchAllAdmins());
        } else {
            showModal("Admin update failed: " + (result.payload?.message || "Unknown error"), "error");
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
            const result = await dispatch(deleteAdmin(adminId));
            if (deleteAdmin.fulfilled.match(result)) {
                showModal("Admin deleted successfully!");
                dispatch(fetchAllAdmins());
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
                dispatch(fetchAllAdmins());
            } else {
                showModal("Failed to update admin status: " + (result.payload?.message || "Unknown error"), "error");
            }
        }
    };

    const handleEditEntity = async (entityType, id) => {
        setEditingEntityType(entityType);
        let result;
        switch (entityType) {
            case 'user':
                result = await dispatch(fetchUserById(id));
                if (fetchUserById.fulfilled.match(result)) {
                    dispatch(setSelectedUser(result.payload.user));
                    setShowEntityEditModal(true);
                } else {
                    showModal("Failed to fetch user details: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            case 'vendor':
                result = await dispatch(fetchVendorById(id));
                if (fetchVendorById.fulfilled.match(result)) {
                    dispatch(setSelectedVendor(result.payload.vendor));
                    setShowEntityEditModal(true);
                } else {
                    showModal("Failed to fetch vendor details: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            case 'deliveryboy':
                result = await dispatch(fetchDeliveryBoyById(id));
                if (fetchDeliveryBoyById.fulfilled.match(result)) {
                    dispatch(setSelectedDeliveryBoy(result.payload.deliveryBoy));
                    setShowEntityEditModal(true);
                } else {
                    showModal("Failed to fetch delivery boy details: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            case 'product':
                result = await dispatch(fetchProductById(id));
                if (fetchProductById.fulfilled.match(result)) {
                    dispatch(setSelectedProduct(result.payload.product));
                    setShowEntityEditModal(true);
                } else {
                    showModal("Failed to fetch product details: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            case 'order':
                result = await dispatch(fetchOrderById(id));
                if (fetchOrderById.fulfilled.match(result)) {
                    dispatch(setSelectedOrder(result.payload.order));
                    setShowEntityEditModal(true);
                } else {
                    showModal("Failed to fetch order details: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            default:
                showModal("Invalid entity type for editing.", "error");
                break;
        }
    };

    const handleSaveEntity = async () => {
        const { _id, password, ...dataToUpdate } = editingEntityData;
        if (password) {
            dataToUpdate.password = password;
        }
        let result;
        switch (editingEntityType) {
            case 'user':
                result = await dispatch(updateUserById({ id: _id, data: dataToUpdate }));
                if (updateUserById.fulfilled.match(result)) {
                    showModal("User updated successfully!");
                    setShowEntityEditModal(false);
                    dispatch(fetchUsers());
                } else {
                    showModal("User update failed: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            case 'vendor':
                result = await dispatch(updateVendorById({ id: _id, data: dataToUpdate }));
                if (updateVendorById.fulfilled.match(result)) {
                    showModal("Vendor updated successfully!");
                    setShowEntityEditModal(false);
                    dispatch(fetchVendors());
                } else {
                    showModal("Vendor update failed: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            case 'deliveryboy':
                result = await dispatch(updateDeliveryBoyById({ id: _id, data: dataToUpdate }));
                if (updateDeliveryBoyById.fulfilled.match(result)) {
                    showModal("Delivery Boy updated successfully!");
                    setShowEntityEditModal(false);
                    dispatch(fetchDeliveryBoys());
                } else {
                    showModal("Delivery Boy update failed: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            case 'product':
                result = await dispatch(updateProductById({ id: _id, data: dataToUpdate }));
                if (updateProductById.fulfilled.match(result)) {
                    showModal("Product updated successfully!");
                    setShowEntityEditModal(false);
                    dispatch(fetchProducts());
                } else {
                    showModal("Product update failed: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            case 'order':
                result = await dispatch(updateOrderById({ id: _id, data: dataToUpdate }));
                if (updateOrderById.fulfilled.match(result)) {
                    showModal("Order updated successfully!");
                    setShowEntityEditModal(false);
                    dispatch(fetchOrders());
                } else {
                    showModal("Order update failed: " + (result.payload?.message || "Unknown error"), "error");
                }
                break;
            default:
                showModal("Invalid entity type for saving.", "error");
                break;
        }
    };

    const handleDeleteEntity = async (entityType, id) => {
        if (window.confirm(`Are you sure you want to delete this ${entityType}? This action cannot be undone.`)) {
            let result;
            switch (entityType) {
                case 'user':
                    result = await dispatch(deleteUserById(id));
                    if (deleteUserById.fulfilled.match(result)) {
                        showModal("User deleted successfully!");
                        dispatch(fetchUsers());
                    } else {
                        showModal("User deletion failed: " + (result.payload?.message || "Unknown error"), "error");
                    }
                    break;
                case 'vendor':
                    result = await dispatch(deleteVendorById(id));
                    if (deleteVendorById.fulfilled.match(result)) {
                        showModal("Vendor deleted successfully!");
                        dispatch(fetchVendors());
                    } else {
                        showModal("Vendor deletion failed: " + (result.payload?.message || "Unknown error"), "error");
                    }
                    break;
                case 'deliveryboy':
                    result = await dispatch(deleteDeliveryBoyById(id));
                    if (deleteDeliveryBoyById.fulfilled.match(result)) {
                        showModal("Delivery Boy deleted successfully!");
                        dispatch(fetchDeliveryBoys());
                    } else {
                        showModal("Delivery Boy deletion failed: " + (result.payload?.message || "Unknown error"), "error");
                    }
                    break;
                case 'product':
                    result = await dispatch(deleteProductById(id));
                    if (deleteProductById.fulfilled.match(result)) {
                        showModal("Product deleted successfully!");
                        dispatch(fetchProducts());
                    } else {
                        showModal("Product deletion failed: " + (result.payload?.message || "Unknown error"), "error");
                    }
                    break;
                case 'order':
                    result = await dispatch(deleteOrderById(id));
                    if (deleteOrderById.fulfilled.match(result)) {
                        showModal("Order deleted successfully!");
                        dispatch(fetchOrders());
                    } else {
                        showModal("Order deletion failed: " + (result.payload?.message || "Unknown error"), "error");
                    }
                    break;
                default:
                    showModal("Invalid entity type for deletion.", "error");
                    break;
            }
        }
    };

    const handleToggleVendorApproval = async (vendorId, currentStatus) => {
        const confirmMessage = currentStatus
            ? "Are you sure you want to disapprove this vendor?"
            : "Are you sure you want to approve this vendor?";
        if (window.confirm(confirmMessage)) {
            const result = await dispatch(toggleVendorApproval(vendorId));
            if (toggleVendorApproval.fulfilled.match(result)) {
                showModal("Vendor approval status updated successfully!");
                dispatch(fetchVendors());
            } else {
                showModal("Failed to update vendor approval status: " + (result.payload?.message || "Unknown error"), "error");
            }
        }
    };

    if (loading && !admin) {
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

    if (!admin || admin.role !== "superadmin") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: backgroundColor }}>
                <div className="text-center p-8 rounded-2xl shadow-lg" style={{ backgroundColor: cardBgColor }}>
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Access Denied.</h2>
                    <p className="text-gray-400">You must be a Superadmin to access this panel.</p>
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Superadmin Control Panel</h1>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {[
                        { id: "analytics", label: "Analytics", icon: LayoutDashboard },
                        { id: "admins", label: "Admins", icon: Users },
                        { id: "users", label: "Users", icon: User },
                        { id: "vendors", label: "Vendors", icon: Store },
                        { id: "deliveryBoys", label: "Delivery Boys", icon: Truck },
                        { id: "products", label: "Products", icon: Package },
                        { id: "orders", label: "Orders", icon: ShoppingCart },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${activeTab === tab.id
                                ? "text-white shadow-md"
                                : "text-gray-300 hover:text-white"
                                }`}
                            style={{
                                background: activeTab === tab.id ? tabActiveBg : tabInactiveBg,
                                color: tabTextColor,
                            }}
                        >
                            <tab.icon className="w-5 h-5 mr-2" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="rounded-2xl shadow-lg border overflow-hidden" style={{ backgroundColor: cardBgColor, border: `1px solid ${cardBorderColor}` }}>
                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <LayoutDashboard className="w-6 h-6 mr-3 text-green-400" /> Platform Analytics
                            </h2>
                            {loading && !analytics ? (
                                <p className="text-gray-400 flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading analytics...</p>
                            ) : analytics ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700">
                                        <DollarSign className="w-8 h-8 text-green-500 mb-3" />
                                        <p className="text-gray-400 text-sm">Total Platform Income</p>
                                        <p className="text-white text-2xl font-bold">${analytics.totalPlatformIncome?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700">
                                        <Percent className="w-8 h-8 text-blue-500 mb-3" />
                                        <p className="text-gray-400 text-sm">18% GST Income</p>
                                        <p className="text-white text-2xl font-bold">${analytics.gstIncome?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700">
                                        <Percent className="w-8 h-8 text-purple-500 mb-3" />
                                        <p className="text-gray-400 text-sm">10% Platform Fee Income</p>
                                        <p className="text-white text-2xl font-bold">${analytics.platformFeeIncome?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700 col-span-full">
                                        <DollarSign className="w-8 h-8 text-yellow-500 mb-3" />
                                        <p className="text-gray-400 text-sm">Remaining Vendor Income (Distributed)</p>
                                        <p className="text-white text-2xl font-bold">${analytics.remainingVendorIncome?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div className="col-span-full mt-6">
                                        <h3 className="text-xl font-semibold text-white mb-4">Vendor Income Breakdown</h3>
                                        {analytics.vendorIncomeDetails && analytics.vendorIncomeDetails.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-700">
                                                    <thead className="bg-gray-700">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendor Name</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Income</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                                        {analytics.vendorIncomeDetails.map((vendor) => (
                                                            <tr key={vendor._id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vendor.name}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${vendor.income?.toFixed(2) || '0.00'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400">No vendor income data available.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400">No analytics data available. Please ensure orders are placed and products are associated with vendors.</p>
                            )}
                        </div>
                    )}

                    {/* Admins Tab */}
                    {activeTab === "admins" && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <Users className="w-6 h-6 mr-3 text-green-400" /> Admin Accounts
                            </h2>
                            <div className="mb-4 flex justify-end">
                                <button
                                    onClick={() => setShowAddAdminModal(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" /> Add New Admin
                                </button>
                            </div>
                            {loading && !admins.length ? (
                                <p className="text-gray-400 flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading admins...</p>
                            ) : admins.length === 0 ? (
                                <p className="text-gray-400">No other admin accounts found.</p>
                            ) : (
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
                                                            {admin._id !== adm._id && (
                                                                <button
                                                                    onClick={() => handleDeleteAdmin(adm._id)}
                                                                    className="text-red-500 hover:text-red-600"
                                                                    title="Delete Admin"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            )}
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

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <User className="w-6 h-6 mr-3 text-green-400" /> User Accounts
                            </h2>
                            {loading && !users.length ? (
                                <p className="text-gray-400 flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading users...</p>
                            ) : users.length === 0 ? (
                                <p className="text-gray-400">No user accounts found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                                            {users.map((user) => (
                                                <tr key={user._id} className="hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.phone || "N/A"}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditEntity('user', user._id)}
                                                                className="text-yellow-500 hover:text-yellow-600"
                                                                title="Edit User"
                                                            >
                                                                <Edit3 className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteEntity('user', user._id)}
                                                                className="text-red-500 hover:text-red-600"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
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

                    {/* Vendors Tab */}
                    {activeTab === "vendors" && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <Store className="w-6 h-6 mr-3 text-green-400" /> Vendor Accounts
                            </h2>
                            {loading && !vendors.length ? (
                                <p className="text-gray-400 flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading vendors...</p>
                            ) : vendors.length === 0 ? (
                                <p className="text-gray-400">No vendor accounts found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Business Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Approved</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                                            {vendors.map((vendor) => (
                                                <tr key={vendor._id} className="hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vendor.businessName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vendor.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vendor.phone || "N/A"}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {vendor.isApproved ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditEntity('vendor', vendor._id)}
                                                                className="text-yellow-500 hover:text-yellow-600"
                                                                title="Edit Vendor"
                                                            >
                                                                <Edit3 className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteEntity('vendor', vendor._id)}
                                                                className="text-red-500 hover:text-red-600"
                                                                title="Delete Vendor"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleVendorApproval(vendor._id, vendor.isApproved)}
                                                                className={`${vendor.isApproved ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}
                                                                title={vendor.isApproved ? "Disapprove" : "Approve"}
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

                    {/* Delivery Boys Tab */}
                    {activeTab === "deliveryBoys" && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <Truck className="w-6 h-6 mr-3 text-green-400" /> Delivery Boy Accounts
                            </h2>
                            {loading && !deliveryBoys.length ? (
                                <p className="text-gray-400 flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading delivery boys...</p>
                            ) : deliveryBoys.length === 0 ? (
                                <p className="text-gray-400">No delivery boy accounts found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Available</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                                            {deliveryBoys.map((boy) => (
                                                <tr key={boy._id} className="hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{boy.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{boy.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{boy.phone || "N/A"}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${boy.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {boy.isAvailable ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditEntity('deliveryboy', boy._id)}
                                                                className="text-yellow-500 hover:text-yellow-600"
                                                                title="Edit Delivery Boy"
                                                            >
                                                                <Edit3 className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteEntity('deliveryboy', boy._id)}
                                                                className="text-red-500 hover:text-red-600"
                                                                title="Delete Delivery Boy"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
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

                    {/* Products Tab */}
                    {activeTab === "products" && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <Package className="w-6 h-6 mr-3 text-green-400" /> Products
                            </h2>
                            {loading && !products.length ? (
                                <p className="text-gray-400 flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading products...</p>
                            ) : products.length === 0 ? (
                                <p className="text-gray-400">No products found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                                            {products.map((product) => (
                                                <tr key={product._id} className="hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{product.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.vendorId?.businessName || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${product.price?.toFixed(2) || '0.00'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.category || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditEntity('product', product._id)}
                                                                className="text-yellow-500 hover:text-yellow-600"
                                                                title="Edit Product"
                                                            >
                                                                <Edit3 className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteEntity('product', product._id)}
                                                                className="text-red-500 hover:text-red-600"
                                                                title="Delete Product"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
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

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <ShoppingCart className="w-6 h-6 mr-3 text-green-400" /> Orders
                            </h2>
                            {loading && !orders.length ? (
                                <p className="text-gray-400 flex items-center"><FaSpinner className="animate-spin mr-2" /> Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <p className="text-gray-400">No orders found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Delivery Boy</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order._id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.userId?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.deliveryBoy?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{order.status || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditEntity('order', order._id)}
                                                                className="text-yellow-500 hover:text-yellow-600"
                                                                title="Edit Order"
                                                            >
                                                                <Edit3 className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteEntity('order', order._id)}
                                                                className="text-red-500 hover:text-red-600"
                                                                title="Delete Order"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
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

                {/* Superadmin: Add New Admin Modal */}
                {showAddAdminModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="rounded-2xl shadow-lg p-8 max-w-lg w-full" style={{ backgroundColor: cardBgColor, border: `1px solid ${cardBorderColor}` }}>
                            <h3 className="text-xl font-bold text-white mb-6">Add New Admin Account</h3>
                            <form onSubmit={handleAddAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newAdminData.name}
                                        onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg"
                                        style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newAdminData.email}
                                        onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg"
                                        style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={newAdminData.phone}
                                        onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg"
                                        style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                    <input
                                        type={showNewAdminPassword ? "text" : "password"}
                                        name="password"
                                        value={newAdminData.password}
                                        onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-3 py-2 border rounded-lg pr-10"
                                        style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                                        style={{ top: "60%", transform: "translateY(-50%)" }}
                                    >
                                        {showNewAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={newAdminData.role}
                                        onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: cardBorderColor }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddAdminModal(false)}
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
                                        {loading ? <><FaSpinner className="animate-spin mr-2" /> Creating...</> : <><PlusCircle className="w-4 h-4 mr-2" /> Add Admin</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Superadmin: Edit Other Admin Modal */}
                {showAdminEditModal && selectedAdmin && (
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
                                        onChange={(e) => setEditingOtherAdminData({ ...editingOtherAdminData, name: e.target.value })}
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
                                        disabled
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
                                        onChange={(e) => setEditingOtherAdminData({ ...editingOtherAdminData, phone: e.target.value })}
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
                                        onChange={(e) => setEditingOtherAdminData({ ...editingOtherAdminData, password: e.target.value })}
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
                                        onChange={(e) => setEditingOtherAdminData({ ...editingOtherAdminData, role: e.target.value })}
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
                                        onChange={(e) => setEditingOtherAdminData({ ...editingOtherAdminData, isActive: e.target.checked })}
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

                {/* Generic Entity Edit Modal */}
                {showEntityEditModal && editingEntityData && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <div className="rounded-2xl shadow-lg p-8 max-w-lg w-full" style={{ backgroundColor: cardBgColor, border: `1px solid ${cardBorderColor}` }}>
                            <h3 className="text-xl font-bold text-white mb-6">Edit {editingEntityType.charAt(0).toUpperCase() + editingEntityType.slice(1)}: {editingEntityData.name || editingEntityData.businessName || editingEntityData.title || editingEntityData._id}</h3>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveEntity(); }} className="space-y-4">
                                {editingEntityType === 'user' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                            <input type="text" name="name" value={editingEntityData.name} onChange={(e) => setEditingEntityData({ ...editingEntityData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                            <input type="email" name="email" value={editingEntityData.email} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, }} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                                            <input type="tel" name="phone" value={editingEntityData.phone} onChange={(e) => setEditingEntityData({ ...editingEntityData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Password (leave blank to keep current)</label>
                                            <input type={showEntityPassword ? "text" : "password"} name="password" value={editingEntityData.password} onChange={(e) => setEditingEntityData({ ...editingEntityData, password: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 border rounded-lg pr-10" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                            <button type="button" onClick={() => setShowEntityPassword(!showEntityPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200" style={{ top: "60%", transform: "translateY(-50%)" }}><Eye size={18} /></button>
                                        </div>
                                    </>
                                )}
                                {editingEntityType === 'vendor' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Business Name</label>
                                            <input type="text" name="businessName" value={editingEntityData.businessName} onChange={(e) => setEditingEntityData({ ...editingEntityData, businessName: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                            <input type="email" name="email" value={editingEntityData.email} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, }} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                                            <input type="tel" name="phone" value={editingEntityData.phone} onChange={(e) => setEditingEntityData({ ...editingEntityData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Password (leave blank to keep current)</label>
                                            <input type={showEntityPassword ? "text" : "password"} name="password" value={editingEntityData.password} onChange={(e) => setEditingEntityData({ ...editingEntityData, password: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 border rounded-lg pr-10" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                            <button type="button" onClick={() => setShowEntityPassword(!showEntityPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200" style={{ top: "60%", transform: "translateY(-50%)" }}><Eye size={18} /></button>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" name="isApproved" checked={editingEntityData.isApproved} onChange={(e) => setEditingEntityData({ ...editingEntityData, isApproved: e.target.checked })} className="h-4 w-4 text-green-600 rounded focus:ring-green-500" style={{ background: inputBgColor, borderColor: inputBorderColor, }} />
                                            <label htmlFor="isApproved" className="ml-2 block text-sm text-gray-300">Is Approved</label>
                                        </div>
                                    </>
                                )}
                                {editingEntityType === 'deliveryboy' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                            <input type="text" name="name" value={editingEntityData.name} onChange={(e) => setEditingEntityData({ ...editingEntityData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                            <input type="email" name="email" value={editingEntityData.email} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, }} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                                            <input type="tel" name="phone" value={editingEntityData.phone} onChange={(e) => setEditingEntityData({ ...editingEntityData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Password (leave blank to keep current)</label>
                                            <input type={showEntityPassword ? "text" : "password"} name="password" value={editingEntityData.password} onChange={(e) => setEditingEntityData({ ...editingEntityData, password: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 border rounded-lg pr-10" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                            <button type="button" onClick={() => setShowEntityPassword(!showEntityPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200" style={{ top: "60%", transform: "translateY(-50%)" }}><Eye size={18} /></button>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" name="isAvailable" checked={editingEntityData.isAvailable} onChange={(e) => setEditingEntityData({ ...editingEntityData, isAvailable: e.target.checked })} className="h-4 w-4 text-green-600 rounded focus:ring-green-500" style={{ background: inputBgColor, borderColor: inputBorderColor, }} />
                                            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-300">Is Available</label>
                                        </div>
                                    </>
                                )}
                                {editingEntityType === 'product' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                                            <input type="text" name="name" value={editingEntityData.name} onChange={(e) => setEditingEntityData({ ...editingEntityData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                                            <input type="number" name="price" value={editingEntityData.price} onChange={(e) => setEditingEntityData({ ...editingEntityData, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                                            <input type="text" name="category" value={editingEntityData.category} onChange={(e) => setEditingEntityData({ ...editingEntityData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                    </>
                                )}
                                {editingEntityType === 'order' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Order Status</label>
                                            <select
                                                name="status"
                                                value={editingEntityData.status}
                                                onChange={(e) => setEditingEntityData({ ...editingEntityData, status: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg"
                                                style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Total Amount</label>
                                            <input type="number" name="totalAmount" value={editingEntityData.totalAmount} onChange={(e) => setEditingEntityData({ ...editingEntityData, totalAmount: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" style={{ background: inputBgColor, color: textColor, borderColor: inputBorderColor, "--tw-ring-color": inputFocusRingColor, }} />
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: cardBorderColor }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowEntityEditModal(false)}
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